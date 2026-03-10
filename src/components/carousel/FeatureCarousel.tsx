import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { FlatList } from 'react-native';
import { colors, typography, spacing } from '@/theme';

interface FeatureSlide {
  id: string;
  title: string;
  description: string;
}

interface FeatureCarouselProps {
  features: FeatureSlide[];
}

export const FeatureCarousel: React.FC<FeatureCarouselProps> = ({ features }) => {
  const { width } = Dimensions.get('window');

  const renderItem = ({ item }: { item: FeatureSlide }) => (
    <View style={[styles.slide, { width }]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <FlatList
      data={features}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
