-- Deter bulk username enumeration via username_available(u).
-- It must stay callable by anon (the signup screen checks availability before a
-- session exists), and its whole job is to answer "does this handle exist" — so
-- we can't hide the answer. Instead we rate-limit per client IP: a real signup
-- calls this a handful of times (on field blur), while an enumeration sweep hits
-- the ceiling almost immediately. Over the limit → error (not a boolean), so the
-- attacker gets no signal; the client already treats any error as "don't block"
-- and the unique constraint on profiles.username is the real backstop.

create table if not exists public.username_check_throttle (
  ip text primary key,
  window_start timestamptz not null default now(),
  count int not null default 0
);

-- Lock the bucket to the security-definer function only: RLS on + no policies,
-- and no direct grants to the API roles.
alter table public.username_check_throttle enable row level security;
revoke all on public.username_check_throttle from anon, authenticated;

create or replace function public.username_available(u text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  client_ip text;
  win interval := interval '1 minute';
  max_calls int := 30;
  cur public.username_check_throttle%rowtype;
begin
  -- First hop of x-forwarded-for (set by the Supabase edge); coalesce so a
  -- missing header still lands in a single shared bucket rather than bypassing.
  client_ip := coalesce(
    split_part(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ',', 1),
    'noip'
  );

  -- opportunistic prune so the table stays bounded by active IPs
  delete from public.username_check_throttle where window_start < now() - interval '1 day';

  insert into public.username_check_throttle (ip, window_start, count)
    values (client_ip, now(), 1)
  on conflict (ip) do update set
    -- SET expressions see the pre-update row, so both branches read the old window
    window_start = case when public.username_check_throttle.window_start < now() - win
                        then now() else public.username_check_throttle.window_start end,
    count = case when public.username_check_throttle.window_start < now() - win
                 then 1 else public.username_check_throttle.count + 1 end
  returning * into cur;

  if cur.count > max_calls then
    raise exception 'rate limit exceeded, try again shortly' using errcode = '54000';
  end if;

  return not exists (select 1 from public.profiles where lower(username) = lower(u));
end;
$$;

revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;
