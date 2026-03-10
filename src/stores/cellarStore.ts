import { create } from 'zustand';
import type { Wine } from '@/types/wine';
import type { WineColor, MaturityPhase } from '@/types/wine';
import type { CellarTab, WineSortBy } from '@/lib/supabase/wines';
import {
  getWines,
  getWishlist,
  addWine as addWineApi,
  updateWine as updateWineApi,
  deleteWine as deleteWineApi,
  updateQuantity as updateQuantityApi,
  moveToHistory as moveToHistoryApi,
  toggleWishlist as toggleWishlistApi,
  toggleFavorite as toggleFavoriteApi,
} from '@/lib/supabase/wines';
import type { AddWineInput } from '@/lib/supabase/wines';

export interface CellarFilters {
  tab: CellarTab;
  searchQuery: string;
  colors: WineColor[];
  regions: string[];
  appellations: string[];
  vintageMin?: number;
  vintageMax?: number;
  maturityPhases: MaturityPhase[];
  sortBy: WineSortBy;
}

const defaultFilters: CellarFilters = {
  tab: 'cellar',
  searchQuery: '',
  colors: [],
  regions: [],
  appellations: [],
  maturityPhases: [],
  sortBy: 'created_at_desc',
};

interface CellarState {
  wines: Wine[];
  wishlist: Wine[];
  filters: CellarFilters;
  isLoading: boolean;
  fetchWines: (userId: string) => Promise<void>;
  addWine: (userId: string, wine: Omit<AddWineInput, 'user_id'>, imageUri?: string) => Promise<Wine | null>;
  updateWine: (wineId: string, updates: Partial<Wine>) => Promise<void>;
  removeWine: (wineId: string) => Promise<void>;
  setFilters: (filters: Partial<CellarFilters>) => void;
  updateQuantity: (wineId: string, delta: number) => Promise<void>;
  fetchWishlist: (userId: string) => Promise<void>;
  moveToHistory: (wineId: string) => Promise<void>;
  toggleWishlist: (wineId: string) => Promise<void>;
  toggleFavorite: (wineId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  wines: [],
  wishlist: [],
  filters: defaultFilters,
  isLoading: false,
};

export const useCellarStore = create<CellarState>((set, get) => ({
  ...initialState,

  fetchWines: async (userId: string) => {
    set({ isLoading: true });
    const { filters } = get();
    const { data, error } = await getWines(userId, filters);
    if (error) {
      __DEV__ && console.warn('[Cellar] fetchWines error:', error.message);
      set({ wines: [] });
    } else {
      set({ wines: data ?? [] });
    }
    set({ isLoading: false });
  },

  addWine: async (userId: string, wine: Omit<AddWineInput, 'user_id'>, imageUri?: string) => {
    const wineWithUser = { ...wine, user_id: userId } as AddWineInput;
    const { data, error } = await addWineApi(wineWithUser, imageUri);
    if (error || !data) return null;
    set((state) => ({ wines: [data, ...state.wines] }));
    return data;
  },

  updateWine: async (wineId: string, updates: Partial<Wine>) => {
    const { data, error } = await updateWineApi(wineId, updates);
    if (!error && data) {
      set((state) => ({
        wines: state.wines.map((w) => (w.id === wineId ? { ...w, ...data } : w)),
        wishlist: state.wishlist.map((w) => (w.id === wineId ? { ...w, ...data } : w)),
      }));
    }
  },

  removeWine: async (wineId: string) => {
    const { error } = await deleteWineApi(wineId);
    if (!error) {
      set((state) => ({
        wines: state.wines.filter((w) => w.id !== wineId),
        wishlist: state.wishlist.filter((w) => w.id !== wineId),
      }));
    }
  },

  setFilters: (filters: Partial<CellarFilters>) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  updateQuantity: async (wineId: string, delta: number) => {
    const { data, error } = await updateQuantityApi(wineId, delta);
    if (!error && data) {
      set((state) => ({
        wines: state.wines.map((w) => (w.id === wineId ? { ...w, quantity: data.quantity } : w)),
      }));
    }
  },

  fetchWishlist: async (userId: string) => {
    const { data, error } = await getWishlist(userId);
    if (!error && data) set({ wishlist: data });
  },

  moveToHistory: async (wineId: string) => {
    const { data, error } = await moveToHistoryApi(wineId);
    if (!error && data) {
      set((state) => ({
        wines: state.wines.filter((w) => w.id !== wineId),
      }));
    }
  },

  toggleWishlist: async (wineId: string) => {
    const { data, error } = await toggleWishlistApi(wineId);
    if (!error && data) {
      set((state) => {
        const inWishlist = data.is_wishlist;
        const wine = state.wines.find((w) => w.id === wineId) ?? state.wishlist.find((w) => w.id === wineId);
        if (!wine) return state;
        const updated = { ...wine, is_wishlist: inWishlist };
        return {
          wines: inWishlist ? state.wines.filter((w) => w.id !== wineId) : state.wines.map((w) => (w.id === wineId ? updated : w)),
          wishlist: inWishlist ? [updated, ...state.wishlist] : state.wishlist.filter((w) => w.id !== wineId),
        };
      });
    }
  },

  toggleFavorite: async (wineId: string) => {
    const { data, error } = await toggleFavoriteApi(wineId);
    if (!error && data) {
      set((state) => ({
        wines: state.wines.map((w) => (w.id === wineId ? { ...w, is_favorite: data.is_favorite ?? false } : w)),
        wishlist: state.wishlist.map((w) => (w.id === wineId ? { ...w, is_favorite: data.is_favorite ?? false } : w)),
      }));
    }
  },

  reset: () => set(initialState),
}));
