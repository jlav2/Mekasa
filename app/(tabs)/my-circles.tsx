import { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen,
  Txt,
  Card,
  Badge,
  ProBadge,
  Button,
  SegmentedControl,
  StatusDot,
  AvatarStack,
  DecorRing,
  RingBadge,
  Icon,
  Skeleton,
} from '../../src/components';
import { colors, fonts } from '../../src/theme';
import { useStore } from '../../src/store';
import type { Circle } from '../../src/data/models';

// 9b — shown while the store's first circles fetch is still in flight.
function ListRowSkeleton({ opacity = 1 }: { opacity?: number }) {
  return (
    <View style={[styles.rowSkeleton, { opacity }]}>
      <Skeleton width={48} height={48} radius={24} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton width={180} height={16} radius={6} delay={100} />
        <Skeleton width={120} height={12} radius={6} delay={200} />
      </View>
    </View>
  );
}

function MyCirclesSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.sandBg }}>
      <Screen contentStyle={{ paddingTop: 24 }}>
        <Txt style={{ fontFamily: fonts.displayBold, fontSize: 56, lineHeight: 56, color: colors.petrol }}>
          המעגלים שלי
        </Txt>
        <SegmentedControl options={['קרובים', 'קבועים', 'היסטוריה']} value={0} activeColor={colors.petrol} style={{ marginTop: 14 }} />

        <Card floating radius={22} pad={16} style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
            <Skeleton width={130} height={22} radius={11} />
            <Skeleton width={70} height={12} radius={6} delay={100} />
          </View>
          <Skeleton width={220} height={26} radius={8} delay={200} style={{ marginTop: 12 }} />
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={{ marginRight: i === 0 ? 0 : -8 }}>
                <Skeleton width={32} height={32} radius={16} delay={i * 150} style={{ borderWidth: 2, borderColor: colors.card }} />
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row-reverse', gap: 8, marginTop: 14 }}>
            <Skeleton width={100} height={44} radius={22} />
            <View style={{ flex: 1, height: 44, borderRadius: 22, backgroundColor: 'rgba(14,79,94,.08)' }} />
          </View>
        </Card>

        <View style={{ gap: 10, marginTop: 10 }}>
          <ListRowSkeleton opacity={1} />
          <ListRowSkeleton opacity={0.7} />
          <ListRowSkeleton opacity={0.45} />
        </View>
      </Screen>
    </View>
  );
}

export default function MyCircles() {
  const router = useRouter();
  const loading = useStore((s) => s.loading);
  const [tab, setTab] = useState(0);
  const user = useStore((s) => s.user);
  const circles = useStore((s) => s.circles);

  const { mine, liveNow, upcoming, beachCount } = useMemo(() => {
    const mine = circles.filter((c) => c.players.some((p) => p.id === user.id));
    return {
      mine,
      liveNow: mine.filter((c) => c.state === 'live'),
      upcoming: mine.filter((c) => c.state === 'scheduled' || c.state === 'missing' || c.state === 'full'),
      beachCount: new Set(mine.map((c) => c.beachId)).size,
    };
  }, [circles, user.id]);

  const onTab = (i: number) => {
    if (i === 1) router.replace('/recurring');
    else if (i === 2) router.replace('/history');
    else setTab(0);
  };

  if (loading) return <MyCirclesSkeleton />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandBg }}>
      <Screen scroll contentStyle={{ paddingBottom: 120, paddingTop: 24 }}>
        <Txt style={{ fontFamily: fonts.displayBold, fontSize: 56, lineHeight: 56, color: colors.petrol }}>
          המעגלים שלי
        </Txt>
        <SegmentedControl
          options={['קרובים', 'קבועים', 'היסטוריה']}
          value={tab}
          onChange={onTab}
          activeColor={colors.petrol}
          style={{ marginTop: 14 }}
        />

        {mine.length === 0 ? (
          <EmptyState onPress={() => router.push('/map')} />
        ) : (
          <View style={{ gap: 10, marginTop: 16 }}>
            {liveNow.map((c) => (
              <LiveCard
                key={c.id}
                circle={c}
                onChat={() => router.push({ pathname: '/chat', params: { circle: c.id } })}
                onOpen={() => router.push({ pathname: '/c/[id]', params: { id: c.id } })}
              />
            ))}

            {upcoming.map((c) => {
              const isHost = c.hostId === user.id;
              const missing = c.capacity - c.players.length;
              const scheduled = c.state === 'scheduled';
              const meta =
                `${c.startLabel} · ${isHost ? 'פתחת את המעגל' : 'הצטרפת'}` +
                (missing > 0 ? ` · חסרים ${missing}` : '');
              return (
                <UpcomingRow
                  key={c.id}
                  ringColor={scheduled ? colors.live : colors.sunset}
                  ringRotate={scheduled ? 80 : -70}
                  center={
                    <Txt style={{ fontSize: 11, fontFamily: fonts.extrabold, color: '#fff' }}>
                      {c.players.length}/{c.capacity}
                    </Txt>
                  }
                  centerBg={scheduled ? colors.live : colors.sunset}
                  title={`${c.sportLabel} · ${c.beachName}`}
                  meta={meta}
                  badge={
                    isHost ? (
                      <Badge label="שלך" bg="rgba(255,107,44,.12)" color={colors.sunsetDeep} />
                    ) : (
                      <Badge label="קרוב" bg={colors.chipBg} color={colors.petrol} />
                    )
                  }
                  onPress={() => router.push({ pathname: '/c/[id]', params: { id: c.id } })}
                />
              );
            })}

            {/* recurring pro teaser — a forward-looking Pro feature, clearly marked */}
            <View style={styles.recurringCard}>
              <View style={styles.recurringIcon}>
                <Icon name="repeat" size={22} color={colors.sunset} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt style={{ fontSize: 14, fontFamily: fonts.bold, color: colors.ink }}>מעגלים קבועים</Txt>
                <Txt style={{ fontSize: 12.5, color: colors.muted, marginTop: 2, fontFamily: fonts.medium }}>
                  קבע מעגל שחוזר כל שבוע ונפתח אוטומטית
                </Txt>
              </View>
              <ProBadge size={10.5} />
            </View>

            {/* real summary line */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryLine} />
              <Txt style={{ fontSize: 12, fontFamily: fonts.bold, color: colors.faint }}>
                אתה ב־{mine.length} מעגלים · {beachCount} חופים
              </Txt>
              <View style={styles.summaryLine} />
            </View>
          </View>
        )}
      </Screen>
    </View>
  );
}

