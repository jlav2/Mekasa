import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Txt } from './Txt';
import { Icon } from './icons';
import { Card } from './ui';
import { Button } from './Button';
import { colors, fonts } from '../theme';
import { useStore } from '../store';

const MESSAGE_DISMISS_MS = 4000;
const JOIN_RACE_DISMISS_MS = 8000;

// One-line auto-dismissing toast for simple failures, plus a richer
// two-action "spot taken" card (9f) for a join that lost a capacity race —
// wherever it originated (map, notifications, circle detail all call the
// same joinCircle action, so this is the single place that renders it).
export function Toast() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useStore((s) => s.toast);
  const clearToast = useStore((s) => s.clearToast);
  const circleById = useStore((s) => s.circleById);
  const joinWaitlist = useStore((s) => s.joinWaitlist);

  useEffect(() => {
    if (!toast) return;
    const ms = toast.kind === 'joinRace' ? JOIN_RACE_DISMISS_MS : MESSAGE_DISMISS_MS;
    const t = setTimeout(clearToast, ms);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  if (toast.kind === 'joinRace') {
    const circle = circleById(toast.circleId);
    return (
      <Animated.View
        entering={FadeInDown.springify().damping(16)}
        exiting={FadeOutDown}
        style={[styles.cardWrap, { bottom: insets.bottom + 90 }]}
      >
        <Card floating radius={22} pad={16} style={styles.raceCard}>
          <View style={styles.raceRow}>
            <View style={styles.raceIconWrap}>
              <Icon name="alertCircle" size={18} color={colors.danger} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt style={styles.raceTitle}>אוף — מישהו תפס את המקום לפניך</Txt>
              <Txt style={styles.raceBody}>
                {circle ? `${circle.sportLabel} · ${circle.beachName} ` : 'המעגל '}
                התמלא לפני שנייה. הצטרף לרשימת ההמתנה — אם מתפנה מקום, ההתראה אצלך.
              </Txt>
            </View>
          </View>
          <View style={styles.raceActions}>
            <Button
              label="לרשימת ההמתנה"
              variant="live"
              size="sm"
              style={{ flex: 1, height: 44, borderRadius: 22 }}
              onPress={() => {
                joinWaitlist(toast.circleId);
                clearToast();
              }}
            />
            <Button
              label="מעגלים אחרים"
              variant="secondary"
              size="sm"
              style={{ height: 44, borderRadius: 22 }}
              onPress={() => {
                clearToast();
                router.push('/map');
              }}
            />
          </View>
        </Card>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(16)}
      exiting={FadeOutDown}
      style={[styles.wrap, { bottom: insets.bottom + 90 }]}
      pointerEvents="none"
    >
      <Txt style={styles.txt}>{toast.message}</Txt>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    alignItems: 'center',
    zIndex: 60,
  },
  txt: {
    backgroundColor: colors.ink,
    color: '#fff',
    fontSize: 13,
    fontFamily: fonts.semibold,
    textAlign: 'center',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  cardWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 60,
  },
  raceCard: { borderWidth: 1.5, borderColor: 'rgba(192,57,43,.4)' },
  raceRow: { flexDirection: 'row-reverse', gap: 10, alignItems: 'flex-start' },
  raceIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(192,57,43,.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  raceTitle: { fontFamily: fonts.extrabold, fontSize: 13.5, color: colors.ink },
  raceBody: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 4, lineHeight: 18 },
  raceActions: { flexDirection: 'row-reverse', gap: 8, marginTop: 12 },
});
