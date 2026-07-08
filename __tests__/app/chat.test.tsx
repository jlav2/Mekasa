import { render, screen, fireEvent, userEvent } from '@testing-library/react-native';
import * as ReanimatedNS from 'react-native-reanimated';
import Chat from '../../app/chat';
import { useStore } from '../../src/store';
import { fillField } from '../../testUtils';

const mockBack = jest.fn();
const mockReplace = jest.fn();
// Mutated per-test before render() to control useLocalSearchParams()'s result.
let mockCircleParam: { circle?: string } = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: mockBack }),
  useLocalSearchParams: () => mockCircleParam,
}));

// The project's shared react-native-reanimated jest mock (wired up globally by
// expo-router/testing-library in jest.setup.js) doesn't implement
// LayoutAnimationConfig — its own source literally has "ADD ME IF NEEDED" for
// it. chat.tsx wraps its message list in one unconditionally, so without a
// stand-in every render (even with zero messages) throws "Element type is
// invalid" for an undefined component.
// A file-local `jest.mock('react-native-reanimated', ...)` does NOT fix this:
// expo-router's own testing-library setup already resolved and cached a mock
// module instance before this file loads, so re-registering the mock factory
// here doesn't invalidate that cached instance. Instead, patch the missing
// property directly on the already-cached shared mock module object — thanks
// to Babel's ESM/CJS interop this is a live property read at each render, so
// chat.tsx's `import { LayoutAnimationConfig } from 'react-native-reanimated'`
// picks up the patch too. Scoped to this file's module instance only.
(ReanimatedNS as any).LayoutAnimationConfig = ({ children }: { children?: any }) => children;

const INITIAL_STATE = useStore.getState();

beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
  mockBack.mockClear();
  mockReplace.mockClear();
  mockCircleParam = {};
});

describe('Chat screen', () => {
  it("shows the requested circle's header and message history", async () => {
    mockCircleParam = { circle: 'frishman' };
    await render(<Chat />);

    // header: host name + beach name, and the players/capacity ring badge
    expect(screen.getByText(/עומר · חוף פרישמן/)).toBeTruthy();
    expect(screen.getByText('3/4')).toBeTruthy();

    // seeded chat history for this circle
    expect(screen.getByText('מישהו מביא רמקול? 🎵')).toBeTruthy();
    expect(screen.getByText('יוצא עכשיו, 5 דקות ואני שם')).toBeTruthy();
  });

  // PRIORITY regression (fixed this session): an unknown/missing circle id
  // must render the not-found view, NOT silently fall back to the default
  // "frishman" fixture circle.
  it('renders the not-found view for an unknown circle id instead of falling back to the default circle', async () => {
    mockCircleParam = { circle: 'ghost-circle-does-not-exist' };
    await render(<Chat />);

    expect(screen.getByText("הצ'אט לא נמצא")).toBeTruthy();
    // must NOT have quietly rendered the "frishman" fixture circle instead
    expect(screen.queryByText(/עומר · חוף פרישמן/)).toBeNull();
    expect(screen.queryByText('מישהו מביא רמקול? 🎵')).toBeNull();
  });

  it('the not-found view\'s "למפה" button navigates back to the map', async () => {
    mockCircleParam = { circle: 'ghost-circle-does-not-exist' };
    await render(<Chat />);

    fireEvent.press(screen.getByText('למפה'));
    expect(mockReplace).toHaveBeenCalledWith('/map');
  });

  it('sending typed text calls sendMessage and clears the input', async () => {
    mockCircleParam = { circle: 'frishman' };
    const user = userEvent.setup();
    await render(<Chat />);

    await fillField(screen.getByPlaceholderText('כתוב למעגל…'), 'הגעתי כבר');
    await user.press(screen.getByLabelText('שלח'));

    const sent = useStore.getState().messages.find((m) => m.text === 'הגעתי כבר');
    expect(sent).toBeTruthy();
    expect(sent?.kind).toBe('out');
    expect(sent?.circleId).toBe('frishman');

    // input must be cleared after sending
    expect(screen.getByPlaceholderText('כתוב למעגל…').props.value).toBe('');
  });

  it('quick-reply chips send their preset text', async () => {
    mockCircleParam = { circle: 'frishman' };
    const user = userEvent.setup();
    await render(<Chat />);

    await user.press(screen.getByText('בדרך 🏃'));

    const sentQuickReply = useStore
      .getState()
      .messages.some((m) => m.kind === 'out' && m.text === 'בדרך 🏃' && m.circleId === 'frishman');
    expect(sentQuickReply).toBe(true);
  });
});
