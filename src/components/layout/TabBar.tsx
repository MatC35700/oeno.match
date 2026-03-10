import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname, type Href } from 'expo-router';
import { colors, typography, shadows } from '@/theme';

type TabConfig = {
  key: string;
  route: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const TABS: TabConfig[] = [
  { key: 'index', route: '/(tabs)', label: 'Accueil', icon: 'home-outline' },
  { key: 'cellar', route: '/(tabs)/cellar', label: 'Mes vins', icon: 'wine-outline' },
  { key: 'pairing', route: '/(tabs)/pairing', label: 'Accords', icon: 'restaurant-outline' },
  { key: 'community', route: '/(tabs)/community', label: 'Communauté', icon: 'people-outline' },
];

export const TabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (tab: TabConfig) => {
    if (tab.key === 'index') return pathname === '/' || pathname === '/(tabs)';
    return pathname.includes(tab.key);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const active = isActive(tab);
          return (
            <Pressable
              key={tab.key}
              onPress={() => router.push(tab.route as Href)}
              style={styles.tab}
            >
              <Ionicons
                name={tab.icon}
                size={22}
                color={active ? colors.accent.primary : colors.text.tertiary}
              />
              <Text style={[styles.label, active && styles.labelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    ...shadows.tabBar,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 24,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  label: {
    ...typography.label,
    fontSize: 10,
    color: colors.text.tertiary,
    marginTop: 2,
    textTransform: 'none',
  },
  labelActive: {
    color: colors.accent.primary,
  },
});
