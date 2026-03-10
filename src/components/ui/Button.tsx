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
import { colors, typography, spacing, shadows, radius } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'chip';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const HEIGHT_PRIMARY = 50;
const HEIGHT_CHIP = 32;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  disabled = false,
  fullWidth = false,
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
        fullWidth && styles.fullWidth,
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
    borderRadius: radius.lg,
    minHeight: HEIGHT_PRIMARY,
    paddingHorizontal: spacing.xxl,
  },
  primary: {
    backgroundColor: colors.accent.primary,
    ...shadows.buttonPrimary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  chip: {
    backgroundColor: colors.background.tertiary,
    minHeight: HEIGHT_CHIP,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
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
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  text: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    textTransform: 'none',
  },
  textPrimary: {
    color: colors.text.onAccent,
  },
  textSecondary: {
    color: colors.accent.primary,
    fontFamily: 'Outfit_500Medium',
  },
  textGhost: {
    color: colors.text.secondary,
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
