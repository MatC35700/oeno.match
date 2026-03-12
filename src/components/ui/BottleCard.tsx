import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, shadows, radius } from '@/theme';
import { REGION_LABELS, COUNTRY_LABELS } from '@/config/wineRegions';
import { MaturityBadge } from './MaturityBadge';
import { Badge } from './Badge';
import type { Wine } from '@/types/wine';
import type { WineColor } from '@/types/wine';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.25;

const WINE_COLOR_GRADIENT: Record<WineColor, [string, string]> = {
  red: ['#E45545', '#B84335'],
  white: ['#F5F0EB', '#E5DFD8'],
  rose: ['#D4758B', '#B85A6E'],
  yellow: ['#C98F70', '#A67A5A'],
  orange: ['#C47A3A', '#9A5E2A'],
};

interface BottleCardProps {
  wine: Wine;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export const BottleCard: React.FC<BottleCardProps> = ({ wine, onPress, onFavoritePress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const [gradientStart, gradientEnd] = WINE_COLOR_GRADIENT[wine.color];

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <LinearGradient
              colors={[gradientStart, gradientEnd]}
              style={styles.gradient}
            >
              {wine.label_image_url ? (
                <Image
                  source={{ uri: wine.label_image_url }}
                  style={styles.bottleImage}
                  contentFit="contain"
                />
              ) : (
                <View style={styles.placeholder} />
              )}
            </LinearGradient>
          </View>
          <View style={styles.info}>
            <Text style={styles.domain} numberOfLines={1}>
              {wine.domain_name}
            </Text>
            {wine.cuvee_name && (
              <Text style={styles.cuvee} numberOfLines={1}>
                {wine.cuvee_name}
              </Text>
            )}
            <Text style={styles.region} numberOfLines={1}>
              {REGION_LABELS[wine.region] ?? wine.region}, {COUNTRY_LABELS[wine.country] ?? wine.country}
            </Text>
            {wine.appellation ? (
              <Text style={styles.appellation} numberOfLines={1}>
                {wine.appellation}
              </Text>
            ) : null}
            <View style={styles.badgesRow}>
              <View style={styles.badges}>
                <Badge>{wine.vintage}</Badge>
                <Badge>{wine.quantity} btl</Badge>
                <MaturityBadge phase={wine.maturity_phase} />
              </View>
              {onFavoritePress ? (
                <Pressable
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    onFavoritePress();
                  }}
                  hitSlop={8}
                  style={styles.favoriteBtn}
                >
                  <Ionicons
                    name={wine.is_favorite ? 'heart' : 'heart-outline'}
                    size={22}
                    color={wine.is_favorite ? colors.accent.primary : colors.text.tertiary}
                  />
                </Pressable>
              ) : (
                <View style={styles.favoriteBtn}>
                  <Ionicons
                    name={wine.is_favorite ? 'heart' : 'heart-outline'}
                    size={22}
                    color={wine.is_favorite ? colors.accent.primary : colors.text.tertiary}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CARD_HEIGHT,
    marginBottom: spacing.md,
  },
  pressable: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 0,
    ...shadows.card,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  imageContainer: {
    width: '35%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottleImage: {
    width: '80%',
    height: '90%',
  },
  placeholder: {
    width: 40,
    height: 80,
    backgroundColor: 'rgba(28, 26, 26, 0.06)',
    borderRadius: radius.sm,
  },
  info: {
    flex: 1,
    padding: spacing.card,
    justifyContent: 'space-between',
  },
  domain: {
    ...typography.h3,
    color: colors.text.primary,
  },
  cuvee: {
    ...typography.body,
    color: colors.text.secondary,
  },
  region: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  appellation: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    flex: 1,
  },
  favoriteBtn: {
    padding: 4,
  },
});
