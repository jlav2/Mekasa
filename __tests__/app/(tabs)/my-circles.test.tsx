import { render, screen, fireEvent } from '@testing-library/react-native';
import MyCircles from '../../../app/(tabs)/my-circles';
import { useStore } from '../../../src/store';
import type { Circle, Player } from '../../../src/data/models';

// This screen only reads the store + navigates via useRouter — no async
// handlers to await (no backend calls happen here), so bare fireEvent.press
// is fine per the house rules (rule 2).
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
}));

const INITIAL_STATE = useStore.getState();
const userId = INITIAL_STATE.user.id;

const makePlayer = (id: string, name: string): Player => ({
  id,
  name,
  avatarInitial: name[0],
  avatarColor: '#123456',
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

describe('MyCircles screen', () => {
  it('renders the live-hero card with the correct player count for a live circle the user is in', async () => {
    const live = makeCircle({
      id: 'c-live',
      state: 'live',
      capacity: 4,
      players: [makePlayer(userId, 'אני'), makePlayer('p2', 'דניאל'), makePlayer('p3', 'נועה')],
    });
    useStore.setState({ circles: [live] });

    await render(<MyCircles />);

    expect(screen.getByText('משחק חי — אתה בפנים')).toBeTruthy();
    expect(screen.getByText(`${live.sportLabel} · ${live.beachName}`)).toBeTruthy();
    expect(screen.getByText(`3/4 · ${live.court}`)).toBeTruthy();
  });

  it('renders an UpcomingRow for a scheduled circle the user joined (non-host)', async () => {
    const upcoming = makeCircle({
      id: 'c-upcoming',
      state: 'scheduled',
      capacity: 4,
      hostId: 'p1',
      startLabel: 'ראשון 18:00',
      players: [makePlayer('p1', 'עומר'), makePlayer(userId, 'אני')],
    });
    useStore.setState({ circles: [upcoming] });

    await render(<MyCircles />);

    expect(screen.getByText(`${upcoming.sportLabel} · ${upcoming.beachName}`)).toBeTruthy();
    expect(screen.getByText('ראשון 18:00 · הצטרפת · חסרים 2')).toBeTruthy();
    expect(screen.getByText('קרוב')).toBeTruthy();
  });

  it('shows host-specific wording and badge for an upcoming circle the user hosts', async () => {
    const upcoming = makeCircle({
      id: 'c-mine',
      state: 'missing',
      capacity: 4,
      hostId: userId,
      startLabel: "חסר שחקן",
      players: [makePlayer(userId, 'אני'), makePlayer('p2', 'דניאל')],
    });
    useStore.setState({ circles: [upcoming] });

    await render(<MyCircles />);

    expect(screen.getByText('חסר שחקן · פתחת את המעגל · חסרים 2')).toBeTruthy();
    expect(screen.getByText('שלך')).toBeTruthy();
    expect(screen.queryByText('קרוב')).toBeNull();
  });

  it('renders the empty state when the user has zero circles, and "למפה" navigates to /map', async () => {
    // None of these circles include the current user as a player.
    useStore.setState({
      circles: [makeCircle({ id: 'c-other', players: [makePlayer('p1', 'עומר'), makePlayer('p2', 'דניאל')] })],
    });

    await render(<MyCircles />);

    expect(screen.getByText('עדיין אין לך מעגלים')).toBeTruthy();

    fireEvent.press(screen.getByText('למפה'));
    expect(mockPush).toHaveBeenCalledWith('/map');
  });

  it('shows the correct circle and (deduplicated) beach counts in the summary line', async () => {
    const first = makeCircle({
      id: 'c-1',
      beachId: 'frishman',
      beachName: 'חוף פרישמן',
      state: 'live',
      players: [makePlayer(userId, 'אני'), makePlayer('p2', 'דניאל')],
    });
    const second = makeCircle({
      id: 'c-2',
      beachId: 'frishman',
      beachName: 'חוף פרישמן',
      state: 'scheduled',
      hostId: 'p3',
      players: [makePlayer('p3', 'יובל'), makePlayer(userId, 'אני')],
    });
    useStore.setState({ circles: [first, second] });

    await render(<MyCircles />);

    // Both circles share the same beach, so beachCount should be 1, not 2.
    expect(screen.getByText('אתה ב־2 מעגלים · 1 חופים')).toBeTruthy();
  });
});
