-- Store onboarding preferences on the profile: chosen sports/levels and home beaches.
alter table public.profiles
  add column if not exists sports jsonb,
  add column if not exists home_beaches text[];
