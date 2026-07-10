import { useEffect, useMemo, useState } from 'react';
import { AppState as RNAppState, Linking, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { markersFromCircles } from '../../src/data/beaches';
import {
  LiveMap,
  Card,
  Txt,
  Button,
  Chip,
  StatusDot,
  AvatarStack,
  Icon,
  MapCanvas,
  Skeleton,
} from '../../src/components';
import { colors, fonts, shadows } from '../../src/theme';
import { useStore, matchesLevel } from '../../src/store';

function Dot({ color }: { color: string }) {
  return <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: color }} />;
}

const SPORT_LABEL: Record<string, string> = {
  all: 'כל הענפים',
  footvolley: "פוצ'יוולי",
  altinha: 'אלטינה',
  volleyball: 'כדורעף',
};

// Live permission status for the map tab — distinct from the one-shot
// onboarding request, which fires once and never blocks. `unknown` (the
// async check hasn't resolved yet) is treated like `granted` to avoid a
// flash of the denied state on every mount.
function useLocationPermission() {
  const [denied, setDenied] = useState(false);

  const check = async () => {
    if (Platform.OS === 'web') return; // web geolocation handled separately in onboarding
    const { status } = await Location.getForegroundPermissionsAsync();
    setDenied(status === 'denied');
  };

  useEffect(() => {
    check();
    // Re-check on return from Settings (status can't be observed directly).
    const sub = RNAppState.addEventListener('change', (next) => {
      if (next === 'active') check();
    });
    return () => sub.remove();
  }, []);

  return denied;
}

function MapSpinner() {
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 1400, easing: Easing.linear }), -1, false);
  }, [rotation]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  return (
    <Animated.View style={style}>
      <Svg width={64} height={64} viewBox="0 0 64 64">
        <Circle
          cx={32}
          cy={32}
          r={26}
          fill="none"
          stroke={colors.petrol}
          strokeWidth={4}
          strokeDasharray="52 7 38 9 44 6"
          strokeLinecap="round"
          transform="rotate(-30 32 32)"
        />
      </Svg>
    </Animated.View>
  );
}

// 9a — shown while the store's first circles fetch is still in flight.
function MapLoadingSkeleton() {
  return (
    <View style={{ flex: 1 }}>
      <MapCanvas style={{ opacity: 0.35 }} />
      <View style={[styles.filters, { flexDirection: 'row-reverse', gap: 8 }]}>
        <Skeleton width={118} height={44} radius={22} />
        <Skeleton width={96} height={44} radius={22} delay={150} />
        <Skeleton width={96} height={44} radius={22} delay={300} />
      </View>
      <View style={styles.spinnerWrap}>
        <MapSpinner />
        <View style={styles.spinnerPill}>
          <Txt style={styles.spinnerTxt}>מאתר מעגלים סביבך…</Txt>
        </View>
      </View>
      <View style={styles.card}>
        <Card floating radius={24} pad={16}>
          <Skeleton width={150} height={12} radius={6} />
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton width={210} height={24} radius={8} delay={100} />
              <Skeleton width={160} height={12} radius={6} delay={200} />
            </View>
            <View style={{ flexDirection: 'row' }}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={{ marginRight: i === 0 ? 0 : -10 }}>
                  <Skeleton
                    width={38}
                    height={38}
                    radius={19}
                    delay={i * 150}
                    style={{ borderWidth: 2, borderColor: colors.card }}
                  />
                </View>
              ))}
            </View>
          </View>
          <View style={{ height: 56, borderRadius: 28, marginTop: 14, backgroundColor: 'rgba(255,107,44,.14)' }} />
        </Card>
      </View>
    </View>
  );
}

