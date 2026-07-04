import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { LiveMap, TabBar, Card, Txt, Button, Chip, Icon } from '../src/components';
import { colors, fonts, shadows } from '../src/theme';

function EmptyIllustration() {
  return (
    <Svg width={96} height={96} viewBox="0 0 96 96">
      <Circle
        cx={48}
        cy={48}
        r={38}
        fill="none"
        stroke="#C9BA9B"
        strokeWidth={4}
        strokeDasharray="70 12 54 14 60 10"
        strokeLinecap="round"
      />
      <Circle
        cx={48}
        cy={48}
        r={24}
        fill="none"
        stroke={colors.sunset}
        strokeWidth={3.5}
        strokeDasharray="6 9"
        strokeLinecap="round"
      />
      <Path d="M48 40v16M40 48h16" stroke={colors.sunset} strokeWidth={3.5} strokeLinecap="round" />
    </Svg>
  );
}

export default function MapEmpty() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandBg }}>
      {/* empty state: no circle markers, muted map */}
      <LiveMap dim markers={[]}>
        <View style={styles.filterRow} pointerEvents="box-none">
          <Chip label="אלטינה" active onPress={() => {}} trailing={<Icon name="chevronDown" size={11} color="#fff" />} />
          <Chip label="מקצוענים" onPress={() => {}} style={styles.chipBlur} />
          <Chip label='עד 1 ק"מ' onPress={() => {}} style={styles.chipBlur} />
        </View>
      </LiveMap>

      <Card floating radius={28} pad={26} style={styles.card}>
        <EmptyIllustration />
        <Txt style={styles.title}>החול פנוי לגמרי</Txt>
        <Txt style={styles.copy}>אין מעגלים פעילים לידך כרגע. פתח אחד — ומי שבסביבה יקבל התראה.</Txt>
        <Button
          label="פתח מעגל עכשיו"
          size="lg"
          style={{ marginTop: 22, alignSelf: 'stretch' }}
          onPress={() => router.push('/create-circle')}
        />
        <Pressable onPress={() => {}}>
          <Txt style={styles.link}>או הרחב את החיפוש ל־5 ק&quot;מ</Txt>
        </Pressable>
      </Card>

      <TabBar active="map" />
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    position: 'absolute',
    top: 64,
    left: 16,
    right: 16,
    flexDirection: 'row-reverse',
    gap: 8,
  },
  chipBlur: { backgroundColor: 'rgba(255,253,246,0.92)' },
  card: {
    position: 'absolute',
    left: 30,
    right: 30,
    top: 266,
    alignItems: 'center',
    ...shadows.floatMap,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 40,
    lineHeight: 40,
    color: colors.petrol,
    marginTop: 18,
    textAlign: 'center',
  },
  copy: {
    fontSize: 14.5,
    color: colors.muted,
    lineHeight: 23,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 240,
  },
  link: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.petrol,
    marginTop: 14,
    textDecorationLine: 'underline',
  },
});
