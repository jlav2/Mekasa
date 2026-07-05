import { NOTIFICATIONS } from '../../data/fixtures';
import { pushMarkRead } from '../../data/backend';
import type { AppState, Set, Get } from '../types';

type NotificationsSlice = Pick<
  AppState,
  'notifications' | 'unreadCount' | 'markAllRead' | 'markRead'
>;

export const createNotificationsSlice = (set: Set, get: Get): NotificationsSlice => ({
  notifications: NOTIFICATIONS,

  unreadCount: () => get().notifications.filter((n) => n.unread).length,

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
});
