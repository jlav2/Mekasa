# MeKasa build conventions (for screen authors)

Stack: Expo SDK 54, expo-router (file-based), react-native-svg, expo-linear-gradient.
Language: Hebrew, **RTL**. We author RTL explicitly (no global I18nManager flip).

## Golden rules
1. **Never edit** `src/theme/`, `src/components/`, `app/_layout.tsx`, `app/index.tsx`. Only CREATE your assigned screen files under `app/`. If you need a one-off helper, define it locally in your screen file.
2. Import everything from the barrel: `import { Screen, Txt, Button, Card, Chip, ... } from '../src/components'` and tokens from `../src/theme`.
3. All text goes through `<Txt>` (defaults: Heebo, right-aligned, RTL). Never use bare `<Text>`.
4. Rows that read right-to-left use `flexDirection: 'row-reverse'`. Leading element (icon/avatar) sits on the RIGHT.
5. Match the canvas markup faithfully — exact Hebrew copy, colors, sizes, radii. Read your screen's HTML block from `../MeKasa.dc.html` (line ranges given in your task). Numbers/prices (₪19.90, 4/4, 18:00) stay LTR — they render fine inside Txt.
6. Use `useRouter()` for navigation; wire obvious CTAs to plausible routes from the manifest in `src/data/screens.ts` (e.g. login→/onboarding-sport, map card "אני בפנים"→/circle-detail, back→router.back()). Don't crash if a route is missing — every route in the manifest will exist.
7. Device chrome (status bar, home indicator, bezels) is NOT part of the UI. Use `<Screen>` which handles safe-area insets.

## Fonts (theme `fonts`)
- `fonts.displayBold` = Karantina 700 — headlines, wordmark, big numbers, screen titles.
- `fonts.display` / `fonts.displayLight` = Karantina 400/300.
- `fonts.body|medium|semibold|bold|extrabold` = Heebo 400/500/600/700/800.

## Colors (theme `colors`)
petrol #0E4F5E, petrolDeep #093A46, ink #12303A, sandBg #F7EFDE, card #FFFDF6,
sunset #FF6B2C (THE action color), sunsetDeep #E85413, sunsetSoft #FFB05C,
live #14B8A8, liveBright #14D3BF, liveDeep #0E7A6E, sandGlow #FFD9A0, amber #E8A13C,
muted #5E7078, faint #8A9AA2, hairline, hairlineStrong, outline, chipBg,
whatsapp #25D366, danger #C0392B, gpsBlue #2E7CF6, facebook #1877F2, sea1/sea2, park…
Gradients exported: `skyGradient`, `petrolGradient`, `beachHeroGradient`, `proGradient`, `iconGradient`. Avatar palette: `avatarPalette`.

## Components (all from `../src/components`)
- `<Screen scroll padded bg edges={{top,bottom}}>` — screen wrapper w/ safe-area + 22px h-padding. Use `scroll` for long screens.
- `<Txt variant="display|title|body|bodyStrong|secondary|label|button" style>` — text.
- `<Button label variant="primary|live|petrol|secondary|tonal|whatsapp|ghost|danger" size="lg|md|sm" icon iconRight onPress full />` — primary = sunset + glow, full-round.
- `<Card petrol floating radius pad>` — cards/sheets. petrol=dark card.
- `<SectionLabel>` — 12px 800 faint section header.
- `<Badge label bg color />`, `<ProBadge />` — pills. `<Chip label active onPress leading trailing filledColor />` — filter/segment chips (active=petrol fill).
- `<Avatar letter size colorIndex color ring ringColor border />`, `<AvatarStack people={[{letter,colorIndex}]} size border emptySlot emptyLabel emptyBorder />`.
- `<StatusDot color size animate />` — pulsing liveDot. `<PulseHalo color size />` — marker halo (absolute).
- `<SegmentedControl options value onChange activeColor />` — selected = sunset fill.
- `<ProgressDashes total active />` — onboarding steps.
- `<Toggle value onChange onColor />` — iOS switch (52×31, on=live).
- `<Stepper value onChange min max />` — −/+ counter (− neutral, + orange).
- `<Divider />`, `<Row gap onPress>`.
- `<TabBar active="map|circles|notifications|profile" />` — iOS floating pill (absolute bottom). Add to tab-root screens; give the ScrollView paddingBottom ~120.
- `<Icon name size color strokeWidth fill />` — names: chevronRight/Left/Down, close/x, check, checkCircle, bell, pin, navigate, share, plus, minus, search, edit, users, clock, flag, trophy, chat, send, mic, settings, star, calendar, lock, sun, menu, repeat, link, sliders, ball.
- `<SportIcon sport="footvolley|altinha|volleyball" size color strokeWidth />`.
- Brand glyphs: `<AppleGlyph/> <GoogleGlyph/> <FacebookGlyph/> <WhatsappGlyph/>`.
- `<SandRing size color strokeWidth variant rotate fill>{children}</SandRing>` — the signature hand-drawn circle. Vary `variant` (0–4) and `rotate` per instance.
- `<DecorRing size color opacity variant rotate strokeWidth style />` — faded oversized ring, absolutely positioned as hero/card decoration; pass offsets via `style` (`{ left: -70, top: -40 }`). Defaults: white, opacity .14, strokeWidth 2, variant 1. Don't hand-roll decorative Svg circles.
- `<RingBadge size color centerBg variant rotate strokeWidth inset>{content}</RingBadge>` — sand ring around a solid center disc (count badges, list-row thumbs, chat header avatar). `inset` controls the ring→disc gap (default 9 on 48).
- `<HeroIconButton size onPress>{icon}</HeroIconButton>` — translucent round icon button for petrol heroes (back/share). Default 38, use 36 on compact headers.
- `<LiveMap markers dim showUser interactive onMarkerPress>{overlays}</LiveMap>` — REAL map (react-native-maps native / MapLibre web), palette-styled, geo-anchored sand-ring markers from `src/data/beaches.ts`. Use for all map screens.
- `<MapCanvas dim>{markers}</MapCanvas>` — absolute-fill stylized SVG map. Only for small illustrations (onboarding 6b).
- `<MapMarker state="live|missing|tournament|neutral" size count="3/4" label="חסר 1" variant rotate style />` — sand-ring map marker (live has pulse).

## Shadows (theme `shadows`): cta, petrolHero, floatMap, card, tabBar, androidCard.

## Android screens (3a, 1j, 1k)
Material-3 flavor: cards radius 16 + androidCard shadow; chips radius 10 (selected=petrol filled w/ leading ✓); M3 search bar h56 r28; extended FAB "פתח מעגל" (r16, sunset) bottom-start; M3 bottom nav h80 bg #FBF4E4 active #B14A17. Roboto/system for chrome, Heebo for content; keep Karantina only for display headlines. Build a local M3 bottom-nav/appbar in the screen file (don't use the iOS TabBar).

## Reference
- Exemplars already built: `app/login.tsx` (1a), `app/onboarding-sport.tsx` (1b). Match their structure/quality.
- Read your HTML block from `../MeKasa.dc.html`. Read `../README.md` sections for copy/behavior nuances.
