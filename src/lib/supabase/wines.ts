import { supabase } from '@/config/supabase';
import type { Wine } from '@/types/wine';
import type { WineColor, MaturityPhase } from '@/types/wine';

export type CellarTab = 'cellar' | 'history' | 'wishlist' | 'favorites';

export type WineSortBy =
  | 'created_at_desc'
  | 'created_at_asc'
  | 'vintage_desc'
  | 'vintage_asc'
  | 'domain_name'
  | 'updated_at_desc';

export interface WineFilters {
  tab?: CellarTab;
  searchQuery?: string;
  colors?: WineColor[];
  regions?: string[];
  appellations?: string[];
  vintageMin?: number;
  vintageMax?: number;
  maturityPhases?: MaturityPhase[];
  sortBy?: WineSortBy;
}

export interface GetWinesOptions extends WineFilters {
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

function buildWinesQuery(userId: string, filters?: GetWinesOptions) {
  let query = supabase
    .from('wines')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (filters?.tab === 'cellar') {
    query = query.is('consumed_at', null).eq('is_wishlist', false);
  } else if (filters?.tab === 'history') {
    query = query.not('consumed_at', 'is', null);
  } else if (filters?.tab === 'wishlist') {
    query = query.eq('is_wishlist', true);
  } else if (filters?.tab === 'favorites') {
    query = query.is('consumed_at', null).eq('is_favorite', true);
  }

  if (filters?.colors?.length) {
    query = query.in('color', filters.colors);
  }
  if (filters?.regions?.length) {
    query = query.in('region', filters.regions);
  }
  if (filters?.appellations?.length) {
    query = query.in('appellation', filters.appellations);
  }
  if (filters?.vintageMin != null) {
    query = query.gte('vintage', filters.vintageMin);
  }
  if (filters?.vintageMax != null) {
    query = query.lte('vintage', filters.vintageMax);
  }
  if (filters?.maturityPhases?.length) {
    query = query.in('maturity_phase', filters.maturityPhases);
  }

  if (filters?.searchQuery?.trim()) {
    const escaped = filters.searchQuery.trim().replace(/'/g, "''");
    const q = `%${escaped}%`;
    query = query.or(`domain_name.ilike.'${q}',cuvee_name.ilike.'${q}',producer_name.ilike.'${q}',region.ilike.'${q}',appellation.ilike.'${q}'`);
  }

  const sortBy = filters?.sortBy ?? 'created_at_desc';
  switch (sortBy) {
    case 'created_at_asc':
      query = query.order('created_at', { ascending: true });
      break;
    case 'vintage_desc':
      query = query.order('vintage', { ascending: false });
      break;
    case 'vintage_asc':
      query = query.order('vintage', { ascending: true });
      break;
    case 'domain_name':
      query = query.order('domain_name', { ascending: true });
      break;
    case 'updated_at_desc':
      query = query.order('updated_at', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const page = filters?.page ?? 0;
  const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  return query;
}

export async function getWines(userId: string, filters?: GetWinesOptions) {
  const { data, error, count } = await buildWinesQuery(userId, filters);
  return {
    data: data as Wine[] | null,
    error,
    count: count ?? 0,
  };
}

export async function getWineById(wineId: string) {
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .eq('id', wineId)
    .is('deleted_at', null)
    .single();
  return { data: data as Wine | null, error };
}

export type AddWineInput = Omit<Wine, 'id' | 'created_at' | 'updated_at' | 'consumed_at' | 'deleted_at'>;

export async function addWine(
  wine: AddWineInput,
  imageUri?: string
): Promise<{ data: Wine | null; error: Error | null }> {
  // @ts-expect-error - Database types placeholder until supabase gen types
  const { data: inserted, error } = await supabase.from('wines').insert(wine).select().single();

  if (error) return { data: null, error };

  const created = inserted as Wine;

  if (imageUri && created?.id) {
    const { data: url, error: uploadError } = await uploadLabelImage(created.user_id, created.id, imageUri);
    if (!uploadError && url) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated } = await (supabase as any)
        .from('wines')
        .update({ label_image_url: url })
        .eq('id', created.id)
        .select()
        .single();
      if (updated) return { data: updated as Wine, error: null };
    }
  }

  return { data: created, error: null };
}

async function uploadLabelImage(
  userId: string,
  wineId: string,
  imageUri: string
): Promise<{ data: string | null; error: Error | null }> {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const path = `${userId}/${wineId}/label.${ext}`;

    const { data, error } = await supabase.storage
      .from('wine-labels')
      .upload(path, blob, { contentType, upsert: true });

    if (error) return { data: null, error };

    const { data: urlData } = supabase.storage.from('wine-labels').getPublicUrl(path);
    return { data: urlData.publicUrl, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export async function updateWine(wineId: string, updates: Partial<Wine>) {
  const clean: Record<string, unknown> = {};
  Object.entries(updates).forEach(([k, v]) => {
    if (v !== undefined) clean[k] = v;
  });
  clean.updated_at = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('wines')
    .update(clean)
    .eq('id', wineId)
    .is('deleted_at', null)
    .select()
    .single();
  return { data: data as Wine | null, error };
}

export async function deleteWine(wineId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('wines')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', wineId)
    .select()
    .single();
  return { data: data as Wine | null, error };
}

export async function updateQuantity(wineId: string, delta: number) {
  const { data: current } = await supabase.from('wines').select('quantity').eq('id', wineId).single();
  const qty = (current as { quantity?: number } | null)?.quantity;
  if (current == null || typeof qty !== 'number') return { data: null, error: new Error('Wine not found') };
  const newQty = Math.max(0, qty + delta);
  return updateWine(wineId, { quantity: newQty });
}

export async function moveToHistory(wineId: string) {
  return updateWine(wineId, { consumed_at: new Date().toISOString() });
}

export async function getWishlist(userId: string) {
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .eq('user_id', userId)
    .eq('is_wishlist', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  return { data: data as Wine[] | null, error };
}

export async function toggleWishlist(wineId: string) {
  const { data: wine } = await getWineById(wineId);
  if (!wine) return { data: null, error: new Error('Wine not found') };
  return updateWine(wineId, { is_wishlist: !wine.is_wishlist });
}

export async function toggleFavorite(wineId: string) {
  const { data: wine } = await getWineById(wineId);
  if (!wine) return { data: null, error: new Error('Wine not found') };
  return updateWine(wineId, { is_favorite: !(wine.is_favorite ?? false) });
}
