import { render, screen, fireEvent } from '@testing-library/react-native';
import MapList from '../../app/map-list';
import { useStore } from '../../src/store';
import { TOURNAMENT } from '../../src/data/fixtures';
import type { Circle, Player } from '../../src/data/models';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));

const player = (overrides: Partial<Player> = {}): Player => ({
  id: 'p-1',
  name: 'שחקן',
  avatarInitial: 'ש',
  avatarColor: '#4C8C7C',
  ...overrides,
});

const circle = (overrides: Partial<Circle> = {}): Circle => ({
  id: 'c-1',
  sport: 'footvolley',
  sportLabel: "פוצ'יוולי",
  beachId: 'b-1',
  beachName: 'חוף א',
  court: 'מגרש 1',
  levelLabel: 'מתחילים',
  capacity: 4,
  players: [player()],
  waitlist: [],
  state: 'missing',
  isOpen: true,
  hostId: 'p-1',
  hostName: 'שחקן',
  startLabel: 'עכשיו',
  distanceLabel: "300 מ' ממך",
  lat: 32.08,
  lng: 34.77,
  ...overrides,
});

// Two actionable circles (missing + live) and one scheduled circle, which the
// sheet must NOT show a row for (scheduled circles never appear in rows/map,
// per map-list.tsx's filter).
const missingCircle = circle({
  id: 'c-missing',
  sportLabel: "פוצ'יוולי",
  beachName: 'חוף פרישמן',
  levelLabel: 'מתחילים',
  distanceLabel: "300 מ' ממך",
  capacity: 4,
  players: [player({ id: 'p-a' }), player({ id: 'p-b' })], // 2 missing
  state: 'missing',
});

const liveCircle = circle({
  id: 'c-live',
  sportLabel: 'אלטינה',
  beachName: 'חוף גורדון',
  levelLabel: 'בינוניים',
  distanceLabel: "650 מ'",
  capacity: 2,
  players: [player({ id: 'p-c' }), player({ id: 'p-d' })],
  state: 'live',
});

const scheduledCircle = circle({
  id: 'c-sched',
  sportLabel: 'כדורעף חופים',
  beachName: 'מצודת הים',
  state: 'scheduled',
});

const INITIAL_STATE = useStore.getState();
beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
  mockPush.mockClear();
});

describe('MapList screen', () => {
  it('renders one row per live/missing circle in the store, with matching title/meta text', async () => {
    useStore.setState({ circles: [missingCircle, liveCircle, scheduledCircle] });
    await render(<MapList />);

    // Header count excludes the scheduled circle (only live/missing count as
    // "מעגלים" in the sheet header).
    expect(screen.getByText('2 מעגלים סביבך')).toBeTruthy();

    expect(screen.getByText("פוצ'יוולי · חוף פרישמן")).toBeTruthy();
    expect(screen.getByText("חסרים 2 · מתחילים · 300 מ' ממך")).toBeTruthy();

    expect(screen.getByText('אלטינה · חוף גורדון')).toBeTruthy();
    expect(screen.getByText("משחק חי · בינוניים · 650 מ'")).toBeTruthy();

    // The scheduled circle must not produce a sheet row at all.
    expect(screen.queryByText('כדורעף חופים · מצודת הים')).toBeNull();
  });

  it('shows singular "חסר שחקן" copy when exactly one player is missing', async () => {
    const oneShort = circle({
      id: 'c-one-short',
      sportLabel: 'כדורעף חופים',
      beachName: 'מצודת הים',
      levelLabel: 'מקצוענים',
      distanceLabel: '1.8 ק"מ',
      capacity: 4,
      players: [player({ id: 'p-e' }), player({ id: 'p-f' }), player({ id: 'p-g' })],
      state: 'missing',
    });
    useStore.setState({ circles: [oneShort] });
    await render(<MapList />);

    expect(screen.getByText('חסר שחקן · מקצוענים · 1.8 ק"מ')).toBeTruthy();
  });

  it('always renders the tournament row from data/fixtures, even with an empty store', async () => {
    useStore.setState({ circles: [] });
    await render(<MapList />);

    // No live/missing circles -> header count is 0, but the tournament row
    // is not derived from the store and must still be present.
    expect(screen.getByText('0 מעגלים סביבך')).toBeTruthy();
    expect(screen.getByText(`טורניר · ${TOURNAMENT.beachName}`)).toBeTruthy();
    expect(
      screen.getByText(`${TOURNAMENT.dateLabel} · ${TOURNAMENT.teamsRegistered}/${TOURNAMENT.teamsCap} קבוצות`),
    ).toBeTruthy();
    expect(screen.getByText('הרשמה')).toBeTruthy();
  });

  it('keeps the tournament row alongside store-derived rows and does not count it in the header', async () => {
    useStore.setState({ circles: [missingCircle, liveCircle] });
    await render(<MapList />);

    expect(screen.getByText('2 מעגלים סביבך')).toBeTruthy();
    expect(screen.getByText(`טורניר · ${TOURNAMENT.beachName}`)).toBeTruthy();
  });

  it('navigates to the circle route when a row action is pressed', async () => {
    useStore.setState({ circles: [missingCircle] });
    await render(<MapList />);

    // Sync-only navigation press (router.push is synchronous, no store/backend
    // work involved) — bare fireEvent.press is safe here per the house rules.
    fireEvent.press(screen.getByText('הצטרף'));
    expect(mockPush).toHaveBeenCalledWith('/c/c-missing');
  });

  it('navigates to /tournament when the tournament row action is pressed', async () => {
    useStore.setState({ circles: [] });
    await render(<MapList />);

    fireEvent.press(screen.getByText('הרשמה'));
    expect(mockPush).toHaveBeenCalledWith('/tournament');
  });
});
