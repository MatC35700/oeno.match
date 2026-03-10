export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  screen: 20, // Padding horizontal des écrans
  section: 24, // Entre sections
  card: 16, // Padding intérieur des cards
} as const;

/** Arrondis élégants, lignes douces */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  /** Cartes type "sheet" (grands coins supérieurs) */
  sheet: 24,
  pill: 9999,
  full: 9999,
} as const;
