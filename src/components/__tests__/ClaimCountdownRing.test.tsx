import { render, screen } from '@testing-library/react-native';
import { ClaimCountdownRing } from '../ClaimCountdownRing';

describe('ClaimCountdownRing', () => {
  it('renders the remaining time as mm:ss from the server expiry', async () => {
    const expiresAt = Date.now() + 5 * 60 * 1000;
    await render(<ClaimCountdownRing expiresAt={expiresAt} />);
    // ~5:00 at mount (tolerate a hair of clock drift within the same tick)
    expect(screen.queryByText('5:00') ?? screen.queryByText('4:59')).toBeTruthy();
  });

  it('clamps an already-expired window to 0:00', async () => {
    await render(<ClaimCountdownRing expiresAt={Date.now() - 1000} />);
    expect(screen.getByText('0:00')).toBeTruthy();
  });

  it('exposes an accessible timer label', async () => {
    await render(<ClaimCountdownRing expiresAt={Date.now() + 90 * 1000} />);
    // role="timer" with the remaining time spoken
    expect(screen.getByLabelText(/לתפוס את המקום/)).toBeTruthy();
  });
});
