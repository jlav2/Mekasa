import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen,
  Txt,
  Button,
  ProgressDashes,
  SegmentedControl,
  SportIcon,
  Icon,
} from '../src/components';
import { colors, fonts, shadows } from '../src/theme';

type Sport = { key: string; name: string; sub: string; icon: 'footvolley' | 'altinha' | 'volleyball' };
const SPORTS: Sport[] = [
  { key: 'footvolley', name: "פוצ'יוולי", sub: 'רגליים בלבד, מעל הרשת', icon: 'footvolley' },
  { key: 'altinha', name: 'אלטינה', sub: 'מעגל, בלי רשת, בלי נפילות', icon: 'altinha' },
  { key: 'volleyball', name: 'כדורעף חופים', sub: 'זוגות או רביעיות', icon: 'volleyball' },
];

export default function OnboardingSport() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(['footvolley', 'altinha']);
  const [level, setLevel] = useState(1);
  const toggle = (k: string) =>
    setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  return (
    <Screen>
      <View style={{ paddingTop: 30, flex: 1 }}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
          <ProgressDashes total={3} active={0} />
          <Pressable onPress={() => router.replace('/map')} style={{ marginLeft: 'auto' }}>
            <Txt style={{ fontFamily: fonts.semibold, fontSize: 13, color: colors.faint }}>דלג</Txt>
          </Pressable>
        </View>

        <Txt style={{ fontFamily: fonts.displayBold, fontSize: 56, lineHeight: 56, color: colors.petrol, marginTop: 26 }}>
          מה אתה משחק?
        </Txt>
        <Txt variant="secondary" style={{ marginTop: 6, fontSize: 14.5 }}>אפשר לבחור יותר מענף אחד</Txt>

        <View style={{ gap: 12, marginTop: 22 }}>
          {SPORTS.map((sp) => {
            const on = selected.includes(sp.key);
            return (
              <Pressable
                key={sp.key}
                onPress={() => toggle(sp.key)}
                style={[styles.card, on ? styles.cardOn : styles.cardOff]}
              >
                <View style={[styles.iconWrap, { backgroundColor: on ? 'rgba(255,255,255,.12)' : colors.chipBg }]}>
                  <SportIcon sport={sp.icon} size={30} color={on ? colors.sandGlow : colors.petrol} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontFamily: fonts.bold, fontSize: 17, color: on ? '#fff' : colors.ink }}>{sp.name}</Txt>
                  <Txt style={{ fontSize: 12.5, color: on ? 'rgba(255,255,255,.65)' : colors.faint, fontFamily: fonts.medium }}>
                    {sp.sub}
                  </Txt>
                </View>
                <View style={[styles.check, on ? { backgroundColor: colors.sunset } : { borderWidth: 1.5, borderColor: colors.hairlineStrong }]}>
                  {on && <Icon name="check" size={15} color="#fff" strokeWidth={2.6} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Txt style={{ fontFamily: fonts.bold, fontSize: 15, color: colors.petrol, marginTop: 26 }}>באיזו רמה?</Txt>
        <SegmentedControl
          options={['מתחילים', 'בינוניים', 'מקצוענים']}
          value={level}
          onChange={setLevel}
          style={{ marginTop: 10 }}
        />

        <View style={{ marginTop: 'auto', paddingTop: 24 }}>
          <Button label="יאללה, למפה" size="lg" onPress={() => router.replace('/onboarding-permissions')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16, borderRadius: 22, padding: 16 },
  cardOn: { backgroundColor: colors.petrol, ...shadows.petrolHero },
  cardOff: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.hairlineStrong },
  iconWrap: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  check: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
