import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { WineCounter } from '@/components/ui/WineCounter';
import { colors, typography, spacing } from '@/theme';
import { useCellar } from '@/hooks/useCellar';
import { useAuthStore } from '@/stores/authStore';

export default function HomeScreen() {
  const router = useRouter();
  const { wines } = useCellar();
  const { profile, user } = useAuthStore();

  const totalBottles = useMemo(
    () => wines.reduce((sum, wine) => sum + (wine.is_wishlist ? 0 : wine.quantity ?? 0), 0),
    [wines],
  );

  const fullName = profile?.first_name || profile?.last_name
    ? `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()
    : user?.user_metadata?.full_name || user?.email || '';

  const initials = useMemo(() => {
    const base = fullName || '';
    const [first, second] = base.split(' ');
    const firstInitial = first?.[0] ?? '';
    const secondInitial = second?.[0] ?? '';
    return (firstInitial + secondInitial).toUpperCase() || 'OM';
  }, [fullName]);

  return (
    <ScreenWrapper>
      <View style={styles.headerRow}>
        <Pressable
          style={styles.avatar}
          onPress={() => router.push('/profile' as Href)}
          hitSlop={8}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </Pressable>
        <Text style={styles.header}>Accueil</Text>
      </View>
      <View style={styles.section}>
        <WineCounter count={totalBottles} label="bouteilles" />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.section,
    gap: spacing.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.bodySmall,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  header: {
    ...typography.h2,
    color: colors.text.primary,
  },
  section: {
    marginBottom: spacing.section,
  },
});

