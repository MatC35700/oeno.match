import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { colors, radius, spacing, shadows } from '@/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, style, ...props }) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.card,
    ...shadows.card,
  },
});
