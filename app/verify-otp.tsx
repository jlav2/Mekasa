import { useEffect, useRef, useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Txt, Button, Icon, DecorRing } from '../src/components';
import { colors, fonts } from '../src/theme';
import { useStore } from '../src/store';

export default function VerifyOtp() {
  const router = useRouter();
  const { email, name, username } = useLocalSearchParams<{ email: string; name: string; username: string }>();
  const verifyOtp = useStore((s) => s.verifyOtp);
  const resendOtp = useStore((s) => s.resendOtp);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const startCooldown = () => {
    setCooldown(30);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1 && timer.current) clearInterval(timer.current);
        return Math.max(0, c - 1);
      });
    }, 1000);
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setNotice(null);
    const res = await resendOtp(email ?? '');
    if (res.ok) {
      setNotice('שלחנו קוד חדש');
      startCooldown();
    } else {
      setError(res.error ?? 'שליחת הקוד נכשלה');
    }
  };

  const submit = async () => {
    if (code.length < 6) return setError('הזן את הקוד בן 6 הספרות');
    setError(null);
    setBusy(true);
    const res = await verifyOtp(email ?? '', code, name ?? '', username ?? '');
    setBusy(false);
    if (res.ok) router.replace('/onboarding-sport');
    else setError(res.error ?? 'קוד שגוי או שפג תוקפו');
  };

  return (
    <Screen padded={false} bg={colors.sandBg} edges={{ top: false, bottom: false }} keyboardAvoiding>
      <View style={styles.hero}>
        <DecorRing style={{ left: -70, top: -40 }} />
        <Pressable style={styles.back} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="חזור">
          <Icon name="chevronRight" size={18} color="#fff" strokeWidth={2.4} />
        </Pressable>
        <Txt style={styles.title}>בדוק את{'\n'}האימייל</Txt>
        <Txt style={styles.sub}>שלחנו קוד בן 6 ספרות אל{'\n'}{email}</Txt>
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
            onSubmitEditing={submit}
            autoFocus
          />
        </View>

        {error ? <Txt style={styles.error}>{error}</Txt> : null}
        {notice ? <Txt style={styles.notice}>{notice}</Txt> : null}

        <Button label="אימות והמשך" size="lg" loading={busy} onPress={submit} style={{ marginTop: 8 }} />

        <Pressable onPress={resend} disabled={cooldown > 0} accessibilityRole="button" style={{ alignSelf: 'center', marginTop: 16 }}>
          <Txt style={[styles.resend, cooldown > 0 && { color: colors.faint, textDecorationLine: 'none' }]}>
            {cooldown > 0 ? `שלח קוד מחדש (${cooldown})` : 'שלח קוד מחדש'}
          </Txt>
        </Pressable>
        <Txt style={styles.hint}>לא קיבלת? בדוק גם בתיקיית הספאם.</Txt>
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
  codeWrap: {
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.hairlineStrong,
    justifyContent: 'center',
  },
  code: {
    fontSize: 30,
    fontFamily: fonts.displayBold,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: 10,
  },
  error: { color: colors.danger, fontSize: 13, fontFamily: fonts.semibold, textAlign: 'center', marginTop: 12 },
  notice: { color: colors.liveDeep, fontSize: 13, fontFamily: fonts.semibold, textAlign: 'center', marginTop: 12 },
  resend: { fontSize: 13.5, color: colors.petrol, fontFamily: fonts.bold, textDecorationLine: 'underline' },
  hint: { fontSize: 12.5, color: colors.faint, fontFamily: fonts.medium, textAlign: 'center', marginTop: 12, lineHeight: 18 },
});
