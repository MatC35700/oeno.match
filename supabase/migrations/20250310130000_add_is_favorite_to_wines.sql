-- Favoris : un vin peut être marqué en favori (étoile) indépendamment de "Mes envies" (wishlist)
ALTER TABLE public.wines
ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_wines_is_favorite ON public.wines (user_id, is_favorite) WHERE is_favorite = true;
