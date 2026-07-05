// App store — Zustand. Seeds from fixtures for instant first paint, then
// hydrate() replaces state from Supabase (when configured) and subscribes to
// realtime changes. Actions apply optimistically and write through to the
// backend; realtime echoes are merged idempotently.
import { create } from 'zustand';
import type { AppNotification, ChatMessage, Circle, Player, User } from '../data/models';
import { CHAT_MESSAGES, CIRCLES, CURRENT_USER, NOTIFICATIONS } from '../data/fixtures';
import {
  sessionInfo,
  fetchAll,
  fetchProfile,
  pushCreateCircle,
  pushJoin,
  pushMarkRead,
  pushMessages,
  signInGuest,
  signInPassword,
  signOut as backendSignOut,
  signUpEmail as backendSignUpEmail,
  subscribeRealtime,
  upsertProfile,
  usernameAvailable,
  verifyEmailOtp,
  type AuthResult,
} from '../data/backend';
import { BEACH_OPTIONS, distanceLabelFrom, type BeachOption } from '../data/beaches';
import type { Sport, SportProfile } from '../data/models';
import { isSupabaseConfigured } from '../lib/supabase';

export type CreateCircleInput = {
  sport: Sport;
  sportLabel: string;
  missing: number; // players wanted besides the host
  levelLabel: string;
  startLabel: string;
  scheduled: boolean;
  isOpen: boolean;
};

export type MapFilter = { sport: Sport | 'all'; level: string | 'all' };

// Cycle orders for the two functional map chips
export const SPORT_CYCLE: (Sport | 'all')[] = ['all', 'footvolley', 'altinha', 'volleyball'];
export const LEVEL_CYCLE: (string | 'all')[] = ['all', 'מתחילים', 'בינוניים', 'מקצוענים'];

