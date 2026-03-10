import { GEMINI_API_KEY } from '@/config/gemini';
import type { Wine } from '@/types/wine';
import type { PairingSuggestion } from '@/types/pairing';

/**
 * Suggestions d'accords mets-vins via Gemini
 */
export async function getPairingSuggestions(
  dish: string,
  wines: Wine[]
): Promise<{ data: PairingSuggestion[] | null; error: Error | null }> {
  if (!GEMINI_API_KEY) {
    return { data: null, error: new Error('GEMINI_API_KEY non configurée') };
  }

  try {
    // TODO: Implémenter l'appel à l'API Gemini
    return { data: [], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Erreur pairing') };
  }
}
