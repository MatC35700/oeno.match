import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radius, shadows } from '@/theme';
import { MaturityBadge } from './MaturityBadge';
import { Badge } from './Badge';
import type { Wine } from '@/types/wine';
import type { WineColor } from '@/types/wine';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.25;

const WINE_COLOR_GRADIENT: Record<WineColor, [string, string]> = {
  red: ['#811C35', '#5C1528'],
  white: ['#F5E6C8', '#D4C4A0'],
  rose: ['#D4758B', '#B85A6E'],
  yellow: ['#C8A951', '#9A8239'],
  orange: ['#C47A3A', '#9A5E2A'],
};

interface BottleCardProps {
  wine: Wine;
  onPress?: () => void;
}

export const BottleCard: React.FC<BottleCardProps> = ({ wine, onPress }) => {
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
              {wine.region}, {wine.country}
            </Text>
            <View style={styles.badges}>
              <Badge>{wine.vintage}</Badge>
              <Badge>{wine.quantity} btl</Badge>
              <MaturityBadge phase={wine.maturity_phase} />
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
    borderRadius: radius.lg,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(46, 24, 9, 0.08)',
    borderRadius: 4,
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
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
