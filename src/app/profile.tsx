import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { colors, spacing, typography, radius, shadows } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/config/supabase';

type ProfileTab = 'photos' | 'reviews' | 'feed' | 'orders';

interface UserPhoto {
  url: string;
  wineId: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, profile, reset } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>('photos');
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const fullName = profile?.first_name || profile?.last_name
    ? `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()
    : user?.user_metadata?.full_name || user?.email || t('auth.login') || 'Mon profil';

  const initials = React.useMemo(() => {
    const base = fullName || '';
    const [first, second] = base.split(' ');
    const firstInitial = first?.[0] ?? '';
    const secondInitial = second?.[0] ?? '';
    return (firstInitial + secondInitial).toUpperCase() || 'OM';
  }, [fullName]);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoadingPhotos(true);
      const { data, error } = await supabase
        .from('wines')
        .select('id, label_image_url, image_urls')
        .eq('user_id', user.id)
        .is('deleted_at', null);
      setLoadingPhotos(false);
      if (error || !data) return;
      const collected: UserPhoto[] = [];
      for (const wine of data as { id: string; label_image_url?: string | null; image_urls?: string[] | null }[]) {
        if (wine.label_image_url) {
          collected.push({ url: wine.label_image_url, wineId: wine.id });
        }
        if (Array.isArray(wine.image_urls)) {
          wine.image_urls.forEach((u) => {
            if (u) collected.push({ url: u, wineId: wine.id });
          });
        }
      }
      setPhotos(collected);
    };
    load();
  }, [user?.id]);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await supabase.auth.signOut();
    reset();
    router.replace('/(auth)/login' as Href);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAvatarPress = () => {
    // TODO: ouvrir ActionSheet avec Prendre une photo / Choisir une photo / Voir en plein écran
  };

  const handleOpenOnboardingDetails = () => {
    router.push('/profile/onboarding' as Href);
  };

  const friendsCount = 0; // Placeholder en attendant la fonctionnalité d'amis

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Pressable onPress={handleAvatarPress} style={styles.avatarWrapper}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </Pressable>

          <View style={styles.headerInfo}>
            <Text style={styles.name}>{fullName}</Text>
            {profile?.age && (
              <Text style={styles.metaText}>
                {t('onboarding.age')}: {profile.age}
              </Text>
            )}
            <Pressable onPress={handleOpenOnboardingDetails} style={styles.profileLink}>
              <Text style={styles.profileLinkText}>
                {t('profile.details') || 'Mon profil (questionnaire)'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
            </Pressable>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={handleClose} style={styles.iconButton} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.text.primary} />
            </Pressable>
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={18} color={colors.text.primary} />
              <Text style={styles.logoutText}>{t('auth.logout') || 'Se déconnecter'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{friendsCount}</Text>
            <Text style={styles.statLabel}>{t('profile.friends') || 'Amis'}</Text>
          </View>
        </View>

        <View style={styles.tabsRow}>
          {[
            { id: 'photos', label: t('profile.tabPhotos') || 'Photos' },
            { id: 'reviews', label: t('profile.tabReviews') || 'Avis' },
            { id: 'feed', label: t('profile.tabFeed') || 'Fil d’actualité' },
            { id: 'orders', label: t('profile.tabOrders') || 'Commandes de vin' },
          ].map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id as ProfileTab)}
              style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'photos' && (
          <View style={styles.tabContent}>
            {loadingPhotos ? (
              <ActivityIndicator color={colors.accent.primary} />
            ) : photos.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="images-outline" size={32} color={colors.text.tertiary} />
                <Text style={styles.emptyTitle}>
                  {t('profile.photosEmptyTitle') || 'Ajoutez des photos'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {t('profile.photosEmptySubtitle') ||
                    'Les photos de vos vins apparaîtront ici.'}
                </Text>
              </View>
            ) : (
              <View style={styles.photoGrid}>
                {photos.map((p) => (
                  <View key={`${p.wineId}-${p.url}`} style={styles.photoItem}>
                    <Image
                      source={{ uri: p.url }}
                      style={styles.photoImage}
                      contentFit="cover"
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={32} color={colors.text.tertiary} />
              <Text style={styles.emptyTitle}>
                {t('profile.reviewsEmptyTitle') || 'Vos avis arriveront bientôt'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {t('profile.reviewsEmptySubtitle') ||
                  'Nous afficherons ici vos avis sur les vins.'}
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'feed' && (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Ionicons name="newspaper-outline" size={32} color={colors.text.tertiary} />
              <Text style={styles.emptyTitle}>
                {t('profile.feedEmptyTitle') || 'Fil d’actualité personnalisé'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {t('profile.feedEmptySubtitle') ||
                  'En fonction de vos préférences, nous vous proposerons ici des contenus sélectionnés.'}
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'orders' && (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={32} color={colors.text.tertiary} />
              <Text style={styles.emptyTitle}>
                {t('profile.ordersEmptyTitle') || 'Commandes à venir'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {t('profile.ordersEmptySubtitle') ||
                  'L’historique de vos commandes de vin sera affiché ici.'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const AVATAR_SIZE = 64;

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: colors.accent.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.accent.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...typography.h3,
    color: colors.accent.primary,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    ...typography.h2,
    color: colors.text.primary,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  profileLink: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileLinkText: {
    ...typography.bodySmall,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  logoutButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoutText: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.sm,
    alignItems: 'center',
    ...shadows.card,
  },
  statValue: {
    ...typography.h3,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.screen,
    borderRadius: 999,
    backgroundColor: colors.background.secondary,
    padding: 4,
    marginBottom: spacing.md,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    backgroundColor: colors.accent.muted,
  },
  tabLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  tabLabelActive: {
    color: colors.accent.primary,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.body,
    color: colors.text.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.background.tertiary,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
});

