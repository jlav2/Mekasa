// src/lib/notifications.ts
// MeKasa push notifications — channels, iOS action categories, copy catalog, deep-link routing.
// Spec: design_handoff_mekasa_push/README.md (matrix = source of truth)
// Requires: expo-notifications + expo-device (installed).

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// ── Android channels ────────────────────────────────────────
// Importance is per-channel. Row 2 (claim expired) is sent on 'claim' with sound: null.
export const CHANNELS = {
  claim: { id: 'claim', name: 'שריון מקום', importance: Notifications.AndroidImportance.HIGH },
  circles: { id: 'circles', name: 'מעגלים חדשים', importance: Notifications.AndroidImportance.DEFAULT },
  chat: { id: 'chat', name: "צ'אט", importance: Notifications.AndroidImportance.DEFAULT },
  reminders: { id: 'reminders', name: 'תזכורות', importance: Notifications.AndroidImportance.DEFAULT },
  host: { id: 'host', name: 'ניהול מעגל', importance: Notifications.AndroidImportance.HIGH },
  tournaments: { id: 'tournaments', name: 'טורנירים', importance: Notifications.AndroidImportance.DEFAULT },
} as const;

export async function setupAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Promise.all(
    Object.values(CHANNELS).map((ch) =>
      Notifications.setNotificationChannelAsync(ch.id, {
        name: ch.name,
        importance: ch.importance,
        vibrationPattern: ch.importance === Notifications.AndroidImportance.HIGH ? [0, 180, 90, 180] : undefined,
      }),
    ),
  );
}

// ── iOS action categories ───────────────────────────────────
// categoryId on the push payload must match these identifiers.
export const CATEGORY = {
  claim: 'CLAIM',
  claimExpired: 'CLAIM_EXPIRED',
  newCircle: 'NEW_CIRCLE',
  rsvp: 'RSVP',
  chat: 'CHAT',
  host: 'HOST',
  starting: 'STARTING',
  tournament: 'TOURNAMENT',
} as const;

export async function setupIOSCategories(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  await Promise.all([
    Notifications.setNotificationCategoryAsync(CATEGORY.claim, [
      { identifier: 'claim.take', buttonTitle: 'תפוס את המקום', options: { opensAppToForeground: true } },
      { identifier: 'claim.release', buttonTitle: 'שחרר לבא בתור', options: { opensAppToForeground: false } },
    ]),
    Notifications.setNotificationCategoryAsync(CATEGORY.claimExpired, [
      { identifier: 'expired.circle', buttonTitle: 'למעגל', options: { opensAppToForeground: true } },
      { identifier: 'expired.others', buttonTitle: 'מעגלים אחרים', options: { opensAppToForeground: true } },
    ]),
    Notifications.setNotificationCategoryAsync(CATEGORY.newCircle, [
      { identifier: 'circle.join', buttonTitle: 'הצטרף', options: { opensAppToForeground: true } },
      { identifier: 'circle.watch', buttonTitle: 'צפה', options: { opensAppToForeground: true } },
    ]),
    Notifications.setNotificationCategoryAsync(CATEGORY.rsvp, [
      { identifier: 'rsvp.yes', buttonTitle: 'מגיע', options: { opensAppToForeground: false } },
      { identifier: 'rsvp.no', buttonTitle: 'לא הפעם', options: { opensAppToForeground: false } },
    ]),
    Notifications.setNotificationCategoryAsync(CATEGORY.chat, [
      {
        identifier: 'chat.reply',
        buttonTitle: 'השב',
        textInput: { submitButtonTitle: 'שלח', placeholder: 'הודעה…' },
      },
      { identifier: 'chat.read', buttonTitle: 'סמן כנקרא', options: { opensAppToForeground: false } },
    ]),
    Notifications.setNotificationCategoryAsync(CATEGORY.host, [
      { identifier: 'host.approve', buttonTitle: 'אשר', options: { opensAppToForeground: false } },
      { identifier: 'host.decline', buttonTitle: 'דחה', options: { opensAppToForeground: false, isDestructive: true } },
    ]),
    Notifications.setNotificationCategoryAsync(CATEGORY.starting, [
      { identifier: 'starting.navigate', buttonTitle: 'ניווט', options: { opensAppToForeground: true } },
      { identifier: 'starting.chat', buttonTitle: "צ'אט", options: { opensAppToForeground: true } },
    ]),
    Notifications.setNotificationCategoryAsync(CATEGORY.tournament, [
      { identifier: 'tournament.bracket', buttonTitle: 'ללוח המשחקים', options: { opensAppToForeground: true } },
    ]),
  ]);
}

// ── Deep links (scheme: mekasa — app.json) ──────────────────
export const DEEPLINK = {
  claim: (token: string) => `mekasa://claim/${token}`,
  circle: (id: string) => `mekasa://circle/${id}`,
  rsvp: (id: string) => `mekasa://circle/${id}/rsvp`,
  manage: (id: string) => `mekasa://circle/${id}/manage`,
  chat: (id: string) => `mekasa://chat/${id}`,
  tournament: (id: string) => `mekasa://tournament/${id}`,
} as const;

