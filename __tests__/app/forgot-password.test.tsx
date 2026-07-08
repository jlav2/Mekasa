import { render, screen, userEvent } from '@testing-library/react-native';
import ForgotPassword from '../../app/forgot-password';
import { useStore } from '../../src/store';
import * as backend from '../../src/data/backend';
import { fillField } from '../../testUtils';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: mockBack }),
}));

const INITIAL_STATE = useStore.getState();
beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
  mockPush.mockClear();
  mockReplace.mockClear();
  mockBack.mockClear();
});

describe('ForgotPassword screen', () => {
  it('renders the email field and submit button', async () => {
    await render(<ForgotPassword />);
    expect(screen.getByPlaceholderText('האימייל שלך')).toBeTruthy();
    expect(screen.getByText('שלח קוד איפוס')).toBeTruthy();
  });

  it('shows a validation error when the email has no @', async () => {
    const user = userEvent.setup();
    await render(<ForgotPassword />);
    await fillField(screen.getByPlaceholderText('האימייל שלך'), 'not-an-email');
    await user.press(screen.getByText('שלח קוד איפוס'));

    expect(await screen.findByText('אימייל לא תקין')).toBeTruthy();
    expect(backend.requestPasswordReset).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates to /reset-password with the email param on success', async () => {
    jest.mocked(backend.requestPasswordReset).mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();
    await render(<ForgotPassword />);
    await fillField(screen.getByPlaceholderText('האימייל שלך'), 'guy@example.com');
    await user.press(screen.getByText('שלח קוד איפוס'));

    expect(backend.requestPasswordReset).toHaveBeenCalledWith('guy@example.com');
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/reset-password',
      params: { email: 'guy@example.com' },
    });
  });

  it('shows the backend error message on failure and does not navigate', async () => {
    jest.mocked(backend.requestPasswordReset).mockResolvedValueOnce({ ok: false, error: 'שליחת הקוד נכשלה' });
    const user = userEvent.setup();
    await render(<ForgotPassword />);
    await fillField(screen.getByPlaceholderText('האימייל שלך'), 'guy@example.com');
    await user.press(screen.getByText('שלח קוד איפוס'));

    expect(await screen.findByText('שליחת הקוד נכשלה')).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates back when the back button is pressed', async () => {
    const user = userEvent.setup();
    await render(<ForgotPassword />);
    await user.press(screen.getByLabelText('חזור'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
