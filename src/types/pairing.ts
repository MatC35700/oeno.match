import type { Wine } from './wine';

export type PairingStyle = 'classic' | 'surprising' | 'bold';

export interface Pairing {
  id: string;
  dish_name: string;
  dish_ingredients?: string[];
  wine_id: string;
  wine?: Wine;
  style: PairingStyle;
  score: number; // 0-10
  explanation?: string;
  created_at: string;
}

export interface PairingSuggestion {
  wine: Wine;
  style: PairingStyle;
  score: number;
  explanation: string;
}
