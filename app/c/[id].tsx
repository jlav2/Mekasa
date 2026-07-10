import { View, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { ZoomIn, FadeOut, LinearTransition, LayoutAnimationConfig } from 'react-native-reanimated';
import Svg, { Circle as SvgCircle, Path as SvgPath } from 'react-native-svg';
import { Screen, Txt, Icon, SandRing, DecorRing, HeroIconButton, StatusDot, Button } from '../../src/components';
import { colors, fonts, shadows } from '../../src/theme';
import { useStore } from '../../src/store';

const RING_ROTATIONS = [0, 60, 150, 230];

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

function NotFound() {
  const router = useRouter();
  return (
    <Screen bg={colors.sandBg} edges={{ top: true, bottom: true }}>
      <View style={styles.notFound}>
        <SandRing size={96} color={colors.faint} strokeWidth={3} variant={2} rotate={40} />
        <Txt style={styles.notFoundTitle}>המעגל לא נמצא</Txt>
        <Txt style={styles.notFoundSub}>יכול להיות שהמעגל נסגר או שהקישור לא תקין</Txt>
        <Button label="למפה" variant="petrol" size="md" style={{ marginTop: 20, minWidth: 180 }} onPress={() => router.replace('/map')} />
      </View>
    </Screen>
  );
}

export default function CircleDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const circle = useStore((s) => s.circleById(id ?? ''));
  const joined = useStore((s) => s.isJoined(id ?? ''));
  const joinCircle = useStore((s) => s.joinCircle);
  const leaveCircle = useStore((s) => s.leaveCircle);
  const joinWaitlist = useStore((s) => s.joinWaitlist);
  const waitlisted = useStore((s) => s.isWaitlisted(id ?? ''));
  const userId = useStore((s) => s.user.id);

  if (!circle) return <NotFound />;

  const isHost = circle.hostId === userId;

  const onLeave = async () => {
    const ok =
      Platform.OS === 'web'
        ? typeof window !== 'undefined' && window.confirm('לעזוב את המעגל?')
        : await new Promise<boolean>((resolve) =>
            Alert.alert('לעזוב את המעגל?', undefined, [
              { text: 'ביטול', style: 'cancel', onPress: () => resolve(false) },
              { text: 'עזוב', style: 'destructive', onPress: () => resolve(true) },
            ]),
          );
    if (!ok) return;
    leaveCircle(circle.id);
    router.replace('/map');
  };

  const missing = circle.capacity - circle.players.length;
  const full = missing === 0;

  const stateBadge = joined
    ? { bg: colors.live, label: circle.state === 'scheduled' ? 'אתה בפנים' : 'משחק חי · אתה בפנים' }
    : circle.state === 'live'
      ? { bg: colors.live, label: 'משחק חי' }
      : circle.state === 'scheduled'
        ? { bg: 'rgba(255,255,255,.2)', label: circle.startLabel }
        : { bg: colors.sunset, label: missing === 1 ? 'חסר שחקן' : `חסרים ${missing}` };

  const openChat = () => router.push({ pathname: '/chat', params: { circle: circle.id } });

  const waitlistRoute = () => router.push({ pathname: '/circle-waitlist', params: { id: circle.id } });

  const onJoin = () => {
    if (joined) return openChat();
    if (full) {
      if (!waitlisted) joinWaitlist(circle.id);
      return waitlistRoute();
    }
    joinCircle(circle.id);
    openChat();
  };

  return (
    <Screen padded={false} bg={colors.sandBg} edges={{ top: false, bottom: false }}>
      {/* hero */}
      <View style={styles.hero}>
        <DecorRing style={{ left: -70, top: -40 }} />
        <View style={styles.heroTopRow}>
          <HeroIconButton onPress={() => router.back()} accessibilityLabel="חזור">
            <Icon name="chevronRight" size={17} color="#fff" strokeWidth={2.4} />
          </HeroIconButton>
          <HeroIconButton onPress={() => router.push({ pathname: '/circle-share', params: { id: circle.id } })} accessibilityLabel="שתף מעגל">
            <Icon name="share" size={16} color="#fff" strokeWidth={1.8} />
          </HeroIconButton>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.stateBadge, { backgroundColor: stateBadge.bg }]}>
            <StatusDot color="#fff" size={7} />
            <Txt style={styles.stateBadgeTxt}>{stateBadge.label}</Txt>
          </View>
          <View style={styles.softBadge}>
            <Txt style={styles.softBadgeTxt}>{circle.sportLabel}</Txt>
          </View>
          <View style={styles.softBadge}>
            <Txt style={styles.softBadgeTxt}>{circle.levelLabel}</Txt>
          </View>
        </View>

        <Txt style={styles.heroTitle}>המעגל של {circle.hostName}{'\n'}{circle.beachName}</Txt>
        <Txt style={styles.heroMeta}>
          {circle.startLabel} · {circle.court} · {circle.distanceLabel}
        </Txt>
      </View>

      {/* body */}
      <View style={styles.body}>
        <View>
          <View style={styles.playersHeader}>
            <Txt style={styles.playersTitle}>שחקנים במעגל</Txt>
            <Txt style={[styles.playersCount, full && { color: colors.liveDeep }]}>
              {full
                ? `${circle.players.length}/${circle.capacity} — מלא. משחקים!`
                : missing === 1
                  ? `${circle.players.length} מתוך ${circle.capacity} — חסר אחד!`
                  : `${circle.players.length} מתוך ${circle.capacity} — חסרים ${missing}`}
            </Txt>
          </View>
          {/* skipEntering: only a mid-session join animates in, not the initial roster */}
          <LayoutAnimationConfig skipEntering>
            <Animated.View style={styles.playersRow} layout={LinearTransition.duration(250)}>
              {circle.players.map((p, i) => (
                <Animated.View key={p.id} entering={ZoomIn.duration(250)} style={styles.playerCol}>
                  <SandRing size={64} color={colors.live} strokeWidth={2.5} rotate={RING_ROTATIONS[i % RING_ROTATIONS.length]} variant={1}>
                    <View style={[styles.playerAvatar, { backgroundColor: p.avatarColor }]}>
                      <Txt style={styles.playerAvatarTxt}>{p.avatarInitial}</Txt>
                    </View>
                  </SandRing>
                  <Txt style={styles.playerName}>{p.name}</Txt>
                  {p.id === circle.hostId && <Txt style={styles.playerHost}>מארח</Txt>}
                </Animated.View>
              ))}
              {!full && !joined && (
                <Animated.View exiting={FadeOut.duration(150)}>
                  <Pressable style={styles.playerCol} onPress={onJoin}>
                    <View style={styles.emptySlot}>
                      <Txt style={styles.emptySlotPlus}>+</Txt>
                    </View>
                    <Txt style={styles.emptySlotLabel}>זה אתה?</Txt>
                  </Pressable>
                </Animated.View>
              )}
            </Animated.View>
          </LayoutAnimationConfig>
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
        {circle.hostNote ? (
          <View style={styles.noteChip}>
            <Svg width={18} height={18} viewBox="0 0 20 20">
              <SvgPath d="M17 10a7 7 0 11-3.2-5.9L17 3v7z" fill="none" stroke={colors.live} strokeWidth={1.8} strokeLinejoin="round" />
            </Svg>
            <Txt style={styles.noteTxt}>{circle.hostNote}</Txt>
          </View>
        ) : null}

        {joined && !isHost && (
          <Pressable onPress={onLeave} style={styles.leaveBtn} accessibilityRole="button">
            <Txt style={styles.leaveTxt}>עזוב את המעגל</Txt>
          </Pressable>
        )}
      </View>

      {/* footer */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.cta, joined && { backgroundColor: colors.live, shadowColor: colors.live }, full && !joined && { backgroundColor: colors.petrol, shadowColor: colors.petrol }]}
          onPress={onJoin}
        >
          <Txt style={styles.ctaTxt}>
            {joined
              ? 'אתה בפנים ✓ — פתח צ׳אט'
              : full
                ? waitlisted
                  ? 'ברשימת ההמתנה ✓ — צפה'
                  : 'המעגל מלא — לרשימת ההמתנה'
                : 'אני בפנים'}
          </Txt>
        </Pressable>
        <Pressable style={styles.shareBtn} onPress={openChat}>
          <Icon name="chat" size={20} color={colors.petrol} strokeWidth={1.7} />
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
  badgeRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 16 },
  stateBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
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
  playersCount: { fontFamily: fonts.bold, fontSize: 13, color: colors.sunsetDeep },
  playersRow: { flexDirection: 'row-reverse', gap: 14, marginTop: 12, flexWrap: 'wrap' },
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
  emptySlotPlus: { fontSize: 26, fontFamily: fonts.bold, color: colors.sunsetDeep },
  emptySlotLabel: { fontSize: 11.5, fontFamily: fonts.bold, color: colors.sunsetDeep },
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
  leaveBtn: { alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 16 },
  leaveTxt: { fontSize: 13, fontFamily: fonts.bold, color: colors.danger, textDecorationLine: 'underline' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  notFoundTitle: { fontFamily: fonts.displayBold, fontSize: 40, color: colors.petrol, marginTop: 16 },
  notFoundSub: { fontSize: 13.5, color: colors.muted, fontFamily: fonts.medium },
});
