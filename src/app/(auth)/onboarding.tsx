import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  FlatList,
  Modal,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import WheelPickerExpo from 'react-native-wheel-picker-expo';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { upsertProfile } from '@/lib/supabase/profiles';
import type { UserProfile } from '@/types/user';
import type { ExperienceLevel, UserGoal } from '@/types/user';

const { width } = Dimensions.get('window');

const MAX_REGIONS = 5;
const FEATURED_REGIONS = ['bordeaux', 'burgundy', 'champagne', 'tuscany', 'ribera', 'napa'] as const;
const ALL_REGIONS = [
  'bordeaux', 'burgundy', 'champagne', 'rhone', 'loire', 'alsace',
  'languedoc', 'provence', 'tuscany', 'piemont', 'rioja', 'ribera',
  'douro', 'napa', 'sonoma', 'barossa', 'mendoza', 'mosel', 'others',
] as const;
const REGIONS_BY_COUNTRY: Record<string, string[]> = {
  fr: ['bordeaux', 'burgundy', 'champagne', 'rhone', 'loire', 'alsace', 'languedoc', 'provence'],
  it: ['tuscany', 'piemont'],
  es: ['rioja', 'ribera'],
  pt: ['douro'],
  us: ['napa', 'sonoma'],
  au: ['barossa'],
  ar: ['mendoza'],
  de: ['mosel'],
  other: ['others'],
};

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; icon: string; labelKey: string; descKey: string }[] = [
  { value: 'beginner', icon: 'leaf-outline', labelKey: 'onboarding.beginner', descKey: 'onboarding.beginnerDesc' },
  { value: 'amateur', icon: 'wine-outline', labelKey: 'onboarding.amateur', descKey: 'onboarding.amateurDesc' },
  { value: 'confirmed', icon: 'book-outline', labelKey: 'onboarding.confirmed', descKey: 'onboarding.confirmedDesc' },
  { value: 'expert', icon: 'ribbon-outline', labelKey: 'onboarding.expert', descKey: 'onboarding.expertDesc' },
  { value: 'master_sommelier', icon: 'trophy-outline', labelKey: 'onboarding.masterSommelier', descKey: 'onboarding.masterSommelierDesc' },
];

const GOAL_OPTIONS: { value: UserGoal; icon: string; labelKey: string }[] = [
  { value: 'pairing', icon: 'restaurant-outline', labelKey: 'onboarding.pairing' },
  { value: 'cellar', icon: 'cube-outline', labelKey: 'onboarding.cellar' },
  { value: 'tasting', icon: 'search-outline', labelKey: 'onboarding.tasting' },
  { value: 'tasting_advice', icon: 'bulb-outline', labelKey: 'onboarding.tastingAdvice' },
  { value: 'buying_tips', icon: 'cart-outline', labelKey: 'onboarding.buyingTips' },
];

const SLIDES = [
  { id: '1', icon: 'wine-outline', titleKey: 'onboarding.slide1Title', descKey: 'onboarding.slide1Desc' },
  { id: '2', icon: 'location-outline', titleKey: 'onboarding.slide2Title', descKey: 'onboarding.slide2Desc' },
  { id: '3', icon: 'restaurant-outline', titleKey: 'onboarding.slide3Title', descKey: 'onboarding.slide3Desc' },
  { id: '4', icon: 'gift-outline', titleKey: 'onboarding.slide4Title', descKey: 'onboarding.slide4Desc' },
  { id: '5', icon: 'people-outline', titleKey: 'onboarding.slide5Title', descKey: 'onboarding.slide5Desc' },
];

const COUNTRY_LABELS: Record<string, string> = {
  fr: 'France',
  it: 'Italie',
  es: 'Espagne',
  pt: 'Portugal',
  us: 'États-Unis',
  au: 'Australie',
  ar: 'Argentine',
  de: 'Allemagne',
  other: 'Autres',
};

