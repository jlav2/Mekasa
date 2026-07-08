import { resetStore, useStore } from '../testUtils/testStore';
import * as backend from '../../data/backend';
import { CURRENT_USER, CIRCLES } from '../../data/fixtures';

beforeEach(resetStore);

describe('setName', () => {
  it('trims the name and derives the avatar initial', () => {
    useStore.getState().setName('  יוני חוף  ');
    expect(useStore.getState().user.name).toBe('יוני חוף');
    expect(useStore.getState().user.avatarInitial).toBe('י');
  });

  it('ignores an empty or whitespace-only name', () => {
    const before = useStore.getState().user;
    useStore.getState().setName('   ');
    expect(useStore.getState().user).toEqual(before);
  });

  // Regression: setName and setSports both fire from onboarding's "continue"
  // button. setName previously sent the FULL profile row (including a stale
  // sports: []), which clobbered a concurrent setSports write. It must now
  // touch identity fields only.
  it('writes identity fields only to the backend — never sports/homeBeaches', () => {
    useStore.setState({ live: true });
    useStore.getState().setName('יוני חוף');

    expect(backend.upsertProfile).toHaveBeenCalledTimes(1);
    const written = jest.mocked(backend.upsertProfile).mock.calls[0][0];
    expect(written).not.toHaveProperty('sports');
    expect(written).not.toHaveProperty('homeBeaches');
    expect(written.name).toBe('יוני חוף');
    expect(written.userId).toBe(useStore.getState().user.id);
  });

  it('does not write to the backend while offline', () => {
    useStore.getState().setName('יוני חוף');
    expect(backend.upsertProfile).not.toHaveBeenCalled();
  });
});

describe('setSports', () => {
  it('updates the sports list', () => {
    const sports = [{ sport: 'altinha' as const, level: 2 as const, verifiedByPeers: false }];
    useStore.getState().setSports(sports);
    expect(useStore.getState().user.sports).toEqual(sports);
  });

  it('writes the full profile (including sports) once live', () => {
    useStore.setState({ live: true });
    const sports = [{ sport: 'altinha' as const, level: 2 as const, verifiedByPeers: false }];
    useStore.getState().setSports(sports);

    const written = jest.mocked(backend.upsertProfile).mock.calls[0][0];
    expect(written.sports).toEqual(sports);
    expect(written).toHaveProperty('homeBeaches');
  });
});

describe('logOut', () => {
  it('resets user/circles/messages/notifications/live/authKind to the fixture seed', async () => {
    useStore.setState({
      user: { ...CURRENT_USER, name: 'Someone Else' },
      live: true,
      authKind: 'user',
    });

    await useStore.getState().logOut();

    const s = useStore.getState();
    expect(s.user).toEqual(CURRENT_USER);
    expect(s.live).toBe(false);
    expect(s.authKind).toBe('none');
    expect(s.circles).toEqual(CIRCLES);
  });

  it('calls the backend sign-out', async () => {
    await useStore.getState().logOut();
    expect(backend.signOut).toHaveBeenCalledTimes(1);
  });
});

describe('deleteAccount', () => {
  it('resets local state on success', async () => {
    useStore.setState({ user: { ...CURRENT_USER, name: 'Someone Else' }, live: true, authKind: 'user' });
    jest.mocked(backend.deleteAccount).mockResolvedValueOnce({ ok: true });

    const res = await useStore.getState().deleteAccount();

    expect(res.ok).toBe(true);
    expect(useStore.getState().user).toEqual(CURRENT_USER);
    expect(useStore.getState().authKind).toBe('none');
  });

  it('leaves local state untouched when the backend call fails', async () => {
    const customUser = { ...CURRENT_USER, name: 'Someone Else' };
    useStore.setState({ user: customUser, live: true, authKind: 'user' });
    jest.mocked(backend.deleteAccount).mockResolvedValueOnce({ ok: false, error: 'nope' });

    const res = await useStore.getState().deleteAccount();

    expect(res.ok).toBe(false);
    expect(useStore.getState().user).toEqual(customUser);
    expect(useStore.getState().authKind).toBe('user');
  });
});

describe('checkUsername', () => {
  it('delegates to the backend', async () => {
    jest.mocked(backend.usernameAvailable).mockResolvedValueOnce(false);
    await expect(useStore.getState().checkUsername('taken')).resolves.toBe(false);
    expect(backend.usernameAvailable).toHaveBeenCalledWith('taken');
  });
});
