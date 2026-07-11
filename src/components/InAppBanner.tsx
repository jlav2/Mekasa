// src/components/InAppBanner.tsx
// Foreground event banner — the in-app sibling of the push notifications.
// Spec: design_handoff_mekasa_banners/README.md + canvas #11a–#11d.
// Rendered ONCE in app/_layout.tsx (global, above the Stack). Toast stays in
// the tabs layer (bottom); banner is top — they never conflict.

import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Txt } from './Txt';
import { Button } from './Button';
import { ClaimCountdownRing } from './ClaimCountdownRing';
import { colors, fonts } from '../theme';
import { DUR, EASE, SPRING, haptic } from '../theme/motion';
import { useStore } from '../store';
import { BANNER_DURATION, type Banner, type BannerKind } from '../store/slices/bannerSlice';

const HIDDEN_Y = -160;
const DISMISS_DY = -40;
const DISMISS_VY = -500;

const ENTRY_HAPTIC: Record<BannerKind, () => void> = {
  claim: haptic.warning,
  hostRequest: haptic.medium,
  claimExpired: haptic.error,
  newCircle: haptic.light,
  chat: haptic.light,
  startingSoon: haptic.light,
  tournament: haptic.light,
};

// Real app routes (circle detail is /c/[id]; the /circle-detail alias just
// redirects to a fixed circle, so it must NOT be used here).
function routeFor(b: Banner): string {
  if (b.route) return b.route;
  switch (b.kind) {
    case 'claim':
      return `/circle-waitlist?id=${b.circleId ?? ''}`;
    case 'chat':
      return `/chat?circle=${b.circleId ?? ''}`;
    case 'hostRequest':
      return '/host-tools';
    case 'tournament':
      return '/tournament';
    default:
      return `/c/${b.circleId ?? ''}`;
  }
}

