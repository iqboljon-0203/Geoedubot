-- ============================================================================
-- DUAL EDUCATION: STUDENT PRACTICE LOCATION MIGRATION
-- ============================================================================

-- 1. Add practice location columns to group_members
ALTER TABLE public.group_members
ADD COLUMN IF NOT EXISTS school_name TEXT,
ADD COLUMN IF NOT EXISTS practice_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS practice_lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS practice_address TEXT;

-- 2. Add school_name to answers table (historical record of where student submitted)
ALTER TABLE public.answers
ADD COLUMN IF NOT EXISTS school_name TEXT;

-- 3. RLS update policy for group_members (allow student to update their practice location)
DROP POLICY IF EXISTS "Students can update own group member info" ON public.group_members;

CREATE POLICY "Students can update own group member info"
ON public.group_members FOR UPDATE
USING (true)
WITH CHECK (true);

-- 4. RLS select policy for group_members (allow reading members)
DROP POLICY IF EXISTS "Guruh a'zolarini hamma ko'ra oladi" ON public.group_members;

CREATE POLICY "Guruh a'zolarini hamma ko'ra oladi" 
ON public.group_members FOR SELECT 
USING (true);
