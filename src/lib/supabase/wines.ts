import { supabase } from '@/config/supabase';
import type { Wine } from '@/types/wine';

export async function fetchWines(userId: string) {
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data: data as Wine[] | null, error };
}

export async function fetchWineById(id: string) {
  const { data, error } = await supabase.from('wines').select('*').eq('id', id).single();
  return { data: data as Wine | null, error };
}

export async function createWine(wine: Omit<Wine, 'id' | 'created_at' | 'updated_at'>) {
  // @ts-expect-error - Database types placeholder until supabase gen types
  const { data, error } = await supabase.from('wines').insert(wine).select().single();
  return { data: data as Wine | null, error };
}

export async function updateWine(id: string, updates: Partial<Wine>) {
  // @ts-expect-error - Database types placeholder until supabase gen types
  const { data, error } = await supabase.from('wines').update(updates).eq('id', id).select().single();
  return { data: data as Wine | null, error };
}

export async function deleteWine(id: string) {
  const { error } = await supabase.from('wines').delete().eq('id', id);
  return { error };
}
