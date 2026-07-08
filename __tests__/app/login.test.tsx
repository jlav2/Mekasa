import { render, screen, userEvent } from '@testing-library/react-native';
import Login from '../../app/login';
import { useStore } from '../../src/store';
import * as backend from '../../src/data/backend';
import { fillField } from '../../testUtils';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
}));

const INITIAL_STATE = useStore.getState();
beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
  mockPush.mockClear();
  mockReplace.mockClear();
});

describe('Login screen', () => {
  it('renders the identifier and password fields', async () => {
    await render(<Login />);
    expect(screen.getByPlaceholderText('אימייל או שם משתמש')).toBeTruthy();
    expect(screen.getByPlaceholderText('סיסמה')).toBeTruthy();
  });

  it('shows a validation error when submitting empty fields', async () => {
    const user = userEvent.setup();
    await render(<Login />);
    await user.press(screen.getByText('התחבר'));
    expect(await screen.findByText('מלא אימייל/שם משתמש וסיסמה')).toBeTruthy();
  });

  it('logs in and navigates to /map on success', async () => {
    jest.mocked(backend.signInPassword).mockResolvedValueOnce({ ok: true, userId: 'u1' });
    const user = userEvent.setup();
    await render(<Login />);
    await fillField(screen.getByPlaceholderText('אימייל או שם משתמש'), 'guy@example.com');
    await fillField(screen.getByPlaceholderText('סיסמה'), 'secret123');
    await user.press(screen.getByText('התחבר'));

    expect(mockReplace).toHaveBeenCalledWith('/map');
    expect(backend.signInPassword).toHaveBeenCalledWith('guy@example.com', 'secret123');
  });

  it('shows the backend error message on failed login', async () => {
    jest.mocked(backend.signInPassword).mockResolvedValueOnce({ ok: false, error: 'שם משתמש או סיסמה שגויים' });
    const user = userEvent.setup();
    await render(<Login />);
    await fillField(screen.getByPlaceholderText('אימייל או שם משתמש'), 'guy@example.com');
    await fillField(screen.getByPlaceholderText('סיסמה'), 'wrong');
    await user.press(screen.getByText('התחבר'));

    expect(screen.getByText('שם משתמש או סיסמה שגויים')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('continues as guest and navigates to onboarding', async () => {
    jest.mocked(backend.signInGuest).mockResolvedValueOnce('guest-uid');
    const user = userEvent.setup();
    await render(<Login />);
    await user.press(screen.getByText('המשך כאורח'));

    expect(mockReplace).toHaveBeenCalledWith('/onboarding-sport');
    expect(backend.signInGuest).toHaveBeenCalledTimes(1);
  });

  it('navigates to /signup and /forgot-password', async () => {
    const user = userEvent.setup();
    await render(<Login />);
    await user.press(screen.getByText('הרשמה'));
    expect(mockPush).toHaveBeenCalledWith('/signup');
    await user.press(screen.getByText('שכחת סיסמה?'));
    expect(mockPush).toHaveBeenCalledWith('/forgot-password');
  });
});
