import { render, screen, fireEvent } from '@testing-library/react-native';
import CircleWaitlist from '../../app/circle-waitlist';
import { useStore } from '../../src/store';
import type { Circle, Player } from '../../src/data/models';

// This screen only reads params + the store — no async handlers to await, so
// bare fireEvent.press is fine per the house rules (rule 2).
let mockParams: { id?: string } = { id: 'c-full' };
const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: mockBack }),
  useLocalSearchParams: () => mockParams,
}));

const INITIAL_STATE = useStore.getState();
const userId = INITIAL_STATE.user.id;

const makePlayer = (id: string, name: string): Player => ({
  id,
  name,
  avatarInitial: name[0],
  avatarColor: '#123456',
});

const makeFullCircle = (waitlist: Player[], overrides: Partial<Circle> = {}): Circle => ({
  id: 'c-full',
  sport: 'volleyball',
  sportLabel: 'כדורעף חופים',
  beachId: 'test-beach',
  beachName: 'חוף בדיקה',
  court: 'מגרש 1',
  levelLabel: 'בינוניים',
  capacity: 4,
  players: [
    makePlayer('p1', 'דנה'),
    makePlayer('p2', 'עידו'),
    makePlayer('p3', 'רון'),
    makePlayer('p4', 'מאיה'),
  ],
  waitlist,
  state: 'live',
  isOpen: true,
  hostId: 'p1',
  hostName: 'דנה',
  startLabel: 'משחק חי',
  distanceLabel: "100 מ' ממך",
  lat: 32.08,
  lng: 34.77,
  ...overrides,
});

const makeAltCircle = (overrides: Partial<Circle> = {}): Circle => ({
  id: 'c-alt',
  sport: 'footvolley',
  sportLabel: "פוצ'יוולי",
  beachId: 'alt-beach',
  beachName: 'חוף שכן',
  court: 'מגרש 3',
  levelLabel: 'פתוח לכולם',
  capacity: 4,
  players: [makePlayer('q1', 'תום'), makePlayer('q2', 'ליה')],
  waitlist: [],
  state: 'missing',
  isOpen: true,
  hostId: 'q1',
  hostName: 'תום',
  startLabel: "חסר שחקן",
  distanceLabel: "50 מ' ממך",
  lat: 32.09,
  lng: 34.78,
  ...overrides,
});

beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
  mockParams = { id: 'c-full' };
  mockPush.mockClear();
  mockReplace.mockClear();
  mockBack.mockClear();
});

describe('CircleWaitlist screen', () => {
  it('shows the leading ordinal ("אתה ראשון בהמתנה") when the user is first on the waitlist', async () => {
    useStore.setState({
      circles: [makeFullCircle([makePlayer(userId, 'אני'), makePlayer('w2', 'שני')])],
    });
    await render(<CircleWaitlist />);
    expect(screen.getByText('אתה ראשון בהמתנה')).toBeTruthy();
  });

  it('shows the correct ordinal when the user is further back in line', async () => {
    useStore.setState({
      circles: [
        makeFullCircle([makePlayer('w1', 'ראשון'), makePlayer(userId, 'אני'), makePlayer('w3', 'שלישי')]),
      ],
    });
    await render(<CircleWaitlist />);
    expect(screen.getByText('אתה שני בהמתנה')).toBeTruthy();
  });

  it('leaving the waitlist calls leaveWaitlist (removing the user) and navigates back', async () => {
    useStore.setState({
      circles: [makeFullCircle([makePlayer(userId, 'אני')])],
    });
    await render(<CircleWaitlist />);

    fireEvent.press(screen.getByText('צא מרשימת ההמתנה'));

    expect(mockBack).toHaveBeenCalledTimes(1);
    const updated = useStore.getState().circleById('c-full');
    expect(updated?.waitlist.some((p) => p.id === userId)).toBe(false);
  });

  it('renders a real nearby alternative circle when one with state "missing" exists', async () => {
    const alt = makeAltCircle();
    useStore.setState({
      circles: [makeFullCircle([makePlayer(userId, 'אני')]), alt],
    });
    await render(<CircleWaitlist />);

    expect(screen.getByText('בינתיים, ממש קרוב:')).toBeTruthy();
    expect(screen.getByText(`${alt.sportLabel} · ${alt.beachName}`)).toBeTruthy();
  });

  it('hides the nearby-alternative section when no "missing" circle exists', async () => {
    useStore.setState({
      circles: [makeFullCircle([makePlayer(userId, 'אני')])],
    });
    await render(<CircleWaitlist />);

    expect(screen.queryByText('בינתיים, ממש קרוב:')).toBeNull();
  });

  it('shows the claim countdown when a spot opens while the user is first in line (spec 04)', async () => {
    // A spot freed up: only 3 of 4 seats taken, and the user leads the waitlist.
    const circle = makeFullCircle([makePlayer(userId, 'אני'), makePlayer('w2', 'שני')], {
      players: [makePlayer('p1', 'דנה'), makePlayer('p2', 'עידו'), makePlayer('p3', 'רון')],
      state: 'missing',
    });
    useStore.setState({ circles: [circle] });
    await render(<CircleWaitlist />);

    expect(screen.getByText('מקום התפנה — הוא שלך!')).toBeTruthy();
    expect(screen.getByText('תפוס עכשיו')).toBeTruthy();
  });

  it('does not show the claim countdown while the circle is still full', async () => {
    useStore.setState({
      circles: [makeFullCircle([makePlayer(userId, 'אני')])],
    });
    await render(<CircleWaitlist />);
    expect(screen.queryByText('מקום התפנה — הוא שלך!')).toBeNull();
  });

  it('shows the not-found state and navigates to /map when the id does not resolve', async () => {
    mockParams = { id: 'does-not-exist' };
    useStore.setState({
      circles: [makeFullCircle([makePlayer(userId, 'אני')])],
    });
    await render(<CircleWaitlist />);

    expect(screen.getByText('המעגל לא נמצא')).toBeTruthy();
    fireEvent.press(screen.getByText('למפה'));
    expect(mockReplace).toHaveBeenCalledWith('/map');
  });
});