function RegionsStep({
  regions,
  onToggle,
  filterCountry,
  onFilterCountry,
  t,
}: {
  regions: string[];
  onToggle: (r: string) => void;
  filterCountry: string | null;
  onFilterCountry: (c: string | null) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [regionsDropdownOpen, setRegionsDropdownOpen] = useState(false);
  const featuredSet = new Set<string>(FEATURED_REGIONS);
  const regionsToShow = filterCountry
    ? REGIONS_BY_COUNTRY[filterCountry] ?? []
    : [...FEATURED_REGIONS, ...ALL_REGIONS.filter((r) => !featuredSet.has(r))];

  const countryOptions = [
    { code: null, label: t('onboarding.allRegions') },
    ...Object.entries(REGIONS_BY_COUNTRY).map(([code]) => ({
      code: code as string,
      label: COUNTRY_LABELS[code] ?? code,
    })),
  ];

  const currentCountryLabel = filterCountry
    ? COUNTRY_LABELS[filterCountry] ?? filterCountry
    : t('onboarding.allRegions');

  return (
    <Animated.View key="1" entering={SlideInRight} exiting={SlideOutLeft}>
      <Text style={styles.title}>{t('onboarding.regions')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.regionsSubtitleLimit', { max: MAX_REGIONS })}</Text>

      <View style={styles.countryDropdownWrap}>
        <Text style={styles.countryDropdownLabel}>{t('onboarding.filterByCountry')}</Text>
        <Pressable
          onPress={() => setCountryDropdownOpen(true)}
          style={styles.countryDropdownTrigger}
        >
          <Text style={styles.countryDropdownTriggerText}>{currentCountryLabel}</Text>
          <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
        </Pressable>
        <Modal
          visible={countryDropdownOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCountryDropdownOpen(false)}
        >
          <Pressable style={styles.dropdownOverlay} onPress={() => setCountryDropdownOpen(false)}>
            <Pressable style={styles.dropdownList} onPress={() => {}}>
              {countryOptions.map(({ code, label }) => (
                <Pressable
                  key={code ?? 'all'}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onFilterCountry(code);
                    setCountryDropdownOpen(false);
                  }}
                  style={[
                    styles.countryDropdownItem,
                    (code === null ? !filterCountry : filterCountry === code) && styles.countryDropdownItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countryDropdownItemText,
                      (code === null ? !filterCountry : filterCountry === code) && styles.countryDropdownItemTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                  {(code === null ? !filterCountry : filterCountry === code) && (
                    <Ionicons name="checkmark" size={18} color={colors.accent.primary} />
                  )}
                </Pressable>
              ))}
            </Pressable>
          </Pressable>
        </Modal>
      </View>

      <View style={styles.regionDropdownWrap}>
        <Text style={styles.regionDropdownLabel}>{t('onboarding.regionsChoose')}</Text>
        <Pressable
          onPress={() => setRegionsDropdownOpen(true)}
          style={styles.countryDropdownTrigger}
        >
          <Text style={styles.countryDropdownTriggerText}>
            {regions.length > 0
              ? t('onboarding.regionsSelectedLimit', { count: regions.length, max: MAX_REGIONS })
              : t('onboarding.regionsChoose')}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
        </Pressable>
        <Modal
          visible={regionsDropdownOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setRegionsDropdownOpen(false)}
        >
          <Pressable
            style={[styles.dropdownOverlay, styles.regionsDropdownOverlay]}
            onPress={() => setRegionsDropdownOpen(false)}
          >
            <Pressable style={styles.regionsDropdownPanel} onPress={() => {}}>
              <View style={styles.regionsDropdownHeader}>
                <Text style={styles.regionsDropdownTitle}>{t('onboarding.regions')}</Text>
                <Pressable onPress={() => setRegionsDropdownOpen(false)} hitSlop={12}>
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </Pressable>
              </View>
              <ScrollView style={styles.regionsDropdownList} showsVerticalScrollIndicator>
                {!filterCountry && (
                  <Text style={styles.regionSectionTitle}>{t('onboarding.suggestedRegions')}</Text>
                )}
                {regionsToShow.map((r) => {
                  const isSelected = regions.includes(r);
                  const canAdd = regions.length < MAX_REGIONS || isSelected;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => {
                        if (!canAdd) return;
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onToggle(r);
                      }}
                      style={[
                        styles.regionRow,
                        isSelected && styles.regionRowSelected,
                        !canAdd && styles.regionRowDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.regionRowText,
                          isSelected && styles.regionRowTextSelected,
                          !canAdd && styles.regionRowTextDisabled,
                        ]}
                      >
                        {t(`regions.${r}`)}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color={colors.accent.primary} />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Pressable
                style={styles.regionsDropdownDone}
                onPress={() => setRegionsDropdownOpen(false)}
              >
                <Text style={styles.regionsDropdownDoneText}>{t('common.save')}</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </View>

      {regions.length > 0 && (
        <View style={styles.selectedRegions}>
          <Text style={styles.selectedRegionsLabel}>
            {t('onboarding.regionsSelectedLimit', { count: regions.length, max: MAX_REGIONS })}
          </Text>
          <View style={styles.selectedTagsWrap}>
            {regions.map((r) => (
              <View key={r} style={styles.selectedTag}>
                <Text style={styles.selectedTagText}>{t(`regions.${r}`)}</Text>
                <Pressable onPress={() => onToggle(r)} hitSlop={8} style={styles.selectedTagRemove}>
                  <Ionicons name="close" size={14} color={colors.text.secondary} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, setProfile } = useAuthStore();
  const [step, setStep] = useState(0);
  const [age, setAge] = useState(25);
  const [regions, setRegions] = useState<string[]>([]);
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [regionFilterCountry, setRegionFilterCountry] = useState<string | null>(null);
  const carouselRef = useRef<FlatList>(null);

  const canNext = () => {
    switch (step) {
      case 0: return age >= 18;
      case 1: return regions.length > 0;
      case 2: return experience !== null;
      case 3: return goals.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step < 4) {
      setStep((s) => s + 1);
    } else if (carouselIndex < 4) {
      const next = carouselIndex + 1;
      setCarouselIndex(next);
      carouselRef.current?.scrollToOffset({ offset: next * width, animated: true });
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 4 && carouselIndex > 0) {
      const prev = carouselIndex - 1;
      setCarouselIndex(prev);
      carouselRef.current?.scrollToOffset({ offset: prev * width, animated: true });
    } else if (step > 0) {
      setStep((s) => s - 1);
    } else {
      router.back();
    }
  };

  const handleFinish = async () => {
    if (!user?.id) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    const { data } = await upsertProfile({
      id: user.id,
      email: user.email ?? '',
      age,
      favorite_regions: regions,
      experience_level: experience ?? undefined,
      goals,
      onboarding_completed: true,
      preferred_language: 'fr',
      first_name: user.user_metadata?.full_name?.split(' ')[0],
      last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
      avatar_url: user.user_metadata?.avatar_url,
    });
    if (data) setProfile(data as UserProfile);
    setLoading(false);
    router.replace('/(tabs)' as Href);
  };

  const toggleRegion = (r: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRegions((prev) =>
      prev.includes(r)
        ? prev.filter((x) => x !== r)
        : prev.length < MAX_REGIONS
          ? [...prev, r]
          : prev
    );
  };

  const toggleGoal = (g: UserGoal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  if (step === 4) {
    const slide = SLIDES[carouselIndex];
    const isLast = carouselIndex === 4;
    return (
      <View style={styles.container}>
        <View style={styles.progressBar}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i <= carouselIndex && styles.progressSegmentActive,
              ]}
            />
          ))}
        </View>
        <FlatList
          ref={carouselRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          scrollEnabled={!isLast}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / width);
            setCarouselIndex(i);
          }}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <LinearGradient
                colors={['#0A0A0F', '#1a0a0f', '#2E1519']}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.slideOverlay}
              />
              <View style={styles.slideContent}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={48}
                  color={colors.accent.primary}
                  style={styles.slideIcon}
                />
                <Text style={styles.slideTitle}>{t(item.titleKey)}</Text>
                <Text style={styles.slideDesc}>{t(item.descKey)}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
        />
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === carouselIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
        <View style={styles.footer}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.accent.primary} />
          </Pressable>
          <Button
            onPress={handleNext}
            disabled={loading}
            fullWidth
            style={styles.nextBtn}
          >
            {isLast ? t('onboarding.startAdventure') : t('common.next')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.progressBar}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.progressSegment,
              i <= step && styles.progressSegmentActive,
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <Animated.View key="0" entering={FadeIn} exiting={FadeOut}>
            <Text style={styles.title}>{t('onboarding.age')}</Text>
            <View style={styles.wheelContainer}>
              <WheelPickerExpo
                height={180}
                width={width - spacing.screen * 2}
                initialSelectedIndex={age - 18}
                items={Array.from({ length: 103 }, (_, i) => ({
                  label: String(i + 18),
                  value: String(i + 18),
                }))}
                onChange={({ item }) => setAge(Number(item.value))}
                backgroundColor={colors.background.primary}
                selectedStyle={{ borderColor: colors.accent.primary, borderWidth: 2 }}
                haptics
              />
            </View>
          </Animated.View>
        )}

        {step === 1 && (
          <RegionsStep
            regions={regions}
            onToggle={toggleRegion}
            filterCountry={regionFilterCountry}
            onFilterCountry={setRegionFilterCountry}
            t={t}
          />
        )}

        {step === 2 && (
          <Animated.View key="2" entering={SlideInRight} exiting={SlideOutLeft}>
            <Text style={styles.title}>{t('onboarding.experience')}</Text>
            <View style={styles.cards}>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExperience(opt.value);
                  }}
                >
                  <Card
                    style={[
                      styles.expCard,
                      experience === opt.value && styles.expCardSelected,
                    ]}
                  >
                    <Ionicons
                      name={opt.icon as keyof typeof Ionicons.glyphMap}
                      size={28}
                      color={experience === opt.value ? colors.accent.primary : colors.text.secondary}
                    />
                    <View style={styles.expTextWrap}>
                      <Text
                        style={[
                          styles.expTitle,
                          experience === opt.value && styles.expTitleSelected,
                        ]}
                      >
                        {t(opt.labelKey)}
                      </Text>
                      <Text style={styles.expDesc}>{t(opt.descKey)}</Text>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View key="3" entering={SlideInRight} exiting={SlideOutLeft}>
            <Text style={styles.title}>{t('onboarding.goals')}</Text>
            <Text style={styles.goalsSubtitle}>{t('onboarding.goalsSubtitle')}</Text>
            <View style={styles.goalsGrid}>
              {GOAL_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => toggleGoal(opt.value)}
                  style={[
                    styles.goalCard,
                    goals.includes(opt.value) && styles.goalCardSelected,
                  ]}
                >
                  <View style={[styles.goalIconWrap, goals.includes(opt.value) && styles.goalIconWrapSelected]}>
                    <Ionicons
                      name={opt.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={goals.includes(opt.value) ? colors.accent.primary : colors.text.secondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.goalLabel,
                      goals.includes(opt.value) && styles.goalLabelSelected,
                    ]}
                    numberOfLines={2}
                  >
                    {t(opt.labelKey)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.accent.primary} />
        </Pressable>
        <Button
          onPress={handleNext}
          disabled={!canNext()}
          fullWidth
          style={styles.nextBtn}
        >
          {step === 3 ? t('onboarding.discover') : t('common.next')}
        </Button>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
  },
  progressSegmentActive: {
    backgroundColor: colors.accent.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.section,
  },
  wheelContainer: {
    alignItems: 'center',
    marginVertical: spacing.section,
  },
  regionTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    borderWidth: 0,
    marginBottom: spacing.md,
  },
  regionTriggerText: {
    ...typography.body,
    color: colors.text.primary,
  },
  selectedRegions: {
    marginTop: spacing.section,
    marginBottom: spacing.md,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    backgroundColor: colors.accent.muted,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  selectedTagText: {
    ...typography.bodySmall,
    color: colors.accent.primary,
  },
  selectedTagRemove: {
    padding: spacing.xs,
  },
  selectedRegionsLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  selectedTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  dropdownList: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 0,
    maxHeight: 280,
    overflow: 'hidden',
  },
  countryDropdownWrap: {
    marginBottom: spacing.md,
    zIndex: 10,
  },
  countryDropdownLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  countryDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    borderWidth: 0,
  },
  countryDropdownTriggerText: {
    ...typography.body,
    color: colors.text.primary,
  },
  countryDropdownList: {
    marginTop: spacing.xs,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 0,
    maxHeight: 220,
    overflow: 'hidden',
  },
  regionDropdownWrap: {
    marginBottom: spacing.md,
  },
  regionDropdownLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  regionsDropdownOverlay: {
    justifyContent: 'flex-end',
  },
  regionsDropdownPanel: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    borderWidth: 0,
    maxHeight: '75%',
    overflow: 'hidden',
  },
  regionsDropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0,
  },
  regionsDropdownTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  regionsDropdownList: {
    maxHeight: 320,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  regionsDropdownDone: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderTopWidth: 0,
  },
  regionsDropdownDoneText: {
    ...typography.body,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.accent.primary,
  },
  regionSectionTitle: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  regionList: {
    marginBottom: spacing.section,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.xs,
    backgroundColor: colors.background.tertiary,
    borderWidth: 0,
  },
  regionRowSelected: {
    backgroundColor: colors.accent.muted,
    borderColor: colors.accent.primary,
  },
  regionRowDisabled: {
    opacity: 0.5,
  },
  regionRowText: {
    ...typography.body,
    color: colors.text.primary,
  },
  regionRowTextSelected: {
    color: colors.accent.primary,
    fontFamily: 'Outfit_600SemiBold',
  },
  regionRowTextDisabled: {
    color: colors.text.tertiary,
  },
  countryDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  countryDropdownItemActive: {
    backgroundColor: colors.accent.muted,
  },
  countryDropdownItemText: {
    ...typography.body,
    color: colors.text.primary,
  },
  countryDropdownItemTextActive: {
    color: colors.accent.primary,
    fontFamily: 'Outfit_600SemiBold',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    borderWidth: 0,
  },
  chipSelected: {
    backgroundColor: colors.accent.muted,
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  chipTextSelected: {
    color: colors.accent.primary,
  },
  cards: {
    gap: spacing.md,
  },
  expCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  expCardSelected: {
    borderWidth: 2,
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.muted,
  },
  expTextWrap: {
    flex: 1,
  },
  expTitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  expTitleSelected: {
    color: colors.accent.primary,
    fontFamily: 'Outfit_600SemiBold',
  },
  expDesc: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  goalsSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.section,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  goalCard: {
    width: (width - spacing.screen * 2 - spacing.md) / 2,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    borderWidth: 0,
  },
  goalCardSelected: {
    backgroundColor: colors.accent.muted,
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  goalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  goalIconWrapSelected: {
    backgroundColor: colors.accent.muted,
  },
  goalLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: colors.accent.primary,
    fontFamily: 'Outfit_600SemiBold',
  },
  slide: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  slideContent: {
    padding: spacing.screen,
    paddingBottom: 120,
  },
  slideIcon: {
    marginBottom: spacing.md,
  },
  slideTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  slideDesc: {
    ...typography.body,
    color: colors.text.secondary,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.tertiary,
    opacity: 0.5,
  },
  dotActive: {
    backgroundColor: colors.accent.primary,
    opacity: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  backBtn: {
    padding: spacing.sm,
  },
  nextBtn: {
    flex: 1,
  },
});
