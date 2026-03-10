import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  type PressableProps,
  type TextStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, typography, radius, spacing, shadows } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'chip';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const HEIGHT_PRIMARY = 48;
const HEIGHT_CHIP = 32;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  disabled = false,
  style,
  ...props
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  const isChip = variant === 'chip';
  const hasMutedPress = (isSecondary || isGhost) && !disabled;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        isGhost && styles.ghost,
        isChip && styles.chip,
        disabled && styles.disabled,
        isPrimary && pressed && !disabled && styles.pressed,
        hasMutedPress && pressed && styles.pressedMuted,
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      <Text
        style={[
          styles.text,
          isPrimary && styles.textPrimary,
          isSecondary && styles.textSecondary,
          isGhost && styles.textGhost,
          isChip && styles.textChip,
          disabled && styles.textDisabled,
        ] as TextStyle[]}
      >
        {children}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    minHeight: HEIGHT_PRIMARY,
    paddingHorizontal: spacing.xxl,
  },
  primary: {
    backgroundColor: colors.accent.primary,
    ...shadows.subtle,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accent.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  chip: {
    backgroundColor: colors.background.tertiary,
    minHeight: HEIGHT_CHIP,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  pressedMuted: {
    backgroundColor: colors.accent.muted,
  },
  text: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
  },
  textPrimary: {
    color: colors.text.inverse,
  },
  textSecondary: {
    color: colors.accent.primary,
    fontFamily: 'Outfit_500Medium',
  },
  textGhost: {
    color: colors.accent.primary,
    fontFamily: 'Outfit_500Medium',
  },
  textChip: {
    color: colors.text.secondary,
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
  },
  textDisabled: {
    color: colors.text.tertiary,
  },
});
