import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { LangProvider } from '../src/lib/LangContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LangProvider>
        <StatusBar style="dark" backgroundColor="#f5f4f0" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" />
          <Stack.Screen
            name="scan"
            options={{ presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="scan-result"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="repair" />
          <Stack.Screen name="repair-detail" />
          <Stack.Screen name="maintenance" />
          <Stack.Screen name="documents" />
          <Stack.Screen name="settings" />
        </Stack>
      </LangProvider>
    </GestureHandlerRootView>
  );
}
