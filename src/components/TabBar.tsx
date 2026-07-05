import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Txt } from './Txt';
import { Icon } from './icons';
import { colors, fonts, shadows } from '../theme';

import { useStore } from '../store';

export type TabKey = 'map' | 'circles' | 'notifications' | 'profile';

const TABS: { key: TabKey; label: string; route: string; showBadge?: boolean }[] = [
  { key: 'map', label: 'מפה', route: '/map' },
  { key: 'circles', label: 'המעגלים שלי', route: '/my-circles' },
  { key: 'notifications', label: 'התראות', route: '/notifications', showBadge: true },
  { key: 'profile', label: 'פרופיל', route: '/profile' },
];

function TabIcon({ tab, active }: { tab: TabKey; active: boolean }) {
  const color = active ? colors.sunset : colors.faint;
  if (tab === 'map') {
    // sand-ring circle motif
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" style={{ transform: [{ rotate: '-30deg' }] }}>
        <Circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke={color}
          strokeWidth={2.2}
          strokeDasharray="18 3 13 4 15 3"
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  const name = tab === 'circles' ? 'users' : tab === 'notifications' ? 'bell' : 'settings';
  return <Icon name={name} size={23} color={color} strokeWidth={active ? 2.3 : 2} />;
}

export function TabBar({ active }: { active: TabKey }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const unread = useStore((s) => s.notifications.filter((n) => n.unread).length);
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]} pointerEvents="box-none">
      <View style={styles.pill}>
        {TABS.map((t) => {
          const isActive = t.key === active;
          const badge = t.showBadge ? unread : 0;
          return (
            <Pressable
              key={t.key}
              style={styles.tab}
              onPress={() => !isActive && router.replace(t.route as any)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={badge > 0 ? `${t.label}, ${badge} חדשות` : t.label}
            >
              <View>
                <TabIcon tab={t.key} active={isActive} />
                {badge > 0 ? (
                  <View style={styles.badge}>
                    <Txt style={{ color: '#fff', fontSize: 9.5, fontFamily: fonts.extrabold }}>{badge}</Txt>
                  </View>
                ) : null}
              </View>
              <Txt
                style={{
                  fontSize: 10.5,
                  fontFamily: isActive ? fonts.bold : fonts.medium,
                  color: isActive ? colors.sunset : colors.faint,
                  marginTop: 3,
                }}
              >
                {t.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  pill: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.cardBlur,
    borderRadius: 33,
    height: 66,
    paddingHorizontal: 8,
    marginHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: colors.hairline,
    ...shadows.tabBar,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -5,
    left: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.sunset,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
});
