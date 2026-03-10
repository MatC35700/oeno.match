import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '@/theme';
import type { MaturityPhase } from '@/types/wine';

const MATURITY_CONFIG: Record<
  MaturityPhase,
  { icon: keyof typeof Ionicons.glyphMap; color: string; labelKey: string }
> = {
  drink: { icon: 'wine-outline', color: colors.maturity.drink, labelKey: 'drink' },
  peak: { icon: 'star-outline', color: colors.maturity.peak, labelKey: 'peak' },
  wait: { icon: 'time-outline', color: colors.maturity.wait, labelKey: 'wait' },
  sleep: { icon: 'moon-outline', color: colors.maturity.sleep, labelKey: 'sleep' },
};

interface MaturityBadgeProps {
  phase: MaturityPhase;
  showLabel?: boolean;
}

export const MaturityBadge: React.FC<MaturityBadgeProps> = ({
  phase,
  showLabel = false,
}) => {
  const config = MATURITY_CONFIG[phase];
  const bgColor = `${config.color}26`;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Ionicons name={config.icon} size={16} color={config.color} />
      {showLabel && (
        <Text style={[styles.label, { color: config.color }]}>
          {config.labelKey}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    fontFamily: 'Outfit_500Medium',
  },
});
