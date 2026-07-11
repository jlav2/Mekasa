import { ReactNode, useEffect, useState } from 'react';
import {
  Platform,
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Txt } from './Txt';
import { Icon } from './icons';
import { colors, fonts, radii, shadows, avatarPalette, proGradient } from '../theme';
import { usePressScale, haptic, PRESS_SCALE } from '../theme/motion';

// Spec 01: shared pressables get the standard press-in scale + spring release.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* ---------------- Card ---------------- */
export function Card({
  children,
  style,
  petrol = false,
  radius = radii.card,
  pad = 16,
  floating = false,
}: {
  children: ReactNode;
  style?: ViewStyle;
  petrol?: boolean;
  radius?: number;
  pad?: number;
  floating?: boolean;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: petrol ? colors.petrol : colors.card,
          borderRadius: radius,
          padding: pad,
          borderWidth: petrol ? 0 : 1,
          borderColor: colors.hairline,
        },
        floating && (petrol ? shadows.petrolHero : shadows.card),
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* ---------------- SectionLabel ---------------- */
export function SectionLabel({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return (
    <Txt
      style={[
        { fontFamily: fonts.extrabold, fontSize: 12, color: colors.faint, letterSpacing: 0.5, marginBottom: 8, paddingRight: 6 },
        style,
      ]}
    >
      {children}
    </Txt>
  );
}

/* ---------------- Badge ---------------- */
export function Badge({
  label,
  bg = colors.chipBg,
  color = colors.petrol,
  style,
}: {
  label: string;
  bg?: string;
  color?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Txt style={{ fontFamily: fonts.extrabold, fontSize: 11, color }}>{label}</Txt>
    </View>
  );
}

export function ProBadge({ style, size = 11 }: { style?: ViewStyle; size?: number }) {
  return (
    <LinearGradient
      colors={proGradient as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.badge, { paddingHorizontal: 10 }, style]}
    >
      <Txt style={{ fontFamily: fonts.extrabold, fontSize: size, color: '#fff', letterSpacing: 0.5 }}>
        PRO
      </Txt>
    </LinearGradient>
  );
}

/* ---------------- Chip / FilterChip ---------------- */
export function Chip({
  label,
  active = false,
  onPress,
  leading,
  trailing,
  style,
  filledColor = colors.petrol,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  leading?: ReactNode;
  trailing?: ReactNode;
  style?: ViewStyle;
  filledColor?: string;
}) {
  // Chip is a selection surface (vocabulary: chips → haptic.selection), so the
  // scale carries no light haptic; the selection buzz fires on actual press.
  const press = usePressScale(PRESS_SCALE, false);
  const interactive = !!onPress;
  return (
    <AnimatedPressable
      onPress={onPress ? () => { haptic.selection(); onPress(); } : undefined}
      onPressIn={interactive ? press.onPressIn : undefined}
      onPressOut={interactive ? press.onPressOut : undefined}
      hitSlop={4}
      style={[
        styles.chip,
        active
          ? { backgroundColor: filledColor }
          : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.hairlineStrong },
        interactive && press.style,
        Platform.OS === 'web' && { cursor: 'pointer' },
        style,
      ]}
    >
      {leading}
      <Txt
        style={{
          fontFamily: fonts.bold,
          fontSize: 13,
          color: active ? '#fff' : colors.petrol,
        }}
      >
        {label}
      </Txt>
      {trailing}
    </AnimatedPressable>
  );
}

/* ---------------- Avatar ---------------- */
export function Avatar({
  letter,
  size = 40,
  colorIndex = 0,
  color,
  ring,
  ringColor = colors.live,
  border,
  style,
}: {
  letter: string;
  size?: number;
  colorIndex?: number;
  color?: string;
  ring?: boolean;
  ringColor?: string;
  border?: string;
  style?: ViewStyle;
}) {
  const bg = color ?? avatarPalette[colorIndex % avatarPalette.length];
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        ring && { borderWidth: 2, borderColor: ringColor },
        border ? { borderWidth: 2, borderColor: border } : null,
        style,
      ]}
    >
      <Txt style={{ fontFamily: fonts.bold, fontSize: size * 0.4, color: '#fff' }}>{letter}</Txt>
    </View>
  );
}

