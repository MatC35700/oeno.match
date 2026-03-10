export const typography = {
  // Titres
  h1: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
  },
  // Corps
  body: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  // Labels
  label: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  // Chiffres (compteur vintage)
  display: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -1,
  },
} as const;
