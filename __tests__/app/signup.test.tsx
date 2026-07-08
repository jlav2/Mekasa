import { render, screen, userEvent, act } from '@testing-library/react-native';
import SignUp from '../../app/signup';
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

// Invokes the username field's onBlur handler (async — awaits checkUsername)
// inside act() so the resulting setUAvail state update is fully flushed
// before we assert on it, instead of firing a raw 'blur' event whose inner
// promise resolves outside of any act() wrapping.
async function blurUsername(usernameInput: ReturnType<typeof screen.getByPlaceholderText>) {
  await act(async () => {
    await usernameInput.props.onBlur();
  });
}

// Fills every field required for a submit-ready form (name/username/email/
// password), each change wrapped individually per the fillField contract.
async function fillValidForm() {
  await fillField(screen.getByPlaceholderText('גיא לוי'), 'גיא לוי');
  await fillField(screen.getByPlaceholderText('guy_tlv'), 'guy_tlv');
  await fillField(screen.getByPlaceholderText('you@example.com'), 'guy@example.com');
  await fillField(screen.getByPlaceholderText('לפחות 6 תווים'), 'secret123');
}

describe('SignUp screen', () => {
  it('renders the name/username/email/password fields', async () => {
    await render(<SignUp />);
    expect(screen.getByPlaceholderText('גיא לוי')).toBeTruthy();
    expect(screen.getByPlaceholderText('guy_tlv')).toBeTruthy();
    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('לפחות 6 תווים')).toBeTruthy();
  });

  it('shows "✓ פנוי" when the username is available on blur', async () => {
    jest.mocked(backend.usernameAvailable).mockResolvedValueOnce(true);
    await render(<SignUp />);
    const usernameInput = screen.getByPlaceholderText('guy_tlv');
    await fillField(usernameInput, 'guy_tlv');
    await blurUsername(usernameInput);

    expect(screen.getByText('✓ פנוי')).toBeTruthy();
    expect(backend.usernameAvailable).toHaveBeenCalledWith('guy_tlv');
  });

  it('shows "תפוס" when the username is taken on blur', async () => {
    jest.mocked(backend.usernameAvailable).mockResolvedValueOnce(false);
    await render(<SignUp />);
    const usernameInput = screen.getByPlaceholderText('guy_tlv');
    await fillField(usernameInput, 'guy_tlv');
    await blurUsername(usernameInput);

    expect(screen.getByText('תפוס')).toBeTruthy();
  });

  it('does not check availability on blur when the username is under 3 characters', async () => {
    await render(<SignUp />);
    const usernameInput = screen.getByPlaceholderText('guy_tlv');
    await fillField(usernameInput, 'ab');
    await blurUsername(usernameInput);

    expect(backend.usernameAvailable).not.toHaveBeenCalled();
    expect(screen.queryByText('✓ פנוי')).toBeNull();
    expect(screen.queryByText('תפוס')).toBeNull();
  });

  it('shows a validation error when the name is empty', async () => {
    const user = userEvent.setup();
    await render(<SignUp />);
    await fillField(screen.getByPlaceholderText('guy_tlv'), 'guy_tlv');
    await fillField(screen.getByPlaceholderText('you@example.com'), 'guy@example.com');
    await fillField(screen.getByPlaceholderText('לפחות 6 תווים'), 'secret123');
    await user.press(screen.getByText('צור חשבון'));

    expect(await screen.findByText('מה השם שלך?')).toBeTruthy();
    expect(backend.signUpEmail).not.toHaveBeenCalled();
  });

  it('blocks submit with a client-side error when the username was already marked taken', async () => {
    jest.mocked(backend.usernameAvailable).mockResolvedValueOnce(false);
    const user = userEvent.setup();
    await render(<SignUp />);
    await fillField(screen.getByPlaceholderText('גיא לוי'), 'גיא לוי');
    const usernameInput = screen.getByPlaceholderText('guy_tlv');
    await fillField(usernameInput, 'guy_tlv');
    await blurUsername(usernameInput);
    expect(screen.getByText('תפוס')).toBeTruthy();

    await fillField(screen.getByPlaceholderText('you@example.com'), 'guy@example.com');
    await fillField(screen.getByPlaceholderText('לפחות 6 תווים'), 'secret123');
    await user.press(screen.getByText('צור חשבון'));

    expect(await screen.findByText('שם המשתמש כבר תפוס')).toBeTruthy();
    expect(backend.signUpEmail).not.toHaveBeenCalled();
  });

  it('signs up and pushes to /verify-otp when confirmation is needed', async () => {
    jest.mocked(backend.signUpEmail).mockResolvedValueOnce({ ok: true, needsConfirmation: true });
    const user = userEvent.setup();
    await render(<SignUp />);
    await fillValidForm();
    await user.press(screen.getByText('צור חשבון'));

    expect(backend.signUpEmail).toHaveBeenCalledWith('guy@example.com', 'secret123', 'גיא לוי', 'guy_tlv');
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/verify-otp',
      params: { email: 'guy@example.com', name: 'גיא לוי', username: 'guy_tlv' },
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('signs up and replaces with /onboarding-sport when confirmation is not needed', async () => {
    jest.mocked(backend.signUpEmail).mockResolvedValueOnce({ ok: true, needsConfirmation: false, userId: 'u1' });
    const user = userEvent.setup();
    await render(<SignUp />);
    await fillValidForm();
    await user.press(screen.getByText('צור חשבון'));

    expect(mockReplace).toHaveBeenCalledWith('/onboarding-sport');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows the backend error message when sign up fails', async () => {
    jest.mocked(backend.signUpEmail).mockResolvedValueOnce({ ok: false, error: 'האימייל כבר בשימוש' });
    const user = userEvent.setup();
    await render(<SignUp />);
    await fillValidForm();
    await user.press(screen.getByText('צור חשבון'));

    expect(await screen.findByText('האימייל כבר בשימוש')).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
