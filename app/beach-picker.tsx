import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle as SvgCircle, Path as SvgPath } from 'react-native-svg';
import { Screen, Txt, Icon } from '../src/components';
import { colors, fonts, shadows } from '../src/theme';

type Court = { label: string; sub: string; state: 'taken' | 'selected' | 'note' };
const COURTS: Court[] = [
  { label: 'מגרש 1', sub: 'תפוס עכשיו', state: 'taken' },
  { label: 'מגרש 2', sub: 'פנוי ✓', state: 'selected' },
  { label: 'ליד המים', sub: 'לאלטינה', state: 'note' },
];

type Beach = { name: string; meta: string; live?: boolean };
const OTHER_BEACHES: Beach[] = [
  { name: 'חוף גורדון', meta: "650 מ' · 2 מגרשים · מעגל חי אחד", live: true },
  { name: 'חוף הילטון', meta: '1.2 ק"מ · מגרש אחד · טורניר בשבת' },
  { name: 'מצודת הים', meta: '1.8 ק"מ · 4 מגרשים' },
  { name: 'חוף בוגרשוב', meta: '1.9 ק"מ · חול בלבד — מתאים לאלטינה' },
];

export default function BeachPicker() {
  const router = useRouter();
  const [courtIdx, setCourtIdx] = useState(1);

  return (
    <Screen padded={false} bg={colors.sandBg} edges={{ top: false, bottom: false }}>
      <View style={styles.topArea}>
        <View style={styles.titleRow}>
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Icon name="close" size={12} color={colors.muted} strokeWidth={2} />
          </Pressable>
          <Txt style={styles.title}>איפה משחקים?</Txt>
        </View>
        <View style={styles.searchBar}>
          <Icon name="search" size={17} color={colors.faint} strokeWidth={1.8} />
          <Txt style={styles.searchPlaceholder}>חפש חוף — ת&quot;א, הרצליה, אשדוד…</Txt>
        </View>
      </View>

      <View style={styles.body}>
        <Txt style={styles.nearLabel}>הכי קרובים אליך</Txt>

        {/* selected beach */}
        <View style={styles.selectedCard}>
          <Svg
            width={140}
            height={140}
            viewBox="0 0 64 64"
            style={{ position: 'absolute', left: -40, top: -26, opacity: 0.14 }}
          >
            <SvgCircle
              cx={32}
              cy={32}
              r={26}
              fill="none"
              stroke="#fff"
              strokeWidth={2}
              strokeDasharray="48 8 40 10"
              strokeLinecap="round"
            />
          </Svg>
          <View style={styles.selectedTopRow}>
            <View style={{ flex: 1 }}>
              <Txt style={styles.selectedTitle}>חוף פרישמן</Txt>
              <Txt style={styles.selectedMeta}>300 מ&apos; · 3 מגרשים · תאורה עד 22:00</Txt>
            </View>
            <View style={styles.checkCircle}>
              <Svg width={13} height={10} viewBox="0 0 14 11">
                <SvgPath
                  d="M1.5 5.5l3.5 3.5 7.5-7.5"
                  fill="none"
                  stroke="#fff"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </View>
          <View style={styles.courtsRow}>
            {COURTS.map((c, i) => {
              const on = i === courtIdx;
              return (
                <Pressable
                  key={c.label}
                  onPress={() => setCourtIdx(i)}
                  style={[styles.courtTile, on ? styles.courtTileOn : styles.courtTileOff]}
                >
                  <Txt style={[styles.courtLabel, { color: on ? '#fff' : 'rgba(255,255,255,.75)' }]}>{c.label}</Txt>
                  <Txt style={[styles.courtSub, { color: on ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.5)' }]}>
                    {c.sub}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* other beaches */}
        <View style={styles.othersCard}>
          {OTHER_BEACHES.map((b, i) => (
            <View
              key={b.name}
              style={[styles.otherRow, i !== OTHER_BEACHES.length - 1 && styles.otherRowBorder]}
            >
              <View style={{ flex: 1 }}>
                <Txt style={styles.otherName}>{b.name}</Txt>
                <Txt style={styles.otherMeta}>{b.meta}</Txt>
              </View>
              {b.live && (
                <View style={styles.liveTag}>
                  <View style={styles.liveDot} />
                  <Txt style={styles.liveTagTxt}>פעיל עכשיו</Txt>
                </View>
              )}
            </View>
          ))}
        </View>

        <Pressable style={styles.addRow}>
          <Svg width={15} height={15} viewBox="0 0 20 20">
            <SvgPath
              d="M10 18s-6.5-5.3-6.5-10A6.5 6.5 0 0110 1.5 6.5 6.5 0 0116.5 8c0 4.7-6.5 10-6.5 10z"
              fill="none"
              stroke={colors.petrol}
              strokeWidth={1.7}
            />
            <SvgCircle cx={10} cy={8} r={2.2} fill={colors.petrol} />
          </Svg>
          <Txt style={styles.addRowTxt}>החוף שלך לא כאן? הוסף חוף חדש</Txt>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.cta} onPress={() => router.back()}>
          <Txt style={styles.ctaTxt}>בחר: פרישמן · מגרש 2</Txt>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topArea: { paddingTop: 64, paddingHorizontal: 22 },
  titleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(14,79,94,.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.displayBold, fontSize: 40, lineHeight: 40, color: colors.petrol },
  searchBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.hairlineStrong,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  searchPlaceholder: { flex: 1, fontSize: 14.5, color: colors.faint },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 14, gap: 10 },
  nearLabel: {
    fontSize: 12,
    fontFamily: fonts.extrabold,
    color: colors.faint,
    letterSpacing: 0.5,
    paddingHorizontal: 6,
  },
  selectedCard: {
    backgroundColor: colors.petrol,
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 16,
    overflow: 'hidden',
    ...shadows.petrolHero,
  },
  selectedTopRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  selectedTitle: { fontSize: 16, fontFamily: fonts.extrabold, color: '#fff' },
  selectedMeta: { fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 1 },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.live,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courtsRow: { flexDirection: 'row-reverse', gap: 8, marginTop: 12 },
  courtTile: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 14 },
  courtTileOn: { backgroundColor: colors.sunset, shadowColor: colors.sunset, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 4 },
  courtTileOff: { backgroundColor: 'rgba(255,255,255,.12)' },
  courtLabel: { fontSize: 12.5, fontFamily: fonts.extrabold },
  courtSub: { fontSize: 10.5, fontFamily: fonts.semibold, marginTop: 2 },
  othersCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  otherRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 13 },
  otherRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  otherName: { fontSize: 14.5, fontFamily: fonts.bold, color: colors.ink },
  otherMeta: { fontSize: 12, color: colors.faint, marginTop: 1 },
  liveTag: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, flexShrink: 0 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.live },
  liveTagTxt: { fontSize: 11.5, fontFamily: fonts.bold, color: colors.live },
  addRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingHorizontal: 6 },
  addRowTxt: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
    color: colors.petrol,
    textDecorationLine: 'underline',
  },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 44 },
  cta: {
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.sunset,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.cta,
  },
  ctaTxt: { fontSize: 16, fontFamily: fonts.extrabold, color: '#fff' },
});
