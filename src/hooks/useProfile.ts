import { useAuthStore } from '@/stores/authStore';
import { upsertProfile } from '@/lib/supabase/profiles';
import type { UserProfile } from '@/types/user';

export function useProfile() {
  const { profile, setProfile } = useAuthStore();

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile?.id) return { error: new Error('Profil non trouvé') };
    const { data, error } = await upsertProfile({ ...profile, ...updates });
    if (!error && data) setProfile(data);
    return { data, error };
  };

  return { profile, updateProfile };
}
