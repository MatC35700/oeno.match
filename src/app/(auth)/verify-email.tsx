import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, typography, spacing } from '@/theme';
import { resendMagicLink, verifyOtpWithCode } from '@/lib/supabase/auth';

const COOLDOWN_SECONDS = 60;
const OTP_MIN_LENGTH = 6;
const OTP_MAX_LENGTH = 10;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { t } = useTranslation();
  const email = params.email ?? '';
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const pulse = useSharedValue(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, [pulse]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setOtpError(null);
    setOtpCode('');
    const { error } = await resendMagicLink(email);
    setLoading(false);
    if (!error) setCooldown(COOLDOWN_SECONDS);
  };

  const handleVerify = async () => {
    const code = otpCode.replace(/\D/g, '').slice(0, OTP_MAX_LENGTH);
    if (code.length < OTP_MIN_LENGTH || !email) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setOtpError(null);
    const { error } = await verifyOtpWithCode(email, code);
    setLoading(false);
    if (error) {
      setOtpError(error.message);
      return;
    }
    router.replace('/(auth)/create-password' as Href);
  };

  const otpCodeClean = otpCode.replace(/\D/g, '').slice(0, OTP_MAX_LENGTH);
  const canVerify = otpCodeClean.length >= OTP_MIN_LENGTH && !!email;

  return (
    <ScreenWrapper>
      <View style={styles.content}>
        <Animated.View style={[styles.iconWrap, animatedIconStyle]}>
          <Ionicons
            name="mail-open-outline"
            size={80}
            color={colors.accent.primary}
          />
        </Animated.View>
        <Text style={styles.title}>{t('auth.verifyEmail')}</Text>
        <Text style={styles.message}>
          {t('auth.emailSent', { email: email || '...' })}
        </Text>
        <Text style={styles.otpHint}>{t('auth.otpHint')}</Text>
        <View style={styles.otpInput}>
          <Input
            placeholder={t('auth.otpPlaceholder')}
            value={otpCode}
            onChangeText={(v) => {
              setOtpCode(v.replace(/\D/g, '').slice(0, OTP_MAX_LENGTH));
              setOtpError(null);
            }}
            keyboardType="number-pad"
            maxLength={OTP_MAX_LENGTH}
          />
        </View>
        {otpError && <Text style={styles.otpError}>{otpError}</Text>}
        <Button
          variant="primary"
          onPress={handleVerify}
          disabled={!canVerify || loading}
          style={styles.btn}
        >
          {t('auth.verifyCode')}
        </Button>
        <Button
          variant="secondary"
          onPress={handleResend}
          disabled={cooldown > 0 || loading}
          style={styles.btn}
        >
          {t('auth.resendEmail')}
          {cooldown > 0 ? ` (${cooldown}s)` : ''}
        </Button>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: spacing.section,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.section,
  },
  btn: {
    width: '100%',
    marginBottom: spacing.md,
  },
  otpHint: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  otpInput: {
    marginBottom: spacing.md,
  },
  otpError: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
