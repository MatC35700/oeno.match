import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/theme';
import { supabase } from '@/config/supabase';
import { signInWithEmail, signUpWithEmail } from '@/lib/supabase/auth';

type Stage = 'email' | 'login';

export default function LoginEmailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckEmail = async () => {
    if (!email) {
      setError(t('auth.email') || 'Adresse e-mail requise');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data) {
      setStage('login');
    } else {
      // Adresse inconnue : on reste sur cet écran et on déclenche directement la création de compte
      await handleRegister();
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('auth.email') || 'Email et mot de passe requis');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);
    const { error: err } = await signInWithEmail(email, password);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.replace('/(tabs)' as Href);
  };

  const handleRegister = async () => {
    if (!email) {
      setError(t('auth.email') || 'Adresse e-mail requise');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);
    const { error: err } = await signUpWithEmail(email);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push(`/(auth)/verify-email?email=${encodeURIComponent(email)}` as Href);
  };

  const title =
    stage === 'email'
      ? t('auth.enterEmailTitle') || 'Indiquez votre adresse e-mail'
      : t('auth.login') || 'Se connecter';

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={styles.backBtn}
              hitSlop={8}
            >
              <Ionicons name="arrow-back" size={18} color={colors.text.primary} />
            </Pressable>
            <Text style={styles.title}>{title}</Text>
          </View>

          <Input
            label={t('auth.email')}
            placeholder="vous@exemple.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={stage === 'email'}
          />

          {stage === 'login' && (
            <Input
              label={t('auth.password')}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          )}

          {error && <Text style={styles.error}>{error}</Text>}

          {stage === 'email' && (
            <Button
              onPress={handleCheckEmail}
              disabled={loading || !email}
              style={styles.submit}
            >
              {t('common.next') || 'Suivant'}
            </Button>
          )}

          {stage === 'login' && (
            <Button
              onPress={handleLogin}
              disabled={loading || !email || !password}
              style={styles.submit}
            >
              {t('auth.login') || 'Se connecter'}
            </Button>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  submit: {
    marginTop: spacing.lg,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.md,
  },
});

