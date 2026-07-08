import { render, screen, fireEvent } from '@testing-library/react-native';
import Notifications from '../../../app/(tabs)/notifications';
import { useStore } from '../../../src/store';
import type { AppNotification } from '../../../src/data/models';

// This screen only reads the store + navigates via useRouter. markRead /
// markAllRead / joinCircle are all synchronous store actions (no awaited
// backend call happens since the default store state has live=false), so
// bare fireEvent.press is fine per the house rules (rule 2).
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));

const INITIAL_STATE = useStore.getState();
beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
  mockPush.mockClear();
});

const notif = (overrides: Partial<AppNotification> = {}): AppNotification => ({
  id: 'n-x',
  kind: 'social',
  group: 'now',
  title: 'כותרת ברירת מחדל',
  time: '12:00',
  unread: false,
  ...overrides,
});

describe('Notifications screen', () => {
  it("renders each kind's title/body straight from store data (not hardcoded)", async () => {
    const rows: AppNotification[] = [
      notif({ id: 'hot-1', kind: 'hot', title: 'HOT_TITLE_X', body: 'HOT_BODY_X', time: '1m', unread: true }),
      notif({ id: 'soc-1', kind: 'social', title: 'SOC_TITLE_X', body: 'SOC_BODY_X', time: '2m', unread: true }),
      notif({ id: 'tour-1', kind: 'tournament', group: 'today', title: 'TOUR_TITLE_X', body: 'TOUR_BODY_X', time: '3m', unread: false }),
      notif({ id: 'sum-1', kind: 'summary', group: 'today', title: 'SUM_TITLE_X', body: 'SUM_BODY_X', time: '4m', unread: false }),
      notif({ id: 'ups-1', kind: 'upsell', group: 'today', title: 'UPS_TITLE_X', body: 'UPS_BODY_X', time: '5m', unread: true }),
    ];
    useStore.setState({ notifications: rows });

    await render(<Notifications />);

    expect(screen.getByText('HOT_TITLE_X')).toBeTruthy();
    expect(screen.getByText('HOT_BODY_X · 1m')).toBeTruthy();

    expect(screen.getByText('SOC_TITLE_X')).toBeTruthy();
    expect(screen.getByText('SOC_BODY_X · 2m')).toBeTruthy();

    expect(screen.getByText('TOUR_TITLE_X')).toBeTruthy();
    expect(screen.getByText('TOUR_BODY_X · 3m')).toBeTruthy();

    expect(screen.getByText('SUM_TITLE_X')).toBeTruthy();
    expect(screen.getByText('SUM_BODY_X · 4m')).toBeTruthy();

    // upsell rows render title + body directly, with no " · time" suffix.
    expect(screen.getByText('UPS_TITLE_X')).toBeTruthy();
    expect(screen.getByText('UPS_BODY_X')).toBeTruthy();
  });

  it('calls the store\'s markAllRead when "סמן הכול כנקרא" is pressed', async () => {
    useStore.setState({
      notifications: [notif({ id: 'n1', unread: true }), notif({ id: 'n2', unread: true })],
    });
    const markAllRead = jest.fn();
    useStore.setState({ markAllRead });

    await render(<Notifications />);
    fireEvent.press(screen.getByText('סמן הכול כנקרא'));

    expect(markAllRead).toHaveBeenCalledTimes(1);
  });

  it('tapping a row with a circleId marks it read and navigates to /c/[id]', async () => {
    const n = notif({ id: 'soc-2', kind: 'social', title: 'SOC_ROW', body: 'body', unread: true, circleId: 'circle-9' });
    useStore.setState({ notifications: [n] });
    const markRead = jest.fn();
    useStore.setState({ markRead });

    await render(<Notifications />);
    fireEvent.press(screen.getByText('SOC_ROW'));

    expect(markRead).toHaveBeenCalledWith('soc-2');
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/c/[id]', params: { id: 'circle-9' } });
  });

  it('tapping a tournament row navigates to /tournament regardless of circleId', async () => {
    const n = notif({
      id: 'tour-2',
      kind: 'tournament',
      title: 'TOUR_ROW',
      body: 'body',
      unread: true,
      circleId: 'some-circle', // present, but tournament routing should win
    });
    useStore.setState({ notifications: [n] });
    const markRead = jest.fn();
    useStore.setState({ markRead });

    await render(<Notifications />);
    fireEvent.press(screen.getByText('TOUR_ROW'));

    expect(markRead).toHaveBeenCalledWith('tour-2');
    expect(mockPush).toHaveBeenCalledWith('/tournament');
  });

  it("tapping the upsell notification's own CTA marks it read and navigates to /paywall", async () => {
    const n = notif({ id: 'ups-2', kind: 'upsell', title: 'UPS_ROW', body: 'body', unread: true });
    useStore.setState({ notifications: [n] });
    const markRead = jest.fn();
    useStore.setState({ markRead });

    await render(<Notifications />);

    // The screen also renders a static marketing footer with the same
    // "נסה חינם" CTA text, unconditionally, after the notification rows —
    // so there are always exactly two matches when one upsell row is
    // present; the first is the notification's own CTA.
    const ctas = screen.getAllByText('נסה חינם');
    expect(ctas).toHaveLength(2);
    fireEvent.press(ctas[0]);

    expect(markRead).toHaveBeenCalledWith('ups-2');
    expect(mockPush).toHaveBeenCalledWith('/paywall');
  });

  it('the hot-kind "אני בפנים" CTA marks it read, joins the circle, and opens the chat', async () => {
    const n = notif({ id: 'hot-2', kind: 'hot', title: 'HOT_ROW', body: 'body', unread: true, circleId: 'circle-hot' });
    useStore.setState({ notifications: [n] });
    const markRead = jest.fn();
    const joinCircle = jest.fn();
    useStore.setState({ markRead, joinCircle });

    await render(<Notifications />);
    fireEvent.press(screen.getByText('אני בפנים'));

    expect(markRead).toHaveBeenCalledWith('hot-2');
    expect(joinCircle).toHaveBeenCalledWith('circle-hot');
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/chat', params: { circle: 'circle-hot' } });
  });

  it('the hot-kind CTA falls back to /map and skips joinCircle when there is no circleId', async () => {
    const n = notif({ id: 'hot-3', kind: 'hot', title: 'HOT_ROW_NO_CIRCLE', body: 'body', unread: true, circleId: undefined });
    useStore.setState({ notifications: [n] });
    const joinCircle = jest.fn();
    useStore.setState({ joinCircle });

    await render(<Notifications />);
    fireEvent.press(screen.getByText('אני בפנים'));

    expect(joinCircle).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/map');
  });
});
