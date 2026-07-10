import { render, screen, userEvent } from '@testing-library/react-native';
import { OfflineBanner } from '../OfflineBanner';
import { useStore } from '../../store';

// The global manual mock (src/lib/__mocks__/supabase.ts) hardcodes
// isSupabaseConfigured=false so store/backend tests stay hermetic. This
// component is specifically about behavior when Supabase IS configured, so
// override it for this file only.
jest.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: null,
}));

const INITIAL_STATE = useStore.getState();
beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
});

describe('OfflineBanner', () => {
  it('renders nothing when authKind is "none" (guest/pure offline-demo mode)', async () => {
    useStore.setState({ authKind: 'none', live: false });
    await render(<OfflineBanner />);
    expect(screen.toJSON()).toBeNull();
  });

  it('renders nothing when live is true, even for a signed-in identity', async () => {
    useStore.setState({ authKind: 'user', live: true });
    await render(<OfflineBanner />);
    expect(screen.toJSON()).toBeNull();
  });

  it('renders the banner when signed in but not live (hydrate failed/offline)', async () => {
    useStore.setState({ authKind: 'user', live: false });
    await render(<OfflineBanner />);
    expect(screen.getByText('אין חיבור לרשת')).toBeTruthy();
    expect(screen.getByText('נסה שוב')).toBeTruthy();
  });

  it('also renders for a guest identity that is not live', async () => {
    useStore.setState({ authKind: 'guest', live: false });
    await render(<OfflineBanner />);
    expect(screen.getByText('אין חיבור לרשת')).toBeTruthy();
  });

  it('calls hydrate() when the retry link is pressed', async () => {
    const hydrate = jest.fn().mockResolvedValue(undefined);
    useStore.setState({ authKind: 'user', live: false, hydrate });
    const user = userEvent.setup();
    await render(<OfflineBanner />);

    await user.press(screen.getByText('נסה שוב'));

    expect(hydrate).toHaveBeenCalledTimes(1);
  });
});
