import { supabase } from '@/config/supabase';
import type { UserProfile } from '@/types/user';

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase.from('profiles' as 'profiles').select('*').eq('id', userId).single();
  return { data: data as UserProfile | null, error };
}

export async function upsertProfile(profile: Partial<UserProfile> & { id: string }) {
  // @ts-expect-error - Database types placeholder until supabase gen types
  const { data, error } = await supabase.from('profiles').upsert(profile).select().single();
  return { data: data as UserProfile | null, error };
}
