import { render, screen } from '@testing-library/react-native';
import Index from '../../app/index';
import * as backend from '../../src/data/backend';

// isSupabaseConfigured is a plain exported const boolean (not a function), so
// to flip it between tests we override the module with a getter backed by a
// mutable module-scope variable. Babel's CJS interop reads named imports as
// live property accesses (`_supabase.isSupabaseConfigured`), so the getter is
// re-evaluated on every read inside the component's effect.
let mockIsSupabaseConfigured = false;
jest.mock('../../src/lib/supabase', () => ({
  get isSupabaseConfigured() {
    return mockIsSupabaseConfigured;
  },
  supabase: null,
}));

// index.tsx renders <Redirect> (not useRouter) once it knows the target
// route, per house rule #6.
jest.mock('expo-router', () => ({
  Redirect: ({ href }: any) =>
    require('react').createElement(require('react-native').Text, null, 'REDIRECT:' + href),
}));

beforeEach(() => {
  mockIsSupabaseConfigured = false;
  jest.mocked(backend.sessionInfo).mockClear();
  jest.mocked(backend.sessionInfo).mockResolvedValue(null);
});

describe('Index (app entry)', () => {
  it('redirects to /login when Supabase is not configured, without calling sessionInfo', async () => {
    await render(<Index />);
    expect(await screen.findByText('REDIRECT:/login')).toBeTruthy();
    expect(backend.sessionInfo).not.toHaveBeenCalled();
  });

  it('redirects to /map when configured and a session is found', async () => {
    mockIsSupabaseConfigured = true;
    jest.mocked(backend.sessionInfo).mockResolvedValueOnce({ id: 'u1', isAnonymous: false });
    await render(<Index />);
    expect(await screen.findByText('REDIRECT:/map')).toBeTruthy();
  });

  it('redirects to /login when configured but there is no session', async () => {
    mockIsSupabaseConfigured = true;
    jest.mocked(backend.sessionInfo).mockResolvedValueOnce(null);
    await render(<Index />);
    expect(await screen.findByText('REDIRECT:/login')).toBeTruthy();
  });
});
