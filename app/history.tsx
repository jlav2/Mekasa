import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Screen, Txt, SegmentedControl, TabBar } from '../src/components';
import { colors, fonts } from '../src/theme';

type Row = {
  day: string;
  month: string;
  title: string;
  meta: string;
  badge?: string;
  action?: string;
  chevron?: boolean;
};

const THIS_WEEK: Row[] = [
  { day: '03', month: 'יולי', title: "פוצ'יוולי · חוף פרישמן", meta: '2.5 שעות · עם עומר, דניאל, נועה', action: 'שחק שוב' },
  { day: '30', month: 'יוני', title: 'אלטינה · חוף גורדון', meta: 'שעה וחצי · מעגל של 7', action: 'שחק שוב' },
];

const JUNE: Row[] = [
  { day: '27', month: 'יוני', title: 'טורניר פוצ\'יוולי · הילטון', meta: '8 קבוצות', badge: 'מקום 2 🏆', chevron: true },
  { day: '24', month: 'יוני', title: 'הקבוע של שלישי · פרישמן', meta: '2 שעות · 4 שחקנים', action: 'שחק שוב' },
  { day: '20', month: 'יוני', title: 'כדורעף חופים · מצודת הים', meta: 'שעה · רביעיות', action: 'שחק שוב' },
];

function HistoryRow({ row, last }: { row: Row; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.dateBox}>
        <Txt style={styles.dateNum}>{row.day}</Txt>
        <Txt style={styles.dateMonth}>{row.month}</Txt>
      </View>
      <View style={{ flex: 1 }}>
        <Txt style={styles.rowTitle}>{row.title}</Txt>
        {row.badge ? (
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 1 }}>
            <Txt style={styles.rowMeta}>{row.meta}</Txt>
            <View style={styles.trophyBadge}>
              <Txt style={{ fontSize: 10.5, fontFamily: fonts.extrabold, color: '#B07515' }}>{row.badge}</Txt>
            </View>
          </View>
        ) : (
          <Txt style={styles.rowMeta}>{row.meta}</Txt>
        )}
      </View>
      {row.chevron ? (
        <Svg width={8} height={13} viewBox="0 0 8 14">
          <Path d="M7 1L1 7l6 6" stroke="#B9C4C9" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ) : (
        <Txt style={styles.action}>{row.action}</Txt>
      )}
    </View>
  );
}

export default function History() {
  const router = useRouter();
  const [segment, setSegment] = useState(2);

  const onSegment = (i: number) => {
    setSegment(i);
    if (i === 0) router.push('/my-circles');
    if (i === 1) router.push('/recurring');
  };

  // Spec 08: pull-to-refresh. History is fixture data here; in production this
  // re-fetches the played-circles history from the backend.
  const onRefresh = () => {};

  return (
    <Screen scroll onRefresh={onRefresh} contentStyle={{ paddingBottom: 120 }}>
      <Txt style={{ fontFamily: fonts.displayBold, fontSize: 56, lineHeight: 56, color: colors.petrol, marginTop: 8 }}>
        המעגלים שלי
      </Txt>
      <SegmentedControl options={['קרובים', 'קבועים', 'היסטוריה']} value={segment} onChange={onSegment} style={{ marginTop: 14 }} />

      <View style={{ gap: 10, marginTop: 16 }}>
        {/* stats strip */}
        <View style={{ flexDirection: 'row-reverse', gap: 10 }}>
          <View style={styles.statCard}>
            <Txt style={styles.statNum}>47</Txt>
            <Txt style={styles.statLabel}>מעגלים</Txt>
          </View>
          <View style={styles.statCard}>
            <Txt style={styles.statNum}>96</Txt>
            <Txt style={styles.statLabel}>שעות על החול</Txt>
          </View>
          <View style={styles.statCard}>
            <Txt style={styles.statNum}>12</Txt>
            <Txt style={styles.statLabel}>חופים</Txt>
          </View>
        </View>

        <Txt style={styles.sectionLabel}>השבוע</Txt>
        <View style={styles.groupCard}>
          {THIS_WEEK.map((r, i) => (
            <HistoryRow key={i} row={r} last={i === THIS_WEEK.length - 1} />
          ))}
        </View>

        <Txt style={styles.sectionLabel}>יוני</Txt>
        <View style={styles.groupCard}>
          {JUNE.map((r, i) => (
            <HistoryRow key={i} row={r} last={i === JUNE.length - 1} />
          ))}
        </View>
      </View>

      <TabBar active="circles" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  statNum: { fontFamily: fonts.displayBold, fontSize: 32, lineHeight: 32, color: colors.petrol },
  statLabel: { fontSize: 11, color: colors.faint, fontFamily: fonts.semibold, marginTop: 2 },
  sectionLabel: { fontSize: 12, fontFamily: fonts.extrabold, color: colors.faint, letterSpacing: 0.5, paddingRight: 6, marginTop: 4 },
  groupCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  dateBox: { width: 44, alignItems: 'center' },
  dateNum: { fontFamily: fonts.displayBold, fontSize: 26, lineHeight: 26, color: colors.petrol },
  dateMonth: { fontSize: 10, color: colors.faint, fontFamily: fonts.semibold },
  rowTitle: { fontSize: 14, fontFamily: fonts.bold, color: colors.ink },
  rowMeta: { fontSize: 12, color: colors.faint, marginTop: 1 },
  trophyBadge: { backgroundColor: 'rgba(232,161,60,.18)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  action: { fontSize: 12.5, fontFamily: fonts.bold, color: colors.sunsetDeep },
});
