import { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { Txt, Button, AppleGlyph, GoogleGlyph } from '../src/components';
import { colors, fonts } from '../src/theme';
import { useStore } from '../src/store';

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

export default function Login() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const logIn = useStore((s) => s.logIn);
  const continueAsGuest = useStore((s) => s.continueAsGuest);
  const signInWithProvider = useStore((s) => s.signInWithProvider);

  const oauth = async (provider: 'apple' | 'google') => {
    setError(null);
    setBusy(true);
    const res = await signInWithProvider(provider);
    setBusy(false);
    // Web redirects away; native returns here on success.
    if (res.ok && res.userId) router.replace('/map');
    else if (!res.ok) setError(res.error ?? 'ההתחברות נכשלה');
  };

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!identifier.trim() || !password) {
      setError('מלא אימייל/שם משתמש וסיסמה');
      return;
    }
    setError(null);
    setBusy(true);
    const res = await logIn(identifier, password);
    setBusy(false);
    if (res.ok) router.replace('/map');
    else setError(res.error ?? 'ההתחברות נכשלה');
  };

  const guest = async () => {
    setBusy(true);
    await continueAsGuest();
    setBusy(false);
    router.replace('/onboarding-sport');
  };

  return (
    <LinearGradient
      colors={['#FFC46B', '#FF9D52', '#F7B573', '#F7EFDE', '#F7EFDE']}
      locations={[0, 0.3, 0.44, 0.62, 1]}
      style={{ flex: 1 }}
    >
      <SeaHorizon />
      <View style={{ flex: 1, alignItems: 'center', paddingTop: insets.top + 70 }}>
        <Txt style={{ fontFamily: fonts.displayBold, fontSize: 84, lineHeight: 78, color: colors.ink }}>מקאסה</Txt>
        <Txt style={{ fontSize: 15, fontFamily: fonts.semibold, color: colors.ink, marginTop: 6 }}>
          המעגל הבא שלך כבר על החול
        </Txt>
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 26 }]}>
        <Txt style={{ fontFamily: fonts.displayBold, fontSize: 34, color: colors.petrol, textAlign: 'center', lineHeight: 36 }}>
          התחברות
        </Txt>

        <View style={styles.inputWrap}>
          <TextInput
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="אימייל או שם משתמש"
            placeholderTextColor={colors.faint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.input}
          />
        </View>
        <View style={styles.inputWrap}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="סיסמה"
            placeholderTextColor={colors.faint}
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
            onSubmitEditing={submit}
            returnKeyType="go"
          />
        </View>

        <Pressable onPress={() => router.push('/forgot-password')} style={{ alignSelf: 'flex-start' }}>
          <Txt style={styles.forgot}>שכחת סיסמה?</Txt>
        </Pressable>

        {error ? <Txt style={styles.error}>{error}</Txt> : null}

        <Button label="התחבר" size="lg" loading={busy} onPress={submit} style={{ marginTop: 2 }} />

        <View style={styles.linkRow}>
          <Txt style={styles.muted}>אין לך חשבון?</Txt>
          <Pressable onPress={() => router.push('/signup')}>
            <Txt style={styles.link}>הרשמה</Txt>
          </Pressable>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divLine} />
          <Txt style={styles.divTxt}>או</Txt>
          <View style={styles.divLine} />
        </View>

        <View style={{ flexDirection: 'row-reverse', gap: 10 }}>
          <SsoButton bg={colors.ink} onPress={() => oauth('apple')} border={undefined}>
            <AppleGlyph size={18} color="#fff" />
            <Txt style={styles.ssoTxt}>Apple</Txt>
          </SsoButton>
          <SsoButton bg="#fff" border="rgba(18,48,58,.16)" onPress={() => oauth('google')}>
            <GoogleGlyph size={18} />
            <Txt style={[styles.ssoTxt, { color: colors.ink }]}>Google</Txt>
          </SsoButton>
        </View>

        <Button label="המשך כאורח" variant="secondary" size="md" onPress={guest} />
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
    paddingTop: 26,
    gap: 12,
    shadowColor: '#12303A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
  },
  inputWrap: {
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.hairlineStrong,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  input: { fontSize: 15, color: colors.ink, fontFamily: fonts.body, textAlign: 'right', writingDirection: 'rtl' },
  error: { color: colors.danger, fontSize: 13, fontFamily: fonts.semibold, textAlign: 'center' },
  forgot: { fontSize: 12.5, color: colors.petrol, fontFamily: fonts.bold, textDecorationLine: 'underline', marginTop: -4 },
  linkRow: { flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 6 },
  muted: { fontSize: 13.5, color: colors.muted, fontFamily: fonts.medium },
  link: { fontSize: 13.5, color: colors.petrol, fontFamily: fonts.bold, textDecorationLine: 'underline' },
  dividerRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: colors.hairlineStrong },
  divTxt: { fontSize: 12, color: colors.faint, fontFamily: fonts.medium },
  sso: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 25,
  },
  ssoTxt: { fontSize: 15, fontFamily: fonts.semibold, color: '#fff' },
});
