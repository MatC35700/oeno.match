import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
}) => {
  const isAccent = variant === 'accent';

  return (
    <View
      style={[
        styles.badge,
        isAccent ? styles.badgeAccent : styles.badgeDefault,
      ]}
    >
      <Text
        style={[
          styles.text,
          isAccent ? styles.textAccent : styles.textDefault,
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeDefault: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 0,
  },
  badgeAccent: {
    backgroundColor: colors.accent.muted,
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  text: {
    ...typography.bodySmall,
  },
  textDefault: {
    color: colors.text.secondary,
  },
  textAccent: {
    color: colors.accent.primary,
  },
});
