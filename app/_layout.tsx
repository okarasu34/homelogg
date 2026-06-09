import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { LangProvider } from '../src/lib/LangContext';
import { supabase } from '../src/lib/supabase';
import { Session } from '@supabase/supabase-js';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      SplashScreen.hideAsync();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session);
});

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LangProvider>
        <StatusBar style="dark" backgroundColor="#f5f4f0" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="scan" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="scan-result" options={{ presentation: 'modal' }} />
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