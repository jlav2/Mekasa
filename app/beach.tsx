import { View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Screen, Txt, Icon, SandRing } from '../src/components';
import { colors, fonts, shadows, beachHeroGradient } from '../src/theme';

function RingDecor({ size, color, opacity, style, dash }: { size: number; color: string; opacity: number; style: any; dash: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" style={[{ position: 'absolute', opacity }, style]}>
      <Circle cx={32} cy={32} r={26} fill="none" stroke={color} strokeWidth={2} strokeDasharray={dash} strokeLinecap="round" />
    </Svg>
  );
}

function LiveCircleRow({
  count,
  color,
  rotate,
  title,
  meta,
  actionLabel,
  actionFilled,
  pulse,
  border = true,
}: {
  count: string;
  color: string;
  rotate: number;
  title: string;
  meta: string;
  actionLabel: string;
  actionFilled: boolean;
  pulse?: boolean;
  border?: boolean;
}) {
  return (
    <View style={[styles.liveRow, border && styles.rowBorder]}>
      <View style={styles.ringWrap}>
        {pulse && <View style={styles.pulseHalo} />}
        <SandRing size={44} color={color} strokeWidth={4} rotate={rotate} variant={2}>
          <View style={[styles.ringCenter, { backgroundColor: color }]}>
            <Txt style={styles.ringCenterTxt}>{count}</Txt>
          </View>
        </SandRing>
      </View>
      <View style={{ flex: 1 }}>
        <Txt style={styles.liveTitle}>{title}</Txt>
        <Txt style={styles.liveMeta}>{meta}</Txt>
      </View>
      <Pressable
        style={[
          styles.liveAction,
          actionFilled ? { backgroundColor: colors.sunset } : styles.liveActionOutline,
        ]}
      >
        <Txt style={[styles.liveActionTxt, { color: actionFilled ? '#fff' : colors.petrol }]}>{actionLabel}</Txt>
      </Pressable>
    </View>
  );
}

function RegularRow({ label, count, border = true }: { label: string; count: string; border?: boolean }) {
  return (
    <View style={[styles.regularRow, border && styles.rowBorder]}>
      <Icon name="repeat" size={17} color={colors.petrol} strokeWidth={2} />
      <Txt style={styles.regularLabel}>{label}</Txt>
      <Txt style={styles.regularCount}>{count}</Txt>
    </View>
  );
}

