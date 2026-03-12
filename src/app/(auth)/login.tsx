import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { colors, typography, spacing } from '@/theme';
import { signInWithOAuth } from '@/lib/supabase/auth';
import { setAppLanguage } from '@/lib/i18n';
import type { SupportedLanguage } from '@/lib/i18n';

const LANGUAGES: { code: SupportedLanguage; labelKey: string }[] = [
  { code: 'fr', labelKey: 'language.french' },
  { code: 'en', labelKey: 'language.english' },
  { code: 'es', labelKey: 'language.spanish' },
  { code: 'it', labelKey: 'language.italian' },
  { code: 'de', labelKey: 'language.german' },
];

export default function LoginScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const currentLanguage = (i18n.language as SupportedLanguage) || 'fr';

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
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {t('auth.loginTitle') || 'Inscrivez-vous ou connectez-vous'}
              </Text>
            </View>
            <View style={styles.languageSelector}>
              <Pressable
                style={styles.languageChip}
                onPress={() => setLanguageMenuOpen((open) => !open)}
                hitSlop={8}
              >
                <Text style={styles.languageChipText}>{currentLanguage.toUpperCase()}</Text>
                <Ionicons name={languageMenuOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.text.primary} />
              </Pressable>
              {languageMenuOpen && (
                <View style={styles.languageMenu}>
                  {LANGUAGES.map(({ code, labelKey }) => (
                    <Pressable
                      key={code}
                      onPress={() => {
                        setLanguageMenuOpen(false);
                        setAppLanguage(code);
                      }}
                      style={styles.languageMenuItem}
                    >
                      <Text
                        style={[
                          styles.languageMenuText,
                          currentLanguage === code && styles.languageMenuTextActive,
                        ]}
                      >
                        {t(labelKey)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.socialSection}>
            <Pressable
              onPress={() => handleOAuth('apple')}
              disabled={loading}
              style={styles.socialPrimaryButton}
            >
              <View style={styles.socialContent}>
                <View style={styles.socialIconSlot}>
                  <Ionicons name="logo-apple" size={24} color="#000000" />
                </View>
                <Text style={styles.socialPrimaryText}>
                  {t('auth.continueWithApple') || 'Continuer avec Apple'}
                </Text>
                <View style={styles.socialIconSlot} />
              </View>
            </Pressable>
            <Pressable
              onPress={() => handleOAuth('google')}
              disabled={loading}
              style={styles.socialPrimaryButton}
            >
              <View style={styles.socialContent}>
                <View style={styles.socialIconSlot}>
                  <Ionicons name="logo-google" size={24} color="#4285F4" />
                </View>
                <Text style={styles.socialPrimaryText}>
                  {t('auth.continueWithGoogle') || 'Continuer avec Google'}
                </Text>
                <View style={styles.socialIconSlot} />
              </View>
            </Pressable>
            <Pressable
              onPress={() => handleOAuth('facebook')}
              disabled={loading}
              style={styles.socialPrimaryButton}
            >
              <View style={styles.socialContent}>
                <View style={styles.socialIconSlot}>
                  <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                </View>
                <Text style={styles.socialPrimaryText}>
                  {t('auth.continueWithFacebook') || 'Continuer avec Facebook'}
                </Text>
                <View style={styles.socialIconSlot} />
              </View>
            </Pressable>
          </View>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>
              {t('auth.orContinueWithEmail') || 'Ou continuer avec une adresse e-mail'}
            </Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.socialSection}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(auth)/login-email' as Href);
              }}
              disabled={loading}
              style={styles.socialPrimaryButton}
            >
              <View style={styles.socialContent}>
                <View style={styles.socialIconSlot} />
                <Text style={styles.socialPrimaryTextEmail}>
                  {t('auth.continueWithEmail') || 'Continuer avec une adresse e-mail'}
                </Text>
                <View style={styles.socialIconSlot} />
              </View>
            </Pressable>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  languageSelector: {
    marginLeft: spacing.sm,
    alignItems: 'flex-end',
  },
  languageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  languageChipText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  languageMenu: {
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  languageMenuItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  languageMenuText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  languageMenuTextActive: {
    color: colors.accent.primary,
    fontWeight: '600',
  },
  socialSection: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  socialPrimaryButton: {
    borderRadius: 999,
    backgroundColor: '#F3F3F5',
    borderWidth: 0,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  socialContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  socialIconSlot: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  socialPrimaryText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  socialPrimaryTextEmail: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
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
