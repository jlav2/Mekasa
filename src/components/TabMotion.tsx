import { ReactNode, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Keyframe,
  ZoomOut,
  useSharedValue,
  useAnimatedStyle,
  useReducedMotion,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Txt } from './Txt';
import { colors, fonts } from '../theme';
import { DUR, SPRING } from '../theme/motion';

// Spec 07 — tab motion pieces shared by both tab bars (the router PillTabBar in
// app/(tabs)/_layout.tsx and the static TabBar used on non-tab screens).

// Selected icon pops on selection: dips to 0.88 then springs back, overshooting
// to ~1.12 before settling at 1. Fires only on the false→true transition.
export function AnimatedTabIcon({ active, children }: { active: boolean; children: ReactNode }) {
  const scale = useSharedValue(1);
  const reduced = useReducedMotion();
  const prev = useRef(active);

  useEffect(() => {
    if (active && !prev.current && !reduced) {
      scale.value = withSequence(
        withTiming(0.88, { duration: DUR.instant }),
        withSpring(1, SPRING.pop),
      );
    }
    prev.current = active;
  }, [active, reduced, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

// Badge arrival: scale 0 → 1.25 → 1 pop, plus one expanding ring that fades out.
// Both play once on mount (i.e. when the unread count first crosses 0 → >0);
// a count change while already visible just updates the number.
const badgePop = new Keyframe({
  0: { transform: [{ scale: 0 }] },
  60: { transform: [{ scale: 1.25 }] },
  100: { transform: [{ scale: 1 }] },
}).duration(DUR.standard + 10); // ~250ms

const ringBurst = new Keyframe({
  0: { transform: [{ scale: 0.6 }], opacity: 0.5 },
  100: { transform: [{ scale: 2 }], opacity: 0 },
}).duration(400);

export function TabBadge({ count }: { count: number }) {
  const reduced = useReducedMotion();
  return (
    <Animated.View
      entering={reduced ? undefined : badgePop}
      exiting={ZoomOut.duration(DUR.quick)}
      style={styles.badge}
    >
      {!reduced ? <Animated.View pointerEvents="none" entering={ringBurst} style={styles.ring} /> : null}
      <Txt style={styles.count}>{count}</Txt>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    left: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.sunset,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  // Expanding halo sits behind the count, matching the badge box then scaling out.
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 9,
    backgroundColor: colors.sunset,
  },
  count: { color: '#fff', fontSize: 11, fontFamily: fonts.extrabold },
});
