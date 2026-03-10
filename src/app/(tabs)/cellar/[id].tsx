import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { colors, spacing, typography, radius, shadows } from '@/theme';
import { REGION_LABELS, COUNTRY_LABELS } from '@/config/wineRegions';
import { getWineById } from '@/lib/supabase/wines';
import { useCellarStore } from '@/stores/cellarStore';
import type { Wine, WineColor } from '@/types/wine';

const COLOR_DOT: Record<WineColor, string> = {
  red: '#8B1A2B',
  white: '#F5F0EB',
  rose: '#D4758B',
  yellow: '#C98F70',
  orange: '#C47A3A',
};

const HEADER_HEIGHT = 300;

export default function WineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const [wine, setWine] = useState<Wine | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  const updateWine = useCellarStore((s) => s.updateWine);
  const removeWine = useCellarStore((s) => s.removeWine);
  const updateQuantity = useCellarStore((s) => s.updateQuantity);
  const moveToHistory = useCellarStore((s) => s.moveToHistory);
  const toggleFavorite = useCellarStore((s) => s.toggleFavorite);

  useEffect(() => {
    if (!id) return;
    getWineById(id).then(({ data }) => {
      setWine(data ?? null);
      setLoading(false);
    });
  }, [id]);

  const handleQuantityChange = async (delta: number) => {
    if (!wine) return;
    if (delta < 0 && wine.quantity === 1) {
      Alert.alert(
        t('cellar.markAsTasted'),
        t('cellar.markAsTastedConfirm'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.save'),
            onPress: async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await moveToHistory(wine.id);
              router.back();
            },
          },
        ]
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateQuantity(wine.id, delta);
    const { data } = await getWineById(wine.id);
    if (data) setWine(data);
  };

  const handleDelete = () => {
    if (!wine) return;
    Alert.alert(
      t('cellar.deleteWine'),
      t('cellar.deleteWineConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('cellar.deleteWine'),
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await removeWine(wine.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async () => {
    if (!wine) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleFavorite(wine.id);
    const { data } = await getWineById(wine.id);
    if (data) setWine(data);
  };

  const handleModify = () => {
    if (!wine) return;
    setMenuVisible(false);
    router.push(`/(modals)/add-wine-manual?id=${wine.id}` as Href);
  };

  const handleShare = () => {
    // Point d’entrée pour le partage (à implémenter plus tard)
  };

  if (loading || !wine) {
    return (
      <ScreenWrapper>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>
            {loading ? '...' : t('cellar.wineNotFound')}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const colorDot = COLOR_DOT[wine.color];
  const rating = wine.user_rating ?? 8.5;

  return (
    <View style={styles.root}>
      <ScreenWrapper edges={['top', 'left', 'right']}>
        {/* HERO */}
        <View style={styles.hero}>
          {wine.label_image_url ? (
            <>
              {/* Photo plein écran, collée aux bords du hero */}
              <Image
                source={{ uri: wine.label_image_url }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
              {/* Légère teinte chaude par-dessus pour garder l’ambiance */}
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.35)']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </>
          ) : (
            <>
              <LinearGradient
                colors={['#2C1A0E', '#6B3B2A', '#4A2C1A', '#1A0F08']}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {/* Silhouette + étiquette */}
              <View style={styles.bottleSilhouette}>
                <View style={styles.bottleShape} />
              </View>
              <View style={styles.labelSticker}>
                <Text style={styles.labelChateau} numberOfLines={2}>
                  {wine.domain_name}
                </Text>
                <View style={styles.labelLine} />
                <Text style={styles.labelYear}>{wine.vintage}</Text>
                <View style={styles.labelLine} />
                <Text style={styles.labelRegion} numberOfLines={1}>
                  {REGION_LABELS[wine.region] ?? wine.region} ·{' '}
                  {COUNTRY_LABELS[wine.country] ?? wine.country}
                </Text>
              </View>
            </>
          )}

          {/* Top nav façon AllTrails */}
          <View style={styles.topNav}>
            <Pressable
              style={styles.navBack}
              hitSlop={10}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
            </Pressable>

            <View style={styles.navRightGroup}>
              <Pressable
                style={styles.navIconBtn}
                hitSlop={6}
                onPress={handleShare}
              >
                <Ionicons
                  name="share-social-outline"
                  size={18}
                  color="#FFFFFF"
                />
              </Pressable>
              <View style={styles.navDivider} />
              <Pressable
                style={styles.navIconBtn}
                hitSlop={6}
                onPress={handleToggleFavorite}
              >
                <Ionicons
                  name={wine.is_favorite ? 'heart' : 'heart-outline'}
                  size={18}
                  color="#FFFFFF"
                />
              </Pressable>
              <View style={styles.navDivider} />
              <Pressable
                style={styles.navIconBtn}
                hitSlop={6}
                onPress={() => setMenuVisible(true)}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={18}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          </View>

          {/* Dots */}
          <View style={styles.heroDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          {/* Gradient bas du hero */}
          <LinearGradient
            colors={['transparent', 'rgba(245,240,235,0.95)']}
            style={styles.heroGradient}
          />
        </View>

        {/* MENU 3 POINTS */}
        <Modal visible={menuVisible} transparent animationType="fade">
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menuDropdown}>
              <Pressable
                style={styles.menuItem}
                onPress={handleModify}
              >
                <Ionicons
                  name="pencil-outline"
                  size={20}
                  color={colors.text.primary}
                />
                <Text style={styles.menuItemText}>
                  {t('cellar.modifyWine')}
                </Text>
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={handleToggleFavorite}
              >
                <Ionicons
                  name={wine.is_favorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={colors.accent.primary}
                />
                <Text style={styles.menuItemText}>
                  {wine.is_favorite
                    ? t('cellar.removeFromFavorite')
                    : t('cellar.addToFavorite')}
                </Text>
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={handleShare}
              >
                <Ionicons
                  name="share-outline"
                  size={20}
                  color={colors.text.primary}
                />
                <Text style={styles.menuItemText}>
                  {t('cellar.shareCommunity')}
                </Text>
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  handleDelete();
                }}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={colors.error}
                />
                <Text
                  style={[styles.menuItemText, styles.menuItemDanger]}
                >
                  {t('cellar.deleteWine')}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* CONTENU */}
        <View style={styles.contentWrapper}>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentInner}
            showsVerticalScrollIndicator={false}
          >
            {/* Pull indicator */}
            <View style={styles.pullIndicator}>
              <View style={styles.pullBar} />
            </View>

            {/* Titre vin */}
            <View style={styles.wineHeader}>
              <Text style={styles.wineName}>
                {wine.cuvee_name || wine.domain_name}
              </Text>
              <Text style={styles.wineDomain}>
                {/* Domaine + appellation en style “ligne rouge” */}
                {wine.domain_name}
                {wine.appellation ? ` · ${wine.appellation}` : ''}
              </Text>
            </View>

            {/* Quick stats row */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{wine.vintage}</Text>
                <Text style={styles.statLabel}>Millésime</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statValueRow}>
                  <View
                    style={[styles.statDot, { backgroundColor: colorDot }]}
                  />
                  <Text style={styles.statValueInline}>
                    {t(`wine.color.${wine.color}`, wine.color)}
                  </Text>
                </View>
                <Text style={styles.statLabel}>Couleur</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent.secondary }]}>
                  {rating.toFixed(1).replace('.', ',')}
                  <Text style={styles.statOutOf}>/10</Text>
                </Text>
                <Text style={styles.statLabel}>Ma note</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>×{wine.quantity}</Text>
                <Text style={styles.statLabel}>En cave</Text>
              </View>
            </View>

            {/* Phase de maturité */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phase de maturité</Text>
              <View style={styles.maturityCard}>
                <Text style={styles.maturityEmoji}>😊</Text>
                <View style={styles.maturityInfo}>
                  <Text style={styles.maturityPhase}>Apogée</Text>
                  <Text style={styles.maturitySub}>
                    Idéal à déguster jusqu&apos;en {new Date().getFullYear() + 2}
                  </Text>
                  <View style={styles.maturityBarWrap}>
                    <View style={styles.maturityBarFill} />
                  </View>
                </View>
              </View>
            </View>

            {/* Dégustation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dégustation</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoTile}>
                  <Text style={styles.infoTileIcon}>🌡</Text>
                  <Text style={styles.infoTileValue}>
                    {wine.ideal_temp ?? 17}°C
                  </Text>
                  <Text style={styles.infoTileLabel}>Température</Text>
                </View>
                <View style={styles.infoTile}>
                  <Text style={styles.infoTileIcon}>⏱</Text>
                  <Text style={styles.infoTileValue}>
                    {wine.decanting_time ?? 90} min
                  </Text>
                  <Text style={styles.infoTileLabel}>Carafage</Text>
                </View>
                <View style={styles.infoTile}>
                  <Text style={styles.infoTileIcon}>🍇</Text>
                  <Text style={styles.infoTileValue}>Cab. Sauv.</Text>
                  <Text style={styles.infoTileLabel}>Cépage principal</Text>
                </View>
                <View style={styles.infoTile}>
                  <Text style={styles.infoTileIcon}>📍</Text>
                  <Text style={styles.infoTileValue}>
                    {REGION_LABELS[wine.region] ?? wine.region}
                  </Text>
                  <Text style={styles.infoTileLabel}>Région</Text>
                </View>
              </View>
            </View>

            {/* Mon avis */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mon avis</Text>
              <View style={styles.ratingBlock}>
                <View style={styles.ratingLeft}>
                  <View style={styles.ratingNumberRow}>
                    <Text style={styles.ratingNumber}>
                      {rating.toFixed(1).replace('.', ',')}
                    </Text>
                    <Text style={styles.ratingSlash}> / 10</Text>
                  </View>
                  <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Ionicons
                        key={i}
                        name={i <= 4 ? 'star' : 'star-outline'}
                        size={14}
                        color={i <= 4 ? colors.accent.secondary : '#E0D8D0'}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.notesText}>
                  {wine.personal_notes ||
                    '“Nez intense, fruits noirs et épices. Bouche ample, tanins soyeux. Finale très longue.”'}
                </Text>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsRow}>
                {(wine.tags && wine.tags.length ? wine.tags : [
                  'Cabernet Sauvignon',
                  'Tanins soyeux',
                  'Garde',
                  'Occasion spéciale',
                ]).map((tag, idx) => (
                  <View key={`${tag}-${idx}`} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Stockage + stepper */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stockage</Text>
              <View style={styles.locationRow}>
                <View style={styles.locationIconWrap}>
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={colors.accent.secondary}
                  />
                </View>
                <View style={styles.locationText}>
                  <Text style={styles.locationMain}>
                    {wine.storage_location || 'Cave principale'}
                  </Text>
                  <Text style={styles.locationSub}>
                    {wine.storage_row
                      ? `Rangée ${wine.storage_row}`
                      : 'Rangée B · Étagère 3'}
                  </Text>
                </View>
                <View style={styles.stepper}>
                  <Pressable
                    style={styles.stepperBtn}
                    hitSlop={6}
                    onPress={() => handleQuantityChange(-1)}
                  >
                    <Text style={styles.stepperBtnText}>−</Text>
                  </Pressable>
                  <Text style={styles.stepperNum}>{wine.quantity}</Text>
                  <Pressable
                    style={styles.stepperBtn}
                    hitSlop={6}
                    onPress={() => handleQuantityChange(1)}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Badge IA */}
            <View style={styles.sectionLast}>
              <View style={styles.aiNote}>
                <Text style={styles.aiIcon}>✨</Text>
                <Text style={styles.aiText}>
                  Informations de maturité et dégustation générées par IA — peuvent
                  contenir des inexactitudes.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Barre d’actions en bas */}
        <View style={styles.bottomBar}>
          <Pressable
            style={styles.bottomIconBtn}
            hitSlop={8}
            onPress={handleShare}
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={colors.text.secondary}
            />
          </Pressable>
          <Pressable style={styles.bottomPrimary} hitSlop={6}>
            <Ionicons
              name="sparkles-outline"
              size={18}
              color={colors.text.onAccent}
            />
            <Text style={styles.bottomPrimaryText}>Trouver un accord</Text>
          </Pressable>
          <Pressable
            style={styles.bottomIconBtn}
            hitSlop={8}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={colors.text.secondary}
            />
          </Pressable>
        </View>
      </ScreenWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E8E0D8',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  hero: {
    height: HEADER_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  bottleSilhouette: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -40 }, { translateY: -100 }],
    opacity: 0.18,
  },
  bottleShape: {
    width: 80,
    height: 200,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  labelSticker: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -36 }, { translateY: -80 }],
    width: 72,
    height: 90,
    borderRadius: 4,
    backgroundColor: '#F5E8D0',
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  labelChateau: {
    fontSize: 5,
    fontWeight: '700',
    color: '#3A1A0A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
    lineHeight: 1.3 * 5,
  },
  labelLine: {
    width: 40,
    height: 1,
    backgroundColor: '#8B5A3A',
    opacity: 0.5,
  },
  labelYear: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A1A0A',
    letterSpacing: -0.3,
  },
  labelRegion: {
    fontSize: 4,
    color: '#6B4A2A',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  topNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  navBack: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.float,
  },
  navRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    ...shadows.float,
  },
  navIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  heroDots: {
    position: 'absolute',
    bottom: 72,
    left: '50%',
    marginLeft: -20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 18,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  contentWrapper: {
    flex: 1,
    marginTop: -24,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentInner: {
    paddingBottom: 120,
  },
  pullIndicator: {
    alignItems: 'center',
    paddingTop: 12,
  },
  pullBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0D8D0',
  },
  wineHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  wineName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  wineDomain: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.accent.primary,
    marginTop: 3,
    textDecorationLine: 'underline',
    textDecorationColor: colors.accent.primary,
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.07)',
    marginTop: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValueInline: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statOutOf: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginLeft: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 3,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionLast: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.text.tertiary,
    marginBottom: 12,
  },
  maturityCard: {
    backgroundColor: '#F0F8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  maturityEmoji: {
    fontSize: 28,
  },
  maturityInfo: {
    flex: 1,
  },
  maturityPhase: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6D972E',
  },
  maturitySub: {
    fontSize: 12,
    color: '#7A9B5A',
    marginTop: 1,
  },
  maturityBarWrap: {
    marginTop: 8,
    height: 6,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#E0EDD0',
  },
  maturityBarFill: {
    height: '100%',
    width: '72%',
    borderRadius: 4,
    backgroundColor: '#6D972E',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoTile: {
    flexBasis: '48%',
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 3,
  },
  infoTileIcon: {
    fontSize: 16,
  },
  infoTileValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 4,
  },
  infoTileLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  ratingBlock: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },
  ratingLeft: {},
  ratingNumberRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ratingNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -1,
    lineHeight: 40,
  },
  ratingSlash: {
    fontSize: 16,
    color: colors.text.tertiary,
    marginLeft: 4,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    flex: 1,
  },
  locationMain: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  locationSub: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 30,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.tertiary,
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: '300',
    color: colors.text.secondary,
  },
  stepperNum: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  aiNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF9F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  aiIcon: {
    fontSize: 14,
  },
  aiText: {
    fontSize: 12,
    color: '#A0845A',
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: colors.background.primary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.07)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bottomIconBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPrimary: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.accent.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bottomPrimaryText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.onAccent,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingRight: spacing.screen,
    alignItems: 'flex-end',
  },
  menuDropdown: {
    backgroundColor: colors.background.primary,
    borderRadius: radius.xl,
    minWidth: 220,
    overflow: 'hidden',
    ...shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemText: {
    ...typography.body,
    color: colors.text.primary,
  },
  menuItemDanger: {
    color: colors.error,
  },
});
