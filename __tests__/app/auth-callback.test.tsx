import { render, screen, act } from '@testing-library/react-native';
import AuthCallback from '../../app/auth-callback';
import * as backend from '../../src/data/backend';

// auth-callback renders a <Redirect> once it has decided a target; stub it so
// we can assert the chosen href without pulling in real expo-router routing.
jest.mock('expo-router', () => ({
  Redirect: ({ href }: any) =>
    require('react').createElement(require('react-native').Text, null, 'REDIRECT:' + href),
}));

describe('AuthCallback screen', () => {
  it('redirects to /map as soon as sessionInfo resolves with a session', async () => {
    jest.mocked(backend.sessionInfo).mockResolvedValueOnce({ id: 'u1', isAnonymous: false });
    await render(<AuthCallback />);

    expect(await screen.findByText('REDIRECT:/map')).toBeTruthy();
    expect(backend.sessionInfo).toHaveBeenCalledTimes(1);
  });

  it('redirects to /map on a later attempt once a session eventually shows up', async () => {
    jest.useFakeTimers();
    try {
      jest.mocked(backend.sessionInfo)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'u1', isAnonymous: false });

      await render(<AuthCallback />);
      // first attempt fires on mount; two more 300ms ticks are needed to reach
      // the third (successful) attempt.
      await act(async () => {
        await jest.advanceTimersByTimeAsync(300);
      });
      await act(async () => {
        await jest.advanceTimersByTimeAsync(300);
      });

      expect(screen.getByText('REDIRECT:/map')).toBeTruthy();
      expect(backend.sessionInfo).toHaveBeenCalledTimes(3);
    } finally {
      jest.useRealTimers();
    }
  });

  it('falls back to /login after all 10 poll attempts return null', async () => {
    jest.useFakeTimers();
    try {
      jest.mocked(backend.sessionInfo).mockResolvedValue(null);

      await render(<AuthCallback />);
      // 1st attempt runs on mount; 9 more retries (300ms apart) exhaust the
      // budget, then the 11th call is the one that gives up and sets /login.
      await act(async () => {
        await jest.advanceTimersByTimeAsync(300 * 10);
      });

      expect(screen.getByText('REDIRECT:/login')).toBeTruthy();
      expect(backend.sessionInfo).toHaveBeenCalledTimes(11);
    } finally {
      jest.useRealTimers();
    }
  });

  it('renders a blank placeholder view before a target is decided', async () => {
    jest.mocked(backend.sessionInfo).mockImplementation(() => new Promise(() => {})); // never resolves
    await render(<AuthCallback />);

    expect(screen.queryByText(/^REDIRECT:/)).toBeNull();
  });
});
