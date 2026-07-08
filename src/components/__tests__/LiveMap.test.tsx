import { render, screen, fireEvent, within, act } from '@testing-library/react-native';
import { LiveMap } from '../LiveMap';
import type { CircleMarkerData } from '../../data/beaches';

const marker = (overrides: Partial<CircleMarkerData> = {}): CircleMarkerData => ({
  id: 'm1',
  beach: 'חוף פרישמן',
  lat: 32.08,
  lng: 34.77,
  state: 'missing',
  size: 60,
  ...overrides,
});

describe('LiveMap', () => {
  it('renders one marker per entry in the markers prop', async () => {
    await render(<LiveMap markers={[marker({ id: 'a' }), marker({ id: 'b' })]} />);
    // +1 for the "show my location" user dot marker (default showUser=true)
    expect(screen.getAllByTestId('mock-map-marker')).toHaveLength(3);
  });

  it('omits the user-location marker when showUser is false', async () => {
    await render(<LiveMap markers={[marker()]} showUser={false} />);
    expect(screen.getAllByTestId('mock-map-marker')).toHaveLength(1);
  });

  it('calls onMarkerPress with the pressed marker data', async () => {
    const onMarkerPress = jest.fn();
    const a = marker({ id: 'a' });
    const b = marker({ id: 'b' });
    await render(<LiveMap markers={[a, b]} onMarkerPress={onMarkerPress} />);
    const [first] = screen.getAllByTestId('mock-map-marker');
    fireEvent.press(first);
    expect(onMarkerPress).toHaveBeenCalledTimes(1);
    expect(onMarkerPress).toHaveBeenCalledWith(a);
  });

  // Regression (#7): a marker must start tracksViewChanges=true (so it paints
  // its custom glyph), then flip to false shortly after — never stay true
  // forever, which was the continuous-re-rasterization perf bug.
  it('flips a marker\'s tracksViewChanges off after it has painted', async () => {
    jest.useFakeTimers();
    try {
      await render(<LiveMap markers={[marker({ id: 'a' })]} showUser={false} />);
      const [circleMarker] = screen.getAllByTestId('mock-map-marker');
      expect(circleMarker.props.tracksViewChanges).toBe(true);

      await act(async () => {
        jest.advanceTimersByTime(700);
      });

      const [afterMarker] = screen.getAllByTestId('mock-map-marker');
      expect(afterMarker.props.tracksViewChanges).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it("renders each marker's beach label via the nested MapMarker glyph", async () => {
    await render(<LiveMap markers={[marker({ id: 'a', label: 'חסר 1' })]} showUser={false} />);
    const [circleMarker] = screen.getAllByTestId('mock-map-marker');
    expect(within(circleMarker).getByText('חסר 1')).toBeTruthy();
  });
});