type AppState = {
  user: User;
  circles: Circle[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  live: boolean; // true once hydrated from Supabase
  authKind: 'none' | 'guest' | 'user'; // account status
  draftBeach: BeachOption; // create-circle location choice (set by beach-picker)
  filter: MapFilter; // map chip filters

  // derived helpers
  circleById: (id: string) => Circle | undefined;
  messagesFor: (circleId: string) => ChatMessage[];
  isJoined: (circleId: string) => boolean;
  unreadCount: () => number;

  // actions
  hydrate: () => Promise<void>;
  continueAsGuest: () => Promise<boolean>;
  signUpEmail: (
    email: string,
    password: string,
    name: string,
    username: string,
  ) => Promise<AuthResult & { name: string; username: string; email: string }>;
  verifyOtp: (email: string, token: string, name: string, username: string) => Promise<AuthResult>;
  logIn: (identifier: string, password: string) => Promise<AuthResult>;
  logOut: () => Promise<void>;
  checkUsername: (username: string) => Promise<boolean>;
  setDraftBeach: (beach: BeachOption) => void;
  setSports: (sports: SportProfile[]) => void;
  cycleFilter: (key: keyof MapFilter) => void;
  createCircle: (input: CreateCircleInput) => string;
  joinCircle: (circleId: string) => void;
  sendMessage: (circleId: string, text: string) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
};

const nowTime = () =>
  new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

const msgId = () => `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

let unsubscribe: (() => void) | null = null;

type Set = (partial: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void;
type Get = () => AppState;

// Load profile + data and start realtime for a signed-in uid (real or guest).
async function goLive(
  set: Set,
  get: Get,
  uid: string,
  kind: 'guest' | 'user',
  overrideName?: string,
  overrideUsername?: string,
) {
  const profile = await fetchProfile(uid);
  const base = get().user;
  const name = overrideName ?? profile?.name ?? base.name;
  const user: User = {
    ...base,
    id: uid,
    name,
    avatarInitial: name.trim().charAt(0) || base.avatarInitial,
    isPro: profile?.isPro ?? base.isPro,
    sports: profile?.sports ?? base.sports,
    homeBeaches: profile?.homeBeaches ?? base.homeBeaches,
  };
  set({ user, authKind: kind });
  if (!profile) {
    upsertProfile({
      userId: uid,
      name: user.name,
      avatarInitial: user.avatarInitial,
      avatarColor: user.avatarColor,
      isPro: user.isPro,
      username: overrideUsername,
      sports: user.sports,
      homeBeaches: user.homeBeaches,
    });
  }
  const data = await fetchAll();
  if (data) set({ ...data, live: true });
  subscribeAll(set);
}

function subscribeAll(set: Set) {
  unsubscribe?.();
  unsubscribe = subscribeRealtime({
    onCircleInsert: (circle) =>
      set((s) =>
        s.circles.some((c) => c.id === circle.id) ? s : { circles: [...s.circles, circle] },
      ),
    onPlayerInsert: (circleId, player) =>
      set((s) => ({
        circles: s.circles.map((c) => {
          if (c.id !== circleId || c.players.some((p) => p.id === player.id)) return c;
          const players = [...c.players, player];
          return { ...c, players, state: players.length >= c.capacity ? 'live' : c.state };
        }),
      })),
    onCircleUpdate: (patch) =>
      set((s) => ({
        circles: s.circles.map((c) => (c.id === patch.id ? { ...c, ...patch } : c)),
      })),
    onMessageInsert: (message) =>
      set((s) =>
        s.messages.some((m) => m.id === message.id) ? s : { messages: [...s.messages, message] },
      ),
    onNotificationUpdate: (id, unread) =>
      set((s) => ({
        notifications: s.notifications.map((n) => (n.id === id ? { ...n, unread } : n)),
      })),
  });
}

export const useStore = create<AppState>((set, get) => ({
  user: CURRENT_USER,
  circles: CIRCLES,
  messages: CHAT_MESSAGES,
  notifications: NOTIFICATIONS,
  live: false,
  authKind: 'none',
  draftBeach: BEACH_OPTIONS[0],
  filter: { sport: 'all', level: 'all' },

  circleById: (id) => get().circles.find((c) => c.id === id),
  messagesFor: (circleId) => get().messages.filter((m) => m.circleId === circleId),
  isJoined: (circleId) => {
    const { user } = get();
    return !!get()
      .circleById(circleId)
      ?.players.some((p) => p.id === user.id);
  },
  unreadCount: () => get().notifications.filter((n) => n.unread).length,

  hydrate: async () => {
    if (!isSupabaseConfigured || get().live) return;
    // Only go live if a session already exists (returning user / guest).
    // New visitors land on /login; auth actions establish the session.
    const info = await sessionInfo();
    if (info) await goLive(set, get, info.id, info.isAnonymous ? 'guest' : 'user');
  },

  continueAsGuest: async () => {
    const uid = await signInGuest();
    if (uid) await goLive(set, get, uid, 'guest');
    return !!uid;
  },

  signUpEmail: async (email, password, name, username) => {
    const res = await backendSignUpEmail(email, password, name, username);
    if (res.ok && !res.needsConfirmation && res.userId) {
      // confirmation disabled → session already active
      await goLive(set, get, res.userId, 'user', name, username);
    }
    return { ...res, name, username, email };
  },

  verifyOtp: async (email, token, name, username) => {
    const res = await verifyEmailOtp(email, token);
    if (res.ok && res.userId) await goLive(set, get, res.userId, 'user', name, username);
    return res;
  },

  logIn: async (identifier, password) => {
    const res = await signInPassword(identifier, password);
    if (res.ok && res.userId) await goLive(set, get, res.userId, 'user');
    return res;
  },

  logOut: async () => {
    unsubscribe?.();
    unsubscribe = null;
    await backendSignOut();
    set({
      user: CURRENT_USER,
      circles: CIRCLES,
      messages: CHAT_MESSAGES,
      notifications: NOTIFICATIONS,
      live: false,
      authKind: 'none',
    });
  },

  checkUsername: (username) => usernameAvailable(username),

  setDraftBeach: (beach) => set({ draftBeach: beach }),

  cycleFilter: (key) =>
    set((s) => {
      const cycle = key === 'sport' ? SPORT_CYCLE : LEVEL_CYCLE;
      const i = cycle.indexOf(s.filter[key] as never);
      const next = cycle[(i + 1) % cycle.length];
      return { filter: { ...s.filter, [key]: next } };
    }),

  setSports: (sports) => {
    const user = { ...get().user, sports };
    set({ user });
    if (get().live) {
      upsertProfile({
        userId: user.id,
        name: user.name,
        avatarInitial: user.avatarInitial,
        avatarColor: user.avatarColor,
        isPro: user.isPro,
        sports,
        homeBeaches: user.homeBeaches,
      });
    }
  },

  createCircle: (input) => {
    const { user, draftBeach } = get();
    const id = `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
    const host: Player = {
      id: user.id,
      name: user.name,
      avatarInitial: user.avatarInitial,
      avatarColor: user.avatarColor,
    };
    const circle: Circle = {
      id,
      sport: input.sport,
      sportLabel: input.sportLabel,
      beachId: draftBeach.id,
      beachName: draftBeach.name,
      court: draftBeach.court,
      levelLabel: input.levelLabel,
      capacity: input.missing + 1, // host takes the first slot
      players: [host],
      waitlist: [],
      state: input.scheduled ? 'scheduled' : 'missing',
      isOpen: input.isOpen,
      hostId: user.id,
      hostName: user.name,
      startLabel: input.startLabel,
      distanceLabel: distanceLabelFrom(draftBeach.lat, draftBeach.lng),
      // nudge off the beach anchor so markers don't stack on existing circles
      lat: draftBeach.lat + ((Date.now() % 7) - 3) * 0.0004,
      lng: draftBeach.lng + ((Date.now() % 5) - 2) * 0.0003,
    };
    const time = nowTime();
    const opening: ChatMessage = {
      id: `evt-open-${id}`,
      circleId: id,
      kind: 'join',
      text: `${user.name} פתח את המעגל · ${time}`,
      time,
    };
    set((s) => ({ circles: [...s.circles, circle], messages: [...s.messages, opening] }));
    if (get().live) pushCreateCircle(circle, host, [opening]);
    return id;
  },

  joinCircle: (circleId) => {
    const { user, circles, messages } = get();
    const circle = circles.find((c) => c.id === circleId);
    if (!circle) return;
    if (circle.players.some((p) => p.id === user.id)) return; // already in
    if (circle.players.length >= circle.capacity) return; // full → waitlist flow (8c)

    const me: Player = {
      id: user.id,
      name: user.name,
      avatarInitial: user.avatarInitial,
      avatarColor: user.avatarColor,
    };
    const players = [...circle.players, me];
    const nowFull = players.length >= circle.capacity;
    const updated: Circle = {
      ...circle,
      players,
      state: nowFull ? 'live' : circle.state,
    };

    const time = nowTime();
    const events: ChatMessage[] = [
      {
        id: `evt-join-${circleId}-${user.id}`,
        circleId,
        kind: 'join',
        text: `${user.name} הצטרף למעגל · ${time}`,
        time,
      },
    ];
    if (nowFull) {
      events.push({
        id: `evt-full-${circleId}`,
        circleId,
        kind: 'milestone',
        text: `המעגל התמלא — ${players.length}/${circle.capacity}. משחקים!`,
        time,
      });
    }

    set({
      circles: circles.map((c) => (c.id === circleId ? updated : c)),
      messages: [...messages, ...events],
    });
    if (get().live) pushJoin(circle, me, events);
  },

  sendMessage: (circleId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const message: ChatMessage = {
      id: msgId(),
      circleId,
      kind: 'out',
      text: trimmed,
      time: nowTime(),
    };
    set((s) => ({ messages: [...s.messages, message] }));
    if (get().live) pushMessages([message]);
  },

  markAllRead: () => {
    const unreadIds = get()
      .notifications.filter((n) => n.unread)
      .map((n) => n.id);
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, unread: false })) }));
    if (get().live) pushMarkRead(unreadIds);
  },

  markRead: (id) => {
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    }));
    if (get().live) pushMarkRead([id]);
  },
}));
