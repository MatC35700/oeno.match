import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCellarStore } from '@/stores/cellarStore';
import { fetchWines } from '@/lib/supabase/wines';

export function useCellar() {
  const { user } = useAuthStore();
  const { wines, isLoading, setWines, setLoading } = useCellarStore();

  useEffect(() => {
    if (!user?.id) {
      setWines([]);
      return;
    }

    setLoading(true);
    fetchWines(user.id)
      .then(({ data, error }) => {
        if (!error && data) setWines(data);
      })
      .finally(() => setLoading(false));
  }, [user?.id, setWines, setLoading]);

  return { wines, isLoading };
}
