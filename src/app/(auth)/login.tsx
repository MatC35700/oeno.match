import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing } from '@/theme';
import { signInWithEmail, signUpWithEmail, signInWithOAuth, resetPasswordForEmail } from '@/lib/supabase/auth';

type AuthMode = 'login' | 'register';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError(null);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email et mot de passe requis');
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
      setError('Email requis');
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

  const handleOAuth = async (provider: 'google' | 'apple' | 'facebook') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);
    const { error: err } = await signInWithOAuth(provider);
    setLoading(false);
    if (err) {
      setError(err.message);
    }
  };

  const canSubmit = mode === 'login' ? email && password : email;

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
          <View style={styles.tabs}>
            <Pressable
              onPress={() => setMode('login')}
              style={[styles.tab, mode === 'login' && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === 'login' && styles.tabTextActive,
                ]}
              >
                {t('auth.login')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('register')}
              style={[styles.tab, mode === 'register' && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === 'register' && styles.tabTextActive,
                ]}
              >
                {t('auth.register')}
              </Text>
            </Pressable>
          </View>

          {mode === 'login' ? (
            <>
              <Input
                label={t('auth.email')}
                placeholder="vous@exemple.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <Input
                label={t('auth.password')}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
              <Pressable
                onPress={async () => {
                  if (!email) {
                    setError('Entrez votre email pour réinitialiser le mot de passe');
                    return;
                  }
                  setLoading(true);
                  const { error: err } = await resetPasswordForEmail(email);
                  setLoading(false);
                  if (err) setError(err.message);
                  else Alert.alert('Email envoyé', 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.');
                }}
                style={styles.forgotLink}
              >
                <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
              </Pressable>
              <Button
                onPress={handleLogin}
                disabled={!canSubmit || loading}
                style={styles.submit}
              >
                {t('auth.login')}
              </Button>
            </>
          ) : (
            <>
              <Input
                label={t('auth.email')}
                placeholder="vous@exemple.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <Button
                onPress={handleRegister}
                disabled={!canSubmit || loading}
                style={styles.submit}
              >
                {t('auth.createAccount')}
              </Button>
            </>
          )}

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>{t('auth.orContinueWith')}</Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.socialRow}>
            <Button
              variant="ghost"
              onPress={() => handleOAuth('google')}
              disabled={loading}
              style={styles.socialBtn}
            >
              <Ionicons name="logo-google" size={24} color={colors.accent.primary} />
            </Button>
            <Button
              variant="ghost"
              onPress={() => handleOAuth('apple')}
              disabled={loading}
              style={styles.socialBtn}
            >
              <Ionicons name="logo-apple" size={24} color={colors.accent.primary} />
            </Button>
            <Button
              variant="ghost"
              onPress={() => handleOAuth('facebook')}
              disabled={loading}
              style={styles.socialBtn}
            >
              <Ionicons name="logo-facebook" size={24} color={colors.accent.primary} />
            </Button>
          </View>
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
    paddingBottom: spacing.xxl,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.section,
    borderBottomWidth: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.accent.primary,
    fontFamily: 'Outfit_600SemiBold',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  submit: {
    marginBottom: spacing.md,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: spacing.md,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.section,
    gap: spacing.md,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  separatorText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialBtn: {
    minWidth: 56,
  },
});
