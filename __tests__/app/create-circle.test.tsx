import { render, screen, fireEvent, userEvent } from '@testing-library/react-native';
import CreateCircle from '../../app/create-circle';
import { useStore } from '../../src/store';

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

const CTA_NOW = 'פתח מעגל — עכשיו';
const CTA_DEFAULT = 'פתח מעגל';

describe('CreateCircle screen', () => {
  it('renders the sport tiles and the beach chosen in the store (draftBeach)', async () => {
    useStore.setState({
      draftBeach: { id: 'test-beach', name: 'חוף בדיקה', court: 'מגרש בדיקה', lat: 32, lng: 34 },
    });
    await render(<CreateCircle />);

    expect(screen.getByText("פוצ'יוולי")).toBeTruthy();
    expect(screen.getByText('אלטינה')).toBeTruthy();
    expect(screen.getByText('כדורעף')).toBeTruthy();
    expect(screen.getByText('חוף בדיקה · מגרש בדיקה')).toBeTruthy();
    expect(screen.getByText(CTA_NOW)).toBeTruthy();
  });

  // PRIORITY (fixed this session — was a dead control): pressing the level
  // dropdown must cycle levelIdx forward through LEVELS and re-render the label.
  it('the level picker Pressable cycles through LEVELS on each press', async () => {
    await render(<CreateCircle />);

    // default levelIdx = 1 -> 'בינוניים'
    expect(screen.getByText('בינוניים')).toBeTruthy();
    const levelBtn = screen.getByText('בינוניים').parent!;

    await fireEvent.press(levelBtn);
    expect(screen.getByText('מקצוענים')).toBeTruthy();
    expect(screen.queryByText('בינוניים')).toBeNull();

    await fireEvent.press(levelBtn);
    expect(screen.getByText('מתחילים')).toBeTruthy();
    expect(screen.queryByText('מקצוענים')).toBeNull();

    // wraps back around
    await fireEvent.press(levelBtn);
    expect(screen.getByText('בינוניים')).toBeTruthy();
  });

  it('selecting a different sport tile changes what is submitted to createCircle', async () => {
    const createCircle = jest.fn(() => 'circle-sport');
    useStore.setState({ createCircle });
    await render(<CreateCircle />);

    await fireEvent.press(screen.getByText('כדורעף'));

    const user = userEvent.setup();
    await user.press(screen.getByText(CTA_NOW));

    expect(createCircle).toHaveBeenCalledWith(
      expect.objectContaining({ sport: 'volleyball', sportLabel: 'כדורעף' }),
    );
    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/c/[id]', params: { id: 'circle-sport' } });
  });

  it('the capacity Stepper adjusts the "missing" count that gets submitted', async () => {
    const createCircle = jest.fn(() => 'circle-stepper');
    useStore.setState({ createCircle });
    await render(<CreateCircle />);

    // default missing = 3; row is [minusBtn, valueTxt, plusBtn]
    const stepperRow = screen.getByText('3').parent!;
    const plusBtn = stepperRow.children[2] as any;
    const minusBtn = stepperRow.children[0] as any;

    await fireEvent.press(plusBtn);
    await fireEvent.press(plusBtn);
    expect(screen.getByText('5')).toBeTruthy();

    await fireEvent.press(minusBtn);
    expect(screen.getByText('4')).toBeTruthy();

    const user = userEvent.setup();
    await user.press(screen.getByText(CTA_NOW));

    expect(createCircle).toHaveBeenCalledWith(expect.objectContaining({ missing: 4 }));
  });

  it('choosing "קבע זמן" on the time SegmentedControl updates the CTA label and marks the circle scheduled', async () => {
    const createCircle = jest.fn(() => 'circle-time');
    useStore.setState({ createCircle });
    await render(<CreateCircle />);

    expect(screen.getByText(CTA_NOW)).toBeTruthy();

    await fireEvent.press(screen.getByText('קבע זמן'));

    expect(screen.queryByText(CTA_NOW)).toBeNull();
    expect(screen.getByText(CTA_DEFAULT)).toBeTruthy();

    const user = userEvent.setup();
    await user.press(screen.getByText(CTA_DEFAULT));

    expect(createCircle).toHaveBeenCalledWith(
      expect.objectContaining({ startLabel: 'בהמשך', scheduled: true }),
    );
  });

  it('flipping the open/closed Toggle submits isOpen: false', async () => {
    const createCircle = jest.fn(() => 'circle-toggle');
    useStore.setState({ createCircle });
    await render(<CreateCircle />);

    const toggleRow = screen.getByText('מעגל פתוח').parent!.parent!;
    const toggleSwitch = toggleRow.children[1] as any;
    await fireEvent.press(toggleSwitch);

    const user = userEvent.setup();
    await user.press(screen.getByText(CTA_NOW));

    expect(createCircle).toHaveBeenCalledWith(expect.objectContaining({ isOpen: false }));
  });

  it('submits the full default input shape to createCircle and navigates to /c/[id]', async () => {
    const createCircle = jest.fn(() => 'circle-default');
    useStore.setState({ createCircle });
    await render(<CreateCircle />);

    const user = userEvent.setup();
    await user.press(screen.getByText(CTA_NOW));

    expect(createCircle).toHaveBeenCalledTimes(1);
    expect(createCircle).toHaveBeenCalledWith({
      sport: 'footvolley',
      sportLabel: "פוצ'יוולי",
      missing: 3,
      levelLabel: 'בינוניים',
      startLabel: 'עכשיו',
      scheduled: false,
      isOpen: true,
    });
    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/c/[id]', params: { id: 'circle-default' } });
  });

  it('closing the screen and changing beach navigate via router.back/push', async () => {
    await render(<CreateCircle />);

    await fireEvent.press(screen.getByLabelText('סגור'));
    expect(mockBack).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByText('שנה'));
    expect(mockPush).toHaveBeenCalledWith('/beach-picker');
  });
});
