import { useState } from 'react';
import { View, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Txt, Toggle, Icon } from '../src/components';
import { colors, fonts, proGradient } from '../src/theme';
import { useStore } from '../src/store';

function ToggleRow({
  title,
  sub,
  value,
  onColor,
  last,
}: {
  title: string;
  sub?: string;
  value: boolean;
  onColor?: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={{ flex: 1 }}>
        <Txt style={styles.rowTitle}>{title}</Txt>
        {sub ? <Txt style={styles.rowSub}>{sub}</Txt> : null}
      </View>
      <Toggle value={value} onColor={onColor} />
    </View>
  );
}

function NavRow({ label, danger, last, onPress }: { label: string; danger?: boolean; last?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, !last && styles.rowBorder]}>
      <Txt style={[styles.navLabel, danger && { color: colors.danger }]}>{label}</Txt>
      {!danger && <Icon name="chevronLeft" size={12} color="#B9C4C9" strokeWidth={2} />}
    </Pressable>
  );
}

// RN's Alert.alert is a no-op on web, so branch to window.confirm there.
function confirmDestructive(title: string, message: string, confirmLabel: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(
      typeof window !== 'undefined' ? window.confirm(`${title}\n\n${message}`) : false,
    );
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'ביטול', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export default function Settings() {
  const router = useRouter();
  const logOut = useStore((s) => s.logOut);
  const deleteAccount = useStore((s) => s.deleteAccount);
  const [deleting, setDeleting] = useState(false);

  const onLogout = async () => {
    await logOut();
    router.replace('/login');
  };

  const onDeleteAccount = async () => {
    if (deleting) return;
    const ok = await confirmDestructive(
      'מחיקת חשבון',
      'הפעולה תמחק לצמיתות את החשבון, המעגלים שיצרת וההשתתפויות שלך. אי אפשר לבטל.',
      'מחק לצמיתות',
    );
    if (!ok) return;
    setDeleting(true);
    const res = await deleteAccount();
    setDeleting(false);
    if (res.ok) {
      router.replace('/login');
    } else if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.alert(res.error ?? 'מחיקת החשבון נכשלה');
    } else {
      Alert.alert('שגיאה', res.error ?? 'מחיקת החשבון נכשלה');
    }
  };

  return (
    <Screen scroll contentStyle={{ paddingBottom: 60 }}>
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="chevronRight" size={16} color={colors.petrol} strokeWidth={2.4} />
        </Pressable>
        <Txt style={{ fontFamily: fonts.displayBold, fontSize: 44, lineHeight: 44, color: colors.petrol }}>הגדרות</Txt>
      </View>

      <View style={{ gap: 10, marginTop: 16 }}>
        <Txt style={styles.sectionLabel}>התראות</Txt>
        <View style={styles.groupCard}>
          <ToggleRow title="מעגל נפתח בחוף שאני עוקב" sub="ההתראה הכי חשובה — אל תכבה" value onColor={colors.live} />
          <ToggleRow title="רק מעגלים ברמה שלי" sub="בינוניים ומעלה" value onColor={colors.live} />
          <ToggleRow title="שקט בין 22:00–8:00" value={false} last />
        </View>

        <View style={styles.badgeHeaderRow}>
          <LinearGradient colors={proGradient as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.proBadge}>
            <Txt style={{ fontSize: 10, fontFamily: fonts.extrabold, color: '#fff' }}>PRO · עד 5 חופים</Txt>
          </LinearGradient>
          <Txt style={styles.sectionLabel}>החופים שאני עוקב</Txt>
        </View>
        <View style={styles.groupCard}>
          <ToggleRow title="חוף פרישמן" value onColor={colors.live} />
          <ToggleRow title="חוף גורדון" value onColor={colors.live} />
          <ToggleRow title="מצודת הים" value={false} last />
        </View>

        <Txt style={styles.sectionLabel}>פרטיות וחשבון</Txt>
        <View style={styles.groupCard}>
          <ToggleRow title="מיקום מדויק" sub="כבוי = אחרים רואים רק את החוף, לא אותך" value={false} />
          <NavRow label="הרמה שלי — עדכן ענפים ורמות" />
          <NavRow label="נהל מנוי Pro" onPress={() => router.push('/paywall')} />
          <NavRow label="התנתק" danger onPress={onLogout} />
          <NavRow label={deleting ? 'מוחק…' : 'מחק חשבון'} danger last onPress={onDeleteAccount} />
        </View>

        <Txt style={styles.sectionLabel}>פיתוח</Txt>
        <View style={styles.groupCard}>
          <NavRow label="גלריית מסכים — כל 29 המסכים" onPress={() => router.push('/gallery')} last />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: { fontSize: 12, fontFamily: fonts.extrabold, color: colors.faint, letterSpacing: 0.5, paddingRight: 6 },
  badgeHeaderRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6 },
  proBadge: { borderRadius: 9, paddingHorizontal: 9, paddingVertical: 3 },
  groupCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  rowTitle: { fontSize: 14, fontFamily: fonts.bold, color: colors.ink },
  rowSub: { fontSize: 11.5, color: colors.faint, marginTop: 1 },
  navLabel: { flex: 1, fontSize: 14, fontFamily: fonts.semibold, color: colors.ink },
});
