-- Username as an alternate login handle. Supabase auth is email-based, so we
-- store a unique username on the profile and resolve it to the account email
-- at login time via a security-definer function (never exposing emails broadly).

alter table public.profiles
  add column if not exists username text unique;

-- Resolve a username to its account email for password login. Security definer
-- so it can read auth.users; returns only the single matching email (or null).
create or replace function public.email_for_username(u text)
returns text
language sql
security definer
set search_path = public, auth
as $$
  select au.email
  from public.profiles p
  join auth.users au on au.id::text = p.user_id
  where lower(p.username) = lower(u)
  limit 1;
$$;

-- Is a username free? (case-insensitive)
create or replace function public.username_available(u text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (select 1 from public.profiles where lower(username) = lower(u));
$$;

grant execute on function public.email_for_username(text) to anon, authenticated;
grant execute on function public.username_available(text) to anon, authenticated;
