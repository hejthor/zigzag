import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useShareIntentListener } from './ShareIntentListener';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { ImageProvider } from '../context/ImageContext';

function ShareIntentListenerGate({ children }: { children: React.ReactNode }) {
  const isShareIntentReady = useShareIntentListener();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  useEffect(() => {
    if (loaded && isShareIntentReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isShareIntentReady]);
  if (!loaded || !isShareIntentReady) {
    return null;
  }
  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ImageProvider>
      <SafeAreaProvider>
        <ShareIntentListenerGate>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </ShareIntentListenerGate>
      </SafeAreaProvider>
    </ImageProvider>
  );
}
