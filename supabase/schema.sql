-- MeKasa schema — run once in the Supabase SQL editor (before seed.sql).
-- Demo-grade RLS: anon can read/write everything. Lock down when real auth lands.

create table public.circles (
  id text primary key,
  sport text not null,
  sport_label text not null,
  beach_id text not null,
  beach_name text not null,
  court text not null,
  level_label text not null,
  capacity int not null,
  state text not null default 'scheduled', -- 'missing' | 'live' | 'scheduled'
  is_open boolean not null default true,
  host_id text not null,
  host_name text not null,
  start_label text not null,
  distance_label text not null,
  host_note text,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now()
);

create table public.players (
  id text primary key, -- "<circle_id>:<user_id>"
  circle_id text not null references public.circles (id) on delete cascade,
  user_id text not null,
  name text not null,
  avatar_initial text not null,
  avatar_color text not null,
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (circle_id, user_id)
);

create table public.messages (
  id text primary key,
  circle_id text not null references public.circles (id) on delete cascade,
  kind text not null, -- 'in' | 'out' | 'join' | 'milestone'
  sender_id text,
  sender_name text,
  sender_color text,
  avatar_letter text,
  avatar_color text,
  text text,
  time_label text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id text primary key,
  kind text not null,
  "group" text not null,
  title text not null,
  body text not null,
  time_label text not null,
  unread boolean not null default true,
  created_at timestamptz not null default now()
);

-- Demo RLS: open to anon. Replace with per-user policies once auth exists.
alter table public.circles enable row level security;
alter table public.players enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

create policy demo_all_circles on public.circles for all using (true) with check (true);
create policy demo_all_players on public.players for all using (true) with check (true);
create policy demo_all_messages on public.messages for all using (true) with check (true);
create policy demo_all_notifications on public.notifications for all using (true) with check (true);

-- Realtime for live counts, chat and badges
alter publication supabase_realtime add table public.circles;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
