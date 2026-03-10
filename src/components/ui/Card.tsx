import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { colors, spacing, shadows, radius } from '@/theme';

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
    borderRadius: radius.xl,
    padding: spacing.card,
    borderWidth: 0,
    ...shadows.card,
  },
});
