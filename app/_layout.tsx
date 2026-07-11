import { ReactNode, useEffect } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { Stack, usePathname, useRouter, useGlobalSearchParams } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Heebo_400Regular,
  Heebo_500Medium,
  Heebo_600SemiBold,
  Heebo_700Bold,
  Heebo_800ExtraBold,
} from '@expo-google-fonts/heebo';
import {
  Karantina_300Light,
  Karantina_400Regular,
  Karantina_700Bold,
} from '@expo-google-fonts/karantina';
import { colors, shadows } from '../src/theme';
import { BrandSplash, InAppBanner } from '../src/components';
import { useStore } from '../src/store';
import {
  setupAndroidChannels,
  setupIOSCategories,
  routeFromNotification,
  bannerKindFromCategory,
  registerForPushNotificationsAsync,
} from '../src/lib/notifications';
import type { BannerKind } from '../src/store/slices/bannerSlice';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Centers the app in a phone-width column on wide browser windows instead of
// stretching the mobile layout edge-to-edge; no-op on native.
const WEB_SHELL_MAX_WIDTH = 480;

function WebShell({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  const { width } = useWindowDimensions();
  const isWide = width > WEB_SHELL_MAX_WIDTH;
  return (
    <View style={{ flex: 1, backgroundColor: colors.petrolDeep, alignItems: 'center' }}>
      <View style={[{ flex: 1, width: '100%', maxWidth: WEB_SHELL_MAX_WIDTH }, isWide && shadows.card]}>
        {children}
      </View>
    </View>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ id?: string; circle?: string }>();

  const [loaded, error] = useFonts({
    Heebo_400Regular,
    Heebo_500Medium,
    Heebo_600SemiBold,
    Heebo_700Bold,
    Heebo_800ExtraBold,
    Karantina_300Light,
    Karantina_400Regular,
    Karantina_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  // Hydrate from Supabase (no-op when unconfigured — fixtures keep working)
  useEffect(() => {
    useStore.getState().hydrate();
  }, []);

  // Keep the banner suppression context in sync with the active route.
  const circleId = (Array.isArray(params.circle) ? params.circle[0] : params.circle) ??
    (Array.isArray(params.id) ? params.id[0] : params.id);
  useEffect(() => {
    // liveGameActive drives the "don't interrupt a live game" suppression arm —
    // true when the active screen belongs to a circle that's currently live.
    const circle = circleId ? useStore.getState().circleById(circleId) : undefined;
    useStore.getState().setBannerContext({ pathname, circleId, liveGameActive: circle?.state === 'live' });
  }, [pathname, circleId]);

  // Push notifications (native only). expo-notifications has no meaningful web
  // surface, and the in-app banner covers the foreground path there anyway.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    setupAndroidChannels().catch(() => {});
    setupIOSCategories().catch(() => {});
    registerForPushNotificationsAsync().catch(() => {});

    // Foreground: suppress the OS banner and render our own from the payload.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: false,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: true,
      }),
    });
    const received = Notifications.addNotificationReceivedListener((n) => {
      const content = n.request.content;
      const data = (content.data ?? {}) as Record<string, any>;
      const kind = (data.kind as BannerKind | undefined) ??
        (bannerKindFromCategory(content.categoryIdentifier ?? undefined) as BannerKind | null);
      if (!kind) return; // rsvp etc. → notifications tab only
      useStore.getState().showBanner({
        kind,
        title: content.title ?? '',
        body: content.body ?? '',
        circleId: data.circleId,
        expiresAt: data.expiresAt,
        claimToken: data.claimToken,
        requestId: data.requestId,
        senderName: data.senderName,
        senderColor: data.senderColor,
      });
    });
    // Tap on a delivered notification → deep-link route.
    const responded = Notifications.addNotificationResponseReceivedListener((r) => {
      const path = routeFromNotification(r);
      if (path) router.push(path as any);
    });
    return () => {
      received.remove();
      responded.remove();
    };
  }, [router]);

  // Fonts still loading: on native the OS splash covers this frame; on web
  // (no native splash) this IS the first paint — show the branded splash
  // rather than a blank so startup reads as MeKasa from the first moment.
  if (!loaded && !error) return <BrandSplash />;

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <WebShell>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.sandBg },
              animation: 'slide_from_left', // RTL-forward feel
            }}
          />
          <InAppBanner />
        </WebShell>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
