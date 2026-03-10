export const colors = {
  // Fonds
  background: {
    primary: '#FFF4E8', // Crème ivoire — fond de page
    secondary: '#FFFFFF', // Blanc — cards, inputs, tab bar
    tertiary: '#F5E6D0', // Crème clair — chips
  },
  // Accent principal — bordeaux
  accent: {
    primary: '#811C35', // Bordeaux principal (boutons, icônes actives)
    secondary: '#8C7B6B', // Brun clair (inactif)
    muted: 'rgba(129, 28, 53, 0.08)', // Fond subtil pressed
  },
  // Couleurs de vin — pour les tags et indicateurs
  wine: {
    red: '#811C35',
    white: '#F5E6C8',
    rose: '#D4758B',
    yellow: '#C8A951',
    orange: '#C47A3A',
  },
  // Maturité
  maturity: {
    drink: '#4CAF50',
    peak: '#8BC34A',
    wait: '#FF9800',
    sleep: '#9E9E9E',
  },
  // Texte
  text: {
    primary: '#2E1809', // Titres
    secondary: '#5C4A3A', // Corps de texte
    tertiary: '#8C7B6B', // Labels, placeholders
    inverse: '#FFF4E8', // Texte sur fond bordeaux
  },
  // Utilitaires
  border: 'rgba(46, 24, 9, 0.12)',
  borderFocus: '#811C35',
  success: '#4CAF50',
  error: '#EF4444',
  warning: '#F59E0B',
  // Icônes
  icon: {
    default: '#5C4A3A', // Brun moyen
    active: '#811C35', // Bordeaux
    inactive: '#8C7B6B', // Brun clair
    empty: '#B1AD86', // Olive doux (état vide)
  },
} as const;
