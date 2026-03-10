import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { colors, typography } from '@/theme';

export default function CreatePasswordScreen() {
  return (
    <ScreenWrapper>
      <Text style={styles.title}>Création du mot de passe</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
});
