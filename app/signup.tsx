import { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Txt, Button, Icon } from '../src/components';
import { colors, fonts } from '../src/theme';
import { useStore } from '../src/store';

export default function SignUp() {
  const router = useRouter();
  const signUpEmail = useStore((s) => s.signUpEmail);
  const checkUsername = useStore((s) => s.checkUsername);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [uAvail, setUAvail] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const cleanUsername = (v: string) => v.replace(/[^a-zA-Z0-9._]/g, '').toLowerCase();

  const onUsernameBlur = async () => {
    if (username.length < 3) {
      setUAvail(null);
      return;
    }
    setUAvail(await checkUsername(username));
  };

  const submit = async () => {
    if (!name.trim()) return setError('מה השם שלך?');
    if (username.length < 3) return setError('שם משתמש — לפחות 3 תווים');
    if (uAvail === false) return setError('שם המשתמש כבר תפוס');
    if (!email.includes('@')) return setError('אימייל לא תקין');
    if (password.length < 6) return setError('סיסמה — לפחות 6 תווים');
    setError(null);
    setBusy(true);
    const res = await signUpEmail(email.trim(), password, name.trim(), username);
    setBusy(false);
    if (!res.ok) return setError(res.error ?? 'ההרשמה נכשלה');
    if (res.needsConfirmation) {
      router.push({
        pathname: '/verify-otp',
        params: { email: email.trim(), name: name.trim(), username },
      });
    } else {
      router.replace('/onboarding-sport');
    }
  };

  return (
    <Screen bg={colors.sandBg} contentStyle={{ paddingTop: 64, paddingBottom: 40, flexGrow: 1 }}>
      <View style={styles.titleRow}>
        <Txt style={styles.title}>הרשמה</Txt>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Icon name="close" size={13} color={colors.muted} strokeWidth={2} />
        </Pressable>
      </View>
      <Txt style={styles.helper}>שנייה אחת, ואתה על החול</Txt>

      <View style={{ gap: 12, marginTop: 22 }}>
        <Field label="השם שלך">
          <TextInput value={name} onChangeText={setName} placeholder="גיא לוי" placeholderTextColor={colors.faint} style={styles.input} />
        </Field>

        <Field label="שם משתמש" hint={uAvail === true ? '✓ פנוי' : uAvail === false ? 'תפוס' : undefined} hintColor={uAvail === true ? colors.live : colors.danger}>
          <TextInput
            value={username}
            onChangeText={(v) => { setUsername(cleanUsername(v)); setUAvail(null); }}
            onBlur={onUsernameBlur}
            placeholder="guy_tlv"
            placeholderTextColor={colors.faint}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </Field>

        <Field label="אימייל">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.faint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.input}
          />
        </Field>

        <Field label="סיסמה">
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="לפחות 6 תווים"
            placeholderTextColor={colors.faint}
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />
        </Field>

        {error ? <Txt style={styles.error}>{error}</Txt> : null}
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 24, gap: 12 }}>
        <Button label="צור חשבון" size="lg" loading={busy} onPress={submit} />
        <View style={styles.linkRow}>
          <Txt style={styles.muted}>כבר יש לך חשבון?</Txt>
          <Pressable onPress={() => router.replace('/login')}>
            <Txt style={styles.link}>התחבר</Txt>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

function Field({ label, hint, hintColor, children }: { label: string; hint?: string; hintColor?: string; children: React.ReactNode }) {
  return (
    <View>
      <View style={styles.labelRow}>
        <Txt style={styles.label}>{label}</Txt>
        {hint ? <Txt style={[styles.hint, { color: hintColor }]}>{hint}</Txt> : null}
      </View>
      <View style={styles.inputWrap}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.displayBold, fontSize: 52, lineHeight: 52, color: colors.petrol },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(14,79,94,.08)', alignItems: 'center', justifyContent: 'center' },
  helper: { fontSize: 13.5, color: colors.muted, marginTop: 4 },
  labelRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  label: { fontSize: 13, fontFamily: fonts.extrabold, color: colors.ink },
  hint: { fontSize: 12, fontFamily: fonts.bold },
  inputWrap: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.hairlineStrong,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: { fontSize: 15, color: colors.ink, fontFamily: fonts.body, textAlign: 'right', writingDirection: 'rtl' },
  error: { color: colors.danger, fontSize: 13, fontFamily: fonts.semibold, textAlign: 'center' },
  linkRow: { flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 6 },
  muted: { fontSize: 13.5, color: colors.muted, fontFamily: fonts.medium },
  link: { fontSize: 13.5, color: colors.petrol, fontFamily: fonts.bold, textDecorationLine: 'underline' },
});
