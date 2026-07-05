-- Self-service account deletion.
-- profiles.user_id is text with no FK to auth.users (demo personas are inert
-- data), so removal is explicit: the caller's hosted circles (which cascade to
-- their players + messages), their memberships / messages / notifications
-- elsewhere, their profile row, and finally their auth user (invalidating login).

-- Let a user remove their own profile row directly. Defense in depth — the RPC
-- below is the primary path and does everything atomically — but this also
-- unblocks a plain REST delete of one's own profile.
create policy profiles_delete on public.profiles for delete
  using (user_id = auth.uid()::text);

create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid text := auth.uid()::text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  delete from public.circles where host_id = uid;      -- cascades players + messages
  delete from public.players where user_id = uid;       -- memberships in others' circles
  delete from public.messages where sender_id = uid;    -- chat messages elsewhere
  delete from public.notifications where user_id = uid;  -- own notifications
  delete from public.profiles where user_id = uid;       -- profile row
  delete from auth.users where id = auth.uid();          -- the login itself
end;
$$;

-- Only a signed-in user may delete their own account (anonymous/guest included).
revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
