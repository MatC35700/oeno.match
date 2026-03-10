import { GEMINI_API_KEY, GEMINI_API_URL } from '@/config/gemini';
import type { Wine } from '@/types/wine';

/**
 * Reconnaissance d'étiquette via Gemini Vision
 * Analyse une image et retourne les données structurées du vin
 */
export async function scanLabel(imageUri: string): Promise<{ data: Partial<Wine> | null; error: Error | null }> {
  if (!GEMINI_API_KEY) {
    return { data: null, error: new Error('GEMINI_API_KEY non configurée') };
  }

  try {
    // TODO: Implémenter l'appel à l'API Gemini Vision
    // Pour l'instant, placeholder pour l'architecture
    return { data: null, error: new Error('Non implémenté') };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Erreur scan') };
  }
}
