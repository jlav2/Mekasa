import { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

// Shimmering loading placeholder — a muted block with a translating gradient
// sweep (single-direction repeat, matching a CSS background-position shimmer).
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
  const stripWidth = Math.max(40, width * STRIP_RATIO);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 1500, easing: Easing.linear }), -1, false),
    );
    return () => cancelAnimation(progress);
  }, [delay, progress]);

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
      <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: stripWidth }, sweepStyle]}>
        <LinearGradient
          colors={['rgba(14,79,94,0)', 'rgba(14,79,94,.15)', 'rgba(14,79,94,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}
