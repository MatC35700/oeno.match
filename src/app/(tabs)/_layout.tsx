import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@/theme';

const TAB_ICON_SIZE = 22;

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
      color={focused ? colors.accent.primary : colors.accent.secondary}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.accent.secondary,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: colors.background.secondary,
          height: 60,
          ...shadows.tabBar,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Outfit_400Regular',
        },
        tabBarItemStyle: {
          paddingTop: 8,
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
