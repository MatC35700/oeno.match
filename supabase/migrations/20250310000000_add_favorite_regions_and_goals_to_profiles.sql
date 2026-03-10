-- Migration: ajout des colonnes favorite_regions et goals à la table profiles
-- À exécuter dans Supabase SQL Editor ou via `supabase db push`
-- Idempotent : IF NOT EXISTS évite les erreurs si les colonnes existent déjà

-- Régions favorites : tableau de chaînes (ex: bordeaux, burgundy, champagne)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS favorite_regions text[] DEFAULT '{}';

-- Objectifs : tableau de chaînes (ex: pairing, cellar, tasting)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS goals text[] DEFAULT '{}';

COMMENT ON COLUMN public.profiles.favorite_regions IS 'Régions viticoles favorites (clés i18n)';
COMMENT ON COLUMN public.profiles.goals IS 'Objectifs utilisateur (pairing, cellar, tasting, tasting_advice, buying_tips)';
