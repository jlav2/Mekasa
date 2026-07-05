-- RLS hardening pass (review findings #14–#17, #24):
--   * is_pro is no longer client-writable (paywall integrity)
--   * chat messages can't spoof another member's sender identity
--   * notifications can't be forged for other users
--   * profiles are readable only by their owner (display data is denormalized
--     into players rows; nothing in the app reads another user's profile)
--   * joins are serialized per circle and position is assigned server-side

-- ---- #14: entitlements are server-side only ----
-- API clients (anon/authenticated) can upsert their profile, but is_pro is
-- pinned: false on insert, unchanged on update. Admin/service-role paths
-- (auth.role() is null or 'service_role') pass through untouched.
create or replace function public.protect_is_pro()
returns trigger
language plpgsql
as $$
begin
  if auth.role() in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      new.is_pro := false;
    else
      new.is_pro := old.is_pro;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_is_pro on public.profiles;
create trigger protect_is_pro
  before insert or update on public.profiles
  for each row execute function public.protect_is_pro();

-- ---- #17: profiles readable only by their owner ----
drop policy profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (user_id = auth.uid()::text);

-- ---- #15: message sender must be yourself (events carry no sender) ----
drop policy messages_insert on public.messages;
create policy messages_insert on public.messages for insert
  with check (
    (messages.sender_id is null or messages.sender_id = auth.uid()::text)
    and exists (
      select 1 from public.players p
      where p.circle_id = messages.circle_id and p.user_id = auth.uid()::text
    )
  );

-- ---- #16: you can only create notifications for yourself ----
drop policy notifications_insert on public.notifications;
create policy notifications_insert on public.notifications for insert
  with check (user_id = auth.uid()::text);

-- ---- #24 + join race: serialize joins per circle, assign position server-side ----
-- FOR UPDATE on the circle row makes concurrent joins queue, so the count
-- check is race-free; position comes from the authoritative count instead of
-- the client's (possibly stale) view.
create or replace function public.handle_player_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cap int;
  cnt int;
begin
  select capacity into cap from circles where id = new.circle_id for update;
  if cap is null then
    raise exception 'circle % not found', new.circle_id;
  end if;
  select count(*) into cnt from players where circle_id = new.circle_id;
  if cnt >= cap then
    raise exception 'circle % is full', new.circle_id;
  end if;
  new.position := cnt;
  if cnt + 1 >= cap then
    update circles set state = 'live' where id = new.circle_id;
  end if;
  return new;
end;
$$;

-- ---- leaving a live circle reopens it (companion to the join flip) ----
create or replace function public.handle_player_removed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cap int;
  cnt int;
begin
  select capacity into cap from circles where id = old.circle_id for update;
  if cap is null then
    return old; -- circle already deleted (cascade)
  end if;
  select count(*) into cnt from players where circle_id = old.circle_id;
  if cnt < cap then
    update circles set state = 'missing' where id = old.circle_id and state = 'live';
  end if;
  return old;
end;
$$;

drop trigger if exists on_player_removed on public.players;
create trigger on_player_removed
  after delete on public.players
  for each row execute function public.handle_player_removed();
