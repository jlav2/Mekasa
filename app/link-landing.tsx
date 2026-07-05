import { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Screen, Txt, Button, AvatarStack, DecorRing } from '../src/components';
import { colors, fonts } from '../src/theme';

export default function LinkLanding() {
  const router = useRouter();
  const [name, setName] = useState('');

  return (
    <Screen bg={colors.sandBg} padded={false} edges={{ top: false, bottom: true }}>
      {/* browser address strip */}
      <View style={styles.browserStrip}>
        <Svg width={11} height={11} viewBox="0 0 12 12">
          <Rect x={2} y={5} width={8} height={6} rx={1.5} fill="none" stroke={colors.faint} strokeWidth={1.4} />
          <Path d="M4 5V3.5a2 2 0 014 0V5" fill="none" stroke={colors.faint} strokeWidth={1.4} />
        </Svg>
        <Txt style={{ fontSize: 13, fontFamily: fonts.semibold, color: colors.muted }}>mekasa.app/c/8kq2</Txt>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 22, paddingBottom: 24 }}>
        {/* mini logo */}
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
          <View style={styles.logoWrap}>
            <LinearGradient colors={['#FFC46B', '#F0862F']} style={StyleSheet.absoluteFill} />
            <Svg width={40} height={40} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
              <Path d="M0 88 Q30 84 60 88 T120 87 V120 H0 Z" fill={colors.petrol} />
              <Circle
                cx={60}
                cy={56}
                r={34}
                fill="none"
                stroke={colors.card}
                strokeWidth={8}
                strokeDasharray="66 10 50 12 56 9"
                strokeLinecap="round"
              />
              <Circle cx={60} cy={56} r={10} fill={colors.card} />
            </Svg>
          </View>
          <Txt style={{ fontFamily: fonts.displayBold, fontSize: 30, lineHeight: 30, color: colors.petrol }}>מקאסה</Txt>
        </View>

        <Txt style={{ fontFamily: fonts.displayBold, fontSize: 48, lineHeight: 48, color: colors.ink, marginTop: 20 }}>
          גיא מזמין אותך למעגל
        </Txt>

        {/* circle card */}
        <View style={styles.circleCard}>
          <DecorRing size={160} style={{ left: -44, top: -30 }} />
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
            <View style={styles.missingBadge}>
              <Txt style={{ fontSize: 11, fontFamily: fonts.extrabold, color: '#fff' }}>חסרים 3</Txt>
            </View>
            <View style={styles.sportBadge}>
              <Txt style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.sandGlow }}>אלטינה · פתוח לכולם</Txt>
            </View>
          </View>
          <Txt style={{ fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 34, color: '#fff', marginTop: 10 }}>
            חוף גורדון · ראשון 18:00
          </Txt>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <AvatarStack
              people={[
                { letter: 'ג', color: colors.sunset },
                { letter: 'ד', color: colors.live },
              ]}
              size={30}
              border={colors.petrol}
              emptySlot
              emptyLabel="+"
              emptyBorder="rgba(255,255,255,.5)"
            />
            <Txt style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>2 בפנים · נשארו 3 מקומות</Txt>
          </View>
        </View>

        {/* guest join */}
        <View style={{ marginTop: 18 }}>
          <Txt style={{ fontSize: 13, fontFamily: fonts.extrabold, color: colors.ink }}>הצטרף בלי להתקין כלום</Txt>
          <View style={styles.nameInputWrap}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="השם שלך"
              placeholderTextColor={colors.faint}
              style={styles.nameInput}
              textAlign="right"
            />
          </View>
          <Button
            label="אני בפנים — שריין מקום"
            variant="primary"
            size="lg"
            style={{ marginTop: 10 }}
            onPress={() => router.push('/map')}
          />
        </View>

        {/* divider */}
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginTop: 'auto', paddingTop: 18 }}>
          <View style={styles.dividerLine} />
          <Txt style={{ fontSize: 11.5, fontFamily: fonts.semibold, color: colors.faint }}>יש לך את האפליקציה?</Txt>
          <View style={styles.dividerLine} />
        </View>
        <Button
          label="פתח במקאסה"
          variant="secondary"
          size="md"
          style={{ marginTop: 10, height: 48, borderRadius: 24 }}
          fontSize={14}
          onPress={() => router.push('/map')}
        />
        <Txt style={{ textAlign: 'center', fontSize: 11.5, color: colors.faint, marginTop: 12 }}>
          חדש כאן?{' '}
          <Txt style={{ fontSize: 11.5, fontFamily: fonts.bold, color: colors.petrol, textDecorationLine: 'underline' }}>
            הורד את מקאסה חינם
          </Txt>
        </Txt>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  browserStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 64,
    paddingBottom: 10,
    backgroundColor: '#EFE6D2',
  },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
  },
  circleCard: {
    backgroundColor: colors.petrol,
    borderRadius: 22,
    padding: 18,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: colors.petrol,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 26,
    elevation: 10,
  },
  missingBadge: {
    backgroundColor: colors.sunset,
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  sportBadge: {
    backgroundColor: 'rgba(255,255,255,.14)',
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  nameInputWrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.hairlineStrong,
    paddingHorizontal: 18,
    marginTop: 8,
  },
  nameInput: {
    flex: 1,
    fontSize: 14.5,
    color: colors.ink,
    fontFamily: fonts.body,
    writingDirection: 'rtl',
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.hairlineStrong },
});
