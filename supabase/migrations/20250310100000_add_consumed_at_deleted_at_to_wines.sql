-- Migration: add consumed_at and deleted_at to wines for history and soft delete
-- Run in Supabase SQL Editor or via `supabase db push`

ALTER TABLE public.wines
ADD COLUMN IF NOT EXISTS consumed_at timestamptz DEFAULT NULL;

ALTER TABLE public.wines
ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

COMMENT ON COLUMN public.wines.consumed_at IS 'When the wine was consumed (moved to history)';
COMMENT ON COLUMN public.wines.deleted_at IS 'Soft delete timestamp';
