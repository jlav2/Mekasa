import { View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { Txt, AppleGlyph, GoogleGlyph, FacebookGlyph } from '../src/components';
import { colors, fonts, shadows } from '../src/theme';
import { ensureSignedIn } from '../src/data/backend';

function SeaHorizon() {
  return (
    <View style={styles.sea} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 402 390" preserveAspectRatio="xMidYMax slice">
        <Circle cx="201" cy="318" r="74" fill="#FF6B2C" />
        <Circle
          cx="201"
          cy="318"
          r="74"
          fill="none"
          stroke="#FFE3B8"
          strokeWidth={3}
          strokeDasharray="90 14 60 18 70 12"
          strokeLinecap="round"
          opacity={0.9}
        />
        <Path d="M0 330 Q100 322 201 330 T402 328 V390 H0 Z" fill="#0E4F5E" opacity={0.92} />
        <Path d="M0 352 Q120 344 240 352 T402 350" fill="none" stroke="#14B8A8" strokeWidth={2.5} opacity={0.55} strokeLinecap="round" />
        <Path d="M40 370 Q130 364 220 370 T402 368" fill="none" stroke="#6ECEC9" strokeWidth={2} opacity={0.4} strokeLinecap="round" />
      </Svg>
    </View>
  );
}

function SsoButton({ children, bg, color, border, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.sso, { backgroundColor: bg }, border && { borderWidth: 1.5, borderColor: border }]}
    >
      {children}
    </Pressable>
  );
}

export default function Login() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // Anonymous Supabase session for now — real Apple/Google/Facebook OAuth
  // can link onto the same user later without losing their data.
  const go = () => {
    ensureSignedIn(); // no-op offline; root layout hydrate also covers this
    router.push('/onboarding-sport');
  };
  return (
    <LinearGradient
      colors={['#FFC46B', '#FF9D52', '#F7B573', '#F7EFDE', '#F7EFDE']}
      locations={[0, 0.3, 0.44, 0.62, 1]}
      style={{ flex: 1 }}
    >
      <SeaHorizon />
      {/* brand */}
      <View style={{ flex: 1, alignItems: 'center', paddingTop: insets.top + 92 }}>
        <Txt style={{ fontFamily: fonts.displayBold, fontSize: 96, lineHeight: 88, color: colors.ink }}>מקאסה</Txt>
        <Txt style={{ fontSize: 16, fontFamily: fonts.semibold, color: colors.ink, marginTop: 6 }}>
          המעגל הבא שלך כבר על החול
        </Txt>
      </View>
      {/* login sheet */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 30 }]}>
        <Txt style={{ fontFamily: fonts.display, fontSize: 32, color: colors.petrol, textAlign: 'center', lineHeight: 34 }}>
          שניות ואתה בפנים
        </Txt>
        <SsoButton bg={colors.ink} onPress={go}>
          <AppleGlyph size={18} color="#fff" />
          <Txt style={styles.ssoTxt}>המשך עם Apple</Txt>
        </SsoButton>
        <SsoButton bg="#fff" border="rgba(18,48,58,.16)" onPress={go}>
          <GoogleGlyph size={19} />
          <Txt style={[styles.ssoTxt, { color: colors.ink }]}>המשך עם Google</Txt>
        </SsoButton>
        <SsoButton bg={colors.facebook} onPress={go}>
          <FacebookGlyph size={19} color="#fff" />
          <Txt style={styles.ssoTxt}>המשך עם Facebook</Txt>
        </SsoButton>
        <Txt style={{ textAlign: 'center', fontSize: 11.5, color: colors.faint, marginTop: 6 }}>
          בהמשך אתה מאשר את <Txt style={{ textDecorationLine: 'underline', fontSize: 11.5, color: colors.faint }}>תנאי השימוש</Txt> ואת{' '}
          <Txt style={{ textDecorationLine: 'underline', fontSize: 11.5, color: colors.faint }}>מדיניות הפרטיות</Txt>
        </Txt>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  sea: { position: 'absolute', top: 0, left: 0, right: 0, height: 390 },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 12,
    shadowColor: '#12303A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
  },
  sso: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    borderRadius: 28,
  },
  ssoTxt: { fontSize: 16, fontFamily: fonts.semibold, color: '#fff' },
});
