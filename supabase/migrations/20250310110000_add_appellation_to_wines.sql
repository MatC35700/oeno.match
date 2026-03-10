-- Migration: add appellation column to wines (AOC/AOP, IGP, etc.)
-- Run in Supabase SQL Editor or via `supabase db push`
-- To be used for filtering and display; full list by country/region to be integrated later.

ALTER TABLE public.wines
ADD COLUMN IF NOT EXISTS appellation text DEFAULT NULL;

COMMENT ON COLUMN public.wines.appellation IS 'Appellation (AOC/AOP, IGP, etc.) — référentiel par pays/région à intégrer';

-- Optional: index for filtering by appellation
CREATE INDEX IF NOT EXISTS idx_wines_appellation ON public.wines (appellation) WHERE appellation IS NOT NULL;
