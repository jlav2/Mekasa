import { Alert } from 'react-native';
import { render, screen, userEvent } from '@testing-library/react-native';
import Settings from '../../app/settings';
import { useStore } from '../../src/store';
import * as backend from '../../src/data/backend';

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

// This test environment resolves Platform.OS to 'ios' (confirmed via a
// throwaway probe test), so settings.tsx's confirmDestructive() always takes
// the native Alert.alert branch, never the web/window.confirm branch.
describe('Settings screen', () => {
  it('logs out and navigates to /login', async () => {
    const user = userEvent.setup();
    await render(<Settings />);
    await user.press(screen.getByText('התנתק'));

    expect(backend.signOut).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('deletes the account and navigates to /login when the confirm alert is accepted', async () => {
    jest.mocked(backend.deleteAccount).mockResolvedValueOnce({ ok: true });
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const confirmBtn = buttons?.find((b) => b.style === 'destructive');
      confirmBtn?.onPress?.();
    });

    const user = userEvent.setup();
    await render(<Settings />);
    await user.press(screen.getByText('מחק חשבון'));

    expect(backend.deleteAccount).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('does nothing when the delete-account confirm alert is declined', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const cancelBtn = buttons?.find((b) => b.style === 'cancel');
      cancelBtn?.onPress?.();
    });

    const user = userEvent.setup();
    await render(<Settings />);
    await user.press(screen.getByText('מחק חשבון'));

    expect(backend.deleteAccount).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
