import { Alert } from 'react-native';
import { render, screen, fireEvent, userEvent } from '@testing-library/react-native';
import * as ReanimatedNS from 'react-native-reanimated';
import CircleDetail from '../../../app/c/[id]';
import { useStore } from '../../../src/store';
import type { Circle, Player } from '../../../src/data/models';

// The project's shared react-native-reanimated jest mock (wired up globally by
// expo-router/testing-library in jest.setup.js) doesn't implement
// LayoutAnimationConfig — its own source literally has "ADD ME IF NEEDED" for
// it. app/c/[id].tsx wraps its player list in one unconditionally, so without
// a stand-in every render throws "Element type is invalid" for an undefined
// component. A file-local `jest.mock('react-native-reanimated', ...)` does
// NOT fix this: expo-router's own testing-library setup already resolved and
// cached a mock module instance before this file loads, so re-registering the
// mock factory here doesn't invalidate that cached instance. Instead, patch
// the missing property directly on the already-cached shared mock module
// object (same fix as chat.test.tsx).
(ReanimatedNS as any).LayoutAnimationConfig = ({ children }: { children?: any }) => children;

// Mutable id read by the mocked useLocalSearchParams — identifier must start
// with "mock" so babel-plugin-jest-hoist allows referencing it inside the
// (hoisted) jest.mock factory below.
let mockParams: { id?: string } = { id: 'c-open' };
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
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

function buildCircle(overrides: Partial<Circle> = {}): Circle {
  return {
    id: 'c-open',
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
    startLabel: 'ראשון 18:00',
    distanceLabel: "300 מ' ממך",
    lat: 32.08,
    lng: 34.77,
    ...overrides,
  };
}

beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
  mockParams = { id: 'c-open' };
  mockPush.mockClear();
  mockReplace.mockClear();
  mockBack.mockClear();
});

describe('CircleDetail screen', () => {
  it('not joined + room available: shows the join CTA, and pressing it joins the circle and opens chat', async () => {
    const circle = buildCircle({ id: 'c-open', capacity: 4, players: [makePlayer('p1', 'עומר'), makePlayer('p2', 'דניאל')] });
    useStore.setState({ circles: [circle] });
    await render(<CircleDetail />);

    expect(screen.getByText('אני בפנים')).toBeTruthy();
    fireEvent.press(screen.getByText('אני בפנים'));

    const updated = useStore.getState().circleById('c-open');
    expect(updated?.players.some((p) => p.id === userId)).toBe(true);
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/chat', params: { circle: 'c-open' } });
  });

  it('already joined: CTA opens chat directly without rejoining', async () => {
    const circle = buildCircle({
      id: 'c-joined',
      hostId: 'p1',
      capacity: 4,
      players: [makePlayer('p1', 'עומר'), makePlayer(userId, 'אני')],
    });
    mockParams = { id: 'c-joined' };
    useStore.setState({ circles: [circle] });
    await render(<CircleDetail />);

    expect(screen.getByText('אתה בפנים ✓ — פתח צ׳אט')).toBeTruthy();
    fireEvent.press(screen.getByText('אתה בפנים ✓ — פתח צ׳אט'));

    const updated = useStore.getState().circleById('c-joined');
    // no duplicate join — still exactly the two original players
    expect(updated?.players).toHaveLength(2);
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/chat', params: { circle: 'c-joined' } });
  });

  it('full circle, not on waitlist: CTA shows the waitlist label, joins the waitlist, and navigates to /circle-waitlist', async () => {
    const circle = buildCircle({
      id: 'c-full',
      hostId: 'p1',
      capacity: 3,
      players: [makePlayer('p1', 'עומר'), makePlayer('p2', 'דניאל'), makePlayer('p3', 'נועה')],
      waitlist: [],
      state: 'live',
    });
    mockParams = { id: 'c-full' };
    useStore.setState({ circles: [circle] });
    await render(<CircleDetail />);

    expect(screen.getByText('המעגל מלא — לרשימת ההמתנה')).toBeTruthy();
    fireEvent.press(screen.getByText('המעגל מלא — לרשימת ההמתנה'));

    const updated = useStore.getState().circleById('c-full');
    expect(updated?.waitlist.some((p) => p.id === userId)).toBe(true);
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/circle-waitlist', params: { id: 'c-full' } });
  });

  it('full circle, already on waitlist: CTA reflects the waitlisted state and does not re-add', async () => {
    const circle = buildCircle({
      id: 'c-full-wl',
      hostId: 'p1',
      capacity: 3,
      players: [makePlayer('p1', 'עומר'), makePlayer('p2', 'דניאל'), makePlayer('p3', 'נועה')],
      waitlist: [makePlayer(userId, 'אני')],
      state: 'live',
    });
    mockParams = { id: 'c-full-wl' };
    useStore.setState({ circles: [circle] });
    await render(<CircleDetail />);

    expect(screen.getByText('ברשימת ההמתנה ✓ — צפה')).toBeTruthy();
    fireEvent.press(screen.getByText('ברשימת ההמתנה ✓ — צפה'));

    const updated = useStore.getState().circleById('c-full-wl');
    expect(updated?.waitlist).toHaveLength(1); // no duplicate waitlist entry
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/circle-waitlist', params: { id: 'c-full-wl' } });
  });

  it('unknown id: shows the not-found view and "למפה" navigates to /map', async () => {
    mockParams = { id: 'does-not-exist' };
    useStore.setState({ circles: [buildCircle()] });
    await render(<CircleDetail />);

    expect(screen.getByText('המעגל לא נמצא')).toBeTruthy();
    fireEvent.press(screen.getByText('למפה'));
    expect(mockReplace).toHaveBeenCalledWith('/map');
  });

  it('hides the leave option for the host', async () => {
    const circle = buildCircle({
      id: 'c-host',
      hostId: userId,
      players: [makePlayer(userId, 'אני'), makePlayer('p2', 'דניאל')],
    });
    mockParams = { id: 'c-host' };
    useStore.setState({ circles: [circle] });
    await render(<CircleDetail />);

    expect(screen.queryByText('עזוב את המעגל')).toBeNull();
  });

  it('shows the leave option for a joined non-host member, and leaving it removes the player and navigates to /map', async () => {
    const circle = buildCircle({
      id: 'c-member',
      hostId: 'p1',
      players: [makePlayer('p1', 'עומר'), makePlayer(userId, 'אני')],
    });
    mockParams = { id: 'c-member' };
    useStore.setState({ circles: [circle] });

    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const confirmBtn = buttons?.find((b) => b.style === 'destructive');
      confirmBtn?.onPress?.();
    });

    const user = userEvent.setup();
    await render(<CircleDetail />);

    expect(screen.getByText('עזוב את המעגל')).toBeTruthy();
    await user.press(screen.getByText('עזוב את המעגל'));

    const updated = useStore.getState().circleById('c-member');
    expect(updated?.players.some((p) => p.id === userId)).toBe(false);
    expect(mockReplace).toHaveBeenCalledWith('/map');
  });
});
