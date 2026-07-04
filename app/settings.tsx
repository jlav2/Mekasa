import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Txt, Toggle, Icon } from '../src/components';
import { colors, fonts, proGradient } from '../src/theme';

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

export default function Settings() {
  const router = useRouter();

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
          <NavRow label="התנתק" danger last />
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
