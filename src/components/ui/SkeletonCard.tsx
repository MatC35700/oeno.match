import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing } from '@/theme';

const CARD_HEIGHT = Dimensions.get('window').height * 0.25;

export const SkeletonCard: React.FC = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Animated.View style={[styles.imagePlaceholder, animatedStyle]} />
        <View style={styles.info}>
          <Animated.View style={[styles.line, styles.lineTitle, animatedStyle]} />
          <Animated.View style={[styles.line, styles.lineSub, animatedStyle]} />
          <Animated.View style={[styles.line, styles.lineSmall, animatedStyle]} />
          <View style={styles.badges}>
            <Animated.View style={[styles.badge, animatedStyle]} />
            <Animated.View style={[styles.badge, animatedStyle]} />
            <Animated.View style={[styles.badge, animatedStyle]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    marginBottom: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  imagePlaceholder: {
    width: '35%',
    height: '100%',
    backgroundColor: colors.background.tertiary,
  },
  info: {
    flex: 1,
    padding: spacing.card,
    justifyContent: 'space-between',
  },
  line: {
    height: 14,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
  },
  lineTitle: {
    width: '80%',
  },
  lineSub: {
    width: '60%',
  },
  lineSmall: {
    width: '40%',
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    width: 48,
    height: 24,
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
  },
});
