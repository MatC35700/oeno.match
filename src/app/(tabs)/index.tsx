import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { WineCounter } from '@/components/ui/WineCounter';
import { colors, typography, spacing } from '@/theme';
import { useCellar } from '@/hooks/useCellar';

export default function HomeScreen() {
  const { wines } = useCellar();

  const totalBottles = useMemo(
    () => wines.reduce((sum, wine) => sum + (wine.is_wishlist ? 0 : wine.quantity ?? 0), 0),
    [wines],
  );

  return (
    <ScreenWrapper>
      <Text style={styles.header}>Accueil</Text>
      <View style={styles.section}>
        <WineCounter count={totalBottles} label="bouteilles" />
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
