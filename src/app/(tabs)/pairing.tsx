import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { colors, typography, spacing } from '@/theme';

export default function PairingScreen() {
  return (
    <ScreenWrapper>
      <Text style={styles.header}>Accords</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.section,
  },
});
