import { useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/stores/authStore';
import { fetchProfile } from '@/lib/supabase/profiles';

export function useAuth() {
  const { user, profile, setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        fetchProfile(session.user.id).then(({ data: profileData }) => {
          setProfile(profileData ?? null);
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        fetchProfile(session.user.id).then(({ data: profileData }) => {
          setProfile(profileData ?? null);
        });
      } else {
        setProfile(null);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [setUser, setProfile, setLoading]);

  return { user, profile, isAuthenticated: !!user };
}
