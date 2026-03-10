import React, { useEffect, useCallback } from 'react';
import { Stack, useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import 'react-native-reanimated';
import 'react-native-gesture-handler';

import '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const { profile, isAuthenticated, isLoading } = useAuth();

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!fontsLoaded || isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/welcome' as Href);
    } else if (!profile?.onboarding_completed) {
      router.replace('/(auth)/onboarding' as Href);
    } else {
      router.replace('/(tabs)' as Href);
    }
  }, [isAuthenticated, profile?.onboarding_completed, isLoading, fontsLoaded, router]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <View style={styles.root} onLayout={onLayoutRootView}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modals)" />
      </Stack>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});
