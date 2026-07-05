-- Close the email-harvesting hole.
-- The previous email_for_username(u) returned any account's real email for a
-- given username to ANONYMOUS callers — so usernames (public handles, also
-- enumerable via username_available) could be turned into a list of emails for
-- phishing / credential stuffing.
--
-- Replace it with a password-gated resolver: the email is returned only when the
-- supplied password already matches the account. That reveals nothing an
-- attacker couldn't obtain by simply logging in, and a wrong password (or an
-- unknown username) yields null — no oracle for "does this email exist".

-- Drop the leaky single-arg version outright. A CREATE OR REPLACE with a new
-- signature would leave the old one in place, still granted to anon and still
-- exploitable.
drop function if exists public.email_for_username(text);

create or replace function public.email_for_username(u text, p text)
returns text
language sql
security definer
set search_path = public, auth, extensions
as $$
  select au.email
  from public.profiles pr
  join auth.users au on au.id::text = pr.user_id
  where lower(pr.username) = lower(u)
    -- GoTrue stores a bcrypt hash; crypt() re-hashes p with the stored salt and
    -- matches only on the correct password (null encrypted_password never matches).
    and au.encrypted_password = extensions.crypt(p, au.encrypted_password)
  limit 1;
$$;

revoke all on function public.email_for_username(text, text) from public;
grant execute on function public.email_for_username(text, text) to anon, authenticated;
