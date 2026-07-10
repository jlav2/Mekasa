import { Platform, View, Pressable, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Txt, Icon, OfflineBanner, Toast } from '../../src/components';
import { colors, fonts, shadows } from '../../src/theme';
import { useStore } from '../../src/store';

const TAB_META: Record<string, { label: string; icon: 'map' | 'users' | 'bell' | 'settings' }> = {
  map: { label: 'מפה', icon: 'map' },
  'my-circles': { label: 'המעגלים שלי', icon: 'users' },
  notifications: { label: 'התראות', icon: 'bell' },
  profile: { label: 'פרופיל', icon: 'settings' },
};

function TabIcon({ icon, active }: { icon: string; active: boolean }) {
  const color = active ? colors.sunset : colors.faint;
  if (icon === 'map') {
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
  return <Icon name={icon as any} size={23} color={color} strokeWidth={active ? 2.3 : 2} />;
}

// Minimal structural type — expo-router vendors its own bottom-tabs types,
// so depending on @react-navigation/bottom-tabs directly causes conflicts.
type PillTabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (e: any) => any;
    navigate: (name: string) => void;
  };
};

// The iOS floating pill bar (design 1c) as a real navigation tab bar —
// screens keep their state across tab switches.
function PillTabBar({ state, navigation }: PillTabBarProps) {
  const insets = useSafeAreaInsets();
  const unread = useStore((s) => s.notifications.filter((n) => n.unread).length);

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]} pointerEvents="box-none">
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;
          const isActive = state.index === index;
          const badge = route.name === 'notifications' ? unread : 0;
          return (
            <Pressable
              key={route.key}
              style={[styles.tab, Platform.OS === 'web' && { cursor: 'pointer' }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={meta.label}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!isActive && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            >
              <Animated.View
                style={{
                  transform: [{ scale: isActive ? 1.12 : 1 }, { translateY: isActive ? -1 : 0 }],
                  transitionProperty: 'transform',
                  transitionDuration: 180,
                  transitionTimingFunction: 'ease-out',
                }}
              >
                <TabIcon icon={meta.icon} active={isActive} />
                {badge > 0 ? (
                  <Animated.View entering={ZoomIn.duration(200)} exiting={ZoomOut.duration(150)} style={styles.badge}>
                    <Txt style={{ color: '#fff', fontSize: 11, fontFamily: fonts.extrabold }}>{badge}</Txt>
                  </Animated.View>
                ) : null}
              </Animated.View>
              <Txt
                style={{
                  fontSize: 10.5,
                  fontFamily: isActive ? fonts.bold : fonts.medium,
                  color: isActive ? colors.sunset : colors.faint,
                  marginTop: 3,
                }}
              >
                {meta.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <PillTabBar {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.sandBg } }}
      >
        <Tabs.Screen name="map" />
        <Tabs.Screen name="my-circles" />
        <Tabs.Screen name="notifications" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <OfflineBanner />
      <Toast />
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
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.sunset,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
});
