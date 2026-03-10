import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing } from '@/theme';
import { hasSeenLanguageScreen } from '@/lib/auth/firstLaunch';
import { useTranslation } from 'react-i18next';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + progress.value * 0.2,
  }));

  const handleStart = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const seen = await hasSeenLanguageScreen();
    if (seen) {
      router.push('/(auth)/login' as Href);
    } else {
      router.push('/(auth)/language' as Href);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={['#0A0A0F', '#1a0a0f', '#2E1519', '#1a0a0f', '#0A0A0F']}
          locations={[0, 0.3, 0.5, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>Oeno.match</Text>
          <Text style={styles.subtitle}>{t('welcome.tagline')}</Text>
        </View>
      </SafeAreaView>
      <SafeAreaView style={styles.footerSafe} edges={['bottom']}>
        <View style={styles.footer}>
          <Button onPress={handleStart} fullWidth>
            {t('welcome.start')}
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
  },
  footerSafe: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.accent.primary,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  footer: {},
});
