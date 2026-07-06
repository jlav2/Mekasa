import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path as SvgPath } from 'react-native-svg';
import { Screen, Txt, Icon, DecorRing, HeroIconButton, RingBadge, StatusDot, Button } from '../src/components';
import { colors, fonts } from '../src/theme';
import { useStore } from '../src/store';

const ordinal = (n: number) =>
  n === 1 ? 'ראשון' : n === 2 ? 'שני' : n === 3 ? 'שלישי' : `מספר ${n}`;

export default function CircleWaitlist() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const circle = useStore((s) => (id ? s.circleById(id) : undefined));
  const userId = useStore((s) => s.user.id);
  const leaveWaitlist = useStore((s) => s.leaveWaitlist);
  // one real nearby alternative: a circle that still needs a player
  const alt = useStore((s) => s.circles.find((c) => c.state === 'missing' && c.id !== id));

  if (!circle) {
    return (
      <Screen bg={colors.sandBg} edges={{ top: true, bottom: true }}>
        <View style={styles.notFound}>
          <Txt style={styles.notFoundTitle}>המעגל לא נמצא</Txt>
          <Button label="למפה" variant="petrol" size="md" style={{ marginTop: 18, minWidth: 160 }} onPress={() => router.replace('/map')} />
        </View>
      </Screen>
    );
  }

  const myIndex = circle.waitlist.findIndex((p) => p.id === userId);
  const onWaitlist = myIndex >= 0;

  const leave = () => {
    leaveWaitlist(circle.id);
    router.back();
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
          <HeroIconButton
            accessibilityLabel="שתף מעגל"
            onPress={() => router.push({ pathname: '/circle-share', params: { id: circle.id } })}
          >
            <Icon name="share" size={16} color="#fff" strokeWidth={1.8} />
          </HeroIconButton>
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.liveBadge}>
            <StatusDot color="#fff" size={7} />
            <Txt style={styles.liveBadgeTxt}>{circle.state === 'live' ? 'משחק חי · מלא' : 'מלא'}</Txt>
          </View>
          <View style={styles.softBadge}>
            <Txt style={styles.softBadgeTxt}>{circle.sportLabel} · {circle.levelLabel}</Txt>
          </View>
        </View>

        <Txt style={styles.heroTitle}>המעגל של {circle.hostName}{'\n'}{circle.beachName}</Txt>
        <Txt style={styles.heroMeta}>{circle.startLabel} · {circle.court} · {circle.distanceLabel}</Txt>
      </View>

      {/* body */}
      <View style={styles.body}>
        <View>
          <View style={styles.playersHeader}>
            <Txt style={styles.playersTitle}>שחקנים במעגל</Txt>
            <Txt style={styles.playersCountFull}>{circle.players.length}/{circle.capacity} — מלא</Txt>
          </View>
          <View style={styles.playersRow}>
            {circle.players.map((p) => (
              <View key={p.id} style={styles.playerCol}>
                <View style={[styles.playerAvatar, { backgroundColor: p.avatarColor }]}>
                  <Txt style={styles.playerAvatarTxt}>{p.avatarInitial}</Txt>
                </View>
                <Txt style={styles.playerName} numberOfLines={1}>{p.name}</Txt>
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
              <Txt style={styles.waitlistTitle}>
                {onWaitlist
                  ? myIndex === 0
                    ? 'אתה ראשון בהמתנה'
                    : `אתה ${ordinal(myIndex + 1)} בהמתנה`
                  : `${circle.waitlist.length} בהמתנה`}
              </Txt>
              <Txt style={styles.waitlistRule}>אם מישהו עוזב — תקבל התראה מיידית ו־5 דק' לתפוס</Txt>
            </View>
          </View>
          {onWaitlist ? (
            <Pressable style={styles.leaveBtn} onPress={leave} accessibilityRole="button">
              <Txt style={styles.leaveTxt}>צא מרשימת ההמתנה</Txt>
            </Pressable>
          ) : (
            <View style={styles.waitlistConfirmedBtn}>
              <Txt style={styles.waitlistConfirmedTxt}>ברשימת ההמתנה ✓</Txt>
            </View>
          )}
        </View>

        {/* one real nearby alternative */}
        {alt ? (
          <View>
            <Txt style={styles.altHeader}>בינתיים, ממש קרוב:</Txt>
            <Pressable style={styles.altRow} onPress={() => router.push({ pathname: '/c/[id]', params: { id: alt.id } })}>
              <RingBadge size={42} color={colors.sunset} rotate={40}>
                <Txt style={styles.altCountTxt}>{alt.players.length}/{alt.capacity}</Txt>
              </RingBadge>
              <View style={{ flex: 1 }}>
                <Txt style={styles.altTitle}>{alt.sportLabel} · {alt.beachName}</Txt>
                <Txt style={styles.altMeta}>חסר שחקן · {alt.levelLabel} · {alt.distanceLabel}</Txt>
              </View>
              <View style={styles.altJoinBtn}>
                <Txt style={styles.altJoinTxt}>הצטרף</Txt>
              </View>
            </Pressable>
          </View>
        ) : null}
      </View>

      {/* footer */}
      <View style={styles.footer}>
        <Pressable style={styles.footerBtn} onPress={() => router.push({ pathname: '/chat', params: { circle: circle.id } })}>
          <Txt style={styles.footerBtnTxt}>צפה במשחק · פתח צ'אט</Txt>
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
  playersRow: { flexDirection: 'row-reverse', gap: 14, marginTop: 12, flexWrap: 'wrap' },
  playerCol: { alignItems: 'center', gap: 6, width: 58 },
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
  leaveBtn: {
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  leaveTxt: { fontSize: 14, fontFamily: fonts.bold, color: colors.petrol },
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
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundTitle: { fontFamily: fonts.displayBold, fontSize: 36, color: colors.petrol },
});
