import { ReactNode, useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Txt } from './Txt';
import { colors, fonts, shadows } from '../theme';
import { DUR, EASE, usePressScale } from '../theme/motion';

// Spec 02 — the join CTA *becomes* the confirmation (no modal). When `celebrate`
// flips true, a teal fill sweeps across, a checkmark draws in, and the label
// swaps. Reduce Motion keeps fill + check (only the burst/pop are dropped).

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK_LEN = 22; // path length of "M5 12 l5 5 L19 7"

export function JoinCTA({
  label,
  celebrate,
  baseColor,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  celebrate: boolean;
  baseColor: string;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const press = usePressScale();
  const sweep = useSharedValue(celebrate ? 1 : 0);
  const draw = useSharedValue(celebrate ? 0 : CHECK_LEN);
  const prev = useRef(celebrate);

  useEffect(() => {
    if (celebrate && !prev.current) {
      sweep.value = withTiming(1, { duration: 200, easing: EASE.standard });
      draw.value = withDelay(120, withTiming(0, { duration: 300, easing: EASE.enter }));
    } else if (!celebrate && prev.current) {
      sweep.value = withTiming(0, { duration: DUR.quick, easing: EASE.exit });
      draw.value = CHECK_LEN;
    }
    prev.current = celebrate;
  }, [celebrate, sweep, draw]);

  const sweepStyle = useAnimatedStyle(() => ({
    opacity: sweep.value <= 0 ? 0 : 1,
    transform: [{ scaleX: sweep.value }],
  }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: draw.value }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.cta, { backgroundColor: baseColor }, press.style]}
    >
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.tealFill, sweepStyle]} />
      <View style={styles.ctaContent}>
        {celebrate ? (
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <AnimatedPath
              d="M5 12 l5 5 L19 7"
              fill="none"
              stroke="#fff"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={CHECK_LEN}
              animatedProps={checkProps}
            />
          </Svg>
        ) : null}
        <Txt style={styles.ctaTxt}>{label}</Txt>
      </View>
    </AnimatedPressable>
  );
}

// Spec 02 — 6-particle radial burst (brand orange/teal/amber), 400ms, ~26px.
// Plays once on mount; render it keyed so a new join replays it. Null under
// Reduce Motion.
const ANGLES = [0, 60, 120, 180, 240, 300];
const PARTICLE_COLORS = [colors.sunset, colors.live, colors.amber, colors.sunset, colors.live, colors.amber];
const BURST_RADIUS = 26;

function Particle({ angle, color, progress }: { angle: number; color: string; progress: SharedValue<number> }) {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad) * BURST_RADIUS;
  const dy = Math.sin(rad) * BURST_RADIUS;
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: dx * progress.value },
      { translateY: dy * progress.value },
      { scale: 1 - 0.45 * progress.value },
    ],
  }));
  return <Animated.View style={[styles.particle, { backgroundColor: color }, style]} />;
}

export function ParticleBurst({ style }: { style?: ViewStyle }) {
  const progress = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    progress.value = withTiming(1, { duration: 400, easing: EASE.exit });
  }, [progress, reduced]);

  if (reduced) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center, style]}>
      {ANGLES.map((a, i) => (
        <Particle key={i} angle={a} color={PARTICLE_COLORS[i]} progress={progress} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cta: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.cta,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : null),
  },
  // Teal layer that sweeps across from the RTL leading (right) edge.
  tealFill: {
    backgroundColor: colors.live,
    borderRadius: 29,
    transformOrigin: 'right',
  },
  ctaContent: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  ctaTxt: { fontFamily: fonts.extrabold, fontSize: 17, color: '#fff' },
  center: { alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute', width: 7, height: 7, borderRadius: 3.5 },
});
