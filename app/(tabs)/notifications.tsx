import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { Txt, Icon, SectionLabel, DecorRing, RingBadge } from '../../src/components';
import { colors, fonts } from '../../src/theme';
import { useStore } from '../../src/store';

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const notifications = useStore((s) => s.notifications);
  const markAllRead = useStore((s) => s.markAllRead);
  const joinCircle = useStore((s) => s.joinCircle);
  const unread = (id: string) => notifications.find((n) => n.id === id)?.unread;

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandBg }}>
      <View style={{ paddingTop: insets.top + 18, paddingHorizontal: 22 }}>
        <View style={styles.titleRow}>
          <Txt style={styles.title}>התראות</Txt>
          <Pressable onPress={markAllRead} accessibilityRole="button">
            <Txt style={styles.markRead}>סמן הכול כנקרא</Txt>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120, gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionLabel>עכשיו</SectionLabel>

        {/* hot: circle opened */}
        <View style={styles.hotCard}>
          <View style={styles.hotLiveDot} />
          <View style={styles.rowTop}>
            <RingBadge size={48} color={colors.sunset} variant={1} rotate={40}>
              <Txt style={{ fontFamily: fonts.extrabold, fontSize: 11, color: '#fff' }}>3/4</Txt>
            </RingBadge>
            <View style={{ flex: 1 }}>
              <Txt style={styles.hotTitle}>נפתח מעגל בחוף פרישמן — חסר שחקן!</Txt>
              <Txt style={styles.hotMeta}>פוצ'יוולי · בינוניים · 300 מ' ממך · לפני 2 דק'</Txt>
            </View>
          </View>
          <View style={styles.hotCtaRow}>
            <Pressable
              style={styles.ctaPrimary}
              onPress={() => {
                joinCircle('frishman'); // one-tap join, straight from the notification
                router.push('/chat');
              }}
            >
              <Txt style={styles.ctaPrimaryText}>אני בפנים</Txt>
            </Pressable>
            <Pressable style={styles.ctaSecondary} onPress={() => router.push('/map')}>
              <Txt style={styles.ctaSecondaryText}>הצג במפה</Txt>
            </Pressable>
          </View>
        </View>

        {/* joined your circle */}
        <View style={styles.plainCard}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.live }]}>
            <Txt style={{ fontFamily: fonts.bold, fontSize: 17, color: '#fff' }}>ד</Txt>
          </View>
          <View style={{ flex: 1 }}>
            <Txt style={styles.rowTitle}>דניאל הצטרף למעגל שלך</Txt>
            <Txt style={styles.rowMeta}>אלטינה · חוף גורדון · לפני 18 דק'</Txt>
          </View>
          {unread('n2') && <View style={styles.unreadDot} />}
        </View>

        <SectionLabel style={{ marginTop: 6 }}>היום</SectionLabel>

        {/* tournament reminder */}
        <Pressable style={styles.plainCard} onPress={() => router.push('/tournament')}>
          <RingBadge size={48} color={colors.petrol} variant={2} rotate={-70}>
            <Svg width={14} height={14} viewBox="0 0 20 20">
              <Path d="M5 2v16M5 3h10l-3 3.5L15 10H5" fill="none" stroke={colors.sandGlow} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </RingBadge>
          <View style={{ flex: 1 }}>
            <Txt style={styles.rowTitle}>תזכורת: טורניר הילטון מחר ב־9:00</Txt>
            <Txt style={styles.rowMeta}>אתה רשום עם דניאל · 8 קבוצות</Txt>
          </View>
          <Icon name="chevronLeft" size={14} color="#B9C4C9" strokeWidth={2} />
        </Pressable>

        {/* closed-game summary */}
        <View style={[styles.plainCard, { opacity: 0.75 }]}>
          <View style={styles.summaryIconWrap}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Circle cx="12" cy="12" r="8" fill="none" stroke={colors.muted} strokeWidth={2} strokeDasharray="18 4 14 4" strokeLinecap="round" />
              <Circle cx="12" cy="12" r="2.6" fill={colors.muted} />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Txt style={styles.rowTitle}>המעגל של אתמול נסגר — 2.5 שעות משחק</Txt>
            <Txt style={styles.rowMeta}>חוף פרישמן · שיחקת עם 5 שחקנים</Txt>
          </View>
        </View>

        {/* pro upsell */}
        <View style={styles.proCard}>
          <DecorRing size={110} color={colors.sandGlow} opacity={0.15} strokeWidth={2.5} style={{ left: -30, top: -20 }} />
          <View style={{ flex: 1 }}>
            <Txt style={styles.proTitle}>רוצה לדעת ראשון על כל מעגל בפרישמן?</Txt>
            <Txt style={styles.proSub}>התראות חכמות לחופים שלך — עם Pro</Txt>
          </View>
          <Pressable style={styles.proCta} onPress={() => router.push('/paywall')}>
            <Txt style={styles.proCtaText}>נסה חינם</Txt>
          </Pressable>
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row-reverse', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontFamily: fonts.displayBold, fontSize: 56, lineHeight: 56, color: colors.petrol },
  markRead: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.petrol,
    textDecorationLine: 'underline',
  },


  hotCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,44,.5)',
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 16,
    position: 'relative',
    shadowColor: colors.sunset,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  hotLiveDot: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.sunset,
  },
  rowTop: { flexDirection: 'row-reverse', gap: 12 },
  hotTitle: { fontFamily: fonts.extrabold, fontSize: 14.5, color: colors.ink },
  hotMeta: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 2 },
  hotCtaRow: { flexDirection: 'row-reverse', gap: 8, marginTop: 12 },
  ctaPrimary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.sunset,
    shadowColor: colors.sunset,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  ctaPrimaryText: { fontFamily: fonts.bold, fontSize: 13.5, color: '#fff' },
  ctaSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(14,79,94,.22)',
  },
  ctaSecondaryText: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.petrol },

  plainCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(14,79,94,.09)',
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row-reverse',
    gap: 12,
    alignItems: 'center',
  },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  rowMeta: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 2 },
  unreadDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.live, flexShrink: 0 },

  summaryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(14,79,94,.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  proCard: {
    backgroundColor: colors.petrol,
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row-reverse',
    gap: 12,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  proTitle: { fontFamily: fonts.extrabold, fontSize: 13.5, color: '#fff' },
  proSub: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 2 },
  proCta: {
    backgroundColor: colors.sunset,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  proCtaText: { fontFamily: fonts.extrabold, fontSize: 12, color: '#fff' },
});
