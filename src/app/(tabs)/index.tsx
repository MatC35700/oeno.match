import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { WineCounter } from '@/components/ui/WineCounter';
import { colors, typography, spacing } from '@/theme';

export default function HomeScreen() {
  return (
    <ScreenWrapper>
      <Text style={styles.header}>Accueil</Text>
      <View style={styles.section}>
        <WineCounter count={0} label="bouteilles" />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.section,
  },
  section: {
    marginBottom: spacing.section,
  },
});
