import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle as SvgCircle, Path as SvgPath } from 'react-native-svg';
import {
  Screen,
  Txt,
  Icon,
  SportIcon,
  SegmentedControl,
  Stepper,
  Toggle,
  Button,
} from '../src/components';
import { colors, fonts, shadows } from '../src/theme';

type Sport = { key: string; name: string; icon: 'footvolley' | 'altinha' | 'volleyball' };
const SPORTS: Sport[] = [
  { key: 'footvolley', name: "פוצ'יוולי", icon: 'footvolley' },
  { key: 'altinha', name: 'אלטינה', icon: 'altinha' },
  { key: 'volleyball', name: 'כדורעף', icon: 'volleyball' },
];

const LEVELS = ['מתחילים', 'בינוניים', 'מקצוענים'];

export default function CreateCircle() {
  const router = useRouter();
  const [sport, setSport] = useState('footvolley');
  const [timeIdx, setTimeIdx] = useState(0);
  const [missing, setMissing] = useState(3);
  const [levelIdx, setLevelIdx] = useState(1);
  const [open, setOpen] = useState(true);

  return (
    <Screen bg={colors.sandBg} contentStyle={{ paddingTop: 70, paddingBottom: 40, flexGrow: 1 }}>
      <View style={styles.titleRow}>
        <Txt style={styles.title}>פותחים מעגל</Txt>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Icon name="close" size={13} color={colors.muted} strokeWidth={2} />
        </Pressable>
      </View>
      <Txt style={styles.helper}>מי שבסביבה יקבל התראה ברגע שתפתח</Txt>

      <Txt style={styles.sectionLabel}>ענף</Txt>
      <View style={styles.sportsRow}>
        {SPORTS.map((sp) => {
          const on = sp.key === sport;
          return (
            <Pressable
              key={sp.key}
              onPress={() => setSport(sp.key)}
              style={[styles.sportTile, on ? styles.sportTileOn : styles.sportTileOff]}
            >
              <SportIcon sport={sp.icon} size={24} color={on ? colors.sandGlow : colors.muted} />
              <Txt style={[styles.sportTileTxt, { color: on ? '#fff' : colors.muted }]}>{sp.name}</Txt>
            </Pressable>
          );
        })}
      </View>

      <Txt style={styles.sectionLabel}>איפה?</Txt>
      <Pressable style={styles.locationRow} onPress={() => router.push('/beach-picker')}>
        <Svg width={20} height={20} viewBox="0 0 20 20">
          <SvgPath
            d="M10 18s-6.5-5.3-6.5-10A6.5 6.5 0 0110 1.5 6.5 6.5 0 0116.5 8c0 4.7-6.5 10-6.5 10z"
            fill="none"
            stroke={colors.sunset}
            strokeWidth={1.8}
          />
          <SvgCircle cx={10} cy={8} r={2.3} fill={colors.sunset} />
        </Svg>
        <View style={{ flex: 1 }}>
          <Txt style={styles.locationTitle}>חוף פרישמן · מגרש 2</Txt>
          <Txt style={styles.locationSub}>הכי קרוב אליך · 300 מ&apos;</Txt>
        </View>
        <Txt style={styles.locationChange}>שנה</Txt>
      </Pressable>

      <Txt style={styles.sectionLabel}>מתי?</Txt>
      <SegmentedControl
        options={['עכשיו', 'בעוד שעה', 'קבע זמן']}
        value={timeIdx}
        onChange={setTimeIdx}
        activeColor={colors.live}
        style={{ marginTop: 8 }}
      />

      <View style={styles.rowTwoCol}>
        <View style={{ flex: 1 }}>
          <Txt style={styles.sectionLabel}>כמה חסרים?</Txt>
          <View style={styles.stepperCard}>
            <Stepper value={missing} onChange={setMissing} min={1} max={9} />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Txt style={styles.sectionLabel}>רמה</Txt>
          <Pressable style={styles.levelDropdown}>
            <Txt style={styles.levelTxt}>{LEVELS[levelIdx]}</Txt>
            <Icon name="chevronDown" size={12} color={colors.muted} strokeWidth={1.8} />
          </Pressable>
        </View>
      </View>

      <View style={styles.toggleRow}>
        <View>
          <Txt style={styles.toggleTitle}>מעגל פתוח</Txt>
          <Txt style={styles.toggleSub}>כל מי שמתאים לרמה יכול להצטרף</Txt>
        </View>
        <Toggle value={open} onChange={setOpen} onColor={colors.live} />
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 24 }}>
        <Button
          label={timeIdx === 0 ? 'פתח מעגל — עכשיו' : 'פתח מעגל'}
          size="lg"
          onPress={() => router.push('/circle-share')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.displayBold, fontSize: 52, lineHeight: 52, color: colors.petrol },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(14,79,94,.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helper: { fontSize: 13.5, color: colors.muted, marginTop: 4 },
  sectionLabel: { fontSize: 13.5, fontFamily: fonts.extrabold, color: colors.ink, marginTop: 20 },
  sportsRow: { flexDirection: 'row-reverse', gap: 8, marginTop: 8 },
  sportTile: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 18,
  },
  sportTileOn: { backgroundColor: colors.petrol, ...shadows.petrolHero },
  sportTileOff: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.hairlineStrong },
  sportTileTxt: { fontSize: 12.5, fontFamily: fonts.bold },
  locationRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.hairlineStrong,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  locationTitle: { fontSize: 14.5, fontFamily: fonts.bold, color: colors.ink },
  locationSub: { fontSize: 12, color: colors.faint, marginTop: 1 },
  locationChange: { fontSize: 13, fontFamily: fonts.bold, color: colors.petrol },
  rowTwoCol: { flexDirection: 'row-reverse', gap: 16, marginTop: 4 },
  stepperCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.hairlineStrong,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  levelDropdown: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.hairlineStrong,
    borderRadius: 18,
    height: 36,
    marginTop: 8,
  },
  levelTxt: { fontSize: 14.5, fontFamily: fonts.bold, color: colors.ink },
  toggleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  toggleTitle: { fontSize: 14, fontFamily: fonts.bold, color: colors.ink },
  toggleSub: { fontSize: 12, color: colors.faint, marginTop: 2 },
});
