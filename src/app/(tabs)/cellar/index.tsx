import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { BottleCard } from '@/components/ui/BottleCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { CellarFilterSheet } from '@/components/cellar/CellarFilterSheet';
import { Toast } from '@/components/ui/Toast';
import { colors, typography, spacing, shadows } from '@/theme';
import { useCellar } from '@/hooks/useCellar';
import { useUserId } from '@/stores/authStore';
import { useCellarStore } from '@/stores/cellarStore';
import type { CellarTab } from '@/lib/supabase/wines';
import type { Wine } from '@/types/wine';

const TABS: { key: CellarTab; labelKey: string }[] = [
  { key: 'history', labelKey: 'cellar.history' },
  { key: 'cellar', labelKey: 'cellar.myWines' },
  { key: 'favorites', labelKey: 'cellar.favorites' },
  { key: 'wishlist', labelKey: 'cellar.wishlist' },
];

const TAB_BAR_HEIGHT = 44;
const CARD_HEIGHT = Dimensions.get('window').height * 0.25;

export default function CellarScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const userId = useUserId();
  const { wines, isLoading, filters, setFilters, fetchWines } = useCellar();
  const toggleFavorite = useCellarStore((s) => s.toggleFavorite);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [fabSheetVisible, setFabSheetVisible] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (userId) await fetchWines(userId);
    setRefreshing(false);
  }, [userId, fetchWines]);

  const displayWines = wines;

  const isEmpty = !isLoading && displayWines.length === 0;

  const openAddManual = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFabSheetVisible(false);
    router.push('/(modals)/add-wine-manual' as Href);
  };

  const openAddScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFabSheetVisible(false);
    router.push('/(modals)/add-wine-scan' as Href);
  };

  const handleWinePress = (wine: Wine) => {
    router.push(`/(tabs)/cellar/${wine.id}` as Href);
  };

  const handleFilterApply = (f: {
    colors: typeof filters.colors;
    regions: typeof filters.regions;
    vintageMin?: number;
    vintageMax?: number;
    maturityPhases: typeof filters.maturityPhases;
    sortBy: typeof filters.sortBy;
  }) => {
    setFilters(f);
  };

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('cellar.title')}</Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(modals)/add-wine-manual' as Href);
            }}
            style={({ pressed }) => [
              styles.addBtn,
              pressed && styles.addBtnPressed,
            ]}
          >
            <Ionicons name="add" size={24} color={colors.text.onAccent} />
          </Pressable>
        </View>

        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = filters.tab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFilters({ tab: tab.key });
                }}
                style={({ pressed }) => [
                  styles.tab,
                  isActive && styles.tabActive,
                  pressed && styles.tabPressed,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    isActive && styles.tabTextActive,
                  ]}
                >
                  {t(tab.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Input
              placeholder={t('cellar.searchPlaceholder')}
              value={filters.searchQuery}
              onChangeText={(q) => setFilters({ searchQuery: q })}
              leftIcon={
                <Ionicons name="search-outline" size={20} color={colors.text.tertiary} />
              }
            />
          </View>
          <Pressable
            onPress={() => setFilterSheetVisible(true)}
            style={({ pressed }) => [
              styles.filterBtn,
              pressed && styles.filterBtnPressed,
            ]}
          >
            <Ionicons name="filter" size={22} color={colors.accent.primary} />
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.list}>
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </View>
        ) : isEmpty ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="wine-outline"
              size={80}
              color={colors.text.tertiary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>{t('cellar.emptyTitle')}</Text>
            <Text style={styles.emptySubtitle}>{t('cellar.emptySubtitle')}</Text>
            <Button onPress={openAddManual} style={styles.addButton}>
              {t('cellar.addFirstWine')}
            </Button>
          </View>
        ) : (
          <FlatList
            data={displayWines}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BottleCard
                wine={item}
                onPress={() => handleWinePress(item)}
                onFavoritePress={userId ? () => toggleFavorite(item.id) : undefined}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent.primary}
              />
            }
          />
        )}

        {(
          <Pressable
            onPress={() => setFabSheetVisible(true)}
            style={({ pressed }) => [
              styles.fab,
              pressed && styles.fabPressed,
            ]}
          >
            <Ionicons name="add" size={28} color={colors.text.onAccent} />
          </Pressable>
        )}

        <Modal visible={fabSheetVisible} transparent animationType="fade">
          <Pressable
            style={styles.fabOverlay}
            onPress={() => setFabSheetVisible(false)}
          >
            <View style={styles.fabSheet}>
              <Pressable
                onPress={openAddScan}
                style={({ pressed }) => [
                  styles.fabOption,
                  pressed && styles.fabOptionPressed,
                ]}
              >
                <Ionicons name="camera-outline" size={24} color={colors.accent.primary} />
                <Text style={styles.fabOptionText}>{t('cellar.scanBottle')}</Text>
              </Pressable>
              <Pressable
                onPress={openAddManual}
                style={({ pressed }) => [
                  styles.fabOption,
                  pressed && styles.fabOptionPressed,
                ]}
              >
                <Ionicons name="create-outline" size={24} color={colors.accent.primary} />
                <Text style={styles.fabOptionText}>{t('cellar.manualEntry')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        <CellarFilterSheet
          visible={filterSheetVisible}
          onClose={() => setFilterSheetVisible(false)}
          colors={filters.colors}
          regions={filters.regions}
          vintageMin={filters.vintageMin}
          vintageMax={filters.vintageMax}
          maturityPhases={filters.maturityPhases}
          sortBy={filters.sortBy}
          onApply={handleFilterApply}
        />

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            visible={!!toast}
            onHide={() => setToast(null)}
          />
        )}
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.screen,
    marginBottom: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabPressed: {
    transform: [{ scale: 0.97 }],
  },
  tabActive: {
    backgroundColor: colors.accent.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.text.onAccent,
    fontFamily: 'Outfit_600SemiBold',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchWrap: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  list: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 120,
  },
  listContent: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    marginBottom: spacing.section,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.section,
    textAlign: 'center',
  },
  addButton: {
    alignSelf: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    left: '50%',
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  fabOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    paddingBottom: 100,
  },
  fabSheet: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  fabOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.background.tertiary,
    gap: spacing.md,
  },
  fabOptionPressed: {
    opacity: 0.8,
  },
  fabOptionText: {
    ...typography.body,
    color: colors.text.primary,
  },
});
