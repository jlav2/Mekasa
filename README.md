# MeKasa — React Native / Expo implementation

Hebrew-first, RTL beach-sports social app (מקאסה). This is the runnable implementation of the design canvas in [`../MeKasa.dc.html`](../MeKasa.dc.html) — all **29 screen blocks** (1a–8e) recreated with Expo + expo-router.

## Run

```bash
cd MeKasaApp
npm install          # already installed
npx expo start       # then press i (iOS sim), a (Android), or w (web)
# or: npx expo start --web --port 8081
```

The app opens on **Login (1a)** and flows like the real product: login → sport/level → permissions → map → circles → chat, with the tab bar connecting map / my-circles / notifications / profile.

## Tests

```bash
npm test              # store unit tests (Jest) — fast, offline, no live dependency
npm run security-check # live RLS/trigger regression check against the linked Supabase project (opt-in)
```

`npm test` covers `src/store/**` — auth identity/no-fixture-leak, join/leave/waitlist optimism + rollback, realtime merge idempotency, filter cycling — with the Supabase boundary (`src/data/backend`, `src/lib/supabase`) swapped for manual mocks (`__mocks__/`), so it never touches the network.

`npm run security-check` re-runs (as an anonymous attacker) the server-side checks a unit test can't reach: `is_pro` self-grant, cross-user profile reads, notification/chat-sender forging, join-impersonation, and the login-resolver rate limit. It creates real anonymous users on the linked project and cleans them up via the Supabase CLI afterward — run it deliberately, not in a tight loop (the rate-limit check consumes real per-IP budget).

## Backend (Supabase, optional)

Without configuration the app runs in offline demo mode (in-memory fixtures, resets on reload). To go live:

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Link it and apply the schema: `supabase link --project-ref <ref>` then `supabase db push`. The ordered migrations in [`supabase/migrations/`](supabase/migrations/) are the single source of truth (schema → seed → auth/RLS → hardening); there is no separate `schema.sql`/`seed.sql` to keep in sync.
3. `cp .env.example .env` and fill in the URL + anon key from Settings → API.
4. Restart `npx expo start`. Joins, chat and read-state now persist, and realtime pushes live player counts / messages / badges to every open client.

