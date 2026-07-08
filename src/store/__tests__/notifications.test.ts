import { resetStore, useStore } from '../testUtils/testStore';
import * as backend from '../../data/backend';

beforeEach(resetStore);

describe('unreadCount', () => {
  it('counts only unread notifications', () => {
    const expected = useStore.getState().notifications.filter((n) => n.unread).length;
    expect(useStore.getState().unreadCount()).toBe(expected);
    expect(expected).toBeGreaterThan(0); // sanity: fixture actually has unread rows
  });
});

describe('markRead', () => {
  it('marks only the targeted notification as read', () => {
    const target = useStore.getState().notifications.find((n) => n.unread)!;
    useStore.getState().markRead(target.id);
    const updated = useStore.getState().notifications.find((n) => n.id === target.id)!;
    expect(updated.unread).toBe(false);
  });

  it('does not push to the backend while offline', () => {
    const target = useStore.getState().notifications.find((n) => n.unread)!;
    useStore.getState().markRead(target.id);
    expect(backend.pushMarkRead).not.toHaveBeenCalled();
  });

  it('pushes exactly the marked id once live', () => {
    useStore.setState({ live: true });
    const target = useStore.getState().notifications.find((n) => n.unread)!;
    useStore.getState().markRead(target.id);
    expect(backend.pushMarkRead).toHaveBeenCalledWith([target.id]);
  });
});

describe('markAllRead', () => {
  it('marks every notification as read', () => {
    useStore.getState().markAllRead();
    expect(useStore.getState().notifications.every((n) => !n.unread)).toBe(true);
    expect(useStore.getState().unreadCount()).toBe(0);
  });

  it('pushes exactly the ids that were unread beforehand, once live', () => {
    useStore.setState({ live: true });
    const unreadIds = useStore.getState().notifications.filter((n) => n.unread).map((n) => n.id);
    useStore.getState().markAllRead();
    expect(backend.pushMarkRead).toHaveBeenCalledWith(unreadIds);
  });
});
