import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { Screen, Txt, Button, Avatar } from '../src/components';
import { colors, fonts } from '../src/theme';

type Vibe = 'ok' | 'great' | 'meh';

function FaceOk({ color }: { color: string }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={1.8} />
      <Path d="M8 14.5c1.2 1 2.5 1.5 4 1.5M8.5 10h.01M15.5 10h.01" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function FaceGreat({ color }: { color: string }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={1.8} />
      <Path d="M7.5 13.5c1.4 1.8 2.9 2.7 4.5 2.7s3.1-.9 4.5-2.7M8.5 9.5h.01M15.5 9.5h.01" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function FaceMeh({ color }: { color: string }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={1.8} />
      <Path d="M8 16c1.2-1 2.5-1.5 4-1.5s2.8.5 4 1.5M8.5 10h.01M15.5 10h.01" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

const VIBES: { key: Vibe; label: string; Face: typeof FaceOk }[] = [
  { key: 'ok', label: 'סבבה', Face: FaceOk },
  { key: 'great', label: 'מעולה!', Face: FaceGreat },
  { key: 'meh', label: 'ככה־ככה', Face: FaceMeh },
];

type LevelChoice = 'lower' | 'accurate' | 'higher';

type Player = { letter: string; color: string; name: string };

const PLAYERS: Player[] = [
  { letter: 'ע', color: colors.petrol, name: 'עומר' },
  { letter: 'ד', color: colors.live, name: 'דניאל' },
  { letter: 'נ', color: colors.amber, name: 'נועה' },
];

function LevelChip({
  label,
  active,
  activeColor,
  onPress,
}: {
  label: string;
  active: boolean;
  activeColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.levelChip,
        active ? { backgroundColor: activeColor, borderColor: activeColor } : { borderColor: colors.hairlineStrong },
      ]}
    >
      <Txt style={{ fontSize: 12, fontFamily: fonts.bold, color: active ? '#fff' : colors.muted }}>{label}</Txt>
    </Pressable>
  );
}

export default function Rating() {
  const router = useRouter();
  const [vibe, setVibe] = useState<Vibe>('great');
  const [choices, setChoices] = useState<Record<string, LevelChoice>>({
    עומר: 'accurate',
    דניאל: 'higher',
    נועה: 'accurate',
  });
  const [noShow, setNoShow] = useState(false);

  const setChoice = (name: string, c: LevelChoice) =>
    setChoices((prev) => ({ ...prev, [name]: c }));

  return (
    <LinearGradient
      colors={['#FFC46B', '#FF9D52', '#F7EFDE', '#F7EFDE']}
      locations={[0, 0.22, 0.46, 1]}
      style={{ flex: 1 }}
    >
      <Screen bg="transparent" scroll contentStyle={{ paddingTop: 30, flexGrow: 1 }}>
        <View style={{ flex: 1 }}>
          <View style={{ alignItems: 'center' }}>
            <Txt style={{ fontSize: 13, fontFamily: fonts.bold, color: '#9A5B1E' }}>
              המעגל בפרישמן נסגר · 2.5 שעות
            </Txt>
            <Txt style={{ fontFamily: fonts.displayBold, fontSize: 56, lineHeight: 56, color: colors.ink, marginTop: 8 }}>
              איך היה?
            </Txt>
          </View>

          {/* vibe tiles */}
          <View style={{ flexDirection: 'row-reverse', gap: 10, marginTop: 18 }}>
            {VIBES.map(({ key, label, Face }) => {
              const active = vibe === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setVibe(key)}
                  style={[
                    styles.vibeTile,
                    active
                      ? { backgroundColor: colors.petrol, ...vibeShadow }
                      : { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.hairlineStrong },
                  ]}
                >
                  <Face color={active ? colors.sandGlow : colors.faint} />
                  <Txt style={{ fontSize: 12.5, fontFamily: fonts.bold, color: active ? '#fff' : colors.muted }}>
                    {label}
                  </Txt>
                </Pressable>
              );
            })}
          </View>

          {/* players confirm */}
          <Txt style={{ fontSize: 14, fontFamily: fonts.extrabold, color: colors.ink, marginTop: 24 }}>
            השחקנים — הרמה מדויקת?
          </Txt>
          <Txt style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
            זה מה ששומר על מעגלים ברמה הנכונה
          </Txt>

          <View style={{ gap: 8, marginTop: 12 }}>
            {PLAYERS.map((p) => {
              const choice = choices[p.name];
              return (
                <View key={p.name} style={styles.playerRow}>
                  <Avatar letter={p.letter} color={p.color} size={40} />
                  <View style={{ flex: 1 }}>
                    <Txt style={{ fontSize: 14, fontFamily: fonts.bold, color: colors.ink }}>{p.name}</Txt>
                    <Txt style={{ fontSize: 11.5, color: colors.faint }}>מוצהר: בינוני</Txt>
                  </View>
                  <View style={{ flexDirection: 'row-reverse', gap: 6 }}>
                    <LevelChip
                      label="נמוך יותר"
                      active={choice === 'lower'}
                      activeColor={colors.muted}
                      onPress={() => setChoice(p.name, 'lower')}
                    />
                    <LevelChip
                      label={choice === 'accurate' ? 'מדויק ✓' : 'מדויק'}
                      active={choice === 'accurate'}
                      activeColor={colors.live}
                      onPress={() => setChoice(p.name, 'accurate')}
                    />
                    <LevelChip
                      label={choice === 'higher' ? 'גבוה יותר ↑' : 'גבוה יותר'}
                      active={choice === 'higher'}
                      activeColor={colors.sunset}
                      onPress={() => setChoice(p.name, 'higher')}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* no-show */}
          <Pressable
            onPress={() => setNoShow((v) => !v)}
            style={{
              flexDirection: 'row-reverse',
              alignItems: 'center',
              gap: 10,
              minHeight: 44,
              marginTop: 14,
              paddingHorizontal: 4,
            }}
          >
            <View
              style={[
                styles.checkbox,
                noShow && { backgroundColor: colors.petrol, borderColor: colors.petrol },
              ]}
            />
            <Txt style={{ fontSize: 13, color: colors.muted, fontFamily: fonts.semibold }}>
              מישהו לא הגיע בכלל? סמן כדי לדווח
            </Txt>
          </Pressable>

          {/* CTA */}
          <View style={{ marginTop: 'auto', paddingTop: 24, flexDirection: 'row-reverse', gap: 10, alignItems: 'center' }}>
            <Button label="שלח וסגור" variant="primary" size="lg" style={{ flex: 1 }} onPress={() => router.push('/map')} />
            <Txt
              style={{ fontSize: 13.5, fontFamily: fonts.bold, color: colors.faint, paddingHorizontal: 10 }}
              onPress={() => router.push('/map')}
            >
              דלג
            </Txt>
          </View>
        </View>
      </Screen>
    </LinearGradient>
  );
}

const vibeShadow = {
  shadowColor: colors.petrol,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.3,
  shadowRadius: 16,
  elevation: 6,
};

const styles = StyleSheet.create({
  vibeTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 20,
  },
  playerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 18,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  levelChip: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 22,
    paddingHorizontal: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(14,79,94,.35)',
  },
});
