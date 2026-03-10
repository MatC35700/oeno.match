import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '@/theme';

interface StarRatingProps {
  rating: number; // 0-10
  max?: number;
  showValue?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  max = 10,
  showValue = true,
}) => {
  const normalized = Math.min(Math.max(rating, 0), max);
  const displayValue = (normalized / max).toFixed(1);

  return (
    <View style={styles.container}>
      <Ionicons name="star" size={20} color={colors.accent.primary} />
      {showValue && (
        <Text style={styles.value}>
          {displayValue}/{max}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});
