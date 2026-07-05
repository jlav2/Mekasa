# Apple / Google OAuth setup

The code is fully wired (`signInWithProvider` in `src/data/backend.ts`, buttons on
the login screen, `/auth-callback` landing route). To **activate** it you must
enable each provider in Supabase and register the redirect URLs. Nothing in the
app changes.

## Redirect URLs to allow (Supabase → Authentication → URL Configuration)

Add these to **Redirect URLs**:

- `mekasa://auth-callback` — native (iOS/Android dev/prod builds)
- `http://localhost:8081/auth-callback` — local web dev
- `https://<your-web-domain>/auth-callback` — production web (when you have one)

## Google

1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth client ID**.
   - Application type: **Web application** (this is the one Supabase uses server-side).
   - Authorized redirect URI: `https://woiqhnbbywxqsdmslksh.supabase.co/auth/v1/callback`
2. Copy the **Client ID** and **Client secret**.
3. Supabase → Authentication → Providers → **Google** → enable, paste client ID + secret, save.
4. (Native builds later) also create iOS/Android OAuth client IDs and add their
   reversed-client-id URL schemes to `app.json` if you switch to native Google Sign-In.

## Apple

Requires a **paid Apple Developer account** ($99/yr).

1. Apple Developer → Certificates, IDs & Profiles:
   - Create an **App ID** (or use the app's bundle id).
   - Create a **Services ID** → enable "Sign in with Apple" → configure the
     return URL `https://woiqhnbbywxqsdmslksh.supabase.co/auth/v1/callback`.
   - Create a **Sign in with Apple key** (.p8), note the Key ID and Team ID.
2. Supabase → Authentication → Providers → **Apple** → enable, fill Services ID
   (client id), Team ID, Key ID, and the .p8 secret, save.

## How the flow works

- **Web**: `signInWithOAuth` redirects the browser to the provider, which returns
  to `/auth-callback`; supabase-js parses the code (`detectSessionInUrl` + PKCE)
  and the route redirects to `/map`.
- **Native**: the provider opens in an in-app browser
  (`WebBrowser.openAuthSessionAsync`); on return we `exchangeCodeForSession(code)`
  and go live. Requires a **dev build** (Expo Go can't register the `mekasa://`
  scheme reliably) — build with `eas build --profile development`.

Until a provider is enabled, tapping its button returns a "provider is not enabled"
error (surfaced on the login screen) — expected.
