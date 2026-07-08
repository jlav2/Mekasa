import { render, screen, fireEvent } from '@testing-library/react-native';
import BeachPicker from '../../app/beach-picker';
import { useStore } from '../../src/store';
import { BEACH_OPTIONS } from '../../src/data/beaches';

// pick() in app/beach-picker.tsx is fully synchronous (setDraftBeach + router.back(),
// no awaited work), so bare fireEvent.press is safe here per the sync-only exception.
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: mockBack }),
}));

const INITIAL_STATE = useStore.getState();
beforeEach(() => {
  useStore.setState(INITIAL_STATE, true);
  mockBack.mockClear();
});

describe('BeachPicker screen', () => {
  it('renders the nearby beach options', async () => {
    await render(<BeachPicker />);
    expect(screen.getByText('חוף גורדון')).toBeTruthy();
    expect(screen.getByText('חוף הילטון')).toBeTruthy();
    expect(screen.getByText('מצודת הים')).toBeTruthy();
    expect(screen.getByText('חוף בוגרשוב')).toBeTruthy();
  });

  it('selecting another beach option sets the draft beach and navigates back', async () => {
    await render(<BeachPicker />);
    fireEvent.press(screen.getByText('חוף הילטון'));

    expect(useStore.getState().draftBeach).toEqual(BEACH_OPTIONS.find((b) => b.name === 'חוף הילטון'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('pressing the footer CTA selects חוף פרישמן and navigates back', async () => {
    // start from a different draft beach so we can tell the CTA actually changed it
    useStore.setState({ draftBeach: BEACH_OPTIONS.find((b) => b.name === 'חוף גורדון')! });
    await render(<BeachPicker />);

    fireEvent.press(screen.getByText('בחר: פרישמן · מגרש 2'));

    expect(useStore.getState().draftBeach).toEqual(BEACH_OPTIONS.find((b) => b.name === 'חוף פרישמן'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('pressing the close button navigates back without touching the draft beach', async () => {
    await render(<BeachPicker />);
    const before = useStore.getState().draftBeach;

    fireEvent.press(screen.getByLabelText('סגור'));

    expect(useStore.getState().draftBeach).toBe(before);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
