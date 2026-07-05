import { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Txt, Button, Icon, DecorRing } from '../src/components';
import { colors, fonts } from '../src/theme';
import { useStore } from '../src/store';

export default function ForgotPassword() {
  const router = useRouter();
  const requestPasswordReset = useStore((s) => s.requestPasswordReset);

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.includes('@')) return setError('אימייל לא תקין');
    setError(null);
    setBusy(true);
    const res = await requestPasswordReset(email.trim());
    setBusy(false);
    if (res.ok) router.push({ pathname: '/reset-password', params: { email: email.trim() } });
    else setError(res.error ?? 'שליחת הקוד נכשלה');
  };

  return (
    <Screen padded={false} bg={colors.sandBg} edges={{ top: false, bottom: false }} keyboardAvoiding>
      <View style={styles.hero}>
        <DecorRing style={{ left: -70, top: -40 }} />
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Icon name="chevronRight" size={18} color="#fff" strokeWidth={2.4} />
        </Pressable>
        <Txt style={styles.title}>שכחת{'\n'}סיסמה?</Txt>
        <Txt style={styles.sub}>נשלח לך קוד בן 6 ספרות לאיפוס</Txt>
      </View>

      <View style={styles.body}>
        <View style={styles.inputWrap}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="האימייל שלך"
            placeholderTextColor={colors.faint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.input}
            onSubmitEditing={submit}
            returnKeyType="send"
          />
        </View>

        {error ? <Txt style={styles.error}>{error}</Txt> : null}

        <Button label="שלח קוד איפוס" size="lg" loading={busy} onPress={submit} style={{ marginTop: 8 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.petrol, paddingTop: 70, paddingHorizontal: 22, paddingBottom: 28, overflow: 'hidden' },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,.14)', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.displayBold, fontSize: 48, lineHeight: 46, color: '#fff', marginTop: 14 },
  sub: { fontSize: 13.5, color: 'rgba(255,255,255,.75)', marginTop: 10, lineHeight: 20 },
  body: { flex: 1, paddingHorizontal: 22, paddingTop: 26 },
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
  error: { color: colors.danger, fontSize: 13, fontFamily: fonts.semibold, textAlign: 'center', marginTop: 12 },
});
