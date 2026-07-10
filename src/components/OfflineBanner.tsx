import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Txt } from './Txt';
import { Icon } from './icons';
import { colors, fonts } from '../theme';
import { isSupabaseConfigured } from '../lib/supabase';
import { useStore } from '../store';

// Shown when we have a signed-in identity but couldn't load live data
// (fetch failed / offline). Offers a retry that re-runs hydrate. Hidden in
// pure offline-demo mode (no backend configured) and while genuinely live.
export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const authKind = useStore((s) => s.authKind);
  const live = useStore((s) => s.live);
  const hydrate = useStore((s) => s.hydrate);
  const [retrying, setRetrying] = useState(false);

  if (!isSupabaseConfigured || live || authKind === 'none') return null;

  const retry = async () => {
    if (retrying) return;
    setRetrying(true);
    await hydrate();
    setRetrying(false);
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
      <View style={styles.banner}>
        <Icon name="wifiOff" size={16} color={colors.sandGlow} strokeWidth={2} />
        <View style={{ flex: 1 }}>
          <Txt style={styles.title}>אין חיבור לרשת</Txt>
          <Txt style={styles.sub}>מציגים את מה ששמור אצלך</Txt>
        </View>
        <Pressable
          onPress={retry}
          style={styles.retryPill}
          accessibilityRole="button"
          accessibilityLabel="נסה שוב"
        >
          <Txt style={styles.retry}>{retrying ? 'מתחבר…' : 'נסה שוב'}</Txt>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', zIndex: 50 },
  banner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.ink,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 14,
  },
  title: { color: '#fff', fontSize: 13.5, fontFamily: fonts.bold },
  sub: { color: 'rgba(255,255,255,.75)', fontSize: 12, fontFamily: fonts.medium, marginTop: 1 },
  retryPill: {
    minHeight: 36,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.14)',
    borderRadius: 18,
    paddingHorizontal: 14,
  },
  retry: { color: colors.sandGlow, fontSize: 12.5, fontFamily: fonts.bold },
});
