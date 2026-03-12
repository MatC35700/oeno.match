import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { RatingBar } from '@/components/ui/RatingBar';
import { colors, spacing, typography, radius, shadows } from '@/theme';
import { REGION_LABELS, COUNTRY_LABELS } from '@/config/wineRegions';
import { getWineById, addWinePhoto } from '@/lib/supabase/wines';
import { useCellarStore } from '@/stores/cellarStore';
import { WINE_COLOR_HEX } from '@/config/wineColors';
import type { Wine, WineColor } from '@/types/wine';

const COLOR_DOT = WINE_COLOR_HEX;

const HEADER_HEIGHT = 300;

export default function WineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const [wine, setWine] = useState<Wine | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [cepagesModalVisible, setCepagesModalVisible] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [addingPhoto, setAddingPhoto] = useState(false);
  const [quantityInput, setQuantityInput] = useState('');
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);

  const { width: screenWidth } = useWindowDimensions();

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

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      getWineById(id).then(({ data }) => {
        setWine(data ?? null);
      });
    }, [id])
  );

  const handleQuantityChange = async (delta: number) => {
    if (!wine || delta === 0) return;

    // Ancienne règle : ne proposer l'historique que lorsqu'on passe de 1 à 0
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

  const handleQuantitySet = async (nextQty: number) => {
    if (!wine) return;
    if (Number.isNaN(nextQty) || nextQty < 0) return;
    const delta = nextQty - wine.quantity;
    await handleQuantityChange(delta);
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
    router.push({
      pathname: '/(modals)/add-wine-manual',
      params: { id: wine.id },
    });
  };

  const handleShare = () => {
    // Point d’entrée pour le partage (à implémenter plus tard)
  };

  const heroPhotos: string[] =
    wine?.image_urls?.length
      ? wine.image_urls.filter((u): u is string => typeof u === 'string' && u.length > 0)
      : wine?.label_image_url
        ? [wine.label_image_url]
        : [];

  useEffect(() => {
    setCarouselIndex(0);
  }, [wine?.id, heroPhotos.length]);

  const handleAddPhoto = () => {
    if (!wine) return;
    setMenuVisible(false);
    Alert.alert(
      t('cellar.addPhotosLabel') || 'Ajouter des photos',
      null,
      [
        { text: t('common.cancel') || 'Annuler', style: 'cancel' },
        {
          text: t('cellar.photoFromLibrary') || 'Photothèque',
          onPress: () => pickAndUploadPhoto('library'),
        },
        {
          text: t('cellar.photoTakePicture') || 'Prendre une photo',
          onPress: () => pickAndUploadPhoto('camera'),
        },
      ]
    );
  };

  const pickAndUploadPhoto = async (source: 'library' | 'camera') => {
    if (!wine) return;
    if (source === 'library') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('common.error') || 'Erreur',
          t('cellar.photoPermissionDenied') || 'Autorisation requise pour accéder aux photos.'
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1.5],
        quality: 0.8,
      });
      if (result.canceled) return;
      await uploadPhoto(result.assets[0].uri);
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('common.error') || 'Erreur',
        t('cellar.cameraPermissionDenied') || 'Autorisation requise pour utiliser l’appareil photo.'
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1.5],
      quality: 0.8,
    });
    if (result.canceled) return;
    await uploadPhoto(result.assets[0].uri);
  };

  const uploadPhoto = async (uri: string) => {
    if (!wine) return;
    setAddingPhoto(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { data, error } = await addWinePhoto(wine.id, wine.user_id, uri);
    setAddingPhoto(false);
    if (error) {
      Alert.alert(
        t('common.error') || 'Erreur',
        (t('cellar.photoUploadError') || 'Impossible d’ajouter la photo.') + (error.message ? `\n${error.message}` : '')
      );
      return;
    }
    if (data) setWine(data);
  };

  if (loading || !wine) {
    return (
      <ScreenWrapper fullWidth>
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
      <ScreenWrapper edges={['top', 'left', 'right']} fullWidth>
        {/* HERO */}
        <View style={styles.hero}>
          {heroPhotos.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                  setCarouselIndex(index);
                }}
                style={StyleSheet.absoluteFill}
              >
                {heroPhotos.map((uri, index) => (
                  <View key={`${uri}-${index}`} style={[styles.heroSlide, { width: screenWidth }]}>
                    <Image
                      source={{ uri }}
                      style={[StyleSheet.absoluteFill, { width: screenWidth, height: HEADER_HEIGHT }]}
                      contentFit="cover"
                      recyclingKey={uri}
                    />
                  </View>
                ))}
              </ScrollView>
              {/* Légère teinte chaude par-dessus pour garder l’ambiance */}
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.35)']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
            </>
          ) : (
            <>
              <LinearGradient
                colors={['#2C1A0E', '#5C3325', '#4A2C1A', '#1A0F08']}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
              {/* Étiquette générique : domaine · millésime · appellation */}
              <View style={styles.genericLabel}>
                <View style={styles.genericLabelInner}>
                  <Text style={styles.genericLabelDomain} numberOfLines={2}>
                    {wine.domain_name}
                  </Text>
                  <View style={styles.genericLabelDivider} />
                  <Text style={styles.genericLabelVintage}>{wine.vintage}</Text>
                  <View style={styles.genericLabelDivider} />
                  <Text style={styles.genericLabelAppellation} numberOfLines={1}>
                    {wine.appellation || `${REGION_LABELS[wine.region] ?? wine.region} · ${COUNTRY_LABELS[wine.country] ?? wine.country}`}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Top nav façon AllTrails */}
          <View style={styles.topNav}>
            <Pressable
              style={({ pressed }) => [styles.navBack, pressed && styles.navBackPressed]}
              hitSlop={10}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
            </Pressable>

            <View style={styles.navRightGroup}>
              <Pressable
                style={({ pressed }) => [styles.navIconBtn, pressed && styles.navIconBtnPressed]}
                hitSlop={6}
                onPress={handleShare}
              >
                <Ionicons
                  name="share-outline"
                  size={18}
                  color="#FFFFFF"
                />
              </Pressable>
              <View style={styles.navDivider} />
              <Pressable
                style={({ pressed }) => [styles.navIconBtn, pressed && styles.navIconBtnPressed]}
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
                style={({ pressed }) => [styles.navIconBtn, pressed && styles.navIconBtnPressed]}
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
            {heroPhotos.length >= 1
              ? heroPhotos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === carouselIndex && styles.dotActive,
                    ]}
                  />
                ))
              : [
                  <View key={0} style={[styles.dot, styles.dotActive]} />,
                  <View key={1} style={styles.dot} />,
                  <View key={2} style={styles.dot} />,
                ]}
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
                onPress={handleAddPhoto}
              >
                <Ionicons
                  name="camera-outline"
                  size={20}
                  color={colors.text.primary}
                />
                <Text style={styles.menuItemText}>
                  {t('cellar.addPhotosLabel') || 'Ajouter des photos'}
                </Text>
              </Pressable>
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
                  {t('cellar.modifyLabel')}
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
                  {t('cellar.deleteLabel')}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Modal cépages */}
        <Modal visible={cepagesModalVisible} transparent animationType="fade">
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setCepagesModalVisible(false)}
          >
            <Pressable style={styles.cepagesModalCard} onPress={() => {}}>
              <View style={styles.cepagesModalHeader}>
                <Text style={styles.cepagesModalTitle}>Cépages</Text>
                <Pressable
                  hitSlop={10}
                  onPress={() => setCepagesModalVisible(false)}
                  style={styles.cepagesModalClose}
                >
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </Pressable>
              </View>
              <ScrollView
                style={styles.cepagesModalList}
                contentContainerStyle={styles.cepagesModalListInner}
                showsVerticalScrollIndicator={false}
              >
                {((wine.grape_varieties?.length ?? 0) > 0
                  ? wine.grape_varieties!
                  : ['Cabernet Sauvignon']
                )
                  .slice(0, 10)
                  .map((cepage, idx) => (
                    <View key={`${cepage}-${idx}`} style={styles.cepagesModalItem}>
                      <Text style={styles.cepagesModalItemText}>{cepage}</Text>
                    </View>
                  ))}
              </ScrollView>
            </Pressable>
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
                <Text style={styles.statLabel}>Millésime</Text>
                <Text style={styles.statValue}>{wine.vintage}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Couleur</Text>
                <View style={[styles.statDot, styles.statDotLarge, { backgroundColor: colorDot }]} />
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Ma note</Text>
                <Text style={[styles.statValue, { color: colors.accent.secondary }]}>
                  {rating.toFixed(1).replace('.', ',')}
                  <Text style={styles.statOutOf}>/10</Text>
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>En cave</Text>
                <Text style={styles.statValue}>×{wine.quantity}</Text>
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
                  <Text style={styles.infoTileLabel}>Température</Text>
                  <View style={styles.infoTileValueRow}>
                    <Text style={styles.infoTileIcon}>🌡</Text>
                    <Text style={styles.infoTileValue}>
                      {wine.ideal_temp ?? 17}°C
                    </Text>
                  </View>
                </View>
                <View style={styles.infoTile}>
                  <Text style={styles.infoTileLabel}>Carafage</Text>
                  <View style={styles.infoTileValueRow}>
                    <Text style={styles.infoTileIcon}>⏱</Text>
                    <Text style={styles.infoTileValue}>
                      {wine.decanting_time ?? 90} min
                    </Text>
                  </View>
                </View>
                <View style={styles.infoTile}>
                  <Text style={styles.infoTileLabel}>Cépage(s)</Text>
                  <View style={styles.infoTileCepagesRow}>
                    <Text style={styles.infoTileValue} numberOfLines={1}>
                      {(wine.grape_varieties && wine.grape_varieties[0])
                        ? wine.grape_varieties[0]
                        : 'Cab. Sauv.'}
                    </Text>
                    <Pressable
                      style={styles.cepagesPlusBtn}
                      hitSlop={8}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setCepagesModalVisible(true);
                      }}
                    >
                        <Ionicons
                          name="add"
                          size={14}
                          color={colors.green.mid}
                        />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.infoTile}>
                  <Text style={styles.infoTileLabel}>Région</Text>
                  <View style={styles.infoTileValueRow}>
                    <Text style={styles.infoTileIcon}>📍</Text>
                    <Text style={styles.infoTileValue}>
                      {REGION_LABELS[wine.region] ?? wine.region}
                    </Text>
                  </View>
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
                  <View style={styles.ratingBarWrap}>
                    <RatingBar
                      value={rating}
                      onChange={() => {}}
                      disabled
                      height={28}
                      borderRadius={8}
                    />
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
                    style={({ pressed }) => [
                      styles.stepperBtn,
                      pressed && styles.stepperBtnPressed,
                    ]}
                    hitSlop={6}
                    onPress={() => handleQuantityChange(-1)}
                  >
                    <Text style={styles.stepperBtnText}>−</Text>
                  </Pressable>
                  <Pressable
                    hitSlop={6}
                    onPress={() => {
                      setQuantityInput(String(wine.quantity));
                      setQuantityModalVisible(true);
                    }}
                  >
                    <Text style={styles.stepperNum}>{wine.quantity}</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.stepperBtn,
                      pressed && styles.stepperBtnPressed,
                    ]}
                    hitSlop={6}
                    onPress={() => handleQuantityChange(1)}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
              <Pressable
                style={styles.restockBtn}
                onPress={() => {
                  Linking.openURL('https://www.example.com').catch(() => undefined);
                }}
              >
                <Text style={styles.restockText}>
                  {t('cellar.restock') || 'Racheter ce vin'}
                </Text>
              </Pressable>
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

        {/* Modale quantité */}
        <Modal
          visible={quantityModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setQuantityModalVisible(false)}
        >
          <Pressable
            style={styles.qtyOverlay}
            onPress={() => setQuantityModalVisible(false)}
          >
            <Pressable style={styles.qtyCard} onPress={() => {}}>
              <Text style={styles.qtyTitle}>
                {t('cellar.editQuantity') || 'Modifier la quantité'}
              </Text>
              <View style={styles.qtyDisplay}>
                <Text style={styles.qtyDisplayText}>{quantityInput || '0'}</Text>
              </View>
              <View style={styles.keypadRow}>
                {['1', '2', '3'].map((d) => (
                  <Pressable
                    key={d}
                    style={styles.keypadKey}
                    onPress={() => setQuantityInput((prev) => (prev === '0' ? d : prev + d))}
                  >
                    <Text style={styles.keypadKeyText}>{d}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.keypadRow}>
                {['4', '5', '6'].map((d) => (
                  <Pressable
                    key={d}
                    style={styles.keypadKey}
                    onPress={() => setQuantityInput((prev) => (prev === '0' ? d : prev + d))}
                  >
                    <Text style={styles.keypadKeyText}>{d}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.keypadRow}>
                {['7', '8', '9'].map((d) => (
                  <Pressable
                    key={d}
                    style={styles.keypadKey}
                    onPress={() => setQuantityInput((prev) => (prev === '0' ? d : prev + d))}
                  >
                    <Text style={styles.keypadKeyText}>{d}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.keypadRow}>
                <Pressable
                  style={styles.keypadKey}
                  onPress={() =>
                    setQuantityInput((prev) =>
                      prev.length <= 1 ? '' : prev.slice(0, prev.length - 1)
                    )
                  }
                >
                  <Text style={styles.keypadKeyText}>⌫</Text>
                </Pressable>
                <Pressable
                  style={styles.keypadKey}
                  onPress={() =>
                    setQuantityInput((prev) => (prev === '' || prev === '0' ? '0' : prev + '0'))
                  }
                >
                  <Text style={styles.keypadKeyText}>0</Text>
                </Pressable>
                <Pressable
                  style={[styles.keypadKey, styles.keypadOkKey]}
                  onPress={() => {
                    const parsed = Number((quantityInput || '0').trim());
                    void handleQuantitySet(parsed);
                    setQuantityModalVisible(false);
                  }}
                >
                  <Text style={styles.keypadOkText}>{t('common.save')}</Text>
                </Pressable>
              </View>
              <Pressable
                style={styles.qtyCancel}
                onPress={() => setQuantityModalVisible(false)}
              >
                <Text style={styles.qtyCancelText}>{t('common.cancel')}</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Barre d’actions en bas */}
        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [
              styles.bottomPrimary,
              pressed && styles.bottomPrimaryPressed,
            ]}
            hitSlop={6}
          >
            <Ionicons
              name="sparkles-outline"
              size={18}
              color={colors.text.onAccent}
            />
            <Text style={styles.bottomPrimaryText}>Trouver un accord</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.bottomIconBtn,
              pressed && styles.bottomIconBtnPressed,
            ]}
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
  heroSlide: {
    height: HEADER_HEIGHT,
  },
  genericLabel: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  genericLabelInner: {
    width: '100%',
    maxWidth: 240,
    backgroundColor: '#F5EDE0',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 90, 58, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  genericLabelDomain: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C1810',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
    lineHeight: 22,
  },
  genericLabelDivider: {
    width: 48,
    height: 1,
    backgroundColor: '#8B5A3A',
    opacity: 0.5,
    marginVertical: 10,
  },
  genericLabelVintage: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3A1A0A',
    letterSpacing: -0.5,
  },
  genericLabelAppellation: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B4A2A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    paddingTop: 8,
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
  navBackPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
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
  navIconBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
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
    gap: 6,
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
  statDotLarge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 0,
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
    gap: 6,
  },
  infoTileLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoTileValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoTileCepagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 24,
  },
  cepagesPlusBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(109, 151, 46, 0.12)',
  },
  infoTileIcon: {
    fontSize: 16,
  },
  infoTileValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
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
  ratingBarWrap: {
    width: '100%',
    minWidth: 160,
    marginTop: 8,
  },
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
  stepperBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
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
  restockBtn: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  restockText: {
    ...typography.bodySmall,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  qtyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
  },
  qtyCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
  },
  qtyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  qtyDisplay: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.background.tertiary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  qtyDisplayText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  keypadKey: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 999,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.tertiary,
  },
  keypadKeyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  keypadOkKey: {
    backgroundColor: colors.accent.primary,
  },
  keypadOkText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.onAccent,
  },
  qtyCancel: {
    marginTop: spacing.sm,
    alignSelf: 'center',
  },
  qtyCancelText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
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
  bottomPrimaryPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  bottomPrimaryText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.onAccent,
  },
  bottomIconBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
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
    minWidth: 160,
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
  cepagesModalCard: {
    marginHorizontal: 24,
    marginTop: 80,
    maxHeight: '70%',
    backgroundColor: colors.background.primary,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  cepagesModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  cepagesModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  cepagesModalClose: {
    padding: 4,
  },
  cepagesModalList: {
    maxHeight: 320,
  },
  cepagesModalListInner: {
    padding: 16,
    paddingBottom: 24,
  },
  cepagesModalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  cepagesModalItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
});
