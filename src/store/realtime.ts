// Cross-cutting session lifecycle: goLive (profile + data fetch + subscription)
// and the realtime merge handlers. Kept out of the slices because it touches
// circles, messages and notifications together and owns module-level state.
import {
  authMetadata,
  fetchAll,
  fetchProfile,
  subscribeRealtime,
  upsertProfile,
} from '../data/backend';
import type { User } from '../data/models';
import { freshUser } from './helpers';
import type { Get, Set } from './types';

let unsubscribe: (() => void) | null = null;
let goingLive = false; // guards against two concurrent goLive runs (hydrate + auth action)

export function teardownRealtime() {
  unsubscribe?.();
  unsubscribe = null;
}

// Load profile + data and start realtime for a signed-in uid (real or guest).
export async function goLive(
  set: Set,
  get: Get,
  uid: string,
  kind: 'guest' | 'user',
  overrideName?: string,
  overrideUsername?: string,
) {
  if (goingLive || get().live) return; // in-flight / already live guard
  goingLive = true;
  try {
    await runGoLive(set, get, uid, kind, overrideName, overrideUsername);
  } finally {
    goingLive = false;
    set({ loading: false });
  }
}

async function runGoLive(
  set: Set,
  get: Get,
  uid: string,
  kind: 'guest' | 'user',
  overrideName?: string,
  overrideUsername?: string,
) {
  const [profile, meta] = await Promise.all([fetchProfile(uid), authMetadata()]);

  if (profile) {
    // Returning account — hydrate identity from its saved profile.
    const name = overrideName ?? profile.name;
    const user: User = {
      ...freshUser(uid, name),
      isPro: profile.isPro,
      sports: profile.sports ?? [],
      homeBeaches: profile.homeBeaches ?? [],
    };
    set({ user, authKind: kind });
  } else {
    // First sign-in — seed a clean profile from real auth data only.
    const name =
      overrideName ??
      meta?.name ??
      (kind === 'guest' ? 'אורח' : meta?.email?.split('@')[0]) ??
      'שחקן חדש';
    const user = freshUser(uid, name);
    set({ user, authKind: kind });
    upsertProfile({
      userId: uid,
      name: user.name,
      avatarInitial: user.avatarInitial,
      avatarColor: user.avatarColor,
      isPro: user.isPro, // false — no self-granted Pro
      username: overrideUsername ?? meta?.username,
      sports: user.sports, // []
      homeBeaches: user.homeBeaches, // []
    });
  }

  const data = await fetchAll();
  // Fetch failed → stay on the offline fixture seed rather than a half-live state
  // (real identity over fixture circles, subscribed but never `live`). A later
  // hydrate/auth action retries, since `live` stays false and the guard clears.
  if (!data) return;
  set({ ...data, live: true });
  subscribeAll(set, get);
}

function subscribeAll(set: Set, get: Get) {
  unsubscribe?.();
  unsubscribe = subscribeRealtime({
    onCircleInsert: (circle) =>
      set((s) =>
        s.circles.some((c) => c.id === circle.id) ? s : { circles: [...s.circles, circle] },
      ),
    onCircleRemove: (id) =>
      set((s) => ({
        circles: s.circles.filter((c) => c.id !== id),
        messages: s.messages.filter((m) => m.circleId !== id),
      })),
    onPlayerRemove: (circleId, userId) =>
      set((s) => ({
        circles: s.circles.map((c) =>
          c.id === circleId
            ? {
                ...c,
                players: c.players.filter((p) => p.id !== userId),
                // dropping below capacity reopens a live circle (mirrors the DB trigger)
                state:
                  c.state === 'live' && c.players.length - 1 < c.capacity ? 'missing' : c.state,
              }
            : c,
        ),
      })),
    onPlayerInsert: (circleId, player) =>
      set((s) => ({
        circles: s.circles.map((c) => {
          if (c.id !== circleId || c.players.some((p) => p.id === player.id)) return c;
          const players = [...c.players, player];
          return { ...c, players, state: players.length >= c.capacity ? 'live' : c.state };
        }),
      })),
    onWaitlistInsert: (circleId, player) =>
      set((s) => ({
        circles: s.circles.map((c) =>
          c.id === circleId && !c.waitlist.some((p) => p.id === player.id)
            ? { ...c, waitlist: [...c.waitlist, player] }
            : c,
        ),
      })),
    onWaitlistRemove: (circleId, userId) =>
      set((s) => ({
        circles: s.circles.map((c) =>
          c.id === circleId ? { ...c, waitlist: c.waitlist.filter((p) => p.id !== userId) } : c,
        ),
      })),
    onCircleUpdate: (patch) =>
      set((s) => ({
        circles: s.circles.map((c) => (c.id === patch.id ? { ...c, ...patch } : c)),
      })),
    onMessageInsert: (message) => {
      if (get().messages.some((m) => m.id === message.id)) return;
      set((s) => ({ messages: [...s.messages, message] }));
      // Foreground in-app chat banner for incoming messages (turn 11). The
      // banner slice's suppression matrix drops it when the user is already in
      // that chat / in a live game / on the rating screen, and coalesces
      // repeats from the same sender.
      if (message.kind === 'in' && message.senderName) {
        const circle = get().circleById(message.circleId);
        get().showBanner({
          kind: 'chat',
          title: `${message.senderName} · ${circle?.beachName ?? 'מעגל'}`,
          body: message.text,
          circleId: message.circleId,
          senderName: message.senderName,
          senderColor: message.avatarColor ?? message.senderColor,
        });
      }
    },
    onNotificationInsert: (notification) =>
      set((s) =>
        s.notifications.some((n) => n.id === notification.id)
          ? s
          : { notifications: [notification, ...s.notifications] },
      ),
    onNotificationUpdate: (id, unread) =>
      set((s) => ({
        notifications: s.notifications.map((n) => (n.id === id ? { ...n, unread } : n)),
      })),
  });
}
