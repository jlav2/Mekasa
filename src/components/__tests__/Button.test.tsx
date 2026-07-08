import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

// RNTL v14 renders on top of the new `test-renderer` package and made
// render() asynchronous — every render() call must be awaited or you get an
// unresolved Promise back instead of a RenderResult.
describe('Button', () => {
  it('renders its label', async () => {
    await render(<Button label="פתח מעגל" />);
    expect(screen.getByText('פתח מעגל')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(<Button label="לחץ" onPress={onPress} />);
    fireEvent.press(screen.getByText('לחץ'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="לחץ" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText('לחץ'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows a spinner and hides the label while loading', async () => {
    await render(<Button label="שלח" loading />);
    expect(screen.queryByText('שלח')).toBeNull();
  });
});
