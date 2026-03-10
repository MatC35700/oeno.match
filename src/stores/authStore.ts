import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/user';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  profile: null,
  isLoading: true,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set(initialState),
}));

/** Selector for userId - use when you only need the user id. */
export const useUserId = () => useAuthStore((state) => state.user?.id ?? null);
