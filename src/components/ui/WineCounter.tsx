import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme';

interface WineCounterProps {
  count: number;
  label?: string;
}

export const WineCounter: React.FC<WineCounterProps> = ({ count, label }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.count}>{count}</Text>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  count: {
    ...typography.display,
    color: colors.accent.primary,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 4,
  },
});