export function InAppBanner() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const reduced = useReducedMotion();
  const banner = useStore((s) => s.banner);
  const dismissBanner = useStore((s) => s.dismissBanner);
  const joinCircle = useStore((s) => s.joinCircle);

  const [screenReader, setScreenReader] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReader);
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReader);
    return () => sub.remove();
  }, []);

  const y = useSharedValue(HIDDEN_Y);
  const alpha = useSharedValue(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownId = useRef<string | null>(null);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };
  const armTimer = (b: Banner) => {
    clearTimer();
    const ms = BANNER_DURATION[b.kind];
    if (ms == null || screenReader) return; // persistent, or screen reader: explicit dismiss only
    timer.current = setTimeout(exit, ms);
  };

  const exit = () => {
    clearTimer();
    if (reduced) {
      alpha.value = withTiming(0, { duration: DUR.quick }, (done) => {
        if (done) runOnJS(dismissBanner)();
      });
    } else {
      y.value = withTiming(HIDDEN_Y, { duration: DUR.standard, easing: EASE.exit }, (done) => {
        if (done) runOnJS(dismissBanner)();
      });
    }
  };

  // Enter on new banner id (a replacing banner re-runs this with the new content).
  useEffect(() => {
    if (!banner) {
      shownId.current = null;
      return;
    }
    if (shownId.current === banner.id) return;
    shownId.current = banner.id;
    alpha.value = 1;
    if (reduced) {
      y.value = 0;
      alpha.value = 0;
      alpha.value = withTiming(1, { duration: DUR.quick });
    } else {
      y.value = HIDDEN_Y;
      y.value = withSpring(0, SPRING.sheet);
    }
    ENTRY_HAPTIC[banner.kind]();
    AccessibilityInfo.announceForAccessibility(`${banner.title}. ${banner.body}`);
    armTimer(banner);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banner?.id, screenReader]);

  // Swipe up to dismiss; timer pauses while touching.
  const pan = Gesture.Pan()
    .onBegin(() => {
      runOnJS(clearTimer)();
    })
    .onUpdate((e) => {
      y.value = e.translationY < 0 ? e.translationY : e.translationY / 6; // 1:1 up, rubber-band down
    })
    .onEnd((e) => {
      if (e.translationY < DISMISS_DY || e.velocityY < DISMISS_VY) {
        runOnJS(exit)();
      } else {
        y.value = withSpring(0, SPRING.sheet);
        if (banner) runOnJS(armTimer)(banner);
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: alpha.value,
  }));

  if (!banner) return null;
  const isAndroid = Platform.OS === 'android';
  const title =
    banner.kind === 'chat' && banner.coalesced > 0
      ? `${banner.senderName} +${banner.coalesced} הודעות`
      : banner.title;

  const onTap = () => {
    exit();
    router.push(routeFor(banner) as any);
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.wrap, { top: insets.top + 8, borderRadius: isAndroid ? 28 : 22 }, style]}
        accessibilityLiveRegion={banner.kind === 'claim' || banner.kind === 'hostRequest' ? 'assertive' : 'polite'}
      >
        <Pressable onPress={onTap} accessibilityRole="button" accessibilityLabel={`${title}. ${banner.body}`}>
          <View style={styles.row}>
            {/* leading */}
            {banner.kind === 'claim' && banner.expiresAt ? (
              <ClaimCountdownRing expiresAt={banner.expiresAt} size={44} onExpire={exit} />
            ) : banner.senderName ? (
              <View style={[styles.avatar, { backgroundColor: banner.senderColor ?? colors.petrolLight }]}>
                <Txt style={styles.avatarTxt}>{banner.senderName[0]}</Txt>
              </View>
            ) : (
              <View style={styles.glyph}>
                <Txt style={styles.glyphTxt}>◌</Txt>
              </View>
            )}
            {/* text */}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Txt numberOfLines={1} style={styles.title}>
                {title}
              </Txt>
              <Txt numberOfLines={1} style={styles.body}>
                {banner.body}
              </Txt>
            </View>
            {/* trailing */}
            {banner.kind === 'claim' ? (
              <Button
                label="תפוס"
                variant="primary"
                size="sm"
                full={false}
                style={{ height: 44, borderRadius: 22 }}
                onPress={onTap}
              />
            ) : (
              <Txt style={styles.time}>עכשיו</Txt>
            )}
          </View>
          {/* host inline actions — no join-request API exists yet, so both route
              to the manage screen (approve) / dismiss (decline) rather than
              calling a fake action. */}
          {banner.kind === 'hostRequest' && (
            <View style={styles.actions}>
              <Button
                label="אשר"
                variant="live"
                size="sm"
                full={false}
                style={{ flex: 1, height: 44, borderRadius: 22 }}
                onPress={() => {
                  exit();
                  router.push('/host-tools');
                }}
              />
              <Button
                label="דחה"
                variant="secondary"
                size="sm"
                full={false}
                style={{ height: 44, borderRadius: 22, paddingHorizontal: 22 }}
                onPress={() => exit()}
              />
            </View>
          )}
          {/* Android M3 text actions for newCircle */}
          {isAndroid && banner.kind === 'newCircle' && (
            <View style={styles.textActions}>
              <Pressable
                style={styles.textBtn}
                onPress={() => {
                  if (banner.circleId) joinCircle(banner.circleId);
                  exit();
                }}
              >
                <Txt style={styles.textBtnPrimary}>הצטרף</Txt>
              </Pressable>
              <Pressable style={styles.textBtn} onPress={onTap}>
                <Txt style={styles.textBtnMuted}>צפה</Txt>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 10,
    right: 10,
    zIndex: 100,
    backgroundColor: 'rgba(255,253,246,0.97)',
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: 12,
    paddingHorizontal: 14,
    ...Platform.select({
      ios: { shadowColor: '#12303A', shadowOffset: { width: 0, height: 10 }, shadowRadius: 24, shadowOpacity: 0.28 },
      android: { elevation: 8 },
    }),
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: colors.white, fontFamily: fonts.bold, fontSize: 15 },
  glyph: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' },
  glyphTxt: { color: colors.petrol, fontSize: 18 },
  title: { fontFamily: fonts.extrabold, fontSize: 13.5, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 1 },
  time: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, alignSelf: 'flex-start', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 11 },
  textActions: { flexDirection: 'row', gap: 4, marginTop: 8 },
  textBtn: { height: 40, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  textBtnPrimary: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.sunsetDeep },
  textBtnMuted: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.muted },
});
