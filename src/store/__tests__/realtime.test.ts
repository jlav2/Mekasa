import { resetStore, useStore } from '../testUtils/testStore';
import { makeCircle } from '../testUtils/testFixtures';
import { goLive } from '../realtime';
import * as backend from '../../data/backend';

beforeEach(resetStore);

describe('goLive — new account', () => {
  it('seeds a clean profile from real auth data only (never the demo fixture)', async () => {
    jest.mocked(backend.fetchProfile).mockResolvedValueOnce(null); // no existing row
    jest.mocked(backend.authMetadata).mockResolvedValueOnce(null);
    jest.mocked(backend.fetchAll).mockResolvedValueOnce({ circles: [], messages: [], notifications: [] });

    await goLive(useStore.setState, useStore.getState, 'new-uid', 'guest');

    const user = useStore.getState().user;
    expect(user.id).toBe('new-uid');
    expect(user.name).toBe('אורח'); // guest default, not the fixture name
    expect(user.isPro).toBe(false);
    expect(user.sports).toEqual([]);
    expect(useStore.getState().live).toBe(true);
    expect(backend.upsertProfile).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'new-uid', isPro: false, sports: [] }),
    );
  });

  it('uses the auth-metadata name for a non-guest first sign-in', async () => {
    jest.mocked(backend.fetchProfile).mockResolvedValueOnce(null);
    jest.mocked(backend.authMetadata).mockResolvedValueOnce({ name: 'דנה כהן', email: 'dana@x.com' });
    jest.mocked(backend.fetchAll).mockResolvedValueOnce({ circles: [], messages: [], notifications: [] });

    await goLive(useStore.setState, useStore.getState, 'oauth-uid', 'user');

    expect(useStore.getState().user.name).toBe('דנה כהן');
  });
});

describe('goLive — returning account', () => {
  it('hydrates identity from the saved profile and does not re-upsert it', async () => {
    jest.mocked(backend.fetchProfile).mockResolvedValueOnce({
      name: 'שחקן ותיק',
      isPro: true,
      sports: [{ sport: 'altinha', level: 3, verifiedByPeers: true }],
      homeBeaches: ['חוף גורדון'],
    });
    jest.mocked(backend.authMetadata).mockResolvedValueOnce(null);
    jest.mocked(backend.fetchAll).mockResolvedValueOnce({ circles: [], messages: [], notifications: [] });

    await goLive(useStore.setState, useStore.getState, 'returning-uid', 'user');

    const user = useStore.getState().user;
    expect(user.name).toBe('שחקן ותיק');
    expect(user.isPro).toBe(true);
    expect(user.sports).toHaveLength(1);
    expect(backend.upsertProfile).not.toHaveBeenCalled();
  });
});

// Regression (#38): a failed data fetch must not leave the app in a half-live
// state (real identity layered over fixture circles, subscribed but not live).
describe('goLive — fetchAll failure', () => {
  it('stays offline: live stays false, fixture circles are untouched', async () => {
    const circlesBefore = useStore.getState().circles;
    jest.mocked(backend.fetchProfile).mockResolvedValueOnce(null);
    jest.mocked(backend.authMetadata).mockResolvedValueOnce(null);
    jest.mocked(backend.fetchAll).mockResolvedValueOnce(null);

    await goLive(useStore.setState, useStore.getState, 'flaky-uid', 'guest');

    expect(useStore.getState().live).toBe(false);
    expect(useStore.getState().user.id).toBe('flaky-uid'); // identity is still applied
    expect(useStore.getState().circles).toBe(circlesBefore); // untouched fixture reference
    expect(backend.subscribeRealtime).not.toHaveBeenCalled();
  });
});

describe('goLive — concurrency guard', () => {
  it('is a no-op once already live', async () => {
    useStore.setState({ live: true });
    await goLive(useStore.setState, useStore.getState, 'uid', 'guest');
    expect(backend.fetchProfile).not.toHaveBeenCalled();
  });

  it('guards against two concurrent calls for the same in-flight session', async () => {
    let resolveProfile: (v: unknown) => void = () => {};
    const pending = new Promise((resolve) => {
      resolveProfile = resolve;
    });
    jest.mocked(backend.fetchProfile).mockReturnValueOnce(pending as ReturnType<typeof backend.fetchProfile>);
    jest.mocked(backend.authMetadata).mockResolvedValue(null);
    jest.mocked(backend.fetchAll).mockResolvedValue(null);

    const first = goLive(useStore.setState, useStore.getState, 'uid-x', 'guest');
    const second = goLive(useStore.setState, useStore.getState, 'uid-x', 'guest'); // short-circuits: goingLive already true

    resolveProfile(null);
    await Promise.all([first, second]);

    expect(backend.fetchProfile).toHaveBeenCalledTimes(1);
  });
});

