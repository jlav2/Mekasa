import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Txt,
  Card,
  Badge,
  StatusDot,
  SandRing,
  Icon,
} from '../src/components';
import { colors, fonts, shadows } from '../src/theme';

type Pair = { a: string; b: string; sa?: string; sb?: string; live?: boolean; winner?: 'a' | 'b'; pending?: boolean };

function MatchCard({ m, highlight }: { m: Pair; highlight?: boolean }) {
  const winA = m.winner === 'a';
  const winB = m.winner === 'b';
  return (
    <View style={[styles.match, highlight && styles.matchLive]}>
      <Row name={m.a} score={m.sa} strong={winA || highlight} scoreColor={winA ? colors.live : undefined} live={m.live && highlight} pending={m.pending} />
      <Row name={m.b} score={m.sb} strong={winB} scoreColor={winB ? colors.live : undefined} pending={m.pending} style={{ marginTop: 4 }} />
    </View>
  );
}

function Row({ name, score, strong, scoreColor, live, pending, style }: any) {
  return (
    <View style={[{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }, style]}>
      <Txt style={{ fontSize: 11.5, fontFamily: strong ? fonts.extrabold : fonts.semibold, color: pending ? colors.faint : strong ? colors.ink : colors.faint }}>
        {name}
      </Txt>
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}>
        {live && <StatusDot color={colors.live} size={6} />}
        <Txt style={{ fontSize: 11.5, fontFamily: fonts.bold, color: scoreColor ?? (pending ? colors.faint : colors.ink) }}>{score ?? '—'}</Txt>
      </View>
    </View>
  );
}

export default function Bracket() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.sandBg, paddingTop: insets.top + 10 }}>
      {/* header */}
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingHorizontal: 22 }}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="chevronRight" size={16} color={colors.petrol} strokeWidth={2.4} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: fonts.displayBold, fontSize: 40, lineHeight: 40, color: colors.petrol }}>גביע הילטון</Txt>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
            <StatusDot color={colors.live} size={7} />
            <Txt style={{ fontSize: 12, color: colors.muted, fontFamily: fonts.semibold }}>מתקיים עכשיו · רבע גמר</Txt>
          </View>
        </View>
        <Badge label="אתם משחקים" bg="rgba(20,184,168,.12)" color={colors.liveDeep} />
      </View>

      {/* your next match */}
      <Card petrol floating style={{ marginHorizontal: 16, marginTop: 14, overflow: 'hidden' }}>
        <SandRing size={170} color="#fff" strokeWidth={2} variant={1} rotate={0} style={{ position: 'absolute', left: -46, top: -34, opacity: 0.14 }} />
        <Txt style={{ fontSize: 11.5, fontFamily: fonts.extrabold, color: colors.liveBright }}>המשחק הבא שלכם · מגרש 1 · בעוד ~15 דק'</Txt>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 14, marginTop: 10 }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Txt style={{ fontSize: 15, fontFamily: fonts.extrabold, color: '#fff' }}>גיא + דניאל</Txt>
            <Txt style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', fontFamily: fonts.medium }}>קבוצה 3</Txt>
          </View>
          <Txt style={{ fontFamily: fonts.displayBold, fontSize: 30, color: colors.sandGlow }}>נגד</Txt>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Txt style={{ fontSize: 15, fontFamily: fonts.extrabold, color: '#fff' }}>עומר + רועי</Txt>
            <Txt style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', fontFamily: fonts.medium }}>קבוצה 6</Txt>
          </View>
        </View>
      </Card>

      {/* bracket */}
      <View style={{ flex: 1, flexDirection: 'row-reverse', gap: 10, paddingHorizontal: 16, paddingTop: 16 }}>
        {/* quarters */}
        <View style={{ flex: 1.15, gap: 8 }}>
          <Txt style={styles.colLabel}>רבע גמר</Txt>
          <MatchCard m={{ a: 'אסף + טל', b: 'יובל + שי', sa: '15', sb: '11', winner: 'a' }} />
          <MatchCard m={{ a: 'גיא + דניאל', b: 'עומר + רועי', sa: '8', sb: '6', live: true }} highlight />
          <MatchCard m={{ a: 'נועה + ליה', b: 'דור + ניב', sa: '15', sb: '9', winner: 'a' }} />
          <MatchCard m={{ a: 'איתי + בן', b: 'עדן + יואב', pending: true }} />
        </View>
        {/* semis */}
        <View style={{ flex: 1, justifyContent: 'center', gap: 8 }}>
          <Txt style={[styles.colLabel, { marginTop: -40 }]}>חצי גמר</Txt>
          <View style={styles.match}>
            <Txt style={{ fontSize: 11.5, fontFamily: fonts.bold, color: colors.ink }}>אסף + טל</Txt>
            <Txt style={{ fontSize: 11.5, fontFamily: fonts.semibold, color: '#B9C4C9', marginTop: 4 }}>מנצחי משחק 2</Txt>
          </View>
          <View style={[styles.match, { marginTop: 26 }]}>
            <Txt style={{ fontSize: 11.5, fontFamily: fonts.bold, color: colors.ink }}>נועה + ליה</Txt>
            <Txt style={{ fontSize: 11.5, fontFamily: fonts.semibold, color: '#B9C4C9', marginTop: 4 }}>מנצחי משחק 4</Txt>
          </View>
        </View>
        {/* final */}
        <View style={{ flex: 0.9, justifyContent: 'center', gap: 8 }}>
          <Txt style={[styles.colLabel, { marginTop: -40 }]}>גמר</Txt>
          <LinearGradient colors={['#FFC46B', '#FF9D52']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.final}>
            <Icon name="trophy" size={20} color="#7A4A0E" strokeWidth={1.6} />
            <Txt style={{ fontSize: 11, fontFamily: fonts.extrabold, color: '#7A4A0E', marginTop: 4, textAlign: 'center' }}>16:30{'\n'}מגרש 1</Txt>
          </LinearGradient>
        </View>
      </View>

      {/* ticker */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 16 }}>
        <View style={styles.ticker}>
          <Icon name="bell" size={16} color={colors.petrol} strokeWidth={1.8} />
          <Txt style={{ flex: 1, fontSize: 12.5, fontFamily: fonts.semibold, color: colors.ink }}>
            עדכון מהמארגן: הגמר הוקדם ל־16:30 בגלל הרוח
          </Txt>
          <Txt style={{ fontSize: 11, color: colors.faint, fontFamily: fonts.medium }}>לפני 4 דק'</Txt>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' },
  colLabel: { fontSize: 11, fontFamily: fonts.extrabold, color: colors.faint, textAlign: 'center' },
  match: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.hairline, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 10 },
  matchLive: { borderWidth: 1.5, borderColor: colors.live, ...shadows.card },
  final: { borderRadius: 14, padding: 10, alignItems: 'center', ...shadows.card },
  ticker: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.hairline, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 16 },
});
