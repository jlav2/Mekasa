import { render, screen, userEvent, fireEvent, waitFor } from '@testing-library/react-native';
import { Linking, Platform } from 'react-native';
import CircleShare from '../../app/circle-share';
import { useStore } from '../../src/store';
import type { Circle } from '../../src/data/models';

const mockPush = jest.fn();
// Mutable id read by the mocked useLocalSearchParams — identifier must start
// with "mock" so babel-plugin-jest-hoist allows referencing it inside the
// (hoisted) jest.mock factory below.
let mockId: string | undefined = 'test-circle';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: mockId }),
}));

const INITIAL_STATE = useStore.getState();

function buildCircle(overrides: Partial<Circle> = {}): Circle {
  return {
    id: 'test-circle',
    sport: 'footvolley',
    sportLabel: "פוצ'יוולי",
    beachId: 'frishman',
    beachName: 'חוף פרישמן',
    court: 'מגרש 2, ליד המציל',
    levelLabel: 'בינוניים',
    capacity: 4,
    players: [
      { id: 'u-omer', name: 'עומר', avatarInitial: 'ע', avatarColor: '#111' },
      { id: 'u-daniel', name: 'דניאל', avatarInitial: 'ד', avatarColor: '#222' },
    ],
    waitlist: [],
    state: 'missing',
    isOpen: true,
    hostId: 'u-omer',
    hostName: 'עומר',
    startLabel: 'ראשון 18:00',
    distanceLabel: '300 מ׳ ממך',
    lat: 32.08,
    lng: 34.77,
    ...overrides,
  };
}

beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
  mockPush.mockClear();
  mockId = 'test-circle';
  Platform.OS = 'ios';
});

describe('CircleShare screen', () => {
  it("renders the store circle's sport, beach, host, missing count, and share link", async () => {
    const circle = buildCircle();
    useStore.setState({ circles: [circle] });
    await render(<CircleShare />);

    expect(
      screen.getByText(`${circle.sportLabel} · ${circle.beachName} · ${circle.startLabel}`),
    ).toBeTruthy();
    expect(screen.getByText(`${circle.hostName} פתח מעגל · לחץ להצטרף בשנייה`)).toBeTruthy();
    // capacity 4, 2 players seated -> 2 missing
    expect(screen.getByText('חסרים 2')).toBeTruthy();
    expect(screen.getByText(`mekasa.app/c/${circle.id}`)).toBeTruthy();
  });

  it('shows "חסר 1" when exactly one spot remains', async () => {
    const almostFull = buildCircle({
      id: 'almost-full',
      capacity: 3,
      players: [buildCircle().players[0], buildCircle().players[1]],
    });
    mockId = 'almost-full';
    useStore.setState({ circles: [almostFull] });
    await render(<CircleShare />);
    expect(screen.getByText('חסר 1')).toBeTruthy();
  });

  it('shows "מלא" when the circle is at capacity', async () => {
    const full = buildCircle({ id: 'full', capacity: 2 });
    mockId = 'full';
    useStore.setState({ circles: [full] });
    await render(<CircleShare />);
    expect(screen.getByText('מלא')).toBeTruthy();
  });

  it('falls back to the first store circle when no id param is present', async () => {
    mockId = undefined;
    const circle = buildCircle({ id: 'fallback-circle', beachName: 'חוף גורדון' });
    useStore.setState({ circles: [circle] });
    await render(<CircleShare />);

    expect(screen.getByText(`mekasa.app/c/${circle.id}`)).toBeTruthy();
    expect(screen.getByText(/חוף גורדון/)).toBeTruthy();
  });

  it('opens a wa.me link containing the circle data on native platforms', async () => {
    jest.mocked(Linking.openURL).mockResolvedValue(true);
    const circle = buildCircle();
    useStore.setState({ circles: [circle] });
    const user = userEvent.setup();
    await render(<CircleShare />);

    await user.press(screen.getByText('שתף בוואטסאפ'));

    expect(Linking.openURL).toHaveBeenCalledTimes(1);
    const url = jest.mocked(Linking.openURL).mock.calls[0][0];
    expect(url).toMatch(/^https:\/\/wa\.me\/\?text=/);
    const decoded = decodeURIComponent(url.split('?text=')[1]);
    expect(decoded).toContain(circle.hostName);
    expect(decoded).toContain(circle.sportLabel);
    expect(decoded).toContain(circle.beachName);
    expect(decoded).toContain(`https://mekasa.app/c/${circle.id}`);
  });

  it('falls back to /map navigation when opening WhatsApp fails on native', async () => {
    jest.mocked(Linking.openURL).mockRejectedValue(new Error('whatsapp not installed'));
    useStore.setState({ circles: [buildCircle()] });
    const user = userEvent.setup();
    await render(<CircleShare />);

    await user.press(screen.getByText('שתף בוואטסאפ'));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/map'));
  });

  it('opens a wa.me link via window.open on web', async () => {
    Platform.OS = 'web';
    const openSpy = jest.fn();
    (window as any).open = openSpy;
    const circle = buildCircle();
    useStore.setState({ circles: [circle] });
    const user = userEvent.setup();
    await render(<CircleShare />);

    try {
      await user.press(screen.getByText('שתף בוואטסאפ'));

      expect(openSpy).toHaveBeenCalledTimes(1);
      const [url, target] = openSpy.mock.calls[0];
      expect(url).toMatch(/^https:\/\/wa\.me\/\?text=/);
      expect(target).toBe('_blank');
      expect(Linking.openURL).not.toHaveBeenCalled();
    } finally {
      delete (window as any).open;
    }
  });

  it('navigates to /map when "דלג — אל המפה" is pressed', async () => {
    useStore.setState({ circles: [buildCircle()] });
    await render(<CircleShare />);

    fireEvent.press(screen.getByText('דלג — אל המפה'));

    expect(mockPush).toHaveBeenCalledWith('/map');
  });
});
