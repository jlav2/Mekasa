import { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { Screen, Txt, SandRing, ProBadge, Icon, DecorRing } from '../../src/components';
import { colors, fonts, shadows } from '../../src/theme';
import { useStore } from '../../src/store';
import type { Level, Sport } from '../../src/data/models';

const SPORT_META: Record<Sport, { label: string; icon: Sport }> = {
  footvolley: { label: "פוצ'יוולי", icon: 'footvolley' },
  altinha: { label: 'אלטינה', icon: 'altinha' },
  volleyball: { label: 'כדורעף חופים', icon: 'volleyball' },
};

const LEVEL_LABEL: Record<Level, string> = { 1: 'מתחיל', 2: 'בינוני', 3: 'מתקדם', 4: 'מקצוען' };
const levelColor = (level: Level) => (level >= 4 ? colors.sunset : level >= 3 ? colors.amber : colors.live);

function SportIconGlyph({ sport }: { sport: Sport }) {
  if (sport === 'footvolley') {
    return (
      <Svg width={22} height={22} viewBox="0 0 32 32">
        <Circle cx={16} cy={11} r={7} fill="none" stroke={colors.petrol} strokeWidth={2.2} />
        <Path d="M4 26c8-4 16-4 24 0" fill="none" stroke={colors.petrol} strokeWidth={2.2} strokeLinecap="round" strokeDasharray="3 4" />
      </Svg>
    );
  }
  if (sport === 'volleyball') {
    return (
      <Svg width={22} height={22} viewBox="0 0 32 32">
        <Circle cx={16} cy={16} r={11} fill="none" stroke={colors.petrol} strokeWidth={2} />
        <Path
          d="M16 5c-4 5-4 17 0 22M16 5c4 5 4 17 0 22M6 12c6 2 14 2 20 0"
          fill="none"
          stroke={colors.petrol}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 32 32">
      <Circle cx={16} cy={16} r={11} fill="none" stroke={colors.petrol} strokeWidth={2} strokeDasharray="8 5" strokeLinecap="round" />
      <Circle cx={16} cy={6} r={2.4} fill={colors.petrol} />
      <Circle cx={25.5} cy={13} r={2.4} fill={colors.petrol} />
      <Circle cx={21.5} cy={24.5} r={2.4} fill={colors.petrol} />
      <Circle cx={10.5} cy={24.5} r={2.4} fill={colors.petrol} />
      <Circle cx={6.5} cy={13} r={2.4} fill={colors.petrol} />
    </Svg>
  );
}

function LevelDots({ filled, color }: { filled: number; color: string }) {
  return (
    <View style={{ flexDirection: 'row-reverse', gap: 3, alignItems: 'center' }}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i < filled ? color : 'rgba(14,79,94,.15)',
          }}
        />
      ))}
    </View>
  );
}

