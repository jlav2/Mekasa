import { useRef, ReactNode } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { ZoomOut, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { Txt, Icon, SectionLabel, DecorRing, RingBadge, StatusDot, Button } from '../../src/components';
import { colors, fonts } from '../../src/theme';
import { useStore } from '../../src/store';
import type { AppNotification } from '../../src/data/models';

// Swipe-to-mark-read wrapper (RTL row: action panel revealed on the left edge).
function SwipeToRead({ enabled, onRead, children }: { enabled: boolean; onRead: () => void; children: ReactNode }) {
  const ref = useRef<SwipeableMethods>(null);
  if (!enabled) return <>{children}</>;

  const renderLeftActions = (progress: SharedValue<number>) => (
    <Animated.View style={[styles.readAction, { opacity: progress }]}>
      <Icon name="check" size={16} color="#fff" strokeWidth={2.6} />
      <Txt style={styles.readActionTxt}>נקרא</Txt>
    </Animated.View>
  );

  return (
    <Swipeable
      ref={ref}
      renderLeftActions={renderLeftActions}
      leftThreshold={64}
      overshootFriction={8}
      onSwipeableOpen={(direction) => {
        if (direction === 'left') {
          onRead();
          ref.current?.close();
        }
      }}
    >
      {children}
    </Swipeable>
  );
}

function UnreadDot({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return <Animated.View exiting={ZoomOut.duration(200)} style={styles.unreadDot} />;
}

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const notifications = useStore((s) => s.notifications);
  const circleById = useStore((s) => s.circleById);
  const markAllRead = useStore((s) => s.markAllRead);
  const markRead = useStore((s) => s.markRead);
  const joinCircle = useStore((s) => s.joinCircle);
  const showToast = useStore((s) => s.showToast);

  const openCircle = (n: AppNotification) => {
    markRead(n.id);
    if (n.kind === 'tournament') return router.push('/tournament');
    if (n.kind === 'upsell') return router.push('/paywall');
    if (n.circleId) return router.push({ pathname: '/c/[id]', params: { id: n.circleId } });
    router.push('/map');
  };

  // hot: urgent "circle needs a player" card with join / show-on-map CTAs
  const renderHot = (n: AppNotification) => {
    const circle = n.circleId ? circleById(n.circleId) : undefined;
    return (
      <View style={styles.hotCard}>
        <View style={styles.hotLiveDot} />
        <View style={styles.rowTop}>
          <RingBadge size={48} color={colors.sunset} variant={1} rotate={40}>
            {circle ? (
              <Txt style={{ fontFamily: fonts.extrabold, fontSize: 11, color: '#fff' }}>
                {circle.players.length}/{circle.capacity}
              </Txt>
            ) : (
              <Icon name="pin" size={14} color="#fff" strokeWidth={2} />
            )}
          </RingBadge>
          <View style={{ flex: 1 }}>
            <Txt style={styles.hotTitle}>{n.title}</Txt>
            <Txt style={styles.hotMeta}>{n.body ? `${n.body} · ${n.time}` : n.time}</Txt>
          </View>
          <UnreadDot visible={n.unread} />
        </View>
        <View style={styles.hotCtaRow}>
          <Pressable
            style={styles.ctaPrimary}
            onPress={() => {
              markRead(n.id);
              if (n.circleId) {
                const target = circleById(n.circleId);
                // the circle may have filled between the notification firing
                // and this tap — surface the race instead of joining silently
                if (target && target.players.length >= target.capacity) {
                  showToast({ kind: 'joinRace', circleId: n.circleId });
                  return;
                }
                joinCircle(n.circleId); // one-tap join, straight from the notification
                router.push({ pathname: '/chat', params: { circle: n.circleId } });
              } else {
                router.push('/map');
              }
            }}
          >
            <Txt style={styles.ctaPrimaryText}>אני בפנים</Txt>
          </Pressable>
          <Pressable style={styles.ctaSecondary} onPress={() => router.push('/map')}>
            <Txt style={styles.ctaSecondaryText}>הצג במפה</Txt>
          </Pressable>
        </View>
      </View>
    );
  };

  // social: someone joined / friend activity — avatar from the title's lead letter
  const renderSocial = (n: AppNotification) => (
    <Pressable style={styles.plainCard} onPress={() => openCircle(n)}>
      <View style={[styles.avatarCircle, { backgroundColor: colors.live }]}>
        <Txt style={{ fontFamily: fonts.bold, fontSize: 17, color: '#fff' }}>{n.title.trim().charAt(0)}</Txt>
      </View>
      <View style={{ flex: 1 }}>
        <Txt style={styles.rowTitle}>{n.title}</Txt>
        <Txt style={styles.rowMeta}>{n.body ? `${n.body} · ${n.time}` : n.time}</Txt>
      </View>
      <UnreadDot visible={n.unread} />
    </Pressable>
  );

  const renderTournament = (n: AppNotification) => (
    <Pressable style={styles.plainCard} onPress={() => openCircle(n)}>
      <RingBadge size={48} color={colors.petrol} variant={2} rotate={-70}>
        <Svg width={14} height={14} viewBox="0 0 20 20">
          <Path d="M5 2v16M5 3h10l-3 3.5L15 10H5" fill="none" stroke={colors.sandGlow} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </RingBadge>
      <View style={{ flex: 1 }}>
        <Txt style={styles.rowTitle}>{n.title}</Txt>
        <Txt style={styles.rowMeta}>{n.body ? `${n.body} · ${n.time}` : n.time}</Txt>
      </View>
      {n.unread ? <UnreadDot visible /> : <Icon name="chevronLeft" size={14} color="#B9C4C9" strokeWidth={2} />}
    </Pressable>
  );

  const renderSummary = (n: AppNotification) => (
    <Pressable style={[styles.plainCard, { opacity: 0.75 }]} onPress={() => openCircle(n)}>
      <View style={styles.summaryIconWrap}>
        <Svg width={20} height={20} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="8" fill="none" stroke={colors.muted} strokeWidth={2} strokeDasharray="18 4 14 4" strokeLinecap="round" />
          <Circle cx="12" cy="12" r="2.6" fill={colors.muted} />
        </Svg>
      </View>
      <View style={{ flex: 1 }}>
        <Txt style={styles.rowTitle}>{n.title}</Txt>
        <Txt style={styles.rowMeta}>{n.body ? `${n.body} · ${n.time}` : n.time}</Txt>
      </View>
      <UnreadDot visible={n.unread} />
    </Pressable>
  );

  // upsell rows navigate to the paywall
  const renderUpsell = (n: AppNotification) => (
    <View style={styles.proCard}>
      <DecorRing size={110} color={colors.sandGlow} opacity={0.15} strokeWidth={2.5} style={{ left: -30, top: -20 }} />
      <View style={{ flex: 1 }}>
        <Txt style={styles.proTitle}>{n.title}</Txt>
        {n.body ? <Txt style={styles.proSub}>{n.body}</Txt> : null}
      </View>
      <Pressable style={styles.proCta} onPress={() => openCircle(n)}>
        <Txt style={styles.proCtaText}>נסה חינם</Txt>
      </Pressable>
    </View>
  );

  const renderRow = (n: AppNotification) => {
    const card =
      n.kind === 'hot' ? renderHot(n)
      : n.kind === 'tournament' ? renderTournament(n)
      : n.kind === 'summary' ? renderSummary(n)
      : n.kind === 'upsell' ? renderUpsell(n)
      : renderSocial(n);
    return (
      <SwipeToRead key={n.id} enabled={n.unread} onRead={() => markRead(n.id)}>
        {card}
      </SwipeToRead>
    );
  };

  const now = notifications.filter((n) => n.group === 'now');
  const today = notifications.filter((n) => n.group === 'today');

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandBg }}>
      <View style={{ paddingTop: insets.top + 18, paddingHorizontal: 22 }}>
        <View style={styles.titleRow}>
          <Txt style={styles.title}>התראות</Txt>
          <Pressable onPress={markAllRead} accessibilityRole="button">
            <Txt style={styles.markRead}>סמן הכול כנקרא</Txt>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120, gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 && (
          <View style={styles.empty}>
            <View style={styles.emptyIconRing}>
              <Icon name="bell" size={30} color={colors.muted} strokeWidth={1.8} />
              <View style={styles.emptyLiveDot}>
                <StatusDot color={colors.live} size={9} />
              </View>
            </View>
            <Txt style={styles.emptyTitle}>שקט על החול</Txt>
            <Txt style={styles.emptyBody}>
              אין התראות חדשות. עקוב אחרי החופים שלך — וברגע שנפתח שם מעגל, תדע ראשון.
            </Txt>
            <Button
              label="בחר חופים למעקב"
              variant="secondary"
              size="md"
              style={{ marginTop: 16, alignSelf: 'center', paddingHorizontal: 24 }}
              full={false}
              onPress={() => router.push('/beach-picker')}
            />
          </View>
        )}

        {now.length > 0 && <SectionLabel>עכשיו</SectionLabel>}
        {now.map(renderRow)}

        {today.length > 0 && <SectionLabel style={{ marginTop: 6 }}>היום</SectionLabel>}
        {today.map(renderRow)}

        {/* pro upsell (marketing footer, not a notification) */}
        <View style={styles.proCard}>
          <DecorRing size={110} color={colors.sandGlow} opacity={0.15} strokeWidth={2.5} style={{ left: -30, top: -20 }} />
          <View style={{ flex: 1 }}>
            <Txt style={styles.proTitle}>רוצה לדעת ראשון על כל מעגל בפרישמן?</Txt>
            <Txt style={styles.proSub}>התראות חכמות לחופים שלך — עם Pro</Txt>
          </View>
          <Pressable style={styles.proCta} onPress={() => router.push('/paywall')}>
            <Txt style={styles.proCtaText}>נסה חינם</Txt>
          </Pressable>
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row-reverse', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontFamily: fonts.displayBold, fontSize: 56, lineHeight: 56, color: colors.petrol },
  markRead: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.petrol,
    textDecorationLine: 'underline',
  },

  empty: { alignItems: 'center', paddingHorizontal: 24, marginTop: 50 },
  emptyIconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(201,186,155,.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLiveDot: {
    position: 'absolute',
    top: 4,
    left: 4,
  },
  emptyTitle: { fontFamily: fonts.displayBold, fontSize: 32, color: colors.ink, marginTop: 16, textAlign: 'center' },
  emptyBody: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 20 },

  hotCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,44,.5)',
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 16,
    position: 'relative',
    shadowColor: colors.sunset,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  hotLiveDot: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.sunset,
  },
  rowTop: { flexDirection: 'row-reverse', gap: 12 },
  hotTitle: { fontFamily: fonts.extrabold, fontSize: 14.5, color: colors.ink },
  hotMeta: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 2 },
  hotCtaRow: { flexDirection: 'row-reverse', gap: 8, marginTop: 12 },
  ctaPrimary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.sunset,
    shadowColor: colors.sunset,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  ctaPrimaryText: { fontFamily: fonts.bold, fontSize: 13.5, color: '#fff' },
  ctaSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(14,79,94,.22)',
  },
  ctaSecondaryText: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.petrol },

  plainCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(14,79,94,.09)',
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row-reverse',
    gap: 12,
    alignItems: 'center',
  },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  rowMeta: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 2 },
  unreadDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.live, flexShrink: 0 },
  readAction: {
    backgroundColor: colors.live,
    borderRadius: 20,
    marginRight: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  readActionTxt: { fontFamily: fonts.extrabold, fontSize: 12, color: '#fff' },

  summaryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(14,79,94,.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  proCard: {
    backgroundColor: colors.petrol,
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row-reverse',
    gap: 12,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  proTitle: { fontFamily: fonts.extrabold, fontSize: 13.5, color: '#fff' },
  proSub: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,.75)', marginTop: 2 },
  proCta: {
    backgroundColor: colors.sunset,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  proCtaText: { fontFamily: fonts.extrabold, fontSize: 12, color: '#fff' },
});
