import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LiveMap, Card, Txt, AvatarStack, StatusDot, Icon } from '../src/components';
import { colors, fonts, radii } from '../src/theme';

type ChipDef = { label: string; selected?: boolean };
const CHIPS: ChipDef[] = [
  { label: 'כל הענפים', selected: true },
  { label: 'בינוניים' },
  { label: 'עד 2 ק"מ' },
];

function M3Chip({ label, selected }: ChipDef) {
  return (
    <View style={[styles.chip, selected ? styles.chipSelected : styles.chipOutlined]}>
      {selected && <Icon name="check" size={12} color="#fff" strokeWidth={2.6} />}
      <Txt style={[styles.chipTxt, selected && { color: '#fff' }]}>{label}</Txt>
      {!selected && <Icon name="chevronDown" size={11} color="#49454F" strokeWidth={2} />}
    </View>
  );
}

function NavItem({
  icon,
  label,
  active,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
}) {
  return (
    <View style={styles.navItem}>
      <View style={[styles.navIndicator, active && styles.navIndicatorActive]}>
        {icon}
        {badge ? (
          <View style={styles.navBadge}>
            <Txt style={styles.navBadgeTxt}>{badge}</Txt>
          </View>
        ) : null}
      </View>
      <Txt style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Txt>
    </View>
  );
}

export default function MapAndroid() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandMap }}>
      <LiveMap
        onMarkerPress={(m) =>
          router.push(m.state === 'tournament' ? '/tournament' : '/circle-detail-android')
        }
      />

      {/* M3 search bar */}
      <View style={[styles.searchBar, { top: insets.top + 12 }]}>
        <Icon name="menu" size={20} color="#49454F" strokeWidth={1.8} />
        <Txt style={styles.searchPlaceholder}>חפש חוף או מעגל</Txt>
        <View style={styles.avatar}>
          <Txt style={styles.avatarTxt}>ג</Txt>
        </View>
      </View>

      {/* M3 filter chips */}
      <View style={[styles.chipsRow, { top: insets.top + 80 }]}>
        {CHIPS.map((c) => (
          <M3Chip key={c.label} {...c} />
        ))}
      </View>

      {/* floating nearest-circle card */}
      <Card floating radius={16} pad={16} style={styles.card}>
        <View style={styles.statusRow}>
          <StatusDot color={colors.sunset} size={8} />
          <Txt style={styles.statusTxt}>חסר שחקן · 300 מ&apos; ממך</Txt>
        </View>
        <Txt style={styles.title}>פוצ&apos;יוולי · חוף פרישמן</Txt>
        <Txt style={styles.meta}>רמה בינונית · מגרש 2, ליד המציל</Txt>
        <View style={styles.actionsRow}>
          <Pressable style={styles.joinBtn} onPress={() => router.push('/circle-detail-android')}>
            <Txt style={styles.joinTxt}>אני בפנים</Txt>
          </Pressable>
          <Pressable style={styles.detailsBtn} onPress={() => router.push('/circle-detail-android')}>
            <Txt style={styles.detailsTxt}>פרטים</Txt>
          </Pressable>
        </View>
      </Card>

      {/* extended FAB */}
      <Pressable style={[styles.fab, { bottom: 100 }]} onPress={() => router.push('/create-circle')}>
        <Icon name="plus" size={18} color="#fff" strokeWidth={2.4} />
        <Txt style={styles.fabTxt}>פתח מעגל</Txt>
      </Pressable>

      {/* M3 bottom nav */}
      <View style={[styles.navBar, { paddingBottom: insets.bottom * 0.4 }]}>
        <NavItem
          active
          icon={<Icon name="ball" size={20} color="#B14A17" strokeWidth={2.2} />}
          label="מפה"
        />
        <NavItem icon={<Icon name="users" size={20} color="#49454F" strokeWidth={2} />} label="המעגלים שלי" />
        <NavItem icon={<Icon name="bell" size={20} color="#49454F" strokeWidth={2} />} label="התראות" badge={3} />
        <NavItem icon={<Icon name="settings" size={20} color="#49454F" strokeWidth={1.8} />} label="פרופיל" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 56,
    borderRadius: radii.androidSearch,
    backgroundColor: colors.card,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    shadowColor: '#12303A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  searchPlaceholder: { flex: 1, fontSize: 15, color: '#49454F', fontFamily: fonts.medium },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.petrol, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 14, fontFamily: fonts.semibold, color: '#fff' },
  chipsRow: { position: 'absolute', left: 16, right: 16, flexDirection: 'row-reverse', gap: 8 },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.androidChip,
  },
  chipSelected: { backgroundColor: colors.petrol },
  chipOutlined: { backgroundColor: colors.card, borderWidth: 1, borderColor: 'rgba(14,79,94,.28)' },
  chipTxt: { fontSize: 13.5, fontFamily: fonts.semibold, color: colors.ink },
  card: { position: 'absolute', left: 16, right: 16, bottom: 170 },
  statusRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  statusTxt: { fontSize: 12, fontFamily: fonts.bold, color: colors.sunset },
  title: { fontSize: 18, fontFamily: fonts.bold, color: colors.ink, marginTop: 6 },
  meta: { fontSize: 13, color: colors.muted, marginTop: 2, fontFamily: fonts.medium },
  actionsRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginTop: 12 },
  joinBtn: { flex: 1, height: 40, borderRadius: 20, backgroundColor: colors.sunset, alignItems: 'center', justifyContent: 'center' },
  joinTxt: { fontSize: 14, fontFamily: fonts.semibold, color: '#fff' },
  detailsBtn: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(14,79,94,.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsTxt: { fontSize: 14, fontFamily: fonts.semibold, color: colors.petrol },
  fab: {
    position: 'absolute',
    right: 16,
    height: 56,
    borderRadius: radii.androidFab,
    backgroundColor: colors.sunset,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    shadowColor: colors.sunset,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  fabTxt: { fontSize: 15, fontFamily: fonts.semibold, color: '#fff' },
  navBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: '#FBF4E4',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    shadowColor: '#12303A',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.08,
    shadowRadius: 0,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navIndicator: { width: 64, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  navIndicatorActive: { backgroundColor: 'rgba(255,107,44,.18)' },
  navBadge: {
    position: 'absolute',
    top: -2,
    left: 10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#B3261E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  navBadgeTxt: { fontSize: 10, fontFamily: fonts.semibold, color: '#fff' },
  navLabel: { fontSize: 11, fontFamily: fonts.medium, color: '#49454F' },
  navLabelActive: { fontFamily: fonts.bold, color: '#B14A17' },
});
