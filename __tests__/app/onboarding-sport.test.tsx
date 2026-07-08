import { render, screen, userEvent, fireEvent } from '@testing-library/react-native';
import OnboardingSport from '../../app/onboarding-sport';
import { useStore } from '../../src/store';
import { fillField } from '../../testUtils';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn() }),
}));

const INITIAL_STATE = useStore.getState();
beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
  mockReplace.mockClear();
});

describe('OnboardingSport screen', () => {
  it('prefills the name field for a non-guest user, blank for a guest', async () => {
    // Default fixture user has a real name → prefilled.
    await render(<OnboardingSport />);
    expect(screen.getByPlaceholderText('איך קוראים לך? (השם שיופיע במעגלים)').props.value).toBe(
      'גיא לוי',
    );
  });

  it('starts the name field blank for guest users (placeholder name "אורח")', async () => {
    useStore.setState({ user: { ...INITIAL_STATE.user, name: 'אורח' } });
    await render(<OnboardingSport />);
    expect(screen.getByPlaceholderText('איך קוראים לך? (השם שיופיע במעגלים)').props.value).toBe('');
  });

  it('toggling a sport chip on adds it to the sports saved on continue', async () => {
    const user = userEvent.setup();
    await render(<OnboardingSport />);
    // volleyball starts unselected — select it too, alongside the two default sports.
    await user.press(screen.getByText('כדורעף חופים'));
    await user.press(screen.getByText('יאללה, למפה'));

    const sports = useStore.getState().user.sports;
    expect(sports.map((s) => s.sport).sort()).toEqual(['altinha', 'footvolley', 'volleyball']);
    expect(mockReplace).toHaveBeenCalledWith('/onboarding-permissions');
  });

  it('toggling a sport chip off removes it from the sports saved on continue', async () => {
    const user = userEvent.setup();
    await render(<OnboardingSport />);
    // footvolley starts selected — deselect it, leaving only altinha.
    await user.press(screen.getByText("פוצ'יוולי"));
    await user.press(screen.getByText('יאללה, למפה'));

    const sports = useStore.getState().user.sports;
    expect(sports.map((s) => s.sport)).toEqual(['altinha']);
  });

  it('disables the continue button once every sport is deselected', async () => {
    const user = userEvent.setup();
    await render(<OnboardingSport />);
    await user.press(screen.getByText("פוצ'יוולי"));
    await user.press(screen.getByText('אלטינה'));
    await user.press(screen.getByText('יאללה, למפה'));

    // No sports selected → proceed() must never have fired.
    expect(mockReplace).not.toHaveBeenCalled();
    expect(useStore.getState().user.sports).toEqual(INITIAL_STATE.user.sports);
  });

  it('changing the level via the SegmentedControl is reflected in the saved sports', async () => {
    const user = userEvent.setup();
    await render(<OnboardingSport />);
    await user.press(screen.getByText('מקצוענים'));
    await user.press(screen.getByText('יאללה, למפה'));

    const sports = useStore.getState().user.sports;
    expect(sports.length).toBeGreaterThan(0);
    expect(sports.every((s) => s.level === 3)).toBe(true);
  });

  it('uses the default (middle) level when the SegmentedControl is left untouched', async () => {
    const user = userEvent.setup();
    await render(<OnboardingSport />);
    await user.press(screen.getByText('יאללה, למפה'));

    const sports = useStore.getState().user.sports;
    expect(sports.every((s) => s.level === 2)).toBe(true);
  });

  it('calls setName with the typed name and navigates on continue', async () => {
    useStore.setState({ user: { ...INITIAL_STATE.user, name: 'אורח' } });
    const user = userEvent.setup();
    await render(<OnboardingSport />);
    await fillField(screen.getByPlaceholderText('איך קוראים לך? (השם שיופיע במעגלים)'), 'דנה כהן');
    await user.press(screen.getByText('יאללה, למפה'));

    expect(useStore.getState().user.name).toBe('דנה כהן');
    expect(mockReplace).toHaveBeenCalledWith('/onboarding-permissions');
  });

  it('does not call setName (name unchanged) when the field is left blank', async () => {
    useStore.setState({ user: { ...INITIAL_STATE.user, name: 'אורח' } });
    const user = userEvent.setup();
    await render(<OnboardingSport />);
    await user.press(screen.getByText('יאללה, למפה'));

    expect(useStore.getState().user.name).toBe('אורח');
    expect(mockReplace).toHaveBeenCalledWith('/onboarding-permissions');
  });
});