export default function Beach() {
  const router = useRouter();

  return (
    <Screen scroll padded={false} bg={colors.sandBg} edges={{ top: false, bottom: false }}>
      {/* hero */}
      <LinearGradient
        colors={beachHeroGradient as unknown as [string, string, string]}
        locations={[0, 0.7, 1]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={styles.hero}
      >
        <RingDecor size={230} color="#fff" opacity={0.13} dash="48 8 40 10 42 7" style={{ left: -64, top: -46 }} />
        <View style={styles.heroTopRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="chevronRight" size={17} color="#fff" strokeWidth={2.4} />
          </Pressable>
          <View style={styles.followPill}>
            <Icon name="bell" size={15} color={colors.sandGlow} strokeWidth={2} />
            <Txt style={styles.followTxt}>עוקב</Txt>
          </View>
        </View>

        <Txt style={styles.heroTitle}>חוף פרישמן</Txt>
        <Txt style={styles.heroMeta}>תל אביב · 3 מגרשי רשת · תאורה עד 22:00</Txt>

        <View style={styles.statsRow}>
          <View>
            <Txt style={[styles.statNum, { color: colors.liveBright }]}>2</Txt>
            <Txt style={styles.statLabel}>מעגלים חיים</Txt>
          </View>
          <View>
            <Txt style={[styles.statNum, { color: colors.sandGlow }]}>3</Txt>
            <Txt style={styles.statLabel}>קבועים שבועיים</Txt>
          </View>
          <View>
            <Txt style={[styles.statNum, { color: '#fff' }]}>84</Txt>
            <Txt style={styles.statLabel}>שחקנים בחוף הזה</Txt>
          </View>
        </View>
      </LinearGradient>

      {/* body */}
      <View style={styles.body}>
        {/* tournament banner */}
        <Pressable onPress={() => router.push('/tournament')} style={styles.tourneyBanner}>
          <RingDecor size={100} color={colors.sandGlow} opacity={0.15} dash="48 8 40 10" style={{ left: -26, top: -16 }} />
          <View style={styles.tourneyIconWrap}>
            <Icon name="flag" size={16} color={colors.sandGlow} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt style={styles.tourneyTitle}>טורניר פוצ&apos;יוולי — שבת 9:00</Txt>
            <Txt style={styles.tourneySub}>נשארו 2 מקומות מתוך 8 קבוצות</Txt>
          </View>
          <View style={styles.tourneyCta}>
            <Txt style={styles.tourneyCtaTxt}>הרשמה</Txt>
          </View>
        </Pressable>

        <Txt style={styles.sectionLabel}>עכשיו על החול</Txt>
        <View style={styles.listCard}>
          <LiveCircleRow
            count="3/4"
            color={colors.sunset}
            rotate={40}
            title="פוצ'יוולי · מגרש 2"
            meta="חסר שחקן · בינוניים · התחיל 17:40"
            actionLabel="הצטרף"
            actionFilled
            pulse
          />
          <LiveCircleRow
            count="5/5"
            color={colors.live}
            rotate={-30}
            title="אלטינה · ליד המים"
            meta="משחק חי · פתוח לכולם"
            actionLabel="צפה"
            actionFilled={false}
            border={false}
          />
        </View>

        <Txt style={styles.sectionLabel}>הקבועים של החוף</Txt>
        <View style={styles.listCard}>
          <RegularRow label="שלישי 18:30 · פוצ'יוולי" count="5 קבועים" />
          <RegularRow label="שישי 8:00 · אלטינה" count="7 קבועים" />
          <RegularRow label="שבת 17:00 · כדורעף חופים" count="6 קבועים" border={false} />
        </View>
      </View>

      {/* bottom CTA */}
      <View style={styles.ctaWrap}>
        <Pressable style={styles.cta} onPress={() => router.push('/create-circle')}>
          <Icon name="plus" size={16} color="#fff" strokeWidth={2.4} />
          <Txt style={styles.ctaTxt}>פתח מעגל בחוף הזה</Txt>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 64,
    paddingHorizontal: 22,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,.14)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followTxt: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.sandGlow },
  heroTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 64,
    lineHeight: 61,
    color: '#fff',
    marginTop: 14,
  },
  heroMeta: { fontFamily: fonts.medium, fontSize: 13, color: 'rgba(255,255,255,.72)', marginTop: 6 },
  statsRow: { flexDirection: 'row-reverse', gap: 18, marginTop: 14 },
  statNum: { fontFamily: fonts.displayBold, fontSize: 32, lineHeight: 32 },
  statLabel: { fontFamily: fonts.semibold, fontSize: 11, color: 'rgba(255,255,255,.6)' },

  body: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },

  tourneyBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.petrol,
    borderRadius: 18,
    padding: 12,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  tourneyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourneyTitle: { fontFamily: fonts.extrabold, fontSize: 13.5, color: '#fff' },
  tourneySub: { fontFamily: fonts.medium, fontSize: 11.5, color: 'rgba(255,255,255,.65)', marginTop: 1 },
  tourneyCta: { backgroundColor: colors.sunset, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 7 },
  tourneyCtaTxt: { fontFamily: fonts.extrabold, fontSize: 12, color: '#fff' },

  sectionLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    color: colors.faint,
    letterSpacing: 0.5,
    paddingRight: 6,
    marginTop: 2,
  },
  listCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.hairline },

  liveRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 12 },
  ringWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pulseHalo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,107,44,.35)',
  },
  ringCenter: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  ringCenterTxt: { fontFamily: fonts.extrabold, fontSize: 10.5, color: '#fff' },
  liveTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  liveMeta: { fontFamily: fonts.medium, fontSize: 12, color: colors.faint, marginTop: 1 },
  liveAction: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveActionOutline: { borderWidth: 1.5, borderColor: colors.outline },
  liveActionTxt: { fontFamily: fonts.bold, fontSize: 13 },

  regularRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 11 },
  regularLabel: { flex: 1, fontFamily: fonts.bold, fontSize: 13.5, color: colors.ink },
  regularCount: { fontFamily: fonts.medium, fontSize: 12, color: colors.faint },

  ctaWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 44 },
  cta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.sunset,
    ...shadows.cta,
  },
  ctaTxt: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
});
