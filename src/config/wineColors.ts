import type { WineColor } from '@/types/wine';

/**
 * Couleurs des pastilles "couleur du vin" — teintes volontairement claires et distinctes
 * pour une bonne lisibilité (hors palette accent de l’app).
 */
export const WINE_COLOR_HEX: Record<WineColor, string> = {
  red: '#B91C3C',
  white: '#F5F0EB',
  rose: '#C94D62',
  yellow: '#F0C000',
  orange: '#D47838',
};

export const WINE_COLORS: { value: WineColor; hex: string }[] = [
  { value: 'red', hex: WINE_COLOR_HEX.red },
  { value: 'white', hex: WINE_COLOR_HEX.white },
  { value: 'rose', hex: WINE_COLOR_HEX.rose },
  { value: 'yellow', hex: WINE_COLOR_HEX.yellow },
  { value: 'orange', hex: WINE_COLOR_HEX.orange },
];
