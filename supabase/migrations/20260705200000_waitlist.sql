-- Waitlist for full circles (design 8c). Separate from players so it doesn't
-- count toward capacity or trip the join trigger. Order is by created_at.
create table if not exists public.waitlist (
  id text primary key, -- "<circle_id>:<user_id>"
  circle_id text not null references public.circles (id) on delete cascade,
  user_id text not null,
  name text not null,
  avatar_initial text not null,
  avatar_color text not null,
  created_at timestamptz not null default now(),
  unique (circle_id, user_id)
);

alter table public.waitlist enable row level security;
create policy waitlist_select on public.waitlist for select using (true);
create policy waitlist_insert on public.waitlist for insert
  with check (user_id = auth.uid()::text);
create policy waitlist_delete on public.waitlist for delete
  using (user_id = auth.uid()::text);

-- Anti-impersonation: trust the joiner's profile display fields (mirrors players).
create or replace function public.handle_waitlist_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  prof record;
begin
  select name, avatar_initial, avatar_color into prof
    from profiles where user_id = new.user_id;
  if found then
    new.name := prof.name;
    new.avatar_initial := prof.avatar_initial;
    new.avatar_color := prof.avatar_color;
  end if;
  return new;
end;
$$;

drop trigger if exists on_waitlist_added on public.waitlist;
create trigger on_waitlist_added
  before insert on public.waitlist
  for each row execute function public.handle_waitlist_added();
