import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurFallback } from '@/components/ui/BlurFallback';
import { useRouter, usePathname, type Href } from 'expo-router';
import { colors, typography } from '@/theme';

type TabConfig = {
  key: string;
  route: string;
  label: string;
  icon: string; // Emoji ou nom d'icône
};

const TABS: TabConfig[] = [
  { key: 'index', route: '/(tabs)', label: 'Accueil', icon: '🏠' },
  { key: 'cellar', route: '/(tabs)/cellar', label: 'Mes vins', icon: '🍷' },
  { key: 'pairing', route: '/(tabs)/pairing', label: 'Accords', icon: '🍽️' },
  { key: 'community', route: '/(tabs)/community', label: 'Communauté', icon: '👥' },
];

export const TabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (tab: TabConfig) => {
    if (tab.key === 'index') return pathname === '/' || pathname === '/(tabs)';
    return pathname.includes(tab.key);
  };

  const TabContent = (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const active = isActive(tab);
        return (
          <Pressable
            key={tab.key}
            onPress={() => router.push(tab.route as Href)}
            style={styles.tab}
          >
            <Text style={[styles.icon, active && styles.iconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, active && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <BlurFallback intensity={80} tint="dark" style={styles.container}>
      {TabContent}
    </BlurFallback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  },
  icon: {
    fontSize: 22,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    ...typography.label,
    fontSize: 10,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  labelActive: {
    color: colors.accent.primary,
  },
});
