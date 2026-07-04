import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
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
import { colors } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

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

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.sandBg },
          animation: 'slide_from_left', // RTL-forward feel
        }}
      />
    </SafeAreaProvider>
  );
}
