import { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Txt, Button, Icon, DecorRing } from '../src/components';
import { colors, fonts } from '../src/theme';
import { useStore } from '../src/store';

export default function ResetPassword() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const confirmPasswordReset = useStore((s) => s.confirmPasswordReset);

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (code.length < 6) return setError('הזן את הקוד בן 6 הספרות');
    if (password.length < 6) return setError('סיסמה חדשה — לפחות 6 תווים');
    setError(null);
    setBusy(true);
    const res = await confirmPasswordReset(email ?? '', code, password);
    setBusy(false);
    if (res.ok) router.replace('/map');
    else setError(res.error ?? 'קוד שגוי או שפג תוקפו');
  };

  return (
    <Screen padded={false} bg={colors.sandBg} edges={{ top: false, bottom: false }} keyboardAvoiding>
      <View style={styles.hero}>
        <DecorRing style={{ left: -70, top: -40 }} />
        <Pressable style={styles.back} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="חזור">
          <Icon name="chevronRight" size={18} color="#fff" strokeWidth={2.4} />
        </Pressable>
        <Txt style={styles.title}>סיסמה{'\n'}חדשה</Txt>
        <Txt style={styles.sub}>הזן את הקוד ששלחנו אל{'\n'}{email}</Txt>
      </View>

      <View style={styles.body}>
        <View style={styles.codeWrap}>
          <TextInput
            value={code}
            onChangeText={(v) => setCode(v.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="______"
            placeholderTextColor={colors.faint}
            keyboardType="number-pad"
            style={styles.code}
            autoFocus
          />
        </View>

        <View style={styles.inputWrap}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="סיסמה חדשה"
            placeholderTextColor={colors.faint}
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
            onSubmitEditing={submit}
            returnKeyType="go"
          />
        </View>

        {error ? <Txt style={styles.error}>{error}</Txt> : null}

        <Button label="עדכן סיסמה והתחבר" size="lg" loading={busy} onPress={submit} style={{ marginTop: 8 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.petrol, paddingTop: 70, paddingHorizontal: 22, paddingBottom: 28, overflow: 'hidden' },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,.14)', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.displayBold, fontSize: 48, lineHeight: 46, color: '#fff', marginTop: 14 },
  sub: { fontSize: 13.5, color: 'rgba(255,255,255,.75)', marginTop: 10, lineHeight: 20 },
  body: { flex: 1, paddingHorizontal: 22, paddingTop: 26, gap: 12 },
  codeWrap: {
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.hairlineStrong,
    justifyContent: 'center',
  },
  code: { fontSize: 30, fontFamily: fonts.displayBold, color: colors.ink, textAlign: 'center', letterSpacing: 10 },
  inputWrap: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.hairlineStrong,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  input: { fontSize: 15, color: colors.ink, fontFamily: fonts.body, textAlign: 'right', writingDirection: 'rtl' },
  error: { color: colors.danger, fontSize: 13, fontFamily: fonts.semibold, textAlign: 'center' },
});
