import { render, screen, userEvent, fireEvent } from '@testing-library/react-native';
import ResetPassword from '../../app/reset-password';
import { useStore } from '../../src/store';
import * as backend from '../../src/data/backend';
import { fillField } from '../../testUtils';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: mockBack }),
  useLocalSearchParams: () => ({ email: 'guy@example.com' }),
}));

const INITIAL_STATE = useStore.getState();
beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
  mockPush.mockClear();
  mockReplace.mockClear();
  mockBack.mockClear();
});

describe('ResetPassword screen', () => {
  it('renders the code and password fields with the email from params', async () => {
    await render(<ResetPassword />);
    expect(screen.getByPlaceholderText('______')).toBeTruthy();
    expect(screen.getByPlaceholderText('סיסמה חדשה')).toBeTruthy();
    expect(screen.getByText(/guy@example.com/)).toBeTruthy();
  });

  it('shows a validation error when the code is under 6 digits', async () => {
    const user = userEvent.setup();
    await render(<ResetPassword />);
    await fillField(screen.getByPlaceholderText('______'), '123');
    await fillField(screen.getByPlaceholderText('סיסמה חדשה'), 'password123');
    await user.press(screen.getByText('עדכן סיסמה והתחבר'));

    expect(await screen.findByText('הזן את הקוד בן 6 הספרות')).toBeTruthy();
    expect(backend.confirmPasswordReset).not.toHaveBeenCalled();
  });

  it('strips non-digit characters and caps the code at 6 characters', async () => {
    await render(<ResetPassword />);
    await fillField(screen.getByPlaceholderText('______'), 'a1b2c3d4e5f6');
    expect(screen.getByPlaceholderText('______').props.value).toBe('123456');
  });

  it('shows a validation error when the new password is under 6 characters', async () => {
    const user = userEvent.setup();
    await render(<ResetPassword />);
    await fillField(screen.getByPlaceholderText('______'), '123456');
    await fillField(screen.getByPlaceholderText('סיסמה חדשה'), 'abc');
    await user.press(screen.getByText('עדכן סיסמה והתחבר'));

    expect(await screen.findByText('סיסמה חדשה — לפחות 6 תווים')).toBeTruthy();
    expect(backend.confirmPasswordReset).not.toHaveBeenCalled();
  });

  it('confirms the reset and navigates to /map on success', async () => {
    jest.mocked(backend.confirmPasswordReset).mockResolvedValueOnce({ ok: true, userId: 'u1' });
    const user = userEvent.setup();
    await render(<ResetPassword />);
    await fillField(screen.getByPlaceholderText('______'), '654321');
    await fillField(screen.getByPlaceholderText('סיסמה חדשה'), 'newpass123');
    await user.press(screen.getByText('עדכן סיסמה והתחבר'));

    expect(backend.confirmPasswordReset).toHaveBeenCalledWith('guy@example.com', '654321', 'newpass123');
    expect(mockReplace).toHaveBeenCalledWith('/map');
  });

  it('shows the backend error message on failed confirmation', async () => {
    jest.mocked(backend.confirmPasswordReset).mockResolvedValueOnce({ ok: false, error: 'קוד שגוי' });
    const user = userEvent.setup();
    await render(<ResetPassword />);
    await fillField(screen.getByPlaceholderText('______'), '654321');
    await fillField(screen.getByPlaceholderText('סיסמה חדשה'), 'newpass123');
    await user.press(screen.getByText('עדכן סיסמה והתחבר'));

    expect(await screen.findByText('קוד שגוי')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('falls back to a default error message when the backend gives none', async () => {
    jest.mocked(backend.confirmPasswordReset).mockResolvedValueOnce({ ok: false });
    const user = userEvent.setup();
    await render(<ResetPassword />);
    await fillField(screen.getByPlaceholderText('______'), '654321');
    await fillField(screen.getByPlaceholderText('סיסמה חדשה'), 'newpass123');
    await user.press(screen.getByText('עדכן סיסמה והתחבר'));

    expect(await screen.findByText('קוד שגוי או שפג תוקפו')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('navigates back when the back button is pressed', async () => {
    await render(<ResetPassword />);
    fireEvent.press(screen.getByLabelText('חזור'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
