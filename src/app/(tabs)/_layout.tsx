import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '@/theme';

const TAB_ICON_SIZE = 22;
const TAB_BAR_BASE_HEIGHT = 32;

function TabBarIcon({
  name,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) {
  return (
    <Ionicons
      name={name}
      size={TAB_ICON_SIZE}
      color={focused ? colors.accent.primary : colors.text.tertiary}
    />
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: colors.background.primary,
          height: tabBarHeight,
          paddingBottom: insets.bottom,
          paddingTop: 2,
          minHeight: tabBarHeight,
          ...shadows.tabBar,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Outfit_400Regular',
          textTransform: 'none',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingTop: 2,
          paddingBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="home-outline" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cellar"
        options={{
          title: 'Ma cave',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="wine-outline" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pairing"
        options={{
          title: 'Accords',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="restaurant-outline" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Communauté',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="people-outline" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
