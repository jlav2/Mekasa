import { resetStore, useStore } from '../testUtils/testStore';
import { makeCircle } from '../testUtils/testFixtures';
import * as backend from '../../data/backend';

beforeEach(resetStore);

// Lets pending .then() callbacks chained onto mocked backend promises settle
// before assertions run (a macrotask tick drains the microtask queue first).
const flush = () => new Promise((r) => setTimeout(r, 0));

const CURRENT_UID = () => useStore.getState().user.id;

describe('createCircle', () => {
  it('creates a circle with the host as its sole player and capacity = missing + 1', () => {
    const id = useStore.getState().createCircle({
      sport: 'altinha',
      sportLabel: 'אלטינה',
      missing: 3,
      levelLabel: 'בינוניים',
      startLabel: 'עכשיו',
      scheduled: false,
      isOpen: true,
    });
    const circle = useStore.getState().circleById(id)!;
    expect(circle).toBeDefined();
    expect(circle.capacity).toBe(4);
    expect(circle.players).toHaveLength(1);
    expect(circle.players[0].id).toBe(CURRENT_UID());
    expect(circle.hostId).toBe(CURRENT_UID());
  });

  it('sets state "scheduled" when scheduled, "missing" otherwise', () => {
    const scheduledId = useStore.getState().createCircle({
      sport: 'altinha', sportLabel: 'א', missing: 1, levelLabel: 'x', startLabel: 'x', scheduled: true, isOpen: true,
    });
    expect(useStore.getState().circleById(scheduledId)!.state).toBe('scheduled');

    const nowId = useStore.getState().createCircle({
      sport: 'altinha', sportLabel: 'א', missing: 1, levelLabel: 'x', startLabel: 'x', scheduled: false, isOpen: true,
    });
    expect(useStore.getState().circleById(nowId)!.state).toBe('missing');
  });

  it('adds an opening chat message for the new circle', () => {
    const id = useStore.getState().createCircle({
      sport: 'altinha', sportLabel: 'א', missing: 1, levelLabel: 'x', startLabel: 'x', scheduled: false, isOpen: true,
    });
    const messages = useStore.getState().messagesFor(id);
    expect(messages).toHaveLength(1);
    expect(messages[0].kind).toBe('join');
  });

  it('does not push to the backend while offline', () => {
    useStore.getState().createCircle({
      sport: 'altinha', sportLabel: 'א', missing: 1, levelLabel: 'x', startLabel: 'x', scheduled: false, isOpen: true,
    });
    expect(backend.pushCreateCircle).not.toHaveBeenCalled();
  });

  it('rolls back the optimistic circle when the backend persist fails', async () => {
    useStore.setState({ live: true });
    jest.mocked(backend.pushCreateCircle).mockResolvedValueOnce(false);
    const id = useStore.getState().createCircle({
      sport: 'altinha', sportLabel: 'א', missing: 1, levelLabel: 'x', startLabel: 'x', scheduled: false, isOpen: true,
    });
    expect(useStore.getState().circleById(id)).toBeDefined(); // optimistic
    await flush();
    expect(useStore.getState().circleById(id)).toBeUndefined(); // rolled back
    expect(useStore.getState().messagesFor(id)).toHaveLength(0);
  });
});

describe('joinCircle', () => {
  it('adds the current user as a player and posts a join message', () => {
    const circle = makeCircle({ id: 'c1', capacity: 3, players: [{ id: 'p1', name: 'A', avatarInitial: 'A', avatarColor: '#000' }] });
    useStore.setState({ circles: [...useStore.getState().circles, circle] });

    useStore.getState().joinCircle('c1');

    const updated = useStore.getState().circleById('c1')!;
    expect(updated.players.map((p) => p.id)).toContain(CURRENT_UID());
    expect(updated.state).toBe('missing'); // not full yet (2/3)
    const joinMsg = useStore.getState().messagesFor('c1').find((m) => m.kind === 'join');
    expect(joinMsg).toBeDefined();
  });

  it('flips state to "live" and posts a milestone message when the join fills the circle', () => {
    const circle = makeCircle({ id: 'c2', capacity: 2, players: [{ id: 'p1', name: 'A', avatarInitial: 'A', avatarColor: '#000' }] });
    useStore.setState({ circles: [...useStore.getState().circles, circle] });

    useStore.getState().joinCircle('c2');

    const updated = useStore.getState().circleById('c2')!;
    expect(updated.state).toBe('live');
    expect(updated.players).toHaveLength(2);
    const milestone = useStore.getState().messagesFor('c2').find((m) => m.kind === 'milestone');
    expect(milestone).toBeDefined();
  });

  it('is a no-op if already a member', () => {
    const before = useStore.getState();
    // own-gordon has CURRENT_USER (u-guy) as a player in the fixture seed
    before.joinCircle('own-gordon');
    expect(useStore.getState().circleById('own-gordon')).toEqual(before.circleById('own-gordon'));
  });

  it('is a no-op if the circle is already full', () => {
    const circle = makeCircle({ id: 'full', capacity: 1, players: [{ id: 'p1', name: 'A', avatarInitial: 'A', avatarColor: '#000' }] });
    useStore.setState({ circles: [...useStore.getState().circles, circle] });

    useStore.getState().joinCircle('full');

    expect(useStore.getState().circleById('full')!.players).toHaveLength(1);
  });

  it('does not push to the backend while offline', () => {
    const circle = makeCircle({ id: 'c3', capacity: 2 });
    useStore.setState({ circles: [...useStore.getState().circles, circle] });
    useStore.getState().joinCircle('c3');
    expect(backend.pushJoin).not.toHaveBeenCalled();
  });

  // Regression: the DB capacity trigger can reject a join that lost a race
  // (#9). The optimistic add/state-flip/messages must all roll back.
  it('rolls back the optimistic join when the backend rejects it', async () => {
    useStore.setState({ live: true });
    jest.mocked(backend.pushJoin).mockResolvedValueOnce(false);
    const circle = makeCircle({ id: 'race', capacity: 2, players: [{ id: 'p1', name: 'A', avatarInitial: 'A', avatarColor: '#000' }] });
    useStore.setState({ circles: [...useStore.getState().circles, circle] });

    useStore.getState().joinCircle('race');
    expect(useStore.getState().circleById('race')!.players).toHaveLength(2); // optimistic
    expect(useStore.getState().circleById('race')!.state).toBe('live'); // optimistically flipped

    await flush();

    const rolledBack = useStore.getState().circleById('race')!;
    expect(rolledBack.players).toHaveLength(1);
    expect(rolledBack.players.some((p) => p.id === CURRENT_UID())).toBe(false);
    expect(rolledBack.state).toBe('missing'); // restored to its pre-join state
    expect(useStore.getState().messagesFor('race')).toHaveLength(0); // join+milestone both undone
  });
});

