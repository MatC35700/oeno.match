import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors, typography, spacing } from '@/theme';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onHide?: () => void;
  duration?: number;
}

const TOAST_BG: Record<ToastType, string> = {
  success: colors.success,
  error: colors.error,
  info: colors.text.secondary,
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible,
  onHide,
  duration = 3000,
}) => {
  useEffect(() => {
    if (!visible || !onHide) return;
    const t = setTimeout(onHide, duration);
    return () => clearTimeout(t);
  }, [visible, onHide, duration]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[styles.toast, { backgroundColor: TOAST_BG[type] }]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    left: spacing.screen,
    right: spacing.screen,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    ...typography.body,
    color: colors.text.inverse,
  },
});