export default function Profile() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const circles = useStore((s) => s.circles);

  // Real activity, derived from the store (no fabricated totals).
  const stats = useMemo(() => {
    const mine = circles.filter((c) => c.players.some((p) => p.id === user.id));
    const beaches = new Set(mine.map((c) => c.beachId)).size;
    const partners = new Set(
      mine.flatMap((c) => c.players.map((p) => p.id)).filter((id) => id !== user.id),
    ).size;
    return { circles: mine.length, beaches, partners };
  }, [circles, user.id]);

  return (
    <Screen scroll contentStyle={{ paddingBottom: 120 }}>
      {/* header */}
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 16, marginTop: 8 }}>
        <SandRing size={88} color={colors.sunset} strokeWidth={2.5} rotate={-20} variant={3}>
          <View style={[styles.avatarInner, { backgroundColor: user.avatarColor }]}>
            <Txt style={{ fontSize: 30, fontFamily: fonts.bold, color: '#fff' }}>{user.avatarInitial}</Txt>
          </View>
        </SandRing>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
            <Txt style={{ fontFamily: fonts.displayBold, fontSize: 44, lineHeight: 44, color: colors.ink }}>{user.name}</Txt>
            {user.isPro && <ProBadge />}
          </View>
          <Txt style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>
            {user.city} · משחק מ־{user.memberSince}
          </Txt>
        </View>
        <Pressable onPress={() => router.push('/settings')} hitSlop={10} accessibilityRole="button" accessibilityLabel="הגדרות">

          <Svg width={20} height={20} viewBox="0 0 20 20">
            <Circle cx={10} cy={10} r={2} fill={colors.muted} />
            <Circle cx={10} cy={4} r={2} fill={colors.muted} />
            <Circle cx={10} cy={16} r={2} fill={colors.muted} />
          </Svg>
        </Pressable>
      </View>

      {/* stats */}
      <View style={{ flexDirection: 'row-reverse', gap: 10, marginTop: 20 }}>
        <View style={styles.statCard}>
          <Txt style={styles.statNum}>{stats.circles}</Txt>
          <Txt style={styles.statLabel}>מעגלים</Txt>
        </View>
        <View style={styles.statCard}>
          <Txt style={styles.statNum}>{stats.beaches}</Txt>
          <Txt style={styles.statLabel}>חופים</Txt>
        </View>
        <View style={styles.statCard}>
          <Txt style={styles.statNum}>{stats.partners}</Txt>
          <Txt style={styles.statLabel}>שותפים למשחק</Txt>
        </View>
      </View>

      {/* sports */}
      {user.sports.length > 0 && (
        <>
          <Txt style={styles.sectionTitle}>הענפים שלי</Txt>
          <View style={{ gap: 8, marginTop: 10 }}>
            {user.sports.map((s) => {
              const meta = SPORT_META[s.sport];
              const color = levelColor(s.level);
              return (
                <View key={s.sport} style={styles.sportRow}>
                  <SportIconGlyph sport={meta.icon} />
                  <Txt style={{ flex: 1, fontSize: 14.5, fontFamily: fonts.bold, color: colors.ink }}>{meta.label}</Txt>
                  <LevelDots filled={s.level} color={color} />
                  <Txt style={{ fontSize: 12, fontFamily: fonts.bold, color }}>{LEVEL_LABEL[s.level]}</Txt>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* beaches */}
      {user.homeBeaches.length > 0 && (
        <>
          <Txt style={styles.sectionTitle}>החופים הקבועים שלי</Txt>
          <View style={{ flexDirection: 'row-reverse', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {user.homeBeaches.map((b) => (
              <View key={b} style={styles.beachChip}>
                <Txt style={{ fontSize: 12.5, fontFamily: fonts.bold, color: colors.petrol }}>{b}</Txt>
              </View>
            ))}
          </View>
        </>
      )}

      {/* pro banner / upsell */}
      <Pressable onPress={() => router.push('/paywall')} style={styles.proBanner}>
        <DecorRing size={120} color={colors.sandGlow} opacity={0.16} strokeWidth={2.5} style={{ left: -30, top: -20 }} />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontSize: 15, fontFamily: fonts.extrabold, color: '#fff' }}>
            {user.isPro ? 'MeKasa Pro פעיל' : 'שדרג ל־MeKasa Pro'}
          </Txt>
          <Txt style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>
            {user.isPro ? 'עוקב אחרי החופים החשובים לך · נהל מנוי' : 'עד 5 חופים במעקב · טורנירים · בלי הגבלה'}
          </Txt>
        </View>
        <Icon name="chevronLeft" size={16} color="rgba(255,255,255,.6)" strokeWidth={2} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarInner: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 999,
    backgroundColor: colors.petrol,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  statNum: { fontFamily: fonts.displayBold, fontSize: 36, lineHeight: 36, color: colors.petrol },
  statLabel: { fontSize: 11.5, color: colors.faint, fontFamily: fonts.semibold, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontFamily: fonts.extrabold, color: colors.ink, marginTop: 22 },
  sportRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  beachChip: { backgroundColor: colors.chipBg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 7 },
  proBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.petrol,
    borderRadius: 22,
    padding: 16,
    paddingHorizontal: 18,
    marginTop: 26,
    overflow: 'hidden',
    ...shadows.petrolHero,
  },
});
