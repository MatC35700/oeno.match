import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing } from '@/theme';
import { updatePassword } from '@/lib/supabase/auth';

const passwordSchema = z
  .string()
  .min(10, 'Minimum 10 caractères')
  .regex(/[0-9]/, 'Au moins un chiffre')
  .regex(/[^a-zA-Z0-9]/, 'Au moins un caractère spécial');

function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 10) strength += 33;
  if (/[0-9]/.test(password)) strength += 33;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 34;
  return strength;
}

export default function CreatePasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = getPasswordStrength(password);
  const isValid = passwordSchema.safeParse(password).success;
  const hasMinChars = password.length >= 10;
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const canSubmit = isValid && password === confirm;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);
    const { error: err } = await updatePassword(password);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.replace('/(auth)/onboarding' as Href);
  };

  const strengthColor =
    strength < 33 ? colors.error : strength < 66 ? colors.warning : colors.success;

  return (
    <ScreenWrapper>
      <Text style={styles.title}>{t('auth.createPassword')}</Text>

      <Input
        label={t('auth.password')}
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        rightIcon={
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowPassword((s) => !s);
            }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.text.tertiary}
            />
          </Pressable>
        }
      />

      <View style={styles.strengthBar}>
        <View
          style={[
            styles.strengthFill,
            { width: `${strength}%`, backgroundColor: strengthColor },
          ]}
        />
      </View>

      <View style={styles.checklist}>
        <Text style={[styles.checkItem, hasMinChars && styles.checkDone]}>
          {hasMinChars ? '✓' : '○'} {t('auth.minChars')}
        </Text>
        <Text style={[styles.checkItem, hasNumber && styles.checkDone]}>
          {hasNumber ? '✓' : '○'} {t('auth.oneNumber')}
        </Text>
        <Text style={[styles.checkItem, hasSpecial && styles.checkDone]}>
          {hasSpecial ? '✓' : '○'} {t('auth.oneSpecial')}
        </Text>
      </View>

      <Input
        label={t('auth.confirmPassword')}
        placeholder="••••••••"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        onPress={handleSubmit}
        disabled={!canSubmit || loading}
        style={styles.submit}
      >
        {t('auth.validate')}
      </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.section,
  },
  strengthBar: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  checklist: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  checkItem: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  checkDone: {
    color: colors.success,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: spacing.md,
  },
  submit: {
    marginTop: spacing.md,
  },
});
