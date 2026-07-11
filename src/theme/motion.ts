// src/theme/motion.ts
// MeKasa motion & haptics tokens — single source of truth.
// Spec: design_handoff_mekasa_motion/README.md + MeKasa Motion.dc.html
// Requires: react-native-reanimated >= 4, expo-haptics (npx expo install expo-haptics)

import { Platform } from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// ── Durations (ms) ──────────────────────────────────────────
export const DUR = {
  /** press-down feedback */
  instant: 80,
  /** color/opacity, crossfades */
  quick: 160,
  /** entrances, small transitions */
  standard: 240,
  /** sheets, map camera */
  gentle: 360,
  /** celebration moments only (join success) */
  celebrate: 600,
} as const;

// ── Easings ─────────────────────────────────────────────────
export const EASE = {
  /** elements arriving */
  enter: Easing.bezier(0.05, 0.7, 0.1, 1),
  /** elements leaving, press-down */
  exit: Easing.bezier(0.3, 0, 0.8, 0.15),
  /** in-place property changes */
  standard: Easing.bezier(0.2, 0, 0, 1),
  /** ONLY for real-time progress (countdown ring) */
  linear: Easing.linear,
} as const;

// ── Springs (withSpring configs) ────────────────────────────
export const SPRING = {
  /** press release */
  snappy: { damping: 15, stiffness: 400, mass: 1 },
  /** avatars, badges, counters */
  pop: { damping: 14, stiffness: 180, mass: 1 },
  /** cards, bottom sheets */
  sheet: { damping: 18, stiffness: 260, mass: 1 },
} as const;

/** Reduce Motion variant: same feel, zero overshoot */
export const SPRING_REDUCED = { damping: 30, stiffness: 400, mass: 1 } as const;

export const PRESS_SCALE = 0.96;
export const PULL_THRESHOLD = 70; // px
export const STAGGER_MS = 50; // list entrances, cap at 6 rows

// ── Haptics (web-safe wrappers) ─────────────────────────────
// Vocabulary — haptics accompany REAL state changes only:
//   selection: tabs, chips, pickers, countdown ticks
//   light:     buttons, message send, pull threshold
//   medium:    marker select
//   success:   joined a circle, host approved
//   warning:   last-60s of claim, spot taken
//   error:     network failure, claim expired
const canHaptic = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptic = {
  selection: () => { if (canHaptic) Haptics.selectionAsync().catch(() => {}); },
  light: () => { if (canHaptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); },
  medium: () => { if (canHaptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); },
  success: () => { if (canHaptic) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); },
  warning: () => { if (canHaptic) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}); },
  error: () => { if (canHaptic) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}); },
} as const;

// ── usePressScale ───────────────────────────────────────────
// Standard press feedback for every pressable (spec 01).
// Usage:
//   const press = usePressScale();
//   <AnimatedPressable style={press.style} onPressIn={press.onPressIn} onPressOut={press.onPressOut} …>
export function usePressScale(scaleTo: number = PRESS_SCALE, withHaptic: boolean = true) {
  const scale = useSharedValue(1);
  const reduced = useReducedMotion();

  const onPressIn = () => {
    scale.value = withTiming(reduced ? 1 : scaleTo, { duration: DUR.instant, easing: EASE.exit });
    if (withHaptic) haptic.light();
  };

  const onPressOut = () => {
    scale.value = withSpring(1, reduced ? SPRING_REDUCED : SPRING.snappy);
  };

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { style, onPressIn, onPressOut };
}
