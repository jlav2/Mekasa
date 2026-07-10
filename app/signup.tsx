import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Txt, Button, Icon, TextField, HeroIconButton } from '../src/components';
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
    <Screen bg={colors.sandBg} keyboardAvoiding contentStyle={{ paddingTop: 64, paddingBottom: 40, flexGrow: 1 }}>
      <View style={styles.titleRow}>
        <Txt style={styles.title}>הרשמה</Txt>
        <HeroIconButton variant="card" onPress={() => router.back()}>
          <Icon name="close" size={13} color={colors.muted} strokeWidth={2} />
        </HeroIconButton>
      </View>
      <Txt style={styles.helper}>שנייה אחת, ואתה על החול</Txt>

      <View style={{ gap: 12, marginTop: 22 }}>
        <TextField label="השם שלך" value={name} onChangeText={setName} placeholder="גיא לוי" />

        <TextField
          label="שם משתמש"
          hint={uAvail === true ? '✓ פנוי' : uAvail === false ? 'תפוס' : undefined}
          hintColor={uAvail === true ? colors.live : colors.danger}
          value={username}
          onChangeText={(v) => { setUsername(cleanUsername(v)); setUAvail(null); }}
          onBlur={onUsernameBlur}
          placeholder="guy_tlv"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextField
          label="אימייל"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <TextField
          label="סיסמה"
          value={password}
          onChangeText={setPassword}
          placeholder="לפחות 6 תווים"
          secureTextEntry
          autoCapitalize="none"
        />

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

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.displayBold, fontSize: 52, lineHeight: 52, color: colors.petrol },
  helper: { fontSize: 13.5, color: colors.muted, marginTop: 4 },
  error: { color: colors.danger, fontSize: 13, fontFamily: fonts.semibold, textAlign: 'center' },
  linkRow: { flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: 6 },
  muted: { fontSize: 13.5, color: colors.muted, fontFamily: fonts.medium },
  link: { fontSize: 13.5, color: colors.petrol, fontFamily: fonts.bold, textDecorationLine: 'underline' },
});
