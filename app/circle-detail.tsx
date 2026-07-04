import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle as SvgCircle, Path as SvgPath } from 'react-native-svg';
import { Screen, Txt, Icon, SandRing, StatusDot } from '../src/components';
import { colors, fonts, shadows } from '../src/theme';
import { useStore } from '../src/store';

const CIRCLE_ID = 'frishman';
const RING_ROTATIONS = [0, 60, 150, 230];

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

function InfoRow({
  icon,
  label,
  trailing,
  border,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  trailing: React.ReactNode;
  border?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <View style={[styles.infoRow, border && styles.infoRowBorder]}>
      {icon}
      <Txt style={styles.infoLabel}>{label}</Txt>
      {trailing}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

export default function CircleDetail() {
  const router = useRouter();
  const circle = useStore((s) => s.circleById(CIRCLE_ID))!;
  const joined = useStore((s) => s.isJoined(CIRCLE_ID));
  const joinCircle = useStore((s) => s.joinCircle);
  const missing = circle.capacity - circle.players.length;

  const onJoin = () => {
    if (!joined) joinCircle(CIRCLE_ID);
    router.push('/chat');
  };

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
            <Icon name="edit" size={16} color="#fff" strokeWidth={1.8} />
          </PillButton>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.stateBadge, joined && { backgroundColor: colors.live }]}>
            <StatusDot color="#fff" size={7} />
            <Txt style={styles.stateBadgeTxt}>{joined ? 'משחק חי · אתה בפנים' : 'חסר שחקן'}</Txt>
          </View>
          <View style={styles.softBadge}>
            <Txt style={styles.softBadgeTxt}>פוצ'יוולי</Txt>
          </View>
          <View style={styles.softBadge}>
            <Txt style={styles.softBadgeTxt}>בינוניים</Txt>
          </View>
        </View>

        <Txt style={styles.heroTitle}>המעגל של עומר{'\n'}חוף פרישמן</Txt>
        <Txt style={styles.heroMeta}>התחיל לפני 20 דק&apos; · מגרש 2, ליד סוכת המציל · 300 מ&apos; ממך</Txt>
      </View>

      {/* body */}
      <View style={styles.body}>
        <View>
          <View style={styles.playersHeader}>
            <Txt style={styles.playersTitle}>שחקנים במעגל</Txt>
            <Txt style={[styles.playersCount, missing === 0 && { color: colors.liveDeep }]}>
              {missing > 0
                ? `${circle.players.length} מתוך ${circle.capacity} — חסר אחד!`
                : `${circle.players.length}/${circle.capacity} — מלא. משחקים!`}
            </Txt>
          </View>
          <View style={styles.playersRow}>
            {circle.players.map((p, i) => (
              <View key={p.id} style={styles.playerCol}>
                <SandRing size={64} color={colors.live} strokeWidth={2.5} rotate={RING_ROTATIONS[i % RING_ROTATIONS.length]} variant={1}>
                  <View style={[styles.playerAvatar, { backgroundColor: p.avatarColor }]}>
                    <Txt style={styles.playerAvatarTxt}>{p.avatarInitial}</Txt>
                  </View>
                </SandRing>
                <Txt style={styles.playerName}>{p.name}</Txt>
                {p.id === circle.hostId && <Txt style={styles.playerHost}>מארח</Txt>}
              </View>
            ))}
            {missing > 0 && (
              <Pressable style={styles.playerCol} onPress={onJoin}>
                <View style={styles.emptySlot}>
                  <Txt style={styles.emptySlotPlus}>+</Txt>
                </View>
                <Txt style={styles.emptySlotLabel}>זה אתה?</Txt>
              </Pressable>
            )}
          </View>
        </View>

        {/* info list */}
        <View style={styles.infoCard}>
          <InfoRow
            border
            icon={
              <Svg width={18} height={18} viewBox="0 0 20 20">
                <SvgCircle cx={10} cy={10} r={8} fill="none" stroke={colors.petrol} strokeWidth={1.8} />
                <SvgPath d="M10 5.5V10l3 2" fill="none" stroke={colors.petrol} strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
            }
            label="משחקים עד השקיעה"
            trailing={<Txt style={styles.infoTrailing}>~19:30</Txt>}
          />
          <InfoRow
            onPress={() => {}}
            icon={
              <Svg width={18} height={18} viewBox="0 0 20 20">
                <SvgPath
                  d="M10 18s-6.5-5.3-6.5-10A6.5 6.5 0 0110 1.5 6.5 6.5 0 0116.5 8c0 4.7-6.5 10-6.5 10z"
                  fill="none"
                  stroke={colors.petrol}
                  strokeWidth={1.8}
                />
                <SvgCircle cx={10} cy={8} r={2.3} fill={colors.petrol} />
              </Svg>
            }
            label="ניווט למגרש"
            trailing={<Icon name="chevronLeft" size={13} color={colors.faint} strokeWidth={2} />}
          />
        </View>

        {/* host note */}
        <View style={styles.noteChip}>
          <Svg width={18} height={18} viewBox="0 0 20 20">
            <SvgPath d="M17 10a7 7 0 11-3.2-5.9L17 3v7z" fill="none" stroke={colors.live} strokeWidth={1.8} strokeLinejoin="round" />
          </Svg>
          <Txt style={styles.noteTxt}>&quot;מביאים כדור, תביאו מים. רשת בגובה תחרותי&quot; — עומר</Txt>
        </View>
      </View>

      {/* footer */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.cta, joined && { backgroundColor: colors.live, shadowColor: colors.live }]}
          onPress={onJoin}
        >
          <Txt style={styles.ctaTxt}>{joined ? 'אתה בפנים ✓ — פתח צ׳אט' : 'אני בפנים'}</Txt>
        </Pressable>
        <Pressable style={styles.shareBtn} onPress={() => router.push('/chat')}>
          <Icon name="share" size={20} color={colors.petrol} strokeWidth={1.7} />
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
    paddingBottom: 24,
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
  stateBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.sunset,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  stateBadgeTxt: { fontFamily: fonts.extrabold, fontSize: 12, color: '#fff' },
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
  body: { flex: 1, paddingHorizontal: 22, paddingTop: 20, gap: 18 },
  playersHeader: { flexDirection: 'row-reverse', alignItems: 'baseline', justifyContent: 'space-between' },
  playersTitle: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.ink },
  playersCount: { fontFamily: fonts.bold, fontSize: 13, color: colors.sunset },
  playersRow: { flexDirection: 'row-reverse', gap: 14, marginTop: 12 },
  playerCol: { alignItems: 'center', gap: 6 },
  playerAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  playerAvatarTxt: { fontFamily: fonts.bold, fontSize: 20, color: '#fff' },
  playerName: { fontSize: 11.5, fontFamily: fonts.bold, color: colors.ink },
  playerHost: { fontSize: 10, color: colors.faint, marginTop: -4 },
  emptySlot: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderColor: colors.sunset,
    backgroundColor: '#FFF3EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotPlus: { fontSize: 26, fontFamily: fonts.bold, color: colors.sunset },
  emptySlotLabel: { fontSize: 11.5, fontFamily: fonts.bold, color: colors.sunset },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  infoRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 13 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  infoLabel: { flex: 1, fontSize: 14, color: colors.ink, fontFamily: fonts.semibold },
  infoTrailing: { fontSize: 13, color: colors.faint },
  noteChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(20,184,168,.1)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  noteTxt: { flex: 1, fontSize: 13, color: colors.liveDeep, fontFamily: fonts.semibold, lineHeight: 18 },
  footer: { flexDirection: 'row-reverse', gap: 10, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 44 },
  cta: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.sunset,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.cta,
  },
  ctaTxt: { fontFamily: fonts.extrabold, fontSize: 17, color: '#fff' },
  shareBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
