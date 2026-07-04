import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  LiveMap,
  TabBar,
  Card,
  Txt,
  Button,
  Chip,
  StatusDot,
  AvatarStack,
  Icon,
} from '../src/components';
import { colors, fonts, shadows } from '../src/theme';

function Dot({ color }: { color: string }) {
  return <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: color }} />;
}

export default function Map() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandBg }}>
      <LiveMap
        onMarkerPress={(m) =>
          router.push(m.state === 'tournament' ? '/tournament' : '/circle-detail')
        }
      >
        {/* top filters */}
        <View style={styles.filters} pointerEvents="box-none">
          <View style={styles.filterRow}>
            <Chip
              label="כל הענפים"
              active
              onPress={() => {}}
              trailing={<Icon name="chevronDown" size={11} color="#fff" />}
            />
            <Chip
              label="בינוניים"
              onPress={() => {}}
              trailing={<Icon name="chevronDown" size={11} color={colors.muted} />}
              style={styles.chipBlur}
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

      {/* bottom floating card — nearest circle */}
      <Card floating radius={24} pad={16} style={styles.card}>
        <View style={styles.statusRow}>
          <StatusDot color={colors.sunset} size={9} />
          <Txt style={styles.statusTxt}>חסר שחקן · 300 מ&apos; ממך</Txt>
          <Txt style={styles.nowTxt}>עכשיו</Txt>
        </View>
        <View style={styles.mainRow}>
          <View style={{ flex: 1 }}>
            <Txt style={styles.title}>פוצ&apos;יוולי · חוף פרישמן</Txt>
            <Txt style={styles.meta}>רמה בינונית · מגרש 2, ליד המציל</Txt>
          </View>
          <AvatarStack
            people={[
              { letter: 'ע', colorIndex: 0 },
              { letter: 'ד', colorIndex: 1 },
              { letter: 'נ', colorIndex: 2 },
            ]}
            size={38}
            border={colors.card}
            emptySlot
            emptyLabel="+"
            emptyBorder={colors.sunset}
          />
        </View>
        <Button label="אני בפנים" size="lg" style={{ marginTop: 14 }} onPress={() => router.push('/circle-detail')} />
      </Card>

      <TabBar active="map" />
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
