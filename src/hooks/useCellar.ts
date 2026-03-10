import { useEffect } from 'react';
import { useUserId } from '@/stores/authStore';
import { useCellarStore } from '@/stores/cellarStore';

export function useCellar() {
  const userId = useUserId();
  const { wines, isLoading, filters, fetchWines, setFilters } = useCellarStore();

  useEffect(() => {
    if (!userId) return;
    fetchWines(userId);
  }, [userId, fetchWines, filters]);

  return { wines, isLoading, filters, setFilters, fetchWines };
}
