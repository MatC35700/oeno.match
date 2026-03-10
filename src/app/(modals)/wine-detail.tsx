import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing } from '@/theme';

export default function WineDetailScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Fiche vin</Text>
      <Button variant="ghost" onPress={() => router.back()}>
        Fermer
      </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
});
