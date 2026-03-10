/**
 * Types Supabase — à remplacer par la sortie de `supabase gen types typescript`
 * Placeholder avec tables wines et profiles pour la configuration initiale.
 */
import type { Wine } from './wine';
import type { UserProfile } from './user';

export interface Database {
  public: {
    Tables: {
      wines: {
        Row: Wine;
        Insert: Omit<Wine, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Wine>;
      };
      profiles: {
        Row: UserProfile;
        Insert: UserProfile;
        Update: Partial<UserProfile>;
      };
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
}