**Sign up / log in**: email + password with username as an alternate login handle (log in with either — username→email resolution is password-gated server-side, so it never hands an account's email to an unauthenticated caller, and the signup availability check is rate-limited per IP to deter username enumeration); 6-digit in-app OTP confirmation is built and activates automatically when email confirmation is enabled server-side (no magic-link app-hopping). Apple/Google OAuth is wired (`signInWithProvider`, login buttons, `/auth-callback`) and activates once the providers are enabled in Supabase — see [`supabase/OAUTH_SETUP.md`](supabase/OAUTH_SETUP.md). Password reset uses the same in-app 6-digit code flow (`שכחת סיסמה?` → email → code + new password). Phone/OTP is deferred behind the same seam (needs an SMS provider). Guest mode uses anonymous auth.

**Auth + RLS**: the app signs in with an anonymous Supabase Auth session on boot (persisted via AsyncStorage/localStorage); the auth uid is your identity and a `profiles` row is upserted for it. Real policies enforce: circles are publicly readable but only their host can modify them, you can only join/leave as yourself, only circle members can post to its chat, and notifications are per-user (seed rows are shared). A security-definer trigger owns the capacity guard and the full→live flip. The login screen's SSO buttons currently create the anonymous session — wiring real Apple/Google OAuth later links onto the same user without losing data. **Account deletion** is self-service: הגדרות → מחק חשבון calls a security-definer `delete_account()` RPC that removes the caller's data (hosted circles cascade to their players + messages) and the auth user itself. A brand-new account never inherits the demo fixture identity — its profile is seeded clean (empty sports/beaches, not Pro) from real auth metadata only.

A **dev screen gallery** listing all 29 screens lives at the `/gallery` route — reachable in-app via Profile (⋮ menu) → הגדרות → פיתוח → גלריית מסכים.

## Architecture

- **`app/`** — expo-router file-based routes. One file per screen (`login.tsx` = 1a, `map.tsx` = 1c …). `app/index.tsx` redirects to login; `app/gallery.tsx` is the dev gallery; `app/_layout.tsx` loads fonts (Heebo + Karantina) and sets the stack.
- **`src/theme/`** — design tokens: `colors`, `fonts`, `radii`, `spacing`, `shadows`, gradients, avatar palette (from the handoff).
- **`src/components/`** — shared library: `SandRing` (signature hand-drawn circle), `MapCanvas`, `MapMarker`, `Button`, `Card`, `Chip`, `Badge`/`ProBadge`, `Avatar`/`AvatarStack`, animated `StatusDot`/`PulseHalo`, `SegmentedControl`, `Toggle`, `Stepper`, `TabBar` (iOS floating pill), `Icon` set + `SportIcon` + brand glyphs.
- **`src/data/`** — `models.ts` (domain types from the handoff), `fixtures.ts` (seed content), `beaches.ts` (geo data), `screens.ts` (gallery manifest).
- **`src/store/`** — Zustand app store: circles, chat messages, notifications, current user. Actions: `joinCircle` (one-tap join → adds you, flips to live, emits chat events), `sendMessage`, `markAllRead`, `markRead`. Seeds from fixtures for instant first paint; when Supabase is configured, `hydrate()` replaces state from the DB and actions write through.
- **`src/data/backend.ts` + `src/lib/supabase.ts`** — the Supabase layer: initial fetch, optimistic write-through (joins, messages, read-state) and realtime subscriptions (live player counts, chat, badges sync across devices). Without env config the app runs fully offline on fixtures.
- **`app/(tabs)/`** — the 4 tab roots under a real expo-router Tabs group; the floating pill bar is a custom `tabBar`, so screens keep state across tab switches. Badge = live unread count.
- **First-run + discovery are real**: onboarding saves your sport/level to the profile (persisted to Supabase when live) and the permissions screen makes a real `expo-location` request; the map's sport/level filter chips filter the live markers; every notification row taps through to its circle (`/c/{id}`).
- **Profile + my-circles are data-driven**: the Profile tab binds name / avatar / Pro / sports / home-beaches to the signed-in `user` and derives its stat counts (circles, beaches, partners) from the store — no fabricated totals, with an upsell (not a fake "Pro active") for free accounts. My-circles derives your live and upcoming circles from the store (host or player), with a real empty state when you have none.
- **Create-circle works end to end** — the 8a form (sport, beach via beach-picker, timing, capacity, level, open toggle) creates a real circle: you're the host and first player, an opening event lands in its chat, it persists to Supabase under RLS, and its sand-ring marker appears on every open client's map in realtime (map markers derive from the store, not static data).
- **`app/c/[id].tsx`** — dynamic circle route (the product's `mekasa.app/c/{id}` deep link): any circle in the store renders from data, with an in-app not-found fallback. `/circle-detail` redirects to `/c/frishman`; map markers, the map-list sheet and my-circles link by id, and chat takes `?circle={id}`. With the `mekasa` scheme this also gives native deep links (`mekasa://c/gordon`).
- **`scripts/generate-assets.mjs`** — renders the app icon, Android adaptive icon set, favicon and splash from the 6d canvas recipe (sunset gradient, petrol wave, sand-ring, Karantina מקאסה wordmark) using sharp + opentype.js. Re-run with `node scripts/generate-assets.mjs` after tweaking.
- **Motion** — Reanimated 4 + Gesture Handler (root wrapped in `GestureHandlerRootView`). Infinite loops (StatusDot, PulseHalo) are CSS animations; press feedback (Button), Toggle and the tab bar use CSS transitions; chat bubbles / join-flow player slots / the map card use entering + layout animations (time-based only — spring-based entering isn't supported on web); the map-list sheet is a pan-gesture drag with velocity spring-snap; notification rows swipe-to-mark-read via `ReanimatedSwipeable`. Never `runOnJS` — use `scheduleOnRN` from `react-native-worklets`.
- **`CONVENTIONS.md`** — component API + RTL rules used to build the screens.

## RTL

The app is authored explicitly RTL (right-aligned text, `row-reverse` rows, mirrored chat bubbles) rather than force-flipping `I18nManager`. This keeps layout deterministic in Expo Go / web without a native rebuild. Numbers/prices/times render LTR inside RTL text.

## Notes / next steps (from the handoff's open decisions)

- **Map is real**: `LiveMap` renders react-native-maps on iOS/Android (palette-matched `customMapStyle` on Google; Apple Maps default cartography on iOS) and MapLibre GL on web (free Carto Voyager basemap recolored at runtime to the sand/sea palette). Sand-ring markers are geo-anchored at real Tel Aviv beaches (`src/data/beaches.ts`) and tap through to circle/tournament screens. `MapCanvas` (stylized SVG) remains only as the onboarding mini-illustration. For production swap the Carto demo basemap for a keyed Mapbox/Carto plan.
- SSO, guest join, payments (StoreKit/Play Billing), realtime (websocket/RTDB for live counts/chat/waitlist/bracket) are UI-only here.
- Android screens (3a, 1j, 1k) use Material-3 chrome; the rest are the iOS design.
- Fonts load from Google Fonts via `@expo-google-fonts/*` — bundle locally for production.
