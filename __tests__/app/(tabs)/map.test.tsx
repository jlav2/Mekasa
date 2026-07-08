import { render, screen, userEvent } from '@testing-library/react-native';
import Map from '../../../app/(tabs)/map';
import { useStore } from '../../../src/store';
import type { Circle, Player } from '../../../src/data/models';

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
  distanceLabel: '300 מ׳ ממך',
  lat: 32.08,
  lng: 34.77,
  ...overrides,
});

// Three circles spanning the three sports and two "featured-worthy" states so
// cycling the sport filter visibly swaps which one is featured.
const footvolleyMissing = circle({
  id: 'c-foot',
  sport: 'footvolley',
  sportLabel: "פוצ'יוולי",
  beachName: 'חוף פרישמן',
  levelLabel: 'מתחילים',
  capacity: 4,
  players: [player({ id: 'p-a' }), player({ id: 'p-b' })],
  state: 'missing',
});

const altinhaLive = circle({
  id: 'c-alt',
  sport: 'altinha',
  sportLabel: 'אלטינה',
  beachName: 'חוף גורדון',
  levelLabel: 'בינוניים',
  capacity: 2,
  players: [player({ id: 'p-c' }), player({ id: 'p-d' })],
  state: 'live',
});

const volleyballMissing = circle({
  id: 'c-vol',
  sport: 'volleyball',
  sportLabel: 'כדורעף',
  beachName: 'מצודת הים',
  levelLabel: 'מקצוענים',
  capacity: 6,
  players: [player({ id: 'p-e' }), player({ id: 'p-f' }), player({ id: 'p-g' })],
  state: 'missing',
});

const INITIAL_STATE = useStore.getState();
beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
  mockPush.mockClear();
});

describe('Map screen', () => {
  it('cycles the sport filter chip through every sport and back to "all"', async () => {
    const user = userEvent.setup();
    await render(<Map />);

    await user.press(screen.getByText('כל הענפים'));
    expect(screen.getByText("פוצ'יוולי")).toBeTruthy();

    await user.press(screen.getByText("פוצ'יוולי"));
    expect(screen.getByText('אלטינה')).toBeTruthy();

    await user.press(screen.getByText('אלטינה'));
    expect(screen.getByText('כדורעף')).toBeTruthy();

    await user.press(screen.getByText('כדורעף'));
    expect(screen.getByText('כל הענפים')).toBeTruthy();
  });

  it('cycles the level filter chip through every level and back to "all"', async () => {
    const user = userEvent.setup();
    await render(<Map />);

    await user.press(screen.getByText('כל הרמות'));
    expect(screen.getByText('מתחילים')).toBeTruthy();

    await user.press(screen.getByText('מתחילים'));
    expect(screen.getByText('בינוניים')).toBeTruthy();

    await user.press(screen.getByText('בינוניים'));
    expect(screen.getByText('מקצוענים')).toBeTruthy();

    await user.press(screen.getByText('מקצוענים'));
    expect(screen.getByText('כל הרמות')).toBeTruthy();
  });

  it('PRIORITY: the featured bottom card follows the active sport filter', async () => {
    useStore.setState({ circles: [footvolleyMissing, altinhaLive, volleyballMissing] });
    const user = userEvent.setup();
    await render(<Map />);

    // filter starts at "all" -> first circle in 'missing' state wins (footvolley)
    expect(screen.getByText("פוצ'יוולי · חוף פרישמן")).toBeTruthy();

    // all -> footvolley: same circle still the only/first match, card unchanged
    await user.press(screen.getByText('כל הענפים'));
    expect(screen.getByText("פוצ'יוולי · חוף פרישמן")).toBeTruthy();

    // footvolley -> altinha: only the live altinha circle matches now
    await user.press(screen.getByText("פוצ'יוולי"));
    expect(screen.queryByText("פוצ'יוולי · חוף פרישמן")).toBeNull();
    expect(screen.getByText('אלטינה · חוף גורדון')).toBeTruthy();

    // altinha -> volleyball: only the missing volleyball circle matches
    await user.press(screen.getByText('אלטינה'));
    expect(screen.queryByText('אלטינה · חוף גורדון')).toBeNull();
    expect(screen.getByText('כדורעף · מצודת הים')).toBeTruthy();
  });

  it('hides the featured card when the filter matches no circle, and restores it once cleared', async () => {
    useStore.setState({ circles: [footvolleyMissing] });
    const user = userEvent.setup();
    await render(<Map />);
    expect(screen.getByText("פוצ'יוולי · חוף פרישמן")).toBeTruthy();

    // the only circle's level is 'מתחילים' — cycling there still matches...
    await user.press(screen.getByText('כל הרמות'));
    expect(screen.getByText("פוצ'יוולי · חוף פרישמן")).toBeTruthy();

    // ...but the next level, 'בינוניים', matches nothing -> card disappears
    await user.press(screen.getByText('מתחילים'));
    expect(screen.queryByText("פוצ'יוולי · חוף פרישמן")).toBeNull();

    // cycle the rest of the way around back to 'all' and the card returns
    await user.press(screen.getByText('בינוניים'));
    await user.press(screen.getByText('מקצוענים'));
    expect(screen.getByText("פוצ'יוולי · חוף פרישמן")).toBeTruthy();
  });

  it('joins the featured circle and navigates to its chat when not yet joined', async () => {
    useStore.setState({ circles: [footvolleyMissing] });
    const user = userEvent.setup();
    await render(<Map />);

    expect(useStore.getState().isJoined('c-foot')).toBe(false);
    await user.press(screen.getByText('אני בפנים'));

    expect(useStore.getState().isJoined('c-foot')).toBe(true);
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/chat', params: { circle: 'c-foot' } });
    expect(screen.getByText('פתח צ׳אט המעגל')).toBeTruthy();
  });

  it('skips re-joining but still navigates to chat when already joined', async () => {
    // 'u-guy' matches CURRENT_USER's id in src/data/fixtures.ts
    const me = player({ id: 'u-guy', name: 'גיא לוי' });
    const alreadyJoined: Circle = {
      ...footvolleyMissing,
      id: 'c-joined',
      players: [player({ id: 'p-a' }), me],
    };
    useStore.setState({ circles: [alreadyJoined] });
    const user = userEvent.setup();
    await render(<Map />);

    expect(useStore.getState().isJoined('c-joined')).toBe(true);
    const playersBefore = useStore.getState().circleById('c-joined')?.players.length;

    await user.press(screen.getByText('פתח צ׳אט המעגל'));

    expect(useStore.getState().circleById('c-joined')?.players.length).toBe(playersBefore);
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/chat', params: { circle: 'c-joined' } });
  });
});
