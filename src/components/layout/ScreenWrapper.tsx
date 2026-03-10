import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Pas de marge horizontale : le contenu remplit toute la largeur */
  fullWidth?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  edges = ['top', 'left', 'right'],
  fullWidth = false,
  style,
  ...props
}) => {
  return (
    <SafeAreaView
      style={[styles.safeArea, style]}
      edges={edges}
      {...props}
    >
      <View style={[styles.content, fullWidth && styles.contentFullWidth]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
  },
  contentFullWidth: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
});
