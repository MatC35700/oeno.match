import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing } from '@/theme';
import { setAppLanguage } from '@/lib/i18n';
import { setLanguageScreenSeen } from '@/lib/auth/firstLaunch';
import type { SupportedLanguage } from '@/lib/i18n';

const LANGUAGES: { code: SupportedLanguage; flag: string; labelKey: string }[] = [
  { code: 'fr', flag: '🇫🇷', labelKey: 'language.french' },
  { code: 'en', flag: '🇬🇧', labelKey: 'language.english' },
  { code: 'es', flag: '🇪🇸', labelKey: 'language.spanish' },
  { code: 'it', flag: '🇮🇹', labelKey: 'language.italian' },
  { code: 'de', flag: '🇩🇪', labelKey: 'language.german' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = React.useState<SupportedLanguage>(i18n.language as SupportedLanguage || 'fr');

  const handleSelect = (code: SupportedLanguage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(code);
    setAppLanguage(code);
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setLanguageScreenSeen();
    router.push('/(auth)/login' as Href);
  };

  return (
    <ScreenWrapper>
      <Text style={styles.title}>{t('language.selectLanguage')}</Text>
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {LANGUAGES.map(({ code, flag, labelKey }) => (
          <Pressable
            key={code}
            onPress={() => handleSelect(code)}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Card
              style={[
                styles.option,
                selected === code && styles.optionSelected,
              ]}
            >
              <Text style={styles.flag}>{flag}</Text>
              <Text style={styles.label}>{t(labelKey)}</Text>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
      <Button onPress={handleNext} style={styles.button}>
        {t('common.next')}
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
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.section,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: colors.accent.primary,
  },
  pressed: {
    opacity: 0.9,
  },
  flag: {
    fontSize: 24,
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
  },
  button: {
    marginTop: spacing.md,
  },
});