describe('leaveCircle', () => {
  it('removes the current user from the circle', () => {
    const circle = makeCircle({
      id: 'lc1',
      capacity: 3,
      players: [{ id: CURRENT_UID(), name: 'Me', avatarInitial: 'M', avatarColor: '#000' }, { id: 'p2', name: 'B', avatarInitial: 'B', avatarColor: '#000' }],
    });
    useStore.setState({ circles: [...useStore.getState().circles, circle] });

    useStore.getState().leaveCircle('lc1');

    expect(useStore.getState().circleById('lc1')!.players.map((p) => p.id)).not.toContain(CURRENT_UID());
  });

  it('reopens a full/live circle to "missing" when the leaver drops it below capacity', () => {
    const circle = makeCircle({
      id: 'lc2',
      state: 'live',
      capacity: 2,
      players: [{ id: CURRENT_UID(), name: 'Me', avatarInitial: 'M', avatarColor: '#000' }, { id: 'p2', name: 'B', avatarInitial: 'B', avatarColor: '#000' }],
    });
    useStore.setState({ circles: [...useStore.getState().circles, circle] });

    useStore.getState().leaveCircle('lc2');

    expect(useStore.getState().circleById('lc2')!.state).toBe('missing');
  });

  it('is a no-op if not a member of the circle', () => {
    const before = useStore.getState().circleById('frishman');
    useStore.getState().leaveCircle('frishman'); // CURRENT_USER (u-guy) isn't a frishman player in the fixture
    expect(useStore.getState().circleById('frishman')).toEqual(before);
  });

  it('pushes the leave to the backend once live', () => {
    useStore.setState({ live: true });
    const circle = makeCircle({
      id: 'lc3',
      players: [{ id: CURRENT_UID(), name: 'Me', avatarInitial: 'M', avatarColor: '#000' }],
    });
    useStore.setState({ circles: [...useStore.getState().circles, circle] });

    useStore.getState().leaveCircle('lc3');

    expect(backend.pushLeave).toHaveBeenCalledWith('lc3', CURRENT_UID());
  });
});

describe('joinWaitlist / leaveWaitlist', () => {
  it('adds the current user to the waitlist', () => {
    const circle = makeCircle({ id: 'wl1' });
    useStore.setState({ circles: [...useStore.getState().circles, circle] });

    useStore.getState().joinWaitlist('wl1');

    expect(useStore.getState().isWaitlisted('wl1')).toBe(true);
    expect(useStore.getState().circleById('wl1')!.waitlist.map((p) => p.id)).toContain(CURRENT_UID());
  });

  it('is a no-op if already playing in the circle', () => {
    // own-gordon has CURRENT_USER as a player already
    useStore.getState().joinWaitlist('own-gordon');
    expect(useStore.getState().circleById('own-gordon')!.waitlist).toHaveLength(0);
  });

  it('is a no-op if already on the waitlist', () => {
    const circle = makeCircle({ id: 'wl2' });
    useStore.setState({ circles: [...useStore.getState().circles, circle] });
    useStore.getState().joinWaitlist('wl2');
    useStore.getState().joinWaitlist('wl2');
    expect(useStore.getState().circleById('wl2')!.waitlist).toHaveLength(1);
  });

  it('removes the current user via leaveWaitlist', () => {
    const circle = makeCircle({ id: 'wl3' });
    useStore.setState({ circles: [...useStore.getState().circles, circle] });
    useStore.getState().joinWaitlist('wl3');
    useStore.getState().leaveWaitlist('wl3');
    expect(useStore.getState().isWaitlisted('wl3')).toBe(false);
  });

  it('pushes join/leave waitlist to the backend once live', () => {
    useStore.setState({ live: true });
    const circle = makeCircle({ id: 'wl4' });
    useStore.setState({ circles: [...useStore.getState().circles, circle] });

    useStore.getState().joinWaitlist('wl4');
    expect(backend.pushJoinWaitlist).toHaveBeenCalledTimes(1);

    useStore.getState().leaveWaitlist('wl4');
    expect(backend.pushLeaveWaitlist).toHaveBeenCalledWith('wl4', CURRENT_UID());
  });
});
