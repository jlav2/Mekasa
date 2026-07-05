import { useState } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import {
  Screen,
  Txt,
  Button,
  ProgressDashes,
  Toggle,
  Icon,
  MapCanvas,
  MapMarker,
} from '../src/components';
import { colors, fonts } from '../src/theme';

function NativeDialogMock() {
  return (
    <View style={styles.dialog}>
      <View style={styles.dialogBody}>
        <Txt style={styles.dialogTitle}>לאפשר ל&quot;מקאסה&quot; לגשת למיקום שלך?</Txt>
        <Txt style={styles.dialogSub}>כדי להראות לך מעגלים פעילים בחופים לידך</Txt>
      </View>
      <View style={styles.dialogRow}>
        <Txt style={styles.dialogAction}>בזמן שימוש באפליקציה</Txt>
      </View>
      <View style={styles.dialogRow}>
        <Txt style={styles.dialogActionLight}>רק הפעם</Txt>
      </View>
      <View style={styles.dialogRow}>
        <Txt style={styles.dialogActionLight}>אל תאפשר</Txt>
      </View>
    </View>
  );
}

export default function OnboardingPermissions() {
  const router = useRouter();
  const [requesting, setRequesting] = useState(false);

  // Ask for real foreground location, then continue regardless of the answer —
  // the map still works with the demo location if permission is denied.
  const allow = async () => {
    setRequesting(true);
    try {
      if (Platform.OS !== 'web') {
        await Location.requestForegroundPermissionsAsync();
      } else if (typeof navigator !== 'undefined' && navigator.geolocation) {
        await new Promise<void>((resolve) =>
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            () => resolve(),
            { timeout: 5000 },
          ),
        );
      }
    } catch {
      // ignore — permission is optional for the demo
    } finally {
      router.push('/map');
    }
  };

  return (
    <Screen edges={{ top: true, bottom: true }} contentStyle={{ paddingTop: 30 }}>
      <ProgressDashes total={3} active={1} />

      <Txt style={styles.title}>בלי מיקום —{'\n'}אין מעגלים</Txt>
      <Txt style={styles.copy}>
        המפה מראה רק מה שקורה סביבך. המיקום נשאר אצלך — שחקנים אחרים רואים רק את החוף, לא אותך.
      </Txt>

      {/* mini map illustration */}
      <View style={styles.mapBox}>
        <MapCanvas>
          <MapMarker state="live" size={64} count="4/4" variant={0} rotate={-30} style={{ position: 'absolute', top: 40, right: 60 }} />
          <View style={styles.userDot} />
        </MapCanvas>
        <NativeDialogMock />
      </View>

      {/* notifications row */}
      <View style={styles.notifRow}>
        <View style={styles.notifIcon}>
          <Icon name="bell" size={19} color={colors.sunset} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt style={styles.notifTitle}>והתראות?</Txt>
          <Txt style={styles.notifSub}>רק כשנפתח מעגל שמתאים לך. בלי ספאם.</Txt>
        </View>
        <Toggle value onColor={colors.live} />
      </View>

      <Button label="אפשר מיקום" size="lg" loading={requesting} style={{ marginTop: 12 }} onPress={allow} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 56,
    lineHeight: 56,
    color: colors.petrol,
    marginTop: 26,
  },
  copy: {
    fontSize: 14.5,
    color: colors.muted,
    lineHeight: 23,
    marginTop: 10,
    maxWidth: 320,
  },
  mapBox: {
    flex: 1,
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(14,79,94,0.1)',
    position: 'relative',
    minHeight: 180,
  },
  userDot: {
    position: 'absolute',
    top: 130,
    right: 90,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gpsBlue,
    borderWidth: 3,
    borderColor: '#fff',
  },
  dialog: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -135 }, { translateY: -95 }],
    width: 270,
    backgroundColor: 'rgba(250,250,250,0.96)',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.3,
    shadowRadius: 50,
    elevation: 20,
  },
  dialogBody: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 14, alignItems: 'center' },
  dialogTitle: { fontSize: 15, fontFamily: fonts.bold, color: '#000', textAlign: 'center', lineHeight: 20 },
  dialogSub: { fontSize: 12.5, color: '#444', marginTop: 6, textAlign: 'center', lineHeight: 18, fontFamily: fonts.body },
  dialogRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.15)',
    paddingVertical: 11,
    alignItems: 'center',
  },
  dialogAction: { fontSize: 15, fontFamily: fonts.semibold, color: '#007AFF' },
  dialogActionLight: { fontSize: 15, fontFamily: fonts.body, color: '#007AFF' },
  notifRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(14,79,94,0.1)',
    borderRadius: 18,
    padding: 14,
    marginTop: 16,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,107,44,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: { fontSize: 14, fontFamily: fonts.bold, color: colors.ink },
  notifSub: { fontSize: 12, color: colors.muted, marginTop: 1 },
});
