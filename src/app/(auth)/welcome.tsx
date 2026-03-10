import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing } from '@/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <View style={styles.content}>
        <Text style={styles.title}>Oeno.match</Text>
        <Text style={styles.subtitle}>
          Votre cave à vin, intelligente et personnelle
        </Text>
        <Button
          onPress={() => router.push('/(auth)/login' as Href)}
          style={styles.button}
        >
          Commencer
        </Button>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: spacing.xxl,
  },
  button: {
    minWidth: 200,
  },
});
