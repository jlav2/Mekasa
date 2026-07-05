-- Auth + real RLS: profiles keyed by auth uid, per-user policies replacing
-- the demo anon-writes-everything set, and a server-side full-circle trigger.
-- user_id columns stay text: real users store auth.uid()::text, seeded demo
-- personas ('u-omer', …) remain as inert data with no auth user behind them.

-- ---- profiles ----
create table public.profiles (
  user_id text primary key, -- auth.uid()::text
  name text not null,
  avatar_initial text not null,
  avatar_color text not null,
  is_pro boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy profiles_select on public.profiles for select using (true);
create policy profiles_insert on public.profiles for insert
  with check (user_id = auth.uid()::text);
create policy profiles_update on public.profiles for update
  using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);

-- ---- notifications gain an owner (null = shared demo rows) ----
alter table public.notifications add column user_id text;

-- ---- drop demo policies ----
drop policy demo_all_circles on public.circles;
drop policy demo_all_players on public.players;
drop policy demo_all_messages on public.messages;
drop policy demo_all_notifications on public.notifications;

-- ---- circles: public read, host-owned writes ----
create policy circles_select on public.circles for select using (true);
create policy circles_insert on public.circles for insert
  with check (auth.uid() is not null and host_id = auth.uid()::text);
create policy circles_update on public.circles for update
  using (host_id = auth.uid()::text) with check (host_id = auth.uid()::text);
create policy circles_delete on public.circles for delete
  using (host_id = auth.uid()::text);

-- ---- players: public read; join/leave only as yourself ----
create policy players_select on public.players for select using (true);
create policy players_insert on public.players for insert
  with check (user_id = auth.uid()::text);
create policy players_delete on public.players for delete
  using (user_id = auth.uid()::text);

-- ---- messages: public read (guest link preview); members write ----
create policy messages_select on public.messages for select using (true);
create policy messages_insert on public.messages for insert
  with check (
    exists (
      select 1 from public.players p
      where p.circle_id = messages.circle_id and p.user_id = auth.uid()::text
    )
  );

-- ---- notifications: shared demo rows or your own ----
create policy notifications_select on public.notifications for select
  using (user_id is null or user_id = auth.uid()::text);
create policy notifications_update on public.notifications for update
  using (user_id is null or user_id = auth.uid()::text)
  with check (user_id is null or user_id = auth.uid()::text);
create policy notifications_insert on public.notifications for insert
  with check (auth.uid() is not null);

-- ---- capacity guard + live flip, server-side ----
-- The joiner isn't the host, so under RLS the client can't flip the circle
-- state; a security-definer trigger owns that transition (and rejects
-- overfull joins at the source of truth).
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
  select capacity into cap from circles where id = new.circle_id;
  select count(*) into cnt from players where circle_id = new.circle_id;
  if cnt >= cap then
    raise exception 'circle % is full', new.circle_id;
  end if;
  if cnt + 1 >= cap then
    update circles set state = 'live' where id = new.circle_id;
  end if;
  return new;
end;
$$;

create trigger on_player_added
  before insert on public.players
  for each row execute function public.handle_player_added();

-- ---- reset demo state from the pre-auth test join ----
delete from public.players where id = 'frishman:u-guy';
delete from public.messages where id in ('evt-join-frishman-u-guy', 'evt-full-frishman');
update public.circles set state = 'missing' where id = 'frishman';
