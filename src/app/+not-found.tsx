import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack, type Href } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { colors, typography, spacing } from '@/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ScreenWrapper>
        <View style={styles.content}>
          <Text style={styles.title}>Cette page n'existe pas.</Text>
          <Link href={'/(tabs)' as Href} asChild>
            <Button>Retour à l'accueil</Button>
          </Link>
        </View>
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
});
