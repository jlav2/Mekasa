import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
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

export default function Map() {
  const router = useRouter();
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
  statusTxt: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.sunset },
  nowTxt: { marginRight: 'auto', fontSize: 12, color: colors.faint },
  mainRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginTop: 10 },
  title: { fontFamily: fonts.displayBold, fontSize: 30, lineHeight: 30, color: colors.ink },
  meta: { fontSize: 13, color: colors.muted, marginTop: 4 },
});