// Overlapping avatar stack + optional dashed empty slot
export function AvatarStack({
  people,
  size = 30,
  border = colors.petrol,
  emptySlot = false,
  emptyLabel = '+',
  emptyBorder = 'rgba(255,255,255,.5)',
}: {
  people: { letter: string; colorIndex?: number; color?: string }[];
  size?: number;
  border?: string;
  emptySlot?: boolean;
  emptyLabel?: string;
  emptyBorder?: string;
}) {
  return (
    <View style={{ flexDirection: 'row-reverse' }}>
      {people.map((p, i) => (
        <Avatar
          key={i}
          letter={p.letter}
          size={size}
          colorIndex={p.colorIndex ?? i}
          color={p.color}
          border={border}
          style={{ marginRight: i === 0 ? 0 : -8 }}
        />
      ))}
      {emptySlot && (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: emptyBorder,
            marginRight: people.length ? -8 : 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,.08)',
          }}
        >
          <Txt style={{ color: 'rgba(255,255,255,.7)', fontSize: size * 0.42, fontFamily: fonts.bold }}>
            {emptyLabel}
          </Txt>
        </View>
      )}
    </View>
  );
}

/* ---------------- Animated status dot (liveDot) ---------------- */
// Reanimated CSS animation — declarative, runs off the JS thread, cleans up on unmount.
const dotPulse = {
  '0%': { opacity: 1 },
  '50%': { opacity: 0.35 },
  '100%': { opacity: 1 },
};

export function StatusDot({ color = colors.live, size = 8, animate = true }: { color?: string; size?: number; animate?: boolean }) {
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        ...(animate
          ? {
              animationName: dotPulse,
              animationDuration: '1600ms',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            }
          : null),
      }}
    />
  );
}

/* ---------------- Pulse halo (mkPulse) behind a live marker ---------------- */
const haloPulse = {
  '0%': { transform: [{ scale: 0.85 }], opacity: 0.75 },
  '100%': { transform: [{ scale: 1.7 }], opacity: 0 },
};

// Spec 03: live ring pulse — scale 0.85→1.7, opacity 0.75→0, 2.2s ease-out,
// infinite. Reduce Motion collapses it to a static halo (no loop).
export function PulseHalo({
  color = colors.live,
  size = 44,
  animate = true,
  style,
}: {
  color?: string;
  size?: number;
  animate?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animate
          ? {
              animationName: haloPulse,
              animationDuration: '2200ms',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-out',
            }
          : { transform: [{ scale: 1.3 }], opacity: 0.18 },
        style,
      ]}
    />
  );
}

/* ---------------- SegmentedControl ---------------- */
function SegItem({
  label,
  active,
  activeColor,
  onPress,
}: {
  label: string;
  active: boolean;
  activeColor: string;
  onPress: () => void;
}) {
  const press = usePressScale(PRESS_SCALE, false);
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={{ top: 2, bottom: 2 }} // segment is 40pt tall → pad to ≥44
      style={[
        styles.segmentItem,
        active && { backgroundColor: activeColor, ...shadows.card },
        press.style,
        Platform.OS === 'web' && { cursor: 'pointer' },
      ]}
    >
      <Txt style={{ fontFamily: active ? fonts.extrabold : fonts.semibold, fontSize: 13.5, color: active ? '#fff' : colors.muted }}>
        {label}
      </Txt>
    </AnimatedPressable>
  );
}

export function SegmentedControl({
  options,
  value,
  onChange,
  activeColor = colors.sunset,
  style,
}: {
  options: string[];
  value: number;
  onChange?: (i: number) => void;
  activeColor?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.segment, style]}>
      {options.map((o, i) => (
        <SegItem
          key={o}
          label={o}
          active={i === value}
          activeColor={activeColor}
          onPress={() => { haptic.selection(); onChange?.(i); }}
        />
      ))}
    </View>
  );
}

/* ---------------- ProgressDashes ---------------- */
export function ProgressDashes({ total, active }: { total: number; active: number }) {
  return (
    <View style={{ flexDirection: 'row-reverse', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{ width: 26, height: 5, borderRadius: 3, backgroundColor: i <= active ? colors.sunset : colors.hairlineStrong }}
        />
      ))}
    </View>
  );
}

