import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import {
  Card,
  SectionLabel,
  Badge,
  ProBadge,
  Avatar,
  AvatarStack,
  SegmentedControl,
  Toggle,
  Stepper,
  Row,
  HeroIconButton,
  StatusDot,
} from '../ui';
import { colors } from '../../theme';

// ---- helpers -------------------------------------------------------------

// Pressable's own host View doesn't show up when querying descendants of
// itself (queryAll excludes the instance it's called on by default), so a
// Pressable-only component (e.g. Toggle) must be pressed via its own root
// instance. Components whose Pressable(s) are nested *inside* another host
// View (e.g. Stepper's row) are found by looking for the responder prop
// usePressability attaches to the underlying View.
function findPressables(root: any): any[] {
  return root.queryAll(
    (el: any) => el.type === 'View' && typeof el.props.onStartShouldSetResponder === 'function'
  );
}

// Walks the toJSON() tree looking for the first node whose flattened style
// object has the given key (react-native-reanimated's Animated.View here
// renders inline style objects, not StyleSheet ids, so no flattening needed).
function findByStyleProp(node: any, key: string): any {
  if (!node || typeof node !== 'object') return null;
  if (node.props?.style && Object.prototype.hasOwnProperty.call(node.props.style, key)) {
    return node;
  }
  for (const child of node.children ?? []) {
    const found = findByStyleProp(child, key);
    if (found) return found;
  }
  return null;
}

// ---- Card ------------------------------------------------------------

describe('Card', () => {
  it('renders its children', async () => {
    await render(
      <Card>
        <Text>תוכן הכרטיס</Text>
      </Card>
    );
    expect(screen.getByText('תוכן הכרטיס')).toBeTruthy();
  });
});

// ---- SectionLabel ------------------------------------------------------

describe('SectionLabel', () => {
  it('renders its children', async () => {
    await render(<SectionLabel>כותרת</SectionLabel>);
    expect(screen.getByText('כותרת')).toBeTruthy();
  });
});

// ---- Badge / ProBadge ------------------------------------------------------

describe('Badge', () => {
  it('renders the given label', async () => {
    await render(<Badge label="חדש" />);
    expect(screen.getByText('חדש')).toBeTruthy();
  });
});

describe('ProBadge', () => {
  it('renders the PRO label', async () => {
    await render(<ProBadge />);
    expect(screen.getByText('PRO')).toBeTruthy();
  });
});

// ---- Avatar / AvatarStack ------------------------------------------------------

describe('Avatar', () => {
  it('renders the given letter', async () => {
    await render(<Avatar letter="א" />);
    expect(screen.getByText('א')).toBeTruthy();
  });
});

describe('AvatarStack', () => {
  it('renders one avatar per person', async () => {
    await render(<AvatarStack people={[{ letter: 'א' }, { letter: 'ב' }, { letter: 'ג' }]} />);
    expect(screen.getByText('א')).toBeTruthy();
    expect(screen.getByText('ב')).toBeTruthy();
    expect(screen.getByText('ג')).toBeTruthy();
  });

  it('does not render an empty slot by default', async () => {
    await render(<AvatarStack people={[{ letter: 'א' }]} />);
    expect(screen.queryByText('+')).toBeNull();
  });

  it('renders a dashed empty slot with the given label when emptySlot is true', async () => {
    await render(<AvatarStack people={[{ letter: 'א' }]} emptySlot emptyLabel="הזמן" />);
    expect(screen.getByText('הזמן')).toBeTruthy();
  });
});

// ---- SegmentedControl ------------------------------------------------------

