import { useMemo } from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { LiveMap, Txt, Chip, Icon, RingBadge, TabBar } from '../src/components';
import { colors, fonts, shadows } from '../src/theme';

// Sheet snap positions as fractions of window height
const EXPANDED_TOP = 0.15;
const DEFAULT_TOP = 0.5;

type Circle = {
  id: string;
  state: 'live' | 'missing' | 'tournament';
  count?: string;
  variant: number;
  rotate: number;
  title: string;
  meta: string;
  action: string;
  actionKind: 'filled' | 'outline';
  route: string;
};

const CIRCLES: Circle[] = [
  {
    id: 'c1',
    state: 'missing',
    count: '3/4',
    variant: 1,
    rotate: 40,
    title: "פוצ'יוולי · חוף פרישמן",
    meta: "חסר שחקן · בינוניים · 300 מ'",
    action: 'הצטרף',
    actionKind: 'filled',
    route: '/c/frishman',
  },
  {
    id: 'c2',
    state: 'live',
    count: '4/4',
    variant: 0,
    rotate: -30,
    title: 'אלטינה · חוף גורדון',
    meta: "משחק חי · פתוח לכולם · 650 מ'",
    action: 'צפה',
    actionKind: 'outline',
    route: '/c/gordon',
  },
  {
    id: 'c3',
    state: 'tournament',
    variant: 2,
    rotate: -70,
    title: "טורניר פוצ'יוולי · חוף הילטון",
    meta: 'שבת 9:00 · 8 קבוצות · 1.2 ק"מ',
    action: 'הרשמה',
    actionKind: 'outline',
    route: '/tournament',
  },
  {
    id: 'c4',
    state: 'live',
    count: '6/6',
    variant: 0,
    rotate: 80,
    title: 'כדורעף חופים · מצודת הים',
    meta: 'משחק חי · מקצוענים · 1.8 ק"מ',
    action: 'צפה',
    actionKind: 'outline',
    route: '/c/metzitzim',
  },
];

function RingThumb({ circle }: { circle: Circle }) {
  const color = circle.state === 'live' ? colors.live : circle.state === 'missing' ? colors.sunset : colors.petrol;
  return (
    <RingBadge size={46} color={color} inset={6} variant={circle.variant} rotate={circle.rotate}>
      {circle.state === 'tournament' ? (
        <Icon name="flag" size={16} color={colors.sandGlow} />
      ) : (
        <Txt style={{ fontFamily: fonts.extrabold, fontSize: 13, color: '#fff' }}>{circle.count}</Txt>
      )}
    </RingBadge>
  );
}

function CircleRow({ circle, last, onPress }: { circle: Circle; last?: boolean; onPress: () => void }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <RingThumb circle={circle} />
      <View style={{ flex: 1 }}>
        <Txt style={styles.rowTitle}>{circle.title}</Txt>
        <Txt style={styles.rowMeta}>{circle.meta}</Txt>
      </View>
      <Pressable
        onPress={onPress}
        style={[styles.actionBtn, circle.actionKind === 'filled' ? styles.actionFilled : styles.actionOutline]}
      >
        <Txt style={[styles.actionTxt, { color: circle.actionKind === 'filled' ? '#fff' : colors.petrol }]}>
          {circle.action}
        </Txt>
      </Pressable>
    </View>
  );
}

export default function MapList() {
  const router = useRouter();
  const { height: winH } = useWindowDimensions();

  // 0 = expanded, restOffset = default half-screen position
  const restOffset = (DEFAULT_TOP - EXPANDED_TOP) * winH;
  const translateY = useSharedValue(restOffset);
  const startY = useSharedValue(0);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-10, 10])
        .onBegin(() => {
          startY.value = translateY.value;
        })
        .onUpdate((e) => {
          translateY.value = Math.min(Math.max(startY.value + e.translationY, 0), restOffset);
        })
        .onEnd((e) => {
          const target =
            e.velocityY < -500
              ? 0
              : e.velocityY > 500
                ? restOffset
                : translateY.value < restOffset / 2
                  ? 0
                  : restOffset;
          translateY.value = withSpring(target, { velocity: e.velocityY, damping: 18, stiffness: 180 });
        }),
    [restOffset],
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandBg }}>
      <View style={styles.mapWrap}>
        <LiveMap
          onMarkerPress={(m) =>
            m.state === 'tournament'
              ? router.push('/tournament')
              : router.push({ pathname: '/c/[id]', params: { id: m.id } })
          }
        >
          <View style={styles.filterRow} pointerEvents="box-none">
            <Chip label="כל הענפים" active onPress={() => {}} trailing={<Icon name="chevronDown" size={11} color="#fff" />} />
            <Chip label="בינוניים" onPress={() => {}} style={styles.chipBlur} />
            <Chip label='עד 2 ק"מ' onPress={() => {}} style={styles.chipBlur} />
          </View>
        </LiveMap>
      </View>

      {/* bottom sheet — drag the header up/down to expand/collapse */}
      <Animated.View style={[styles.sheet, { top: EXPANDED_TOP * winH }, sheetStyle]}>
        <GestureDetector gesture={pan} touchAction="none">
          <View style={styles.grabZone}>
            <View style={styles.dragHandle} />
            <View style={styles.sheetHeader}>
              <Txt style={styles.sheetTitle}>5 מעגלים סביבך</Txt>
              <Txt style={styles.sheetSub}>ת&quot;א · יפו</Txt>
            </View>
          </View>
        </GestureDetector>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
          {CIRCLES.map((c, i) => (
            <CircleRow key={c.id} circle={c} last={i === CIRCLES.length - 1} onPress={() => router.push(c.route as any)} />
          ))}
        </ScrollView>
      </Animated.View>

      <TabBar active="map" />
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: { position: 'absolute', top: 0, left: 0, right: 0, height: '54%', overflow: 'hidden' },
  filterRow: {
    position: 'absolute',
    top: 64,
    left: 16,
    right: 16,
    flexDirection: 'row-reverse',
    gap: 8,
  },
  chipBlur: { backgroundColor: 'rgba(255,253,246,0.92)', ...shadows.card },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    ...shadows.floatMap,
  },
  grabZone: { paddingTop: 10, paddingBottom: 4 },
  dragHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(18,48,58,0.18)',
    alignSelf: 'center',
  },
  sheetHeader: { flexDirection: 'row-reverse', alignItems: 'baseline', gap: 8, marginTop: 14 },
  sheetTitle: { fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 34, color: colors.petrol },
  sheetSub: { fontSize: 12.5, color: colors.faint },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14, paddingVertical: 13 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(14,79,94,0.09)' },
  rowTitle: { fontSize: 15.5, fontFamily: fonts.bold, color: colors.ink },
  rowMeta: { fontSize: 12.5, color: colors.faint, marginTop: 2 },
  actionBtn: { height: 38, paddingHorizontal: 18, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  actionFilled: { backgroundColor: colors.sunset },
  actionOutline: { borderWidth: 1.5, borderColor: 'rgba(14,79,94,0.25)' },
  actionTxt: { fontSize: 13.5, fontFamily: fonts.bold },
});
