import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing } from '@/theme';

export default function CellarScreen() {
  const router = useRouter();
  const isEmpty = true; // TODO: dériver du store/state

  const addWine = () => router.push('/(modals)/add-wine-manual' as Href);

  if (isEmpty) {
    return (
      <ScreenWrapper edges={['top', 'left', 'right']}>
        <Text style={styles.header}>Ma cave</Text>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="wine-outline"
            size={64}
            color={colors.icon.empty}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>Votre cave est vide</Text>
          <Text style={styles.emptySubtitle}>
            Ajoutez votre premier vin pour commencer
          </Text>
          <Button onPress={addWine} style={styles.addButton}>
            Ajouter un vin
          </Button>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Ma cave</Text>
        <Pressable
          onPress={addWine}
          style={({ pressed }) => [styles.addIconBtn, pressed && styles.addIconBtnPressed]}
        >
          <Ionicons name="add" size={24} color={colors.accent.primary} />
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.section,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.section,
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
  addIconBtn: {
    padding: spacing.sm,
  },
  addIconBtnPressed: {
    opacity: 0.7,
  },
});
