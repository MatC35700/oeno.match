import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, type Href } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { colors, spacing, typography } from '@/theme';
import { useAuthStore } from '@/stores/authStore';

export default function ProfileOnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuthStore();

  if (!profile) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {t('profile.noOnboarding') || 'Aucune information de profil trouvée.'}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const goalsLabels = (profile.goals ?? []).map((g) => t(`onboardingGoal.${g}`, t(`onboarding.${g}`)));

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>
          {t('profile.onboardingTitle') || 'Mon profil'}
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('onboarding.age')}</Text>
          <Text style={styles.value}>{profile.age ?? '—'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('onboarding.regions')}</Text>
          <Text style={styles.value}>
            {profile.favorite_regions?.length
              ? profile.favorite_regions.map((r) => t(`regions.${r}`)).join(', ')
              : '—'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('onboarding.experience')}</Text>
          <Text style={styles.value}>
            {profile.experience_level
              ? t(`onboarding.${profile.experience_level}`)
              : '—'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('onboarding.goals')}</Text>
          <Text style={styles.value}>
            {goalsLabels.length ? goalsLabels.join(', ') : '—'}
          </Text>
        </View>

        <Text
          style={styles.backLink}
          onPress={() => router.back()}
        >
          {t('common.back')}
        </Text>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.body,
    color: colors.text.primary,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  backLink: {
    ...typography.bodySmall,
    color: colors.accent.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});

