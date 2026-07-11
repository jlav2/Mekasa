# Spot-claim Live Activity (§10c)

The "שריון מקום" Live Activity — Dynamic Island (compact / expanded / minimal)
and lock-screen presentations — for the 5-minute spot-claim countdown.

> **This is native iOS code that cannot be built in the JS/web toolchain or in
> CI (which only runs `tsc` + `jest`).** It requires an iOS prebuild + a dev
> client or EAS build to compile and verify. Everything JS-side is guarded so
> the app, tests, and web keep working whether or not the widget is built.

## Pieces

| Path | What |
|---|---|
| `targets/claim-activity/index.swift` | Widget extension: `ClaimActivityAttributes` + `ClaimActivityWidget` (3 presentations, exact §10c colors/sizes) + `@main` bundle. |
| `targets/claim-activity/expo-target.config.js` | `@bacons/apple-targets` widget target (iOS 16.2). |
| `targets/claim-activity/Info.plist` | WidgetKit extension point. |
| `modules/expo-claim-activity/ios/ExpoClaimActivityModule.swift` | Local Expo module: `start` / `update` / `end` via ActivityKit. |
| `modules/expo-claim-activity/index.ts` | Optional native-module JS entry (null when unbuilt). |
| `src/lib/liveActivity.ts` | App-facing wrapper (`startClaimActivity` / `updateClaimActivity` / `endClaimActivity`); no-op unless iOS ≥ 16.2 **and** the module is present. |
| `app/circle-waitlist.tsx` | Starts the activity while the claim window is open, ends it on cleanup/expiry. |
| `app.json` | `NSSupportsLiveActivities`, the `@bacons/apple-targets` plugin, the time-sensitive entitlement. |

## Build & verify

1. Set your Apple Team ID (required to sign the extension) — either add
   `"appleTeamId": "XXXXXXXXXX"` under `expo.ios` in `app.json`, or configure it
   in EAS credentials.
2. Prebuild the iOS project so the plugin generates the widget target:
   `npx expo prebuild -p ios --clean`
3. Build a dev client / device build (widget extensions don't run in Expo Go):
   `npx expo run:ios --device` or `eas build -p ios --profile development`.
4. Verify: on the waitlist screen, when you're first in line and a spot opens,
   the claim window starts the Live Activity — check the lock screen and the
   Dynamic Island (long-press to expand → "תפוס את המקום"). The countdown ticks
   on its own via SwiftUI `Text(timerInterval:)`, no pushes needed.

## ⚠️ Keep the attributes in sync

`ClaimActivityAttributes` is declared **twice** — in
`targets/claim-activity/index.swift` and
`modules/expo-claim-activity/ios/ExpoClaimActivityModule.swift`. They must stay
**byte-identical**: ActivityKit matches a running activity to its widget by the
attributes type's name + Codable shape. If they diverge the activity starts but
renders no UI. (Hardening option: extract to a single file under
`targets/claim-activity/_shared/` and add it to the module pod's `source_files`.)

## Production control (server)

Per the push handoff, once the ActivityKit push token is captured the Supabase
Edge Function should drive **update/end** via push (`Text(timerInterval:)` means
no push is needed just to tick), and iOS 17.2+ can **push-to-start**. The local
`start`/`end` here cover the in-app path and the graceful fallback.

## Fallback

If the widget isn't built, the flow is fully covered by the Time-Sensitive
claim notification (push matrix rows 1–2) + the in-app `ClaimCountdownRing`
(motion §04). Nothing regresses.