/* ---------------- Toggle (iOS switch) ---------------- */
export function Toggle({ value, onChange, onColor = colors.live }: { value: boolean; onChange?: (v: boolean) => void; onColor?: string }) {
  const [on, setOn] = useState(value);
  useEffect(() => setOn(value), [value]); // stay in sync when used as a controlled prop
  return (
    <Pressable
      onPress={() => { haptic.selection(); setOn(!on); onChange?.(!on); }}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      hitSlop={{ top: 7, bottom: 7, left: 6, right: 6 }} // track is 31pt tall → pad to ≥44
    >
      <Animated.View
        style={{
          width: 52,
          height: 31,
          borderRadius: 16,
          backgroundColor: on ? onColor : 'rgba(14,79,94,.16)',
          justifyContent: 'center',
          transitionProperty: 'backgroundColor',
          transitionDuration: 180,
        }}
      >
        <Animated.View
          style={{
            width: 27,
            height: 27,
            borderRadius: 14,
            backgroundColor: '#fff',
            transform: [{ translateX: on ? 23 : 2 }],
            transitionProperty: 'transform',
            transitionDuration: 180,
            transitionTimingFunction: 'ease-out',
            ...shadows.card,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}

/* ---------------- Stepper ---------------- */
export function Stepper({ value, onChange, min = 0, max = 9 }: { value: number; onChange?: (v: number) => void; min?: number; max?: number }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]); // stay in sync when used as a controlled prop
  const set = (n: number) => {
    const c = Math.max(min, Math.min(max, n));
    if (c !== v) haptic.selection(); // picker → selection buzz only on a real change
    setV(c);
    onChange?.(c);
  };
  return (
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 14 }}>
      <Pressable onPress={() => set(v - 1)} hitSlop={2} accessibilityRole="button" accessibilityLabel="הפחת" style={[styles.stepBtn, { borderColor: colors.hairlineStrong }]}>
        <Icon name="minus" size={18} color={colors.muted} />
      </Pressable>
      <Txt style={{ fontFamily: fonts.displayBold, fontSize: 26, color: colors.ink, minWidth: 20, textAlign: 'center' }}>{v}</Txt>
      <Pressable onPress={() => set(v + 1)} hitSlop={2} accessibilityRole="button" accessibilityLabel="הוסף" style={[styles.stepBtn, { backgroundColor: colors.sunset, borderColor: colors.sunset }]}>
        <Icon name="plus" size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

/* ---------------- Divider ---------------- */
export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[{ height: 1, backgroundColor: colors.hairline }, style]} />;
}

/* ---------------- Row (RTL list row) ---------------- */
export function Row({ children, style, gap = 12, onPress }: { children: ReactNode; style?: ViewStyle; gap?: number; onPress?: () => void }) {
  const press = usePressScale();
  const content = <View style={[{ flexDirection: 'row-reverse', alignItems: 'center', gap }, style]}>{children}</View>;
  return onPress ? (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={6} // pad shorter content rows toward the ≥44pt target (rows are spaced, no overlap)
      style={[press.style, Platform.OS === 'web' && { cursor: 'pointer' }]}
    >
      {content}
    </AnimatedPressable>
  ) : (
    content
  );
}

/* ---------------- HeroIconButton (circular icon button — translucent on petrol heroes, card on light screens) ---------------- */
export function HeroIconButton({
  size = 44,
  variant = 'translucent',
  onPress,
  style,
  children,
  accessibilityLabel,
}: {
  size?: number;
  variant?: 'translucent' | 'card';
  onPress?: () => void;
  style?: ViewStyle;
  children: ReactNode;
  accessibilityLabel?: string;
}) {
  const fill: ViewStyle =
    variant === 'card'
      ? { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.hairlineStrong }
      : { backgroundColor: 'rgba(255,255,255,.14)' };
  const press = usePressScale();
  // Pad sub-44 targets up to the 44pt minimum via hitSlop.
  const slop = size < 44 ? (44 - size) / 2 : 0;
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={slop}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
        },
        fill,
        press.style,
        Platform.OS === 'web' && { cursor: 'pointer' },
        style,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 11, paddingVertical: 4, borderRadius: radii.badge, alignSelf: 'flex-start' },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radii.chip,
    justifyContent: 'center',
  },
  segment: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.chipBg,
    borderRadius: radii.segmentOuter,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    height: 40,
    borderRadius: radii.segmentInner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
