import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';

const FALLBACK_BG = 'rgba(20, 20, 31, 0.95)';

interface BlurFallbackProps {
  children?: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: ViewStyle;
}

/**
 * Remplace BlurView par une View semi-transparente.
 * BlurView (expo-blur) peut crasher sur simulateur ou certaines configs.
 * Ce fallback garantit un rendu stable sur toutes les plateformes.
 */
export const BlurFallback: React.FC<BlurFallbackProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.fallback, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: FALLBACK_BG,
  },
});
