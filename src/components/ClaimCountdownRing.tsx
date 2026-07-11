import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Txt } from './Txt';
import { fonts } from '../theme';
import { haptic } from '../theme/motion';

// Spec 04 — the 5-minute spot-claim countdown. The ring drains LINEARLY off the
// UI thread against a real server expiry (`expiresAt`, ms epoch) — never a
// client 300s timer. The numeric time and per-second haptics run JS-side (they
// are discrete state changes). Numeric time is ALWAYS shown; colour never
// carries meaning alone.

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const FULL_MS = 5 * 60 * 1000;

// Exact spec palette.
const TEAL = '#14B8A8'; // > 2:00
const AMBER = '#E8A13C'; // 2:00–1:00
const RED = '#C0392B'; // < 1:00

function fmt(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function phaseColor(msLeft: number): string {
  if (msLeft > 120000) return TEAL;
  if (msLeft > 60000) return AMBER;
  return RED;
}

export function ClaimCountdownRing({
  expiresAt,
  onExpire,
  size = 132,
}: {
  expiresAt: number;
  onExpire?: () => void;
  size?: number;
}) {
  const reduced = useReducedMotion();
  const stroke = 9;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;

  const initialLeft = Math.max(0, expiresAt - Date.now());
  const [msLeft, setMsLeft] = useState(initialLeft);
  // Ring fraction of the full 5:00 window — drains to 0 over the remaining ms.
  const ring = useSharedValue(Math.min(1, initialLeft / FULL_MS));
  const pulse = useSharedValue(1);
  const warned = useRef(false);

  // Ring drain — UI thread, real-time linear (no easing).
  useEffect(() => {
    ring.value = withTiming(0, { duration: initialLeft, easing: Easing.linear });
    return () => cancelAnimation(ring);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Numeric countdown + haptic vocabulary — JS thread, once per second.
  useEffect(() => {
    let done = false;
    const iv = setInterval(() => {
      if (done) return;
      const left = Math.max(0, expiresAt - Date.now());
      setMsLeft(left);
      // one-time warning as it crosses into the final minute
      if (!warned.current && left <= 60000 && left > 0) {
        warned.current = true;
        haptic.warning();
      }
      // last 10s: a selection tick per second + a subtle seconds-text pulse
      if (left > 0 && left <= 10000) {
        haptic.selection();
        if (!reduced) {
          pulse.value = withSequence(
            withTiming(1.055, { duration: 60 }),
            withTiming(1, { duration: 60 }),
          );
        }
      }
      if (left <= 0) {
        done = true;
        clearInterval(iv);
        haptic.error();
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [expiresAt, onExpire, reduced, pulse]);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - ring.value) }));
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const color = phaseColor(msLeft);

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="timer"
      accessibilityLabel={`נותרו ${fmt(msLeft)} לתפוס את המקום`}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(14,79,94,.1)" strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          animatedProps={ringProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Animated.View style={pulseStyle}>
        <Txt style={{ fontFamily: fonts.displayBold, fontSize: size * 0.28, color, fontVariant: ['tabular-nums'] }}>
          {fmt(msLeft)}
        </Txt>
      </Animated.View>
    </View>
  );
}
