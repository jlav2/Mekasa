-- Close the password-guessing oracle opened when email_for_username became
-- password-gated (migration 140000): an anon caller could brute-force a
-- password by calling it in a loop, bypassing GoTrue's own login rate limits.
-- Apply the same per-IP token bucket used for username_available, via a shared
-- helper so both share one implementation (distinct key namespaces).

-- Generic token bucket over the existing throttle table. Raises 54000 on exceed.
-- Only the security-definer callers below use it (runs as owner) — not exposed.
create or replace function public.rate_limit(bucket text, max_calls int, win interval)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cur public.username_check_throttle%rowtype;
begin
  delete from public.username_check_throttle where window_start < now() - interval '1 day';
  insert into public.username_check_throttle (ip, window_start, count)
    values (bucket, now(), 1)
  on conflict (ip) do update set
    window_start = case when public.username_check_throttle.window_start < now() - win
                        then now() else public.username_check_throttle.window_start end,
    count = case when public.username_check_throttle.window_start < now() - win
                 then 1 else public.username_check_throttle.count + 1 end
  returning * into cur;
  if cur.count > max_calls then
    raise exception 'rate limit exceeded, try again shortly' using errcode = '54000';
  end if;
end;
$$;
revoke all on function public.rate_limit(text, int, interval) from public, anon, authenticated;

-- First hop of x-forwarded-for (set by the Supabase edge); coalesce so a missing
-- header still buckets rather than bypassing.
create or replace function public.caller_ip()
returns text
language sql
stable
set search_path = public
as $$
  select coalesce(
    split_part(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ',', 1),
    'noip'
  );
$$;
revoke all on function public.caller_ip() from public, anon, authenticated;

-- username availability: 30/min per IP (unchanged limit, now via the helper)
create or replace function public.username_available(u text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.rate_limit('uname:' || public.caller_ip(), 30, interval '1 minute');
  return not exists (select 1 from public.profiles where lower(username) = lower(u));
end;
$$;

-- username→email login resolver: 10/min per IP — enough for a human mistyping a
-- password, punishing for automated guessing (each attempt is a bcrypt compare).
create or replace function public.email_for_username(u text, p text)
returns text
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  result text;
begin
  perform public.rate_limit('login:' || public.caller_ip(), 10, interval '1 minute');
  select au.email into result
  from public.profiles pr
  join auth.users au on au.id::text = pr.user_id
  where lower(pr.username) = lower(u)
    and au.encrypted_password = extensions.crypt(p, au.encrypted_password)
  limit 1;
  return result;
end;
$$;

grant execute on function public.username_available(text) to anon, authenticated;
grant execute on function public.email_for_username(text, text) to anon, authenticated;
