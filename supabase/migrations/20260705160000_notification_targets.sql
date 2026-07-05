-- Give notifications a navigation target so the client can render the list
-- data-driven (tap-through resolves from the row, not from hardcoded JSX).
-- Nullable: tournament/upsell rows navigate by kind, not by circle.
alter table public.notifications add column if not exists circle_id text;

update public.notifications set circle_id = 'frishman'   where id = 'n1';
update public.notifications set circle_id = 'own-gordon' where id = 'n2';
update public.notifications set circle_id = 'gordon'     where id = 'n4';