// 9d — the map tab's own location-permission-denied state (distinct from
// the one-shot onboarding-permissions.tsx, which never blocks).
function LocationDenied({ onChooseBeach }: { onChooseBeach: () => void }) {
  return (
    <View style={{ flex: 1 }}>
      <MapCanvas style={{ opacity: 0.4 }} />
      <View style={styles.emptyWrap}>
        <Card floating radius={28} pad={22} style={{ alignItems: 'center' }}>
          <View style={styles.emptyIconRing}>
            <Icon name="locationOff" size={34} color={colors.sunsetDeep} strokeWidth={1.8} />
          </View>
          <Txt style={styles.emptyTitle}>בלי מיקום — אין &quot;לידך&quot;</Txt>
          <Txt style={styles.emptyBody}>
            הרשאת המיקום כבויה, אז אי אפשר להראות מה קורה סביבך. אפשר להפעיל אותה בהגדרות — או פשוט לבחור חוף ידנית.
          </Txt>
          <Button
            label="פתח הגדרות מיקום"
            variant="primary"
            size="lg"
            style={{ marginTop: 18 }}
            onPress={() => Linking.openSettings()}
          />
          <Button
            label="בחר חוף ידנית"
            variant="secondary"
            size="md"
            style={{ marginTop: 10 }}
            onPress={onChooseBeach}
          />
          <View style={styles.footnoteRow}>
            <Icon name="alertCircle" size={14} color={colors.faint} />
            <Txt style={styles.footnoteTxt}>שחקנים אחרים רואים רק את החוף — אף פעם לא אותך</Txt>
          </View>
        </Card>
      </View>
    </View>
  );
}