// Map a deep link to an expo-router path. Aligned to the real routes:
//   circle detail = /c/[id]  (the /circle-detail route is only a redirect alias)
//   chat = /chat?circle=…, manage = /host-tools, claim = /circle-waitlist,
//   tournament = /tournament.
export function urlToRoute(url: string): string | null {
  const m = url.match(/^mekasa:\/\/(.+)$/);
  if (!m) return null;
  const [head, ...rest] = m[1].split('/');
  switch (head) {
    case 'claim':
      return `/circle-waitlist?claim=${rest[0] ?? ''}`;
    case 'circle':
      if (rest[1] === 'rsvp') return `/c/${rest[0] ?? ''}`;
      if (rest[1] === 'manage') return '/host-tools';
      return `/c/${rest[0] ?? ''}`;
    case 'chat':
      return `/chat?circle=${rest[0] ?? ''}`;
    case 'tournament':
      return '/tournament';
    default:
      return null;
  }
}

// ── Copy catalog (matrix rows 1–8) ──────────────────────────
type Copy = { title: string; body: string };

export const PUSH_COPY = {
  claimOpened: (p: { circle: string; beach: string; time: string; until: string }): Copy => ({
    title: 'התפנה מקום — הוא שלך ל־5 דקות',
    body: `${p.circle} · ${p.beach}, ${p.time}. המקום שמור עד ${p.until}.`,
  }),
  claimExpired: (p: { circle: string; position: number }): Copy => ({
    title: 'המקום עבר לבא בתור',
    body: `נשארת ברשימת ההמתנה של ${p.circle} — מקום ${p.position}.`,
  }),
  newCircle: (p: { beach: string; sport: string; level: string; time: string; count: string }): Copy => ({
    title: `נפתח מעגל ב${p.beach}`,
    body: `${p.sport} · ${p.level} · ${p.time} · ${p.count}`,
  }),
  rsvpReminder: (p: { day: string; time: string; circle: string; confirmed: string }): Copy => ({
    title: `${p.day} ${p.time} — מגיע?`,
    body: `${p.circle} · ${p.confirmed} כבר אישרו`,
  }),
  chatMessage: (p: { sender: string; circle: string; message: string }): Copy => ({
    title: `${p.sender} · ${p.circle}`,
    body: p.message,
  }),
  joinRequest: (p: { name: string; level: number; circle: string; spotsLeft: string }): Copy => ({
    title: `${p.name} (רמה ${p.level}) רוצה להצטרף`,
    body: `${p.circle} · ${p.spotsLeft}`,
  }),
  startingSoon: (p: { minutes: number; where: string }): Copy => ({
    title: `מתחילים בעוד ${p.minutes} דק'`,
    body: `${p.where} · אל תשכח מים`,
  }),
  tournamentAdvance: (p: { stage: string; nextTime: string; court: string; opponent: string }): Copy => ({
    title: `עליתם ל${p.stage}!`,
    body: `המשחק הבא ${p.nextTime} · ${p.court} מול "${p.opponent}"`,
  }),
} as const;

// Map an incoming push (data.url + categoryId) to a banner kind for foreground
// presentation (see app/_layout.tsx). The app renders its own on-brand banner
// instead of the OS one when in the foreground.
export function bannerKindFromCategory(categoryId?: string): string | null {
  switch (categoryId) {
    case CATEGORY.claim:
      return 'claim';
    case CATEGORY.claimExpired:
      return 'claimExpired';
    case CATEGORY.newCircle:
      return 'newCircle';
    case CATEGORY.chat:
      return 'chat';
    case CATEGORY.host:
      return 'hostRequest';
    case CATEGORY.starting:
      return 'startingSoon';
    case CATEGORY.tournament:
      return 'tournament';
    default:
      return null; // rsvp → notifications tab only (no in-app banner)
  }
}

// ── Response routing ────────────────────────────────────────
export function routeFromNotification(response: Notifications.NotificationResponse): string | null {
  const data = response.notification.request.content.data as { url?: string } | undefined;
  const action = response.actionIdentifier;
  // Background actions (rsvp.*, host.*, claim.release, chat.read, chat.reply) are handled
  // by the store/API without navigation — return null for them.
  const background = ['rsvp.yes', 'rsvp.no', 'host.approve', 'host.decline', 'claim.release', 'chat.read', 'chat.reply'];
  if (background.includes(action)) return null;
  return data?.url ? urlToRoute(data.url) : null;
}

// ── Token registration (best-effort) ────────────────────────
// Guarded: real devices only, needs an EAS projectId + granted permission.
// Safe no-op on web/simulator/unconfigured — never throws.
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    const Device = await import('expo-device');
    if (!Device.isDevice) return null;
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== 'granted') return null;
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    // No EAS projectId in dev, or module unavailable — skip silently.
    return null;
  }
}
