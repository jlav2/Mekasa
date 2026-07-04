// App store — Zustand. Seeded from fixtures; actions mutate like the real
// product will once a backend exists (joins, chat, notification reads).
import { create } from 'zustand';
import type { AppNotification, ChatMessage, Circle, User } from '../data/models';
import { CHAT_MESSAGES, CIRCLES, CURRENT_USER, NOTIFICATIONS } from '../data/fixtures';

type AppState = {
  user: User;
  circles: Circle[];
  messages: ChatMessage[];
  notifications: AppNotification[];

  // derived helpers
  circleById: (id: string) => Circle | undefined;
  messagesFor: (circleId: string) => ChatMessage[];
  isJoined: (circleId: string) => boolean;
  unreadCount: () => number;

  // actions
  joinCircle: (circleId: string) => void;
  sendMessage: (circleId: string, text: string) => void;
  markAllRead: () => void;
};

const nowTime = () =>
  new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

export const useStore = create<AppState>((set, get) => ({
  user: CURRENT_USER,
  circles: CIRCLES,
  messages: CHAT_MESSAGES,
  notifications: NOTIFICATIONS,

  circleById: (id) => get().circles.find((c) => c.id === id),
  messagesFor: (circleId) => get().messages.filter((m) => m.circleId === circleId),
  isJoined: (circleId) => {
    const { user } = get();
    return !!get()
      .circleById(circleId)
      ?.players.some((p) => p.id === user.id);
  },
  unreadCount: () => get().notifications.filter((n) => n.unread).length,

  joinCircle: (circleId) => {
    const { user, circles, messages } = get();
    const circle = circles.find((c) => c.id === circleId);
    if (!circle) return;
    if (circle.players.some((p) => p.id === user.id)) return; // already in
    if (circle.players.length >= circle.capacity) return; // full → waitlist flow (8c)

    const players = [
      ...circle.players,
      { id: user.id, name: user.name, avatarInitial: user.avatarInitial, avatarColor: user.avatarColor },
    ];
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
  },

  sendMessage: (circleId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: `msg-${s.messages.length + 1}-${circleId}`,
          circleId,
          kind: 'out',
          text: trimmed,
          time: nowTime(),
        },
      ],
    }));
  },

  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, unread: false })) })),
}));
