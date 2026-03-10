import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '@/theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'wine';
  color?: keyof typeof colors.wine;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  color = 'red',
}) => {
  const bgColor =
    variant === 'accent'
      ? colors.accent.muted
      : variant === 'wine'
        ? `${colors.wine[color]}26`
        : colors.background.tertiary;

  const textColor =
    variant === 'accent'
      ? colors.accent.primary
      : variant === 'wine'
        ? colors.wine[color]
        : colors.text.secondary;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
  },
});
