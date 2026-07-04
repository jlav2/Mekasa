import { View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Screen, Txt, Button, ProBadge, SandRing, Icon } from '../src/components';
import { colors, fonts, petrolGradient, shadows } from '../src/theme';

type Benefit = { title: string; sub: string };

const BENEFITS: Benefit[] = [
  { title: 'התראות חכמות בחופים שלך', sub: '"נפתח מעגל בפרישמן" — לפני כולם' },
  { title: 'פתיחת מעגלים ללא הגבלה', sub: 'כולל מעגלים קבועים שחוזרים כל שבוע' },
  { title: 'סינון מתקדם לפי רמה ושחקנים', sub: 'שחק רק עם מי שברמה שלך' },
  { title: 'עדיפות בטורנירים + תג Pro', sub: 'מקום שמור לפני שנגמר' },
];

function BenefitRow({ title, sub }: Benefit) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.checkCircle}>
        <Icon name="check" size={14} color={colors.live} strokeWidth={2.6} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt style={styles.benefitTitle}>{title}</Txt>
        <Txt style={styles.benefitSub}>{sub}</Txt>
      </View>
    </View>
  );
}

export default function Paywall() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <LinearGradient colors={petrolGradient as any} style={{ flex: 1 }}>
      {/* decorative faint sand rings */}
      <SandRing
        size={330}
        color={colors.sandGlow}
        strokeWidth={1.6}
        variant={1}
        rotate={0}
        style={[styles.ringTop, { opacity: 0.12 }]}
      />
      <SandRing
        size={200}
        color={colors.live}
        strokeWidth={2}
        variant={3}
        rotate={0}
        style={[styles.ringBottom, { opacity: 0.1 }]}
      />

      <Screen bg="transparent" edges={{ top: false, bottom: false }} contentStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Icon name="close" size={14} color="#fff" strokeWidth={2.2} />
          </Pressable>

          <View style={{ marginTop: 18 }}>
            <ProBadge size={13} />
            <Txt style={styles.headline}>אף מעגל{'\n'}לא בורח לך</Txt>
            <Txt style={styles.subcopy}>לשחקנים הקבועים — הכלים שהופכים כל ערב על החוף למשחק.</Txt>
          </View>

          <View style={{ marginTop: 26, gap: 14 }}>
            {BENEFITS.map((b) => (
              <BenefitRow key={b.title} {...b} />
            ))}
          </View>

          <View style={{ marginTop: 'auto', paddingTop: 24 }}>
            <View style={styles.priceRow}>
              <View style={styles.priceCard}>
                <Txt style={styles.priceLabel}>חודשי</Txt>
                <Txt style={styles.priceValue}>
                  ₪19.90<Txt style={styles.pricePer}> / חודש</Txt>
                </Txt>
              </View>
              <View style={[styles.priceCard, styles.priceCardSelected]}>
                <View style={styles.discountBadge}>
                  <Txt style={styles.discountTxt}>37% הנחה</Txt>
                </View>
                <Txt style={styles.priceLabel}>שנתי</Txt>
                <Txt style={styles.priceValue}>
                  ₪149<Txt style={styles.pricePer}> / שנה</Txt>
                </Txt>
              </View>
            </View>

            <Button label="התחל 14 יום חינם" size="lg" style={{ marginTop: 14 }} onPress={() => router.back()} />
            <Txt style={styles.footer}>ביטול בכל רגע · שחזור רכישות</Txt>
          </View>
        </View>
      </Screen>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  ringTop: { position: 'absolute', left: -110, top: -70 },
  ringBottom: { position: 'absolute', right: -60, bottom: 120 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,.12)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  headline: {
    fontFamily: fonts.displayBold,
    fontSize: 64,
    lineHeight: 60,
    color: '#fff',
    marginTop: 14,
  },
  subcopy: {
    fontSize: 14.5,
    color: 'rgba(255,255,255,.7)',
    marginTop: 10,
    lineHeight: 22,
    maxWidth: '86%',
  },
  benefitRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  checkCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(20,184,168,.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  benefitTitle: { fontSize: 15, fontFamily: fonts.bold, color: '#fff' },
  benefitSub: { fontSize: 12.5, color: 'rgba(255,255,255,.6)', marginTop: 2 },
  priceRow: { flexDirection: 'row-reverse', gap: 10 },
  priceCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,.18)',
    borderRadius: 20,
    padding: 14,
  },
  priceCardSelected: {
    backgroundColor: 'rgba(255,255,255,.14)',
    borderWidth: 2,
    borderColor: colors.sunset,
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: -11,
    right: 14,
    backgroundColor: colors.sunset,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  discountTxt: { fontSize: 10, fontFamily: fonts.extrabold, color: '#fff' },
  priceLabel: { fontSize: 12.5, fontFamily: fonts.bold, color: 'rgba(255,255,255,.65)' },
  priceValue: { fontSize: 20, fontFamily: fonts.extrabold, color: '#fff', marginTop: 2 },
  pricePer: { fontSize: 12, fontFamily: fonts.semibold, color: 'rgba(255,255,255,.55)' },
  footer: { textAlign: 'center', fontSize: 11.5, color: 'rgba(255,255,255,.5)', marginTop: 12 },
});
