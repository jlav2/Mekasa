import { render, screen, fireEvent } from '@testing-library/react-native';
import Profile from '../../../app/(tabs)/profile';
import { useStore } from '../../../src/store';
import type { Circle, Player, User } from '../../../src/data/models';

// This screen only reads the store + navigates via useRouter — no async
// handlers to await (no backend calls happen here), so bare fireEvent.press
// is fine per the house rules (rule 2).
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
}));

const INITIAL_STATE = useStore.getState();

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'u-test',
  name: 'טסט טסטר',
  avatarInitial: 'ט',
  avatarColor: '#123456',
  city: 'תל אביב',
  memberSince: 2024,
  sports: [],
  homeBeaches: [],
  followedBeaches: [],
  isPro: false,
  // NB: this legacy `stats` field is intentionally NOT what the screen
  // renders anymore — the screen derives its own stats from `circles`. We
  // deliberately set nonsense values here to prove the screen ignores them.
  stats: { circles: 999, beaches: 999, partners: 999, hours: 999 },
  ...overrides,
});

const makePlayer = (id: string, name: string): Player => ({
  id,
  name,
  avatarInitial: name[0],
  avatarColor: '#654321',
});

const makeCircle = (overrides: Partial<Circle> = {}): Circle => ({
  id: 'c-1',
  sport: 'footvolley',
  sportLabel: "פוצ'יוולי",
  beachId: 'frishman',
  beachName: 'חוף פרישמן',
  court: 'מגרש 2, ליד המציל',
  levelLabel: 'בינוניים',
  capacity: 4,
  players: [makePlayer('p1', 'עומר'), makePlayer('p2', 'דניאל')],
  waitlist: [],
  state: 'missing',
  isOpen: true,
  hostId: 'p1',
  hostName: 'עומר',
  startLabel: "התחיל לפני 20 דק'",
  distanceLabel: "300 מ' ממך",
  lat: 32.0809,
  lng: 34.767,
  ...overrides,
});

beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
  mockPush.mockClear();
  mockReplace.mockClear();
});

describe('Profile screen', () => {
  it('shows 0/0/0 stats and the Pro upsell (not "Pro active") for a user with zero circles and isPro=false', async () => {
    useStore.setState({
      user: makeUser({ isPro: false, sports: [], homeBeaches: [] }),
      circles: [],
    });

    await render(<Profile />);

    // Regression: must NOT fall back to the old hardcoded 47/12/128 fixture
    // stats, nor to the nonsense `user.stats` field set above.
    expect(screen.queryByText('47')).toBeNull();
    expect(screen.queryByText('12')).toBeNull();
    expect(screen.queryByText('128')).toBeNull();
    expect(screen.queryByText('999')).toBeNull();
    expect(screen.getAllByText('0')).toHaveLength(3);

    expect(screen.getByText('שדרג ל־MeKasa Pro')).toBeTruthy();
    expect(screen.queryByText('MeKasa Pro פעיל')).toBeNull();

    // No sports/beaches the user has none of.
    expect(screen.queryByText('הענפים שלי')).toBeNull();
    expect(screen.queryByText('החופים הקבועים שלי')).toBeNull();
  });

  it('derives stat counts from circles the user is actually in (not hardcoded), deduping beaches and partners', async () => {
    const user = makeUser({ id: 'u-guy', isPro: false });
    const inFrishmanWithOmer = makeCircle({
      id: 'c-a',
      beachId: 'frishman',
      beachName: 'חוף פרישמן',
      players: [makePlayer(user.id, 'אני'), makePlayer('p-omer', 'עומר')],
    });
    // Same beach as above (frishman) — must NOT double-count the beach.
    const inFrishmanWithDaniel = makeCircle({
      id: 'c-b',
      beachId: 'frishman',
      beachName: 'חוף פרישמן',
      players: [makePlayer(user.id, 'אני'), makePlayer('p-daniel', 'דניאל')],
    });
    // Different beach, and same partner (omer) as circle A — must NOT
    // double-count the partner.
    const inGordonWithOmer = makeCircle({
      id: 'c-c',
      beachId: 'gordon',
      beachName: 'חוף גורדון',
      players: [makePlayer(user.id, 'אני'), makePlayer('p-omer', 'עומר')],
    });
    // The user is NOT in this circle at all — must be excluded entirely.
    const notMine = makeCircle({
      id: 'c-d',
      beachId: 'bograshov',
      beachName: 'חוף בוגרשוב',
      players: [makePlayer('p-other1', 'אחר1'), makePlayer('p-other2', 'אחר2')],
    });

    useStore.setState({
      user,
      circles: [inFrishmanWithOmer, inFrishmanWithDaniel, inGordonWithOmer, notMine],
    });

    await render(<Profile />);

    // circles: 3 (a, b, c) — excludes notMine.
    expect(screen.getByText('3')).toBeTruthy();
    // beaches: 2 distinct (frishman, gordon) despite 3 circles, AND
    // partners: 2 distinct (omer, daniel) despite omer appearing twice —
    // both stat cards should read "2", never a stray "4" from double-counting.
    expect(screen.getAllByText('2')).toHaveLength(2);
    expect(screen.queryByText('4')).toBeNull();
  });

  it('shows "MeKasa Pro פעיל" instead of the upsell when user.isPro is true', async () => {
    useStore.setState({
      user: makeUser({ isPro: true }),
      circles: [],
    });

    await render(<Profile />);

    expect(screen.getByText('MeKasa Pro פעיל')).toBeTruthy();
    expect(screen.queryByText('שדרג ל־MeKasa Pro')).toBeNull();
  });

  it('renders the sports section with label and level when the user has sport profiles', async () => {
    useStore.setState({
      user: makeUser({ sports: [{ sport: 'volleyball', level: 3, verifiedByPeers: true }] }),
      circles: [],
    });

    await render(<Profile />);

    expect(screen.getByText('הענפים שלי')).toBeTruthy();
    expect(screen.getByText('כדורעף חופים')).toBeTruthy();
    expect(screen.getByText('מתקדם')).toBeTruthy();
  });

  it('renders home-beach chips when the user has home beaches', async () => {
    useStore.setState({
      user: makeUser({ homeBeaches: ['חוף פרישמן', 'חוף בוגרשוב'] }),
      circles: [],
    });

    await render(<Profile />);

    expect(screen.getByText('החופים הקבועים שלי')).toBeTruthy();
    expect(screen.getByText('חוף פרישמן')).toBeTruthy();
    expect(screen.getByText('חוף בוגרשוב')).toBeTruthy();
  });

  it('navigates to /settings when the gear icon is pressed', async () => {
    useStore.setState({ user: makeUser(), circles: [] });
    await render(<Profile />);

    fireEvent.press(screen.getByLabelText('הגדרות'));

    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('navigates to /paywall when the pro banner is pressed', async () => {
    useStore.setState({ user: makeUser({ isPro: false }), circles: [] });
    await render(<Profile />);

    fireEvent.press(screen.getByText('שדרג ל־MeKasa Pro'));

    expect(mockPush).toHaveBeenCalledWith('/paywall');
  });
});
