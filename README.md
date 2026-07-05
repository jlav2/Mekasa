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

A **dev screen gallery** listing all 29 screens lives at the `/gallery` route — reachable in-app via Profile (⋮ menu) → הגדרות → פיתוח → גלריית מסכים.

## Architecture

- **`app/`** — expo-router file-based routes. One file per screen (`login.tsx` = 1a, `map.tsx` = 1c …). `app/index.tsx` redirects to login; `app/gallery.tsx` is the dev gallery; `app/_layout.tsx` loads fonts (Heebo + Karantina) and sets the stack.
- **`src/theme/`** — design tokens: `colors`, `fonts`, `radii`, `spacing`, `shadows`, gradients, avatar palette (from the handoff).
- **`src/components/`** — shared library: `SandRing` (signature hand-drawn circle), `MapCanvas`, `MapMarker`, `Button`, `Card`, `Chip`, `Badge`/`ProBadge`, `Avatar`/`AvatarStack`, animated `StatusDot`/`PulseHalo`, `SegmentedControl`, `Toggle`, `Stepper`, `TabBar` (iOS floating pill), `Icon` set + `SportIcon` + brand glyphs.
- **`src/data/`** — `models.ts` (domain types from the handoff), `fixtures.ts` (seed content), `beaches.ts` (geo data), `screens.ts` (gallery manifest).
- **`src/store/`** — Zustand app store: circles, chat messages, notifications, current user. Actions: `joinCircle` (one-tap join → adds you, flips to live, emits chat events), `sendMessage`, `markAllRead`. In-memory only — resets on reload until a backend lands.
- **`app/(tabs)/`** — the 4 tab roots under a real expo-router Tabs group; the floating pill bar is a custom `tabBar`, so screens keep state across tab switches. Badge = live unread count.
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
