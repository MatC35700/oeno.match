export type WineColor = 'red' | 'white' | 'rose' | 'yellow' | 'orange';

export type MaturityPhase = 'drink' | 'peak' | 'wait' | 'sleep';

export interface Wine {
  id: string;
  user_id: string;
  domain_name: string;
  cuvee_name?: string;
  appellation?: string;
  color: WineColor;
  country: string;
  region: string;
  vintage: number;
  user_rating?: number; // 0-10
  tags?: string[];
  personal_notes?: string;
  producer_name?: string;
  storage_location?: string; // Lieu physique
  storage_row?: string; // Numéro rangée
  quantity: number;
  label_image_url?: string;
  back_label_image_url?: string;
  maturity_phase: MaturityPhase;
  peak_date?: string; // Date d'apogée
  ideal_temp?: number; // Température idéale °C
  decanting_time?: number; // Temps de carafage en minutes
  is_wishlist: boolean; // Mes envies
  is_favorite?: boolean; // Favori (étoile)
  notes_public: boolean; // Visible par la communauté
  estimated_value?: number; // Valeur estimée en €
  purchase_price?: number;
  created_at: string;
  updated_at: string;
  consumed_at?: string | null; // When moved to history
  deleted_at?: string | null; // Soft delete
  grape_varieties?: string[]; // Cépages (jusqu'à 10)
}
