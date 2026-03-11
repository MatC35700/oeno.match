-- Migration: add image_urls to wines for carousel (multiple photos per wine)
ALTER TABLE public.wines
ADD COLUMN IF NOT EXISTS image_urls jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.wines.image_urls IS 'URLs des photos du vin (étiquette, etc.) pour le carousel';
