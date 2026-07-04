import { ScrollView, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SandRing, Txt, Badge } from '../src/components';
import { colors, fonts } from '../src/theme';
import { SCREEN_GROUPS } from '../src/data/screens';

export default function Gallery() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.sandBg }}
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 40, paddingHorizontal: 22 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <SandRing size={44} color={colors.sunset} variant={3} rotate={12} />
        <Txt style={{ fontFamily: fonts.displayBold, fontSize: 52, color: colors.ink, lineHeight: 52 }}>מקאסה</Txt>
      </View>
      <Txt variant="secondary" style={{ marginBottom: 22 }}>גלריית מסכים · 26 מסכים · המעגל הבא שלך כבר על החול</Txt>

      {SCREEN_GROUPS.map((g) => (
        <View key={g.group} style={{ marginBottom: 22 }}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Txt style={{ fontFamily: fonts.extrabold, fontSize: 12, color: colors.petrol, letterSpacing: 0.6 }}>
              {g.group}
            </Txt>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.hairlineStrong }} />
          </View>
          <View style={{ gap: 8 }}>
            {g.screens.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => router.push(s.route as any)}
                style={({ pressed }) => ({
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.hairline,
                  paddingVertical: 13,
                  paddingHorizontal: 14,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View style={{ backgroundColor: colors.ink, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 }}>
                  <Txt style={{ fontFamily: fonts.bold, fontSize: 10.5, color: '#fff' }}>{s.id}</Txt>
                </View>
                <Txt style={{ flex: 1, fontFamily: fonts.bold, fontSize: 14, color: colors.ink }}>{s.title}</Txt>
                {s.platform === 'Android' ? <Badge label="Android" bg={colors.chipBg} color={colors.muted} /> : null}
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