export default function Map() {
  const router = useRouter();
  const loading = useStore((s) => s.loading);
  const locationDenied = useLocationPermission();
  const circles = useStore((s) => s.circles);
  const filter = useStore((s) => s.filter);
  const cycleFilter = useStore((s) => s.cycleFilter);
  const filtered = useMemo(
    () =>
      circles.filter(
        (c) =>
          (filter.sport === 'all' || c.sport === filter.sport) &&
          matchesLevel(c.levelLabel, filter.level),
      ),
    [circles, filter],
  );
  const markers = useMemo(() => markersFromCircles(filtered), [filtered]);
  // Featured card follows the active filter: prefer a circle that still needs a
  // player, then a live game, then anything matching (null → no card).
  const featured = useMemo(
    () =>
      filtered.find((c) => c.state === 'missing') ??
      filtered.find((c) => c.state === 'live') ??
      filtered[0] ??
      null,
    [filtered],
  );
  const joined = useStore((s) => (featured ? s.isJoined(featured.id) : false));
  const joinCircle = useStore((s) => s.joinCircle);
  const missing = featured ? featured.capacity - featured.players.length : 0;

  const onJoin = () => {
    if (!featured) return;
    if (!joined) joinCircle(featured.id);
    router.push({ pathname: '/chat', params: { circle: featured.id } });
  };

  if (loading) return <MapLoadingSkeleton />;
  if (locationDenied) return <LocationDenied onChooseBeach={() => router.push('/beach-picker')} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandBg }}>
      <LiveMap
        markers={markers}
        onMarkerPress={(m) =>
          m.state === 'tournament'
            ? router.push('/tournament')
            : router.push({ pathname: '/c/[id]', params: { id: m.id } })
        }
      >
        {/* top filters */}
        <View style={styles.filters} pointerEvents="box-none">
          <View style={styles.filterRow}>
            <Chip
              label={SPORT_LABEL[filter.sport]}
              active={filter.sport !== 'all'}
              onPress={() => cycleFilter('sport')}
              trailing={<Icon name="chevronDown" size={11} color={filter.sport !== 'all' ? '#fff' : colors.muted} />}
              style={filter.sport === 'all' ? styles.chipBlur : undefined}
            />
            <Chip
              label={filter.level === 'all' ? 'כל הרמות' : filter.level}
              active={filter.level !== 'all'}
              onPress={() => cycleFilter('level')}
              trailing={<Icon name="chevronDown" size={11} color={filter.level !== 'all' ? '#fff' : colors.muted} />}
              style={filter.level === 'all' ? styles.chipBlur : undefined}
            />
            <Chip
              label='עד 2 ק"מ'
              onPress={() => {}}
              trailing={<Icon name="chevronDown" size={11} color={colors.muted} />}
              style={styles.chipBlur}
            />
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <Dot color={colors.live} />
              <Txt style={styles.legendTxt}>חי</Txt>
            </View>
            <View style={styles.legendItem}>
              <Dot color={colors.sunset} />
              <Txt style={styles.legendTxt}>חסר שחקן</Txt>
            </View>
            <View style={styles.legendItem}>
              <Dot color={colors.petrol} />
              <Txt style={styles.legendTxt}>טורניר</Txt>
            </View>
          </View>
        </View>
      </LiveMap>

      {/* bottom floating card — featured circle from the filtered set */}
      {featured && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.card}>
          <Card floating radius={24} pad={16}>
            <View style={styles.statusRow}>
              <StatusDot color={joined ? colors.live : featured.state === 'live' ? colors.live : colors.sunset} size={9} />
              <Txt style={[styles.statusTxt, (joined || featured.state === 'live') && { color: colors.liveDeep }]}>
                {joined
                  ? 'אתה בפנים'
                  : featured.state === 'live'
                    ? `משחק חי · ${featured.distanceLabel}`
                    : `${missing === 1 ? 'חסר שחקן' : `חסרים ${missing}`} · ${featured.distanceLabel}`}
              </Txt>
              <Txt style={styles.nowTxt}>עכשיו</Txt>
            </View>
            <View style={styles.mainRow}>
              <View style={{ flex: 1 }}>
                <Txt style={styles.title}>
                  {featured.sportLabel} · {featured.beachName}
                </Txt>
                <Txt style={styles.meta}>{featured.levelLabel} · {featured.court}</Txt>
              </View>
              <AvatarStack
                people={featured.players.map((p) => ({ letter: p.avatarInitial, color: p.avatarColor }))}
                size={38}
                border={colors.card}
                emptySlot={missing > 0}
                emptyLabel="+"
                emptyBorder={colors.sunset}
              />
            </View>
            <Button
              label={joined ? 'פתח צ׳אט המעגל' : featured.state === 'live' ? 'צפה במעגל' : 'אני בפנים'}
              variant={joined || featured.state === 'live' ? 'live' : 'primary'}
              size="lg"
              style={{ marginTop: 14 }}
              onPress={onJoin}
            />
          </Card>
        </Animated.View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  filters: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    gap: 10,
  },
  filterRow: { flexDirection: 'row-reverse', gap: 8, alignItems: 'center' },
  chipBlur: { backgroundColor: 'rgba(255,253,246,0.92)', ...shadows.card },
  legend: {
    flexDirection: 'row-reverse',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,253,246,0.9)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 12,
    ...shadows.card,
  },
  legendItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  legendTxt: { fontFamily: fonts.semibold, fontSize: 11, color: colors.muted },
  card: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 104,
  },
  statusRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  statusTxt: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.sunsetDeep },
  nowTxt: { marginRight: 'auto', fontSize: 12, color: colors.faint },
  mainRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginTop: 10 },
  title: { fontFamily: fonts.displayBold, fontSize: 30, lineHeight: 30, color: colors.ink },
  meta: { fontSize: 13, color: colors.muted, marginTop: 4 },
  spinnerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '38%',
    alignItems: 'center',
    gap: 14,
  },
  spinnerPill: {
    backgroundColor: 'rgba(255,253,246,.92)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    ...shadows.card,
  },
  spinnerTxt: { fontSize: 13.5, fontFamily: fonts.bold, color: colors.petrol },
  emptyWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: '20%',
  },
  emptyIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(201,186,155,.6)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 14,
  },
  emptyBody: {
    fontSize: 13.5,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  footnoteRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  footnoteTxt: { fontSize: 11.5, color: colors.faint, flexShrink: 1 },
});
