import { useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/stores/authStore';
import { fetchProfile } from '@/lib/supabase/profiles';

export function useAuth() {
  const { user, profile, isLoading, setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        const { data: profileData } = await fetchProfile(session.user.id);
        setProfile(profileData ?? null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        const { data: profileData } = await fetchProfile(session.user.id);
        setProfile(profileData ?? null);
      } else {
        setProfile(null);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [setUser, setProfile, setLoading]);

  return { user, profile, isAuthenticated: !!user, isLoading };
}
