-- ============================================================================
-- GEOEDUCATIONBOT - TO'LIQ SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Yaratildi: 2026-01-22
-- Maqsad: Teacher va Student uchun topshiriqlar va amaliyot tizimi
-- ============================================================================

-- 1. PROFILES JADVALI (Foydalanuvchi profillari)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hamma o'z profilini ko'ra oladi" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Foydalanuvchilar o'z profilini yarata oladi" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Foydalanuvchilar o'z profilini yangilay oladi" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- ============================================================================
-- 2. GROUPS JADVALI (O'quv guruhlari)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address TEXT,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);

-- RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guruhlarni hamma ko'ra oladi" 
  ON public.groups FOR SELECT 
  USING (true);

CREATE POLICY "O'qituvchilar guruh yarata oladi" 
  ON public.groups FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "O'qituvchilar o'z guruhlarini yangilay oladi" 
  ON public.groups FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "O'qituvchilar o'z guruhlarini o'chira oladi" 
  ON public.groups FOR DELETE 
  USING (auth.uid() = created_by);

-- ============================================================================
-- 3. GROUP_MEMBERS JADVALI (Guruh a'zolari)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(group_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);

-- RLS
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guruh a'zolarini hamma ko'ra oladi" 
  ON public.group_members FOR SELECT 
  USING (true);

CREATE POLICY "Talabalar guruhlarga qo'shilish so'rovi yuboradi" 
  ON public.group_members FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Talaba o'zini guruhdan chiqarishi mumkin" 
  ON public.group_members FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. TASKS JADVALI (Topshiriqlar va Amaliyotlar)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('homework', 'internship')),
  group_id UUID REFERENCES public.groups ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users NOT NULL,
  file_url TEXT,
  deadline DATE,  -- Uyga vazifa uchun
  date DATE,      -- Amaliyot uchun
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_group_id ON public.tasks(group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON public.tasks(type);

-- RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Topshiriqlarni hamma ko'ra oladi" 
  ON public.tasks FOR SELECT 
  USING (true);

CREATE POLICY "O'qituvchilar topshiriq yarata oladi" 
  ON public.tasks FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "O'qituvchilar o'z topshiriqlarini yangilay oladi" 
  ON public.tasks FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "O'qituvchilar o'z topshiriqlarini o'chira oladi" 
  ON public.tasks FOR DELETE 
  USING (auth.uid() = created_by);

-- ============================================================================
-- 5. ANSWERS JADVALI (Talaba javoblari)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  description TEXT,
  file_url TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  teacher_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  graded_at TIMESTAMPTZ,
  UNIQUE(task_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_answers_task_id ON public.answers(task_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON public.answers(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_score ON public.answers(score);

-- RLS
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Javoblarni hamma ko'ra oladi" 
  ON public.answers FOR SELECT 
  USING (true);

CREATE POLICY "Talabalar o'z javoblarini yubora oladi" 
  ON public.answers FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Talabalar o'z javoblarini yangilay oladi" 
  ON public.answers FOR UPDATE 
  USING (auth.uid() = user_id AND score IS NULL);

CREATE POLICY "O'qituvchilar javoblarni baholay oladi" 
  ON public.answers FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t 
      WHERE t.id = task_id AND t.created_by = auth.uid()
    )
  );

-- ============================================================================
-- STORAGE BUCKETS (Fayllar uchun)
-- ============================================================================
-- Qo'shimcha ravishda Supabase Storage UI orqali quyidagi bucketlarni yarating:
-- 1. "avatars" - Profil rasmlari uchun
-- 2. "tasks" - Topshiriq fayllari uchun (o'qituvchilar yuklaydi)
-- 3. "answers" - Javob fayllari uchun (talabalar yuklaydi)

-- ============================================================================
-- TRIGGERS (Avtomatik yangilanishlar)
-- ============================================================================

-- Profile updated_at avtomatik yangilanishi
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DATA VALIDATION FUNCTIONS
-- ============================================================================

-- Amaliyot javoblari uchun lokatsiya tekshiruvi
CREATE OR REPLACE FUNCTION validate_internship_location()
RETURNS TRIGGER AS $$
DECLARE
  task_type TEXT;
  group_lat DOUBLE PRECISION;
  group_lng DOUBLE PRECISION;
  distance DOUBLE PRECISION;
BEGIN
  -- Task turini aniqlash
  SELECT t.type, g.lat, g.lng INTO task_type, group_lat, group_lng
  FROM public.tasks t
  JOIN public.groups g ON t.group_id = g.id
  WHERE t.id = NEW.task_id;

  -- Agar amaliyot bo'lsa va lokatsiya bo'lmasa - xato
  IF task_type = 'internship' THEN
    IF NEW.location_lat IS NULL OR NEW.location_lng IS NULL THEN
      RAISE EXCEPTION 'Amaliyot uchun lokatsiya majburiy!';
    END IF;
    
    -- Masofa tekshiruvi (taxminan 2km radius)
    distance := SQRT(
      POWER(NEW.location_lat - group_lat, 2) + 
      POWER(NEW.location_lng - group_lng, 2)
    );
    
    IF distance > 0.02 THEN
      RAISE EXCEPTION 'Siz amaliyot joyidan juda uzoqdasiz!';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_internship_location
  BEFORE INSERT ON public.answers
  FOR EACH ROW EXECUTE FUNCTION validate_internship_location();

-- ============================================================================
-- YANGILANISH SANASI
-- ============================================================================
-- graded_at avtomatik o'rnatish
CREATE OR REPLACE FUNCTION set_graded_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.score IS NOT NULL AND OLD.score IS NULL THEN
    NEW.graded_at = timezone('utc'::text, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_graded_at
  BEFORE UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION set_graded_at();

-- ============================================================================
-- SCHEMA TAYYOR! ✅
-- ============================================================================
-- Keyingi qadam: Supabase CLI orqali types.ts generatsiya qilish
-- Buyruq: npx supabase gen types typescript --local > src/integrations/supabase/types.ts
-- ============================================================================
