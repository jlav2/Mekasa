import { render, screen, userEvent, act } from '@testing-library/react-native';
import VerifyOtp from '../../app/verify-otp';
import { useStore } from '../../src/store';
import * as backend from '../../src/data/backend';
import { fillField } from '../../testUtils';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockParams = { email: 'guy@example.com', name: 'גיא', username: 'guy1' };
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: mockBack }),
  useLocalSearchParams: () => mockParams,
}));

const INITIAL_STATE = useStore.getState();
beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
  mockPush.mockClear();
  mockReplace.mockClear();
  mockBack.mockClear();
});

describe('VerifyOtp screen', () => {
  it('shows the email the code was sent to', async () => {
    await render(<VerifyOtp />);
    expect(screen.getByText(/guy@example.com/)).toBeTruthy();
  });

  it('shows a validation error for a code shorter than 6 digits and does not call verifyOtp', async () => {
    const user = userEvent.setup();
    await render(<VerifyOtp />);
    await fillField(screen.getByPlaceholderText('______'), '123');
    await user.press(screen.getByText('אימות והמשך'));

    expect(await screen.findByText('הזן את הקוד בן 6 הספרות')).toBeTruthy();
    expect(backend.verifyEmailOtp).not.toHaveBeenCalled();
  });

  it('verifies a 6-digit code and navigates to /onboarding-sport on success', async () => {
    jest.mocked(backend.verifyEmailOtp).mockResolvedValueOnce({ ok: true, userId: 'u1' });
    const user = userEvent.setup();
    await render(<VerifyOtp />);
    await fillField(screen.getByPlaceholderText('______'), '123456');
    await user.press(screen.getByText('אימות והמשך'));

    expect(backend.verifyEmailOtp).toHaveBeenCalledWith('guy@example.com', '123456');
    expect(mockReplace).toHaveBeenCalledWith('/onboarding-sport');
  });

  it('shows the backend error message on failed verification and does not navigate', async () => {
    jest.mocked(backend.verifyEmailOtp).mockResolvedValueOnce({ ok: false, error: 'קוד שגוי או שפג תוקפו' });
    const user = userEvent.setup();
    await render(<VerifyOtp />);
    await fillField(screen.getByPlaceholderText('______'), '999999');
    await user.press(screen.getByText('אימות והמשך'));

    expect(screen.getByText('קוד שגוי או שפג תוקפו')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('resends the code, shows a notice, and counts down a 30s cooldown that disables the resend button', async () => {
    jest.useFakeTimers();
    try {
      jest.mocked(backend.resendEmailOtp).mockResolvedValueOnce({ ok: true });
      const user = userEvent.setup();
      await render(<VerifyOtp />);

      await user.press(screen.getByText('שלח קוד מחדש'));

      expect(backend.resendEmailOtp).toHaveBeenCalledWith('guy@example.com');
      expect(screen.getByText('שלחנו קוד חדש')).toBeTruthy();
      // cooldown starts immediately at 30 and the button label reflects it
      expect(screen.getByText('שלח קוד מחדש (30)')).toBeTruthy();

      // pressing again mid-cooldown must be a no-op (button disabled)
      await user.press(screen.getByText('שלח קוד מחדש (30)'));
      expect(backend.resendEmailOtp).toHaveBeenCalledTimes(1);

      await act(async () => {
        jest.advanceTimersByTime(5000);
      });
      expect(screen.getByText('שלח קוד מחדש (25)')).toBeTruthy();

      await act(async () => {
        jest.advanceTimersByTime(25000);
      });
      // cooldown fully elapsed — label drops the countdown and becomes pressable again
      expect(screen.getByText('שלח קוד מחדש')).toBeTruthy();

      await user.press(screen.getByText('שלח קוד מחדש'));
      expect(backend.resendEmailOtp).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });

  it('shows the backend error message when resend fails', async () => {
    jest.mocked(backend.resendEmailOtp).mockResolvedValueOnce({ ok: false, error: 'שליחת הקוד נכשלה' });
    const user = userEvent.setup();
    await render(<VerifyOtp />);

    await user.press(screen.getByText('שלח קוד מחדש'));

    expect(screen.getByText('שליחת הקוד נכשלה')).toBeTruthy();
    expect(screen.queryByText('שלחנו קוד חדש')).toBeNull();
  });
});
