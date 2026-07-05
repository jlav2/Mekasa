import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { Screen, Txt, SandRing, ProBadge, Icon, DecorRing } from '../../src/components';
import { colors, fonts, shadows } from '../../src/theme';

type Sport = {
  name: string;
  icon: 'footvolley' | 'altinha';
  levelColor: string;
  levelLabel: string;
  filled: number;
};

const SPORTS: Sport[] = [
  { name: "פוצ'יוולי", icon: 'footvolley', levelColor: colors.sunset, levelLabel: 'מקצוען', filled: 3 },
  { name: 'אלטינה', icon: 'altinha', levelColor: colors.live, levelLabel: 'בינוני', filled: 2 },
];

const BEACHES = ['חוף פרישמן', 'חוף גורדון', 'מצודת הים'];

function SportIconGlyph({ sport }: { sport: Sport['icon'] }) {
  if (sport === 'footvolley') {
    return (
      <Svg width={22} height={22} viewBox="0 0 32 32">
        <Circle cx={16} cy={11} r={7} fill="none" stroke={colors.petrol} strokeWidth={2.2} />
        <Path d="M4 26c8-4 16-4 24 0" fill="none" stroke={colors.petrol} strokeWidth={2.2} strokeLinecap="round" strokeDasharray="3 4" />
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

  return (
    <Screen scroll contentStyle={{ paddingBottom: 120 }}>
      {/* header */}
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 16, marginTop: 8 }}>
        <SandRing size={88} color={colors.sunset} strokeWidth={2.5} rotate={-20} variant={3}>
          <View style={styles.avatarInner}>
            <Txt style={{ fontSize: 30, fontFamily: fonts.bold, color: '#fff' }}>ג</Txt>
          </View>
        </SandRing>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
            <Txt style={{ fontFamily: fonts.displayBold, fontSize: 44, lineHeight: 44, color: colors.ink }}>גיא לוי</Txt>
            <ProBadge />
          </View>
          <Txt style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>תל אביב · משחק מ־2023</Txt>
        </View>
        <Pressable onPress={() => router.push('/settings')} hitSlop={10}>
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
          <Txt style={styles.statNum}>47</Txt>
          <Txt style={styles.statLabel}>מעגלים</Txt>
        </View>
        <View style={styles.statCard}>
          <Txt style={styles.statNum}>12</Txt>
          <Txt style={styles.statLabel}>חופים</Txt>
        </View>
        <View style={styles.statCard}>
          <Txt style={styles.statNum}>128</Txt>
          <Txt style={styles.statLabel}>שותפים למשחק</Txt>
        </View>
      </View>

      {/* sports */}
      <Txt style={styles.sectionTitle}>הענפים שלי</Txt>
      <View style={{ gap: 8, marginTop: 10 }}>
        {SPORTS.map((s) => (
          <View key={s.name} style={styles.sportRow}>
            <SportIconGlyph sport={s.icon} />
            <Txt style={{ flex: 1, fontSize: 14.5, fontFamily: fonts.bold, color: colors.ink }}>{s.name}</Txt>
            <LevelDots filled={s.filled} color={s.levelColor} />
            <Txt style={{ fontSize: 12, fontFamily: fonts.bold, color: s.levelColor }}>{s.levelLabel}</Txt>
          </View>
        ))}
      </View>

      {/* beaches */}
      <Txt style={styles.sectionTitle}>החופים הקבועים שלי</Txt>
      <View style={{ flexDirection: 'row-reverse', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        {BEACHES.map((b) => (
          <View key={b} style={styles.beachChip}>
            <Txt style={{ fontSize: 12.5, fontFamily: fonts.bold, color: colors.petrol }}>{b}</Txt>
          </View>
        ))}
      </View>

      {/* pro banner */}
      <Pressable onPress={() => router.push('/paywall')} style={styles.proBanner}>
        <DecorRing size={120} color={colors.sandGlow} opacity={0.16} strokeWidth={2.5} style={{ left: -30, top: -20 }} />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontSize: 15, fontFamily: fonts.extrabold, color: '#fff' }}>MeKasa Pro פעיל</Txt>
          <Txt style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>מתחדש ב־12.8.26 · נהל מנוי</Txt>
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