function LiveCard({ circle, onChat, onOpen }: { circle: Circle; onChat: () => void; onOpen: () => void }) {
  const full = circle.players.length >= circle.capacity;
  return (
    <Card petrol floating style={{ overflow: 'hidden' }}>
      <DecorRing size={190} style={{ left: -55, top: -40 }} />
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
        <View style={styles.liveBadge}>
          <StatusDot color="#fff" size={7} />
          <Txt style={{ color: '#fff', fontSize: 11.5, fontFamily: fonts.extrabold }}>משחק חי — אתה בפנים</Txt>
        </View>
        <Txt style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,.75)', fontFamily: fonts.medium }}>
          {circle.startLabel}
        </Txt>
      </View>
      <Txt style={{ fontFamily: fonts.displayBold, fontSize: 36, lineHeight: 36, color: '#fff', marginTop: 10 }}>
        {circle.sportLabel} · {circle.beachName}
      </Txt>
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <AvatarStack
          size={32}
          people={circle.players.map((p) => ({ letter: p.avatarInitial, color: p.avatarColor }))}
        />
        <Txt style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)', fontFamily: fonts.medium }}>
          {circle.players.length}/{circle.capacity}
          {full ? ' · מלא' : ''} · {circle.court}
        </Txt>
      </View>
      <View style={{ flexDirection: 'row-reverse', gap: 8, marginTop: 14 }}>
        <Button label="פתח צ'אט" size="sm" style={{ flex: 1, height: 42, borderRadius: 21 }} onPress={onChat} />
        <Button
          label="פרטים"
          size="sm"
          variant="ghost"
          style={{ height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,.14)', paddingHorizontal: 18 }}
          fontSize={14}
          onPress={onOpen}
        />
      </View>
    </Card>
  );
}

function EmptyState({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.empty}>
      <RingBadge size={72} color={colors.sunset} centerBg={colors.petrol} variant={3} rotate={-20}>
        <Icon name="pin" size={22} color="#fff" strokeWidth={1.8} />
      </RingBadge>
      <Txt style={{ fontFamily: fonts.displayBold, fontSize: 26, color: colors.petrol, marginTop: 16 }}>
        עדיין אין לך מעגלים
      </Txt>
      <Txt style={{ fontSize: 13.5, color: colors.muted, fontFamily: fonts.medium, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
        צא למפה, מצא משחק פתוח על החול{'\n'}והצטרף בלחיצה אחת
      </Txt>
      <Button label="למפה" size="md" style={{ marginTop: 18, paddingHorizontal: 32 }} onPress={onPress} />
    </View>
  );
}

function UpcomingRow({ ringColor, ringRotate, center, centerBg, title, meta, badge, onPress }: any) {
  return (
    <Pressable onPress={onPress}>
      <Card floating={false} pad={14} style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
        <RingBadge size={48} color={ringColor} centerBg={centerBg} variant={2} rotate={ringRotate}>
          {center}
        </RingBadge>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontSize: 14.5, fontFamily: fonts.bold, color: colors.ink }}>{title}</Txt>
          <Txt style={{ fontSize: 12.5, color: colors.muted, marginTop: 2, fontFamily: fonts.medium }}>{meta}</Txt>
        </View>
        {badge}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  liveBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: colors.live, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  recurringCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,107,44,.45)',
  },
  recurringIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,107,44,.1)', alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 6, opacity: 0.7 },
  summaryLine: { flex: 1, height: 1, backgroundColor: 'rgba(14,79,94,.14)' },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: 24 },
  rowSkeleton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 18,
    padding: 14,
  },
});
