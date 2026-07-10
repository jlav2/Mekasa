import { render, screen, fireEvent } from '@testing-library/react-native';
import { TextField } from '../TextField';
import { colors } from '../../theme';

describe('TextField', () => {
  it('renders label and hint text when provided', async () => {
    await render(<TextField label="אימייל" hint="שדה חובה" />);
    expect(screen.getByText('אימייל')).toBeTruthy();
    expect(screen.getByText('שדה חובה')).toBeTruthy();
  });

  it('omits the label/hint row entirely when neither is provided', async () => {
    await render(<TextField placeholder="הקלד כאן" />);
    expect(screen.queryByText('אימייל')).toBeNull();
    // No crash, and the input itself still renders.
    expect(screen.getByPlaceholderText('הקלד כאן')).toBeTruthy();
  });

  it('applies a custom hintColor to the hint text style', async () => {
    await render(<TextField hint="שגיאה" hintColor="#ff0000" />);
    const hintText = screen.getByText('שגיאה');
    const flatStyle = Array.isArray(hintText.props.style)
      ? Object.assign({}, ...hintText.props.style.flat(Infinity).filter(Boolean))
      : hintText.props.style;
    expect(flatStyle.color).toBe('#ff0000');
  });

  it('falls back to the default hint color when hintColor is not provided', async () => {
    await render(<TextField hint="רגיל" />);
    const hintText = screen.getByText('רגיל');
    const flatStyle = Array.isArray(hintText.props.style)
      ? Object.assign({}, ...hintText.props.style.flat(Infinity).filter(Boolean))
      : hintText.props.style;
    expect(flatStyle.color).toBe(colors.liveDeep);
  });

  it('renders without crashing when pill is set, and still exposes the input', async () => {
    await render(<TextField pill placeholder="חיפוש" />);
    expect(screen.getByPlaceholderText('חיפוש')).toBeTruthy();
  });

  it('passes value, placeholder, and secureTextEntry through to the underlying TextInput', async () => {
    await render(<TextField placeholder="סיסמה" value="abc123" secureTextEntry />);
    const input = screen.getByPlaceholderText('סיסמה');
    expect(input.props.value).toBe('abc123');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('calls onChangeText with the typed value', async () => {
    const onChangeText = jest.fn();
    await render(<TextField placeholder="שם משתמש" onChangeText={onChangeText} />);
    fireEvent.changeText(screen.getByPlaceholderText('שם משתמש'), 'גיא');
    expect(onChangeText).toHaveBeenCalledWith('גיא');
  });
});
