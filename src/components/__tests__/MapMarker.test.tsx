import { render, screen } from '@testing-library/react-native';
import { MapMarker, markerA11yLabel } from '../MapMarker';

describe('markerA11yLabel', () => {
  it('announces live state + count as "N מתוך M"', () => {
    expect(markerA11yLabel('live', '3/4')).toBe('מעגל חי, 3 מתוך 4');
  });
  it('announces a missing-player circle', () => {
    expect(markerA11yLabel('missing', '2/4')).toBe('חסר שחקן, 2 מתוך 4');
  });
  it('labels a tournament plainly', () => {
    expect(markerA11yLabel('tournament', '3/8')).toBe('טורניר');
  });
  it('omits the count when none is given', () => {
    expect(markerA11yLabel('live')).toBe('מעגל חי');
  });
});

// MarkerState = 'live' | 'missing' | 'tournament' | 'neutral' (see MapMarker.tsx).
describe('MapMarker', () => {
  it.each(['live', 'missing', 'tournament', 'neutral'] as const)(
    'renders without crashing for state=%s',
    async (state) => {
      await render(<MapMarker state={state} />);
      // No visible text expected with no count/label — just confirm it mounted.
      expect(screen.toJSON()).toBeTruthy();
    }
  );

  it('shows the count text when provided', async () => {
    await render(<MapMarker state="missing" count="3/4" />);
    expect(screen.getByText('3/4')).toBeTruthy();
  });

  it('shows the label text when provided', async () => {
    await render(<MapMarker state="missing" label="חסר 1" />);
    expect(screen.getByText('חסר 1')).toBeTruthy();
  });

  it('shows both count and label together for a live marker', async () => {
    await render(<MapMarker state="live" count="4/4" label="עכשיו" />);
    expect(screen.getByText('4/4')).toBeTruthy();
    expect(screen.getByText('עכשיו')).toBeTruthy();
  });

  it('renders neither count nor label text when omitted', async () => {
    await render(<MapMarker state="neutral" />);
    expect(screen.queryByText(/\//)).toBeNull();
  });

  it('renders the flag icon glyph instead of count/label for tournament state, even if count/label are passed', async () => {
    await render(<MapMarker state="tournament" count="3/4" label="חסר 1" />);
    // Content() short-circuits to the flag Icon for 'tournament' — count/label text must not render.
    expect(screen.queryByText('3/4')).toBeNull();
    expect(screen.queryByText('חסר 1')).toBeNull();
  });
});
