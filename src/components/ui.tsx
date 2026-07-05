import { ReactNode, useState } from 'react';
import {
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
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active
          ? { backgroundColor: filledColor }
          : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.hairlineStrong },
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
    </Pressable>
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

export function PulseHalo({ color = colors.live, size = 44, style }: { color?: string; size?: number; style?: ViewStyle }) {
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
          animationName: haloPulse,
          animationDuration: '2000ms',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-out',
        },
        style,
      ]}
    />
  );
}

/* ---------------- SegmentedControl ---------------- */
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
      {options.map((o, i) => {
        const active = i === value;
        return (
          <Pressable
            key={o}
            onPress={() => onChange?.(i)}
            style={[
              styles.segmentItem,
              active && { backgroundColor: activeColor, ...shadows.card },
            ]}
          >
            <Txt style={{ fontFamily: active ? fonts.extrabold : fonts.semibold, fontSize: 13.5, color: active ? '#fff' : colors.muted }}>
              {o}
            </Txt>
          </Pressable>
        );
      })}
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
  return (
    <Pressable onPress={() => { setOn(!on); onChange?.(!on); }}>
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
  const set = (n: number) => { const c = Math.max(min, Math.min(max, n)); setV(c); onChange?.(c); };
  return (
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 14 }}>
      <Pressable onPress={() => set(v - 1)} style={[styles.stepBtn, { borderColor: colors.hairlineStrong }]}>
        <Icon name="minus" size={18} color={colors.muted} />
      </Pressable>
      <Txt style={{ fontFamily: fonts.displayBold, fontSize: 26, color: colors.ink, minWidth: 20, textAlign: 'center' }}>{v}</Txt>
      <Pressable onPress={() => set(v + 1)} style={[styles.stepBtn, { backgroundColor: colors.sunset, borderColor: colors.sunset }]}>
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
  const content = <View style={[{ flexDirection: 'row-reverse', alignItems: 'center', gap }, style]}>{children}</View>;
  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

/* ---------------- HeroIconButton (translucent round button on petrol heroes) ---------------- */
export function HeroIconButton({
  size = 38,
  onPress,
  style,
  children,
  accessibilityLabel,
}: {
  size?: number;
  onPress?: () => void;
  style?: ViewStyle;
  children: ReactNode;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(255,255,255,.14)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 11, paddingVertical: 4, borderRadius: 11, alignSelf: 'flex-start' },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
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
