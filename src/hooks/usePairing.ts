import { useState } from 'react';
import { getPairingSuggestions } from '@/lib/gemini/pairing';
import type { Wine } from '@/types/wine';
import type { PairingSuggestion } from '@/types/pairing';

export function usePairing() {
  const [suggestions, setSuggestions] = useState<PairingSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchPairings = async (dish: string, wines: Wine[]) => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await getPairingSuggestions(dish, wines);
    if (error) setError(error);
    if (data) setSuggestions(data);
    setIsLoading(false);
  };

  return { suggestions, isLoading, error, searchPairings };
}
