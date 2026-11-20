-- ============================================================================
-- TASKS JADVALIGA GEO-FENS SOZLAMALARINI QO'SHISH MIGRATSIYASI
-- ============================================================================
-- Ushbu SQL kodni Supabase Dashboard -> SQL Editor bo'limida ishga tushiring:

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS radius DOUBLE PRECISION DEFAULT 1.5,
ADD COLUMN IF NOT EXISTS mandatory_geo BOOLEAN DEFAULT true;

-- Schema keshini yangilash (PostgREST schema cache reload)
NOTIFY pgrst, 'reload schema';