describe('realtime merge handlers', () => {
  let handlers: Parameters<typeof backend.subscribeRealtime>[0];

  beforeEach(async () => {
    jest.mocked(backend.subscribeRealtime).mockImplementation((h) => {
      handlers = h;
      return () => {};
    });
    jest.mocked(backend.fetchProfile).mockResolvedValueOnce(null);
    jest.mocked(backend.authMetadata).mockResolvedValueOnce(null);
    jest.mocked(backend.fetchAll).mockResolvedValueOnce({
      circles: [],
      messages: [],
      notifications: [{ id: 'n-seed', kind: 'social', group: 'now', title: 'x', time: 'x', unread: true }],
    });
    await goLive(useStore.setState, useStore.getState, 'uid', 'guest');
  });

  it('onCircleInsert adds a circle and is idempotent on a duplicate id', () => {
    const circle = makeCircle({ id: 'rc1' });
    handlers.onCircleInsert(circle);
    expect(useStore.getState().circleById('rc1')).toBeDefined();
    handlers.onCircleInsert(circle);
    expect(useStore.getState().circles.filter((c) => c.id === 'rc1')).toHaveLength(1);
  });

  it('onCircleRemove drops the circle and its messages', () => {
    handlers.onCircleInsert(makeCircle({ id: 'rc2' }));
    useStore.setState((s) => ({
      messages: [...s.messages, { id: 'm1', circleId: 'rc2', kind: 'join' as const, text: 'x', time: 'x' }],
    }));
    handlers.onCircleRemove('rc2');
    expect(useStore.getState().circleById('rc2')).toBeUndefined();
    expect(useStore.getState().messagesFor('rc2')).toHaveLength(0);
  });

  it('onPlayerInsert adds a player, flips to live at capacity, and is idempotent on a duplicate', () => {
    handlers.onCircleInsert(makeCircle({ id: 'rc3', capacity: 1 }));
    const player = { id: 'p1', name: 'A', avatarInitial: 'A', avatarColor: '#000' };
    handlers.onPlayerInsert('rc3', player);
    expect(useStore.getState().circleById('rc3')!.players).toHaveLength(1);
    expect(useStore.getState().circleById('rc3')!.state).toBe('live');
    handlers.onPlayerInsert('rc3', player);
    expect(useStore.getState().circleById('rc3')!.players).toHaveLength(1);
  });

  it('onPlayerRemove drops a player and reopens a live circle below capacity', () => {
    handlers.onCircleInsert(
      makeCircle({
        id: 'rc4',
        state: 'live',
        capacity: 2,
        players: [
          { id: 'p1', name: 'A', avatarInitial: 'A', avatarColor: '#000' },
          { id: 'p2', name: 'B', avatarInitial: 'B', avatarColor: '#000' },
        ],
      }),
    );
    handlers.onPlayerRemove('rc4', 'p1');
    const updated = useStore.getState().circleById('rc4')!;
    expect(updated.players.map((p) => p.id)).toEqual(['p2']);
    expect(updated.state).toBe('missing');
  });

  it('onWaitlistInsert/onWaitlistRemove add, dedupe, and remove', () => {
    handlers.onCircleInsert(makeCircle({ id: 'rc5' }));
    const player = { id: 'p1', name: 'A', avatarInitial: 'A', avatarColor: '#000' };
    handlers.onWaitlistInsert('rc5', player);
    handlers.onWaitlistInsert('rc5', player); // duplicate
    expect(useStore.getState().circleById('rc5')!.waitlist).toHaveLength(1);
    handlers.onWaitlistRemove('rc5', 'p1');
    expect(useStore.getState().circleById('rc5')!.waitlist).toHaveLength(0);
  });

  it('onMessageInsert is idempotent on a duplicate id', () => {
    const msg = { id: 'dup-1', circleId: 'frishman', kind: 'out' as const, text: 'hi', time: 'x' };
    handlers.onMessageInsert(msg);
    handlers.onMessageInsert(msg);
    expect(useStore.getState().messages.filter((m) => m.id === 'dup-1')).toHaveLength(1);
  });

  it('onNotificationInsert is idempotent on a duplicate id', () => {
    const notif = { id: 'dup-n', kind: 'social' as const, group: 'now' as const, title: 'x', time: 'x', unread: true };
    handlers.onNotificationInsert(notif);
    handlers.onNotificationInsert(notif);
    expect(useStore.getState().notifications.filter((n) => n.id === 'dup-n')).toHaveLength(1);
  });

  it('onNotificationUpdate flips only the targeted notification', () => {
    const target = useStore.getState().notifications[0];
    handlers.onNotificationUpdate(target.id, false);
    expect(useStore.getState().notifications.find((n) => n.id === target.id)!.unread).toBe(false);
  });
});
