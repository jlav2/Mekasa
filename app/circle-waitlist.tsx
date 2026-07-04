import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle as SvgCircle, Path as SvgPath } from 'react-native-svg';
import { Screen, Txt, Icon, SandRing, StatusDot } from '../src/components';
import { colors, fonts } from '../src/theme';

type Player = { letter: string; name: string; color: string };

const PLAYERS: Player[] = [
  { letter: 'נ', name: 'נועה', color: colors.amber },
  { letter: 'ע', name: 'עומר', color: colors.petrol },
  { letter: 'ד', name: 'דניאל', color: colors.live },
  { letter: 'ר', name: 'רועי', color: '#7A6FB8' },
];

function HeroRingDecor() {
  return (
    <Svg
      width={240}
      height={240}
      viewBox="0 0 64 64"
      style={{ position: 'absolute', left: -70, top: -40, opacity: 0.14 }}
    >
      <SvgCircle
        cx={32}
        cy={32}
        r={26}
        fill="none"
        stroke="#fff"
        strokeWidth={2}
        strokeDasharray="48 8 40 10 42 7"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function PillButton({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.pillBtn}>
      {children}
    </Pressable>
  );
}

export default function CircleWaitlist() {
  const router = useRouter();

  return (
    <Screen padded={false} bg={colors.sandBg} edges={{ top: false, bottom: false }}>
      {/* hero */}
      <View style={styles.hero}>
        <HeroRingDecor />
        <View style={styles.heroTopRow}>
          <PillButton onPress={() => router.back()}>
            <Icon name="chevronRight" size={17} color="#fff" strokeWidth={2.4} />
          </PillButton>
          <PillButton>
            <Svg width={16} height={16} viewBox="0 0 20 20">
              <SvgPath
                d="M14 7a3 3 0 10-2.8-4M14 7a3 3 0 01.9 5.9M6 13a3 3 0 102.8 4M6 13a3 3 0 01-.9-5.9M12 5L8 8m4 7l-4-3"
                fill="none"
                stroke="#fff"
                strokeWidth={1.7}
                strokeLinecap="round"
              />
            </Svg>
          </PillButton>
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.liveBadge}>
            <StatusDot color="#fff" size={7} />
            <Txt style={styles.liveBadgeTxt}>משחק חי · מלא</Txt>
          </View>
          <View style={styles.softBadge}>
            <Txt style={styles.softBadgeTxt}>פוצ&apos;יוולי · בינוניים</Txt>
          </View>
        </View>

        <Txt style={styles.heroTitle}>המעגל של נועה{'\n'}חוף גורדון</Txt>
        <Txt style={styles.heroMeta}>התחיל לפני 40 דק&apos; · ליד המים · 650 מ&apos; ממך</Txt>
      </View>

      {/* body */}
      <View style={styles.body}>
        <View>
          <View style={styles.playersHeader}>
            <Txt style={styles.playersTitle}>שחקנים במעגל</Txt>
            <Txt style={styles.playersCountFull}>4/4 — מלא</Txt>
          </View>
          <View style={styles.playersRow}>
            {PLAYERS.map((p) => (
              <View key={p.letter} style={styles.playerCol}>
                <View style={[styles.playerAvatar, { backgroundColor: p.color }]}>
                  <Txt style={styles.playerAvatarTxt}>{p.letter}</Txt>
                </View>
                <Txt style={styles.playerName}>{p.name}</Txt>
              </View>
            ))}
          </View>
        </View>

        {/* waitlist card */}
        <View style={styles.waitlistCard}>
          <View style={styles.waitlistTop}>
            <View style={styles.bellCircle}>
              <Icon name="bell" size={20} color={colors.live} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt style={styles.waitlistTitle}>אתה ראשון בהמתנה</Txt>
              <Txt style={styles.waitlistRule}>אם מישהו עוזב — תקבל התראה מיידית ו־5 דק&apos; לתפוס</Txt>
            </View>
          </View>
          <View style={styles.waitlistConfirmedBtn}>
            <Txt style={styles.waitlistConfirmedTxt}>ברשימת ההמתנה ✓</Txt>
          </View>
        </View>

        {/* alternatives */}
        <View>
          <Txt style={styles.altHeader}>בינתיים, ממש קרוב:</Txt>
          <Pressable style={styles.altRow} onPress={() => router.push('/circle-detail')}>
            <View style={styles.altRingWrap}>
              <SandRing size={42} color={colors.sunset} strokeWidth={4} rotate={40} variant={1}>
                <View style={styles.altCountCircle}>
                  <Txt style={styles.altCountTxt}>3/4</Txt>
                </View>
              </SandRing>
            </View>
            <View style={{ flex: 1 }}>
              <Txt style={styles.altTitle}>פוצ&apos;יוולי · חוף פרישמן</Txt>
              <Txt style={styles.altMeta}>חסר שחקן · אותה רמה · 300 מ&apos;</Txt>
            </View>
            <View style={styles.altJoinBtn}>
              <Txt style={styles.altJoinTxt}>הצטרף</Txt>
            </View>
          </Pressable>
        </View>
      </View>

      {/* footer */}
      <View style={styles.footer}>
        <Pressable style={styles.footerBtn} onPress={() => router.push('/chat')}>
          <Txt style={styles.footerBtnTxt}>צפה במשחק · פתח צ&apos;אט</Txt>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.petrol,
    paddingTop: 70,
    paddingHorizontal: 22,
    paddingBottom: 22,
    overflow: 'hidden',
  },
  heroTopRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  pillBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 16 },
  liveBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.live,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  liveBadgeTxt: { fontFamily: fonts.extrabold, fontSize: 12, color: '#fff' },
  softBadge: { backgroundColor: 'rgba(255,255,255,.14)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  softBadgeTxt: { fontFamily: fonts.bold, fontSize: 12, color: colors.sandGlow },
  heroTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 52,
    lineHeight: 50,
    color: '#fff',
    marginTop: 12,
  },
  heroMeta: { fontSize: 13.5, color: 'rgba(255,255,255,.72)', marginTop: 8 },
  body: { flex: 1, paddingHorizontal: 22, paddingTop: 20, gap: 16 },
  playersHeader: { flexDirection: 'row-reverse', alignItems: 'baseline', justifyContent: 'space-between' },
  playersTitle: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.ink },
  playersCountFull: { fontFamily: fonts.bold, fontSize: 13, color: colors.live },
  playersRow: { flexDirection: 'row-reverse', gap: 14, marginTop: 12 },
  playerCol: { alignItems: 'center', gap: 6 },
  playerAvatar: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  playerAvatarTxt: { fontFamily: fonts.bold, fontSize: 19, color: '#fff' },
  playerName: { fontSize: 11, fontFamily: fonts.bold, color: colors.ink },
  waitlistCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(20,184,168,.5)',
    padding: 16,
  },
  waitlistTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  bellCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(20,184,168,.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitlistTitle: { fontSize: 14.5, fontFamily: fonts.extrabold, color: colors.ink },
  waitlistRule: { fontSize: 12, color: colors.muted, marginTop: 1 },
  waitlistConfirmedBtn: {
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.live,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: colors.live,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  waitlistConfirmedTxt: { fontSize: 14.5, fontFamily: fonts.bold, color: '#fff' },
  altHeader: { fontSize: 13, fontFamily: fonts.extrabold, color: colors.ink },
  altRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  altRingWrap: { width: 42, height: 42 },
  altCountCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.sunset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  altCountTxt: { fontSize: 10, fontFamily: fonts.extrabold, color: '#fff' },
  altTitle: { fontSize: 13.5, fontFamily: fonts.bold, color: colors.ink },
  altMeta: { fontSize: 11.5, color: colors.faint, marginTop: 1 },
  altJoinBtn: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: colors.sunset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  altJoinTxt: { fontSize: 13, fontFamily: fonts.bold, color: '#fff' },
  footer: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 44 },
  footerBtn: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnTxt: { fontSize: 14.5, fontFamily: fonts.bold, color: colors.petrol },
});
