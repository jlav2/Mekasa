import { ReactNode, useEffect, useState } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  useReducedMotion,
  withRepeat,
  withTiming,
  withDelay,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { DUR, STAGGER_MS } from '../theme/motion';

// Shimmering loading placeholder — a muted block with a translating gradient
// sweep (single-direction repeat, matching a CSS background-position shimmer).
// Spec 06: Reduce Motion → shimmer off (flat gray), no sweep.
const STRIP_RATIO = 0.6;

export function Skeleton({
  width,
  height,
  radius = 8,
  style,
  delay = 0,
}: {
  width: number;
  height: number;
  radius?: number;
  style?: ViewStyle;
  delay?: number;
}) {
  const progress = useSharedValue(0);
  const reduced = useReducedMotion();
  const stripWidth = Math.max(40, width * STRIP_RATIO);

  useEffect(() => {
    if (reduced) return; // flat gray, no sweep
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 1500, easing: Easing.linear }), -1, false),
    );
    return () => cancelAnimation(progress);
  }, [delay, progress, reduced]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -stripWidth + progress.value * (width + stripWidth) }],
  }));

  return (
    <View
      style={[
        { width, height, borderRadius: radius, backgroundColor: 'rgba(14,79,94,.08)', overflow: 'hidden' },
        style,
      ]}
    >
      {!reduced ? (
        <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: stripWidth }, sweepStyle]}>
          <LinearGradient
            colors={['rgba(14,79,94,0)', 'rgba(14,79,94,.15)', 'rgba(14,79,94,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

// Spec 06: "Show skeleton only if load > 250ms." Returns true only once `active`
// has stayed true continuously for `delayMs` — so a fast load never flashes a
// skeleton, and the caller shows plain chrome during the sub-threshold window.
export function useDelayedFlag(active: boolean, delayMs: number): boolean {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!active) {
      setShown(false);
      return;
    }
    const t = setTimeout(() => setShown(true), delayMs);
    return () => clearTimeout(t);
  }, [active, delayMs]);
  return shown;
}

// Spec 06: content rows enter staggered as the skeleton clears. FadeInDown with
// a per-row delay capped at 6 rows; Reduce Motion collapses to a plain fade.
export function Reveal({
  index = 0,
  children,
  style,
}: {
  index?: number;
  children: ReactNode;
  style?: ViewStyle;
}) {
  const reduced = useReducedMotion();
  const entering = reduced
    ? FadeIn.duration(DUR.quick)
    : FadeInDown.duration(DUR.standard).delay(Math.min(index, 5) * STAGGER_MS);
  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