describe('SegmentedControl', () => {
  const options = ['הכל', 'היום', 'השבוע'];

  it('renders every option label', async () => {
    await render(<SegmentedControl options={options} value={0} />);
    options.forEach((o) => expect(screen.getByText(o)).toBeTruthy());
  });

  it('calls onChange with the index of the pressed option', async () => {
    const onChange = jest.fn();
    await render(<SegmentedControl options={options} value={0} onChange={onChange} />);
    fireEvent.press(screen.getByText('השבוע'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(2);
  });
});

// ---- Toggle ------------------------------------------------------

describe('Toggle', () => {
  it('renders off (knob at translateX 2, track not on-colored) when value is false', async () => {
    await render(<Toggle value={false} />);
    const track = findByStyleProp(screen.toJSON(), 'transitionProperty' as any) ?? null;
    // First transitionProperty node encountered is the outer track (see ui.tsx).
    expect(track.props.style.backgroundColor).not.toBe(colors.live);
    const knob = findByStyleProp(track, 'transform');
    expect(knob.props.style.transform).toEqual([{ translateX: 2 }]);
  });

  it('calls onChange with the flipped value when pressed', async () => {
    const onChange = jest.fn();
    await render(<Toggle value={false} onChange={onChange} />);
    await fireEvent.press(screen.root!);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange(false) when pressed while value is true', async () => {
    const onChange = jest.fn();
    await render(<Toggle value={true} onChange={onChange} />);
    await fireEvent.press(screen.root!);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  // Regression: Toggle used to seed its `on` state from `value` only once
  // (useState fire-once), so a prop change after mount was silently ignored.
  // A useEffect now re-syncs `on` whenever `value` changes.
  it('syncs its visual state when the value prop changes after mount (regression)', async () => {
    const { rerender } = await render(<Toggle value={false} />);

    let track = findByStyleProp(screen.toJSON(), 'transitionProperty' as any);
    expect(track.props.style.backgroundColor).not.toBe(colors.live);
    let knob = findByStyleProp(track, 'transform');
    expect(knob.props.style.transform).toEqual([{ translateX: 2 }]);

    await rerender(<Toggle value={true} />);

    track = findByStyleProp(screen.toJSON(), 'transitionProperty' as any);
    expect(track.props.style.backgroundColor).toBe(colors.live);
    knob = findByStyleProp(track, 'transform');
    expect(knob.props.style.transform).toEqual([{ translateX: 23 }]);
  });
});

// ---- Stepper ------------------------------------------------------

describe('Stepper', () => {
  it('renders the initial value', async () => {
    await render(<Stepper value={3} />);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('increments and calls onChange when the + button is pressed', async () => {
    const onChange = jest.fn();
    await render(<Stepper value={3} onChange={onChange} />);
    const [, incrementBtn] = findPressables(screen.root);
    await fireEvent.press(incrementBtn);
    expect(screen.getByText('4')).toBeTruthy();
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('decrements and calls onChange when the - button is pressed', async () => {
    const onChange = jest.fn();
    await render(<Stepper value={3} onChange={onChange} />);
    const [decrementBtn] = findPressables(screen.root);
    await fireEvent.press(decrementBtn);
    expect(screen.getByText('2')).toBeTruthy();
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('does not go above max', async () => {
    const onChange = jest.fn();
    await render(<Stepper value={9} max={9} onChange={onChange} />);
    const [, incrementBtn] = findPressables(screen.root);
    await fireEvent.press(incrementBtn);
    expect(screen.getByText('9')).toBeTruthy();
    expect(onChange).toHaveBeenCalledWith(9);
  });

  it('does not go below min', async () => {
    const onChange = jest.fn();
    await render(<Stepper value={0} min={0} onChange={onChange} />);
    const [decrementBtn] = findPressables(screen.root);
    await fireEvent.press(decrementBtn);
    expect(screen.getByText('0')).toBeTruthy();
    expect(onChange).toHaveBeenCalledWith(0);
  });

  // Regression: same fire-once useState bug as Toggle — Stepper must re-sync
  // its displayed value whenever the `value` prop changes after mount.
  it('syncs its displayed value when the value prop changes after mount (regression)', async () => {
    const { rerender } = await render(<Stepper value={2} />);
    expect(screen.getByText('2')).toBeTruthy();

    await rerender(<Stepper value={7} />);

    expect(screen.queryByText('2')).toBeNull();
    expect(screen.getByText('7')).toBeTruthy();
  });
});

// ---- Row ------------------------------------------------------

describe('Row', () => {
  it('renders its children', async () => {
    await render(
      <Row>
        <Text>שורה</Text>
      </Row>
    );
    expect(screen.getByText('שורה')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(
      <Row onPress={onPress}>
        <Text>שורה לחיצה</Text>
      </Row>
    );
    fireEvent.press(screen.getByText('שורה לחיצה'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not wrap its children in a Pressable when onPress is omitted', async () => {
    await render(
      <Row>
        <Text>שורה סטטית</Text>
      </Row>
    );
    expect(findPressables(screen.root)).toHaveLength(0);
  });
});

// ---- HeroIconButton ------------------------------------------------------

describe('HeroIconButton', () => {
  it('renders its children', async () => {
    await render(
      <HeroIconButton>
        <Text>X</Text>
      </HeroIconButton>
    );
    expect(screen.getByText('X')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(
      <HeroIconButton onPress={onPress} accessibilityLabel="סגור">
        <Text>X</Text>
      </HeroIconButton>
    );
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes the given accessibilityLabel', async () => {
    await render(
      <HeroIconButton accessibilityLabel="סגור">
        <Text>X</Text>
      </HeroIconButton>
    );
    expect(screen.getByLabelText('סגור')).toBeTruthy();
  });
});

// ---- StatusDot ------------------------------------------------------

describe('StatusDot', () => {
  it('applies a pulsing animation by default', async () => {
    await render(<StatusDot />);
    expect(findByStyleProp(screen.toJSON(), 'animationName')).toBeTruthy();
  });

  it('omits the animation when animate is false', async () => {
    await render(<StatusDot animate={false} />);
    expect(findByStyleProp(screen.toJSON(), 'animationName')).toBeNull();
  });
});
