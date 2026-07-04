import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Screen, Txt, Icon, AvatarStack } from '../src/components';
import { colors, fonts, shadows } from '../src/theme';

function RingDecor({ size, color, opacity, style, dash }: { size: number; color: string; opacity: number; style: any; dash: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" style={[{ position: 'absolute', opacity }, style]}>
      <Circle cx={32} cy={32} r={26} fill="none" stroke={color} strokeWidth={2} strokeDasharray={dash} strokeLinecap="round" />
    </Svg>
  );
}

function DetailRow({ icon, text, border = true }: { icon: React.ReactNode; text: string; border?: boolean }) {
  return (
    <View style={[styles.detailRow, border && styles.rowBorder]}>
      {icon}
      <Txt style={styles.detailTxt}>{text}</Txt>
    </View>
  );
}

export default function Tournament() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const totalSpots = 8;
  const filled = 6;

  return (
    <Screen padded={false} bg={colors.sandBg} edges={{ top: false, bottom: false }}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      {/* hero */}
      <View style={[styles.hero, { paddingTop: insets.top + 20 }]}>
        <RingDecor size={250} color={colors.sandGlow} opacity={0.13} dash="60 9 50 8" style={{ left: -70, top: -50 }} />
        <View style={styles.heroTopRow}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Icon name="chevronRight" size={17} color="#fff" strokeWidth={2.4} />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Icon name="share" size={16} color="#fff" strokeWidth={1.7} />
          </Pressable>
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.tourneyBadge}>
            <Icon name="flag" size={12} color="#7A4A0E" strokeWidth={2} />
            <Txt style={styles.tourneyBadgeTxt}>טורניר</Txt>
          </View>
          <View style={styles.formatBadge}>
            <Txt style={styles.formatBadgeTxt}>פוצ&apos;יוולי · זוגות</Txt>
          </View>
        </View>

        <Txt style={styles.heroTitle}>גביע הילטון{'\n'}של הקיץ</Txt>
        <Txt style={styles.heroMeta}>שבת 11.7 · 9:00 · חוף הילטון · 8 קבוצות · שיטת נוקאאוט</Txt>
      </View>

      {/* body */}
      <View style={styles.body}>
        {/* registration meter */}
        <View style={styles.card}>
          <View style={styles.spotsHeader}>
            <Txt style={styles.spotsLabel}>קבוצות רשומות</Txt>
            <Txt style={styles.spotsValue}>6/8 — נשארו 2 מקומות</Txt>
          </View>
          <View style={styles.meterRow}>
            {Array.from({ length: totalSpots }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.meterSeg,
                  { backgroundColor: i < filled ? colors.live : 'rgba(14,79,94,.12)' },
                ]}
              />
            ))}
          </View>
          <View style={styles.avatarsRow}>
            <AvatarStack
              people={[
                { letter: 'ע', color: colors.petrol },
                { letter: 'ד', color: colors.live },
                { letter: 'נ', color: colors.amber },
                { letter: 'ר', color: colors.muted },
              ]}
              size={34}
              border={colors.card}
            />
            <View style={[styles.plusAvatar]}>
              <Txt style={styles.plusAvatarTxt}>+8</Txt>
            </View>
            <Txt style={styles.avatarsNote}>רמת בינוניים ומעלה</Txt>
          </View>
        </View>

        {/* details */}
        <View style={styles.card}>
          <DetailRow
            icon={
              <Svg width={17} height={17} viewBox="0 0 20 20">
                <Circle cx={10} cy={10} r={8} fill="none" stroke={colors.petrol} strokeWidth={1.8} />
              </Svg>
            }
            text="משחקים עד 15, יתרון 2 · חצי גמר וגמר עד 18"
          />
          <DetailRow icon={<Icon name="trophy" size={17} color={colors.petrol} strokeWidth={1.8} />} text="פרס: ציוד מקצועי + כניסה חינם לטורניר הבא" />
          <DetailRow
            icon={<Icon name="calendar" size={17} color={colors.petrol} strokeWidth={1.8} />}
            text="דמי הרשמה ₪40 לקבוצה · ביטול חינם עד יום לפני"
            border={false}
          />
        </View>

        {/* partner picker */}
        <Pressable style={styles.partnerCard}>
          <View style={styles.partnerPlus}>
            <Txt style={styles.partnerPlusTxt}>+</Txt>
          </View>
          <View style={{ flex: 1 }}>
            <Txt style={styles.partnerTitle}>מי הפרטנר שלך?</Txt>
            <Txt style={styles.partnerSub}>בחר מהשותפים הקבועים או הזמן בוואטסאפ</Txt>
          </View>
          <Txt style={styles.partnerPick}>בחר</Txt>
        </Pressable>
      </View>
      </ScrollView>

      {/* sticky footer CTA */}
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.cta} onPress={() => router.push('/bracket')}>
          <Txt style={styles.ctaTxt}>הירשם עם דניאל — ₪40</Txt>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.petrol,
    paddingHorizontal: 22,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 14 },
  tourneyBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.sandGlow,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tourneyBadgeTxt: { fontFamily: fonts.extrabold, fontSize: 12, color: '#7A4A0E' },
  formatBadge: {
    backgroundColor: 'rgba(255,255,255,.14)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  formatBadgeTxt: { fontFamily: fonts.bold, fontSize: 12, color: colors.sandGlow },
  heroTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 54,
    lineHeight: 51,
    color: '#fff',
    marginTop: 10,
  },
  heroMeta: { fontFamily: fonts.medium, fontSize: 13.5, color: 'rgba(255,255,255,.72)', marginTop: 8 },

  body: { paddingHorizontal: 16, paddingTop: 16, gap: 10, paddingBottom: 16 },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 16,
  },
  spotsHeader: { flexDirection: 'row-reverse', alignItems: 'baseline', justifyContent: 'space-between' },
  spotsLabel: { fontFamily: fonts.extrabold, fontSize: 14, color: colors.ink },
  spotsValue: { fontFamily: fonts.extrabold, fontSize: 13, color: colors.sunset },
  meterRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  meterSeg: { flex: 1, height: 8, borderRadius: 4 },
  avatarsRow: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 12 },
  plusAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(14,79,94,.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
    marginRight: -8,
  },
  plusAvatarTxt: { fontFamily: fonts.extrabold, fontSize: 11, color: colors.petrol },
  avatarsNote: { fontFamily: fonts.medium, fontSize: 12, color: colors.faint, marginRight: 12 },

  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  detailRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 12 },
  detailTxt: { flex: 1, fontFamily: fonts.semibold, fontSize: 13.5, color: colors.ink },

  partnerCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,107,44,.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,44,.45)',
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 16,
  },
  partnerPlus: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.sunset,
    borderStyle: 'dashed',
    backgroundColor: '#FFF3EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerPlusTxt: { fontFamily: fonts.bold, fontSize: 20, color: colors.sunset },
  partnerTitle: { fontFamily: fonts.extrabold, fontSize: 14, color: colors.ink },
  partnerSub: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted, marginTop: 1 },
  partnerPick: { fontFamily: fonts.bold, fontSize: 13, color: colors.sunset },

  ctaWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.sandBg,
  },
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.sunset,
    ...shadows.cta,
  },
  ctaTxt: { fontFamily: fonts.extrabold, fontSize: 16.5, color: '#fff' },
});
