import { render, screen, act } from '@testing-library/react-native';
import { TabBar } from '../TabBar';
import { useStore } from '../../store';
import type { AppNotification } from '../../data/models';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn() }),
}));

const INITIAL_STATE = useStore.getState();
beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
  mockReplace.mockClear();
});

const notification = (overrides: Partial<AppNotification> = {}): AppNotification => ({
  id: 'n1',
  kind: 'social',
  group: 'now',
  title: 'הודעה',
  time: 'עכשיו',
  unread: true,
  ...overrides,
});

describe('TabBar', () => {
  it('renders all four tabs with accessibilityRole="tab"', async () => {
    await render(<TabBar active="map" />);
    expect(screen.getAllByRole('tab')).toHaveLength(4);
  });

  it('marks only the active tab as selected in accessibilityState', async () => {
    await render(<TabBar active="circles" />);
    const tabs = screen.getAllByRole('tab');
    const selected = tabs.filter((t) => t.props.accessibilityState?.selected === true);
    expect(selected).toHaveLength(1);
    expect(selected[0].props.accessibilityLabel).toBe('המעגלים שלי');
  });

  it('reflects a different active tab correctly', async () => {
    await render(<TabBar active="profile" />);
    const tabs = screen.getAllByRole('tab');
    const selected = tabs.filter((t) => t.props.accessibilityState?.selected === true);
    expect(selected).toHaveLength(1);
    expect(selected[0].props.accessibilityLabel).toBe('פרופיל');
  });

  it('shows no unread badge on the notifications tab when there are no unread notifications', async () => {
    useStore.setState({ notifications: [notification({ id: 'n1', unread: false })] });
    await render(<TabBar active="map" />);
    // Plain label, no ", X חדשות" suffix, and no badge count text rendered.
    expect(screen.getByLabelText('התראות')).toBeTruthy();
    expect(screen.queryByText(/חדשות/)).toBeNull();
  });

  it('shows the unread badge count on the notifications tab only', async () => {
    useStore.setState({
      notifications: [
        notification({ id: 'n1', unread: true }),
        notification({ id: 'n2', unread: true }),
        notification({ id: 'n3', unread: false }),
      ],
    });
    await render(<TabBar active="map" />);
    expect(screen.getByLabelText('התראות, 2 חדשות')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();

    // The other tabs never carry a badge, regardless of unread count.
    expect(screen.getByLabelText('מפה')).toBeTruthy();
    expect(screen.getByLabelText('המעגלים שלי')).toBeTruthy();
    expect(screen.getByLabelText('פרופיל')).toBeTruthy();
  });

  it('uses singular Hebrew grammar in the a11y label for exactly one unread', async () => {
    useStore.setState({ notifications: [notification({ id: 'n1', unread: true })] });
    await render(<TabBar active="map" />);
    // "1 חדשה" (singular), not the grammatically wrong "1 חדשות".
    expect(screen.getByLabelText('התראות, 1 חדשה')).toBeTruthy();
    expect(screen.queryByLabelText('התראות, 1 חדשות')).toBeNull();
  });

  it('updates the badge when the unread count changes', async () => {
    useStore.setState({ notifications: [notification({ id: 'n1', unread: true })] });
    await render(<TabBar active="map" />);
    expect(screen.getByText('1')).toBeTruthy();

    await act(async () => {
      useStore.setState({
        notifications: [notification({ id: 'n1', unread: true }), notification({ id: 'n2', unread: true })],
      });
    });
    expect(await screen.findByText('2')).toBeTruthy();
  });
});
