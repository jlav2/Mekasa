// App store — Zustand. Seeds from fixtures for instant first paint, then
// hydrate() replaces state from Supabase (when configured) and subscribes to
// realtime changes. Actions apply optimistically and write through to the
// backend; realtime echoes are merged idempotently.
import { create } from 'zustand';
import type { AppNotification, ChatMessage, Circle, Player, User } from '../data/models';
import { CHAT_MESSAGES, CIRCLES, CURRENT_USER, NOTIFICATIONS } from '../data/fixtures';
import { fetchAll, pushJoin, pushMarkRead, pushMessages, subscribeRealtime } from '../data/backend';
import { isSupabaseConfigured } from '../lib/supabase';

type AppState = {
  user: User;
  circles: Circle[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  live: boolean; // true once hydrated from Supabase

  // derived helpers
  circleById: (id: string) => Circle | undefined;
  messagesFor: (circleId: string) => ChatMessage[];
  isJoined: (circleId: string) => boolean;
  unreadCount: () => number;

  // actions
  hydrate: () => Promise<void>;
  joinCircle: (circleId: string) => void;
  sendMessage: (circleId: string, text: string) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
};

const nowTime = () =>
  new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

const msgId = () => `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

let unsubscribe: (() => void) | null = null;

export const useStore = create<AppState>((set, get) => ({
  user: CURRENT_USER,
  circles: CIRCLES,
  messages: CHAT_MESSAGES,
  notifications: NOTIFICATIONS,
  live: false,

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
    const data = await fetchAll();
    if (!data) return; // fetch failed → stay on fixtures
    set({ ...data, live: true });

    unsubscribe?.();
    unsubscribe = subscribeRealtime({
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
          s.messages.some((m) => m.id === message.id)
            ? s
            : { messages: [...s.messages, message] },
        ),
      onNotificationUpdate: (id, unread) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, unread } : n)),
        })),
    });
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
    if (get().live) pushJoin(circle, me, events, nowFull);
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
