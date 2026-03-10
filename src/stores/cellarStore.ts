import { create } from 'zustand';
import type { Wine } from '@/types/wine';

interface CellarState {
  wines: Wine[];
  isLoading: boolean;
  setWines: (wines: Wine[]) => void;
  addWine: (wine: Wine) => void;
  updateWine: (id: string, updates: Partial<Wine>) => void;
  removeWine: (id: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  wines: [],
  isLoading: false,
};

export const useCellarStore = create<CellarState>((set) => ({
  ...initialState,
  setWines: (wines) => set({ wines }),
  addWine: (wine) => set((state) => ({ wines: [wine, ...state.wines] })),
  updateWine: (id, updates) =>
    set((state) => ({
      wines: state.wines.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    })),
  removeWine: (id) => set((state) => ({ wines: state.wines.filter((w) => w.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set(initialState),
}));
