-- Low-severity hardening (review #34, #35, #37).

-- #34: a joining client can send any name/avatar in its players row, letting it
-- impersonate another player's display identity. Trust the joiner's profile
-- instead: for any user_id that has a profile (i.e. every real auth user), the
-- trigger overwrites the denormalized display fields from it. Seeded demo
-- personas (no profile row) keep the values they were inserted with.
create or replace function public.handle_player_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cap int;
  cnt int;
  prof record;
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

  select name, avatar_initial, avatar_color into prof
    from profiles where user_id = new.user_id;
  if found then
    new.name := prof.name;
    new.avatar_initial := prof.avatar_initial;
    new.avatar_color := prof.avatar_color;
  end if;

  if cnt + 1 >= cap then
    update circles set state = 'live' where id = new.circle_id;
  end if;
  return new;
end;
$$;

-- #35: username_available compares case-insensitively (lower()), but the column's
-- UNIQUE constraint is case-sensitive — so 'Guy' and 'guy' could both register.
-- Enforce a single case-insensitive identity with a functional unique index.
alter table public.profiles drop constraint if exists profiles_username_key;
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

-- #37: AppNotification.body is optional in the app but the column was NOT NULL.
alter table public.notifications alter column body drop not null;
