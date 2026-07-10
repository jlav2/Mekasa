import { ReactNode, useEffect } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
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
import { BrandSplash } from '../src/components';
import { useStore } from '../src/store';

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
        </WebShell>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
