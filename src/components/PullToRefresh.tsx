import { ReactNode, useCallback, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  cancelAnimation,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Txt } from './Txt';
import { colors, fonts } from '../theme';
import { PULL_THRESHOLD, haptic } from '../theme/motion';

// Spec 08 — pull-to-refresh with the brand dashed-ring "ball". The ball rotation
// tracks the pull 1:1 (deg = pull × 2.2); crossing the 70px threshold buzzes
// once; releasing past it free-spins until the refresh resolves, then settles
// with a success haptic + an "עודכן עכשיו" chip.
//
// The pull is driven purely by the ScrollView's own scroll offset (iOS bounces
// to a negative contentOffset at the top) + onScrollEndDrag — NO Pan gesture,
// so it can never fight the native scroll. Android/web/Reduce-Motion fall back
// to the platform RefreshControl.

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const REFRESH_INSET = 64;
const BALL = 42;
const MIN_SPIN_MS = 700; // keep the spin visible even when the refresh is instant

function Ball() {
  return (
    <Svg width={BALL} height={BALL} viewBox="0 0 44 44">
      <Circle
        cx={22}
        cy={22}
        r={17}
        fill="none"
        stroke={colors.petrol}
        strokeWidth={3.5}
        strokeDasharray="30 6 22 8 26 5"
        strokeLinecap="round"
      />
      <Circle cx={22} cy={22} r={6} fill={colors.petrol} />
    </Svg>
  );
}

function UpdatedChip() {
  return (
    <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(160)} style={styles.chip} pointerEvents="none">
      <Txt style={styles.chipTxt}>עודכן עכשיו</Txt>
    </Animated.View>
  );
}

export function PullToRefresh({
  onRefresh,
  children,
  contentContainerStyle,
  style,
}: {
  onRefresh: () => void | Promise<void>;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: ViewStyle;
}) {
  const reduced = useReducedMotion();
  const [refreshing, setRefreshing] = useState(false);
  const [chip, setChip] = useState(false);

  const finish = useCallback(() => {
    setRefreshing(false);
    haptic.success();
    setChip(true);
    setTimeout(() => setChip(false), 1600);
  }, []);

  const runRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      Promise.resolve(onRefresh()),
      new Promise((r) => setTimeout(r, MIN_SPIN_MS)),
    ]);
    finish();
  }, [onRefresh, finish]);

  // Fallback: Android / web / Reduce Motion use the reliable native control.
  if (Platform.OS !== 'ios' || reduced) {
    return (
      <View style={[styles.flex, style]}>
        <ScrollView
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={runRefresh} tintColor={colors.petrol} colors={[colors.petrol]} />
          }
        >
          {children}
        </ScrollView>
        {chip ? <UpdatedChip /> : null}
      </View>
    );
  }

  return <IosPullToRefresh
    refreshing={refreshing}
    chip={chip}
    onRefresh={onRefresh}
    setRefreshing={setRefreshing}
    finish={finish}
    contentContainerStyle={contentContainerStyle}
    style={style}
  >{children}</IosPullToRefresh>;
}

// Split into its own component so the shared-value hooks aren't conditional on
// the platform branch above.
function IosPullToRefresh({
  refreshing,
  chip,
  onRefresh,
  setRefreshing,
  finish,
  children,
  contentContainerStyle,
  style,
}: {
  refreshing: boolean;
  chip: boolean;
  onRefresh: () => void | Promise<void>;
  setRefreshing: (v: boolean) => void;
  finish: () => void;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: ViewStyle;
}) {
  const scrollY = useSharedValue(0);
  const spin = useSharedValue(0);
  const active = useSharedValue(false); // mirrors `refreshing` on the UI thread
  const crossed = useSharedValue(false);

  const begin = useCallback(() => {
    active.value = true;
    setRefreshing(true);
    // free spin: 360° / 500ms = 720°/s, linear, until the refresh resolves
    spin.value = withRepeat(withTiming(spin.value + 360, { duration: 500, easing: Easing.linear }), -1, false);
    Promise.all([
      Promise.resolve(onRefresh()),
      new Promise((r) => setTimeout(r, MIN_SPIN_MS)),
    ]).finally(() => {
      cancelAnimation(spin);
      active.value = false;
      crossed.value = false;
      finish();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRefresh, finish]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
      if (!active.value) {
        const pulled = Math.max(0, -scrollY.value);
        if (pulled >= PULL_THRESHOLD && !crossed.value) {
          crossed.value = true;
          runOnJS(haptic.light)();
        } else if (pulled < PULL_THRESHOLD && crossed.value) {
          crossed.value = false;
        }
      }
    },
    onEndDrag: () => {
      if (!active.value && -scrollY.value >= PULL_THRESHOLD) {
        runOnJS(begin)();
      }
    },
  });

  const ballStyle = useAnimatedStyle(() => {
    const pulled = Math.max(0, -scrollY.value);
    const deg = active.value ? spin.value : pulled * 2.2;
    const opacity = active.value ? 1 : Math.min(1, pulled / PULL_THRESHOLD);
    const scale = active.value ? 1 : Math.min(1, 0.6 + (pulled / PULL_THRESHOLD) * 0.4);
    return { opacity, transform: [{ rotate: `${deg}deg` }, { scale }] };
  });

  return (
    <View style={[styles.flex, style]}>
      <View style={styles.ballWrap} pointerEvents="none">
        <Animated.View style={ballStyle}>
          <Ball />
        </Animated.View>
      </View>
      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentInset={{ top: refreshing ? REFRESH_INSET : 0 }}
        contentOffset={refreshing ? { x: 0, y: -REFRESH_INSET } : { x: 0, y: 0 }}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </AnimatedScrollView>
      {chip ? <UpdatedChip /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  ballWrap: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    height: REFRESH_INSET,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  chip: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: colors.petrol,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 7,
    zIndex: 3,
  },
  chipTxt: { fontFamily: fonts.bold, fontSize: 12.5, color: '#fff' },
});
