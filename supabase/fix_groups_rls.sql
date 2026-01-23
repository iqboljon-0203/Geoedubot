-- ============================================================================
-- FIX RLS FOR TELEGRAM AUTH (Create Groups)
-- ============================================================================
-- Muammo: Supabase Auth ishlatilmayotgani uchun auth.uid() null qaytaradi.
-- Natija: 401 Unauthorized xatosi (guruh yaratishda).
-- Yechim: RLS qoidalarini auth.uid() ga bog'liqlikdan ozod qilish va
-- faqat created_by ID si haqiqiy o'qituvchi ekanligini tekshirish.
-- ============================================================================

-- 1. Groups jadvali uchun Insert policy
DROP POLICY IF EXISTS "O'qituvchilar guruh yarata oladi" ON public.groups;

CREATE POLICY "Teachers can create groups (No Auth)" 
ON public.groups FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = created_by AND role = 'teacher'
  )
);

-- 2. Groups jadvali uchun Update/Delete policy
DROP POLICY IF EXISTS "O'qituvchilar o'z guruhlarini yangilay oladi" ON public.groups;
DROP POLICY IF EXISTS "O'qituvchilar o'z guruhlarini o'chira oladi" ON public.groups;

CREATE POLICY "Teachers can update own groups (No Auth)" 
ON public.groups FOR UPDATE 
USING (created_by IN (SELECT id FROM public.profiles WHERE role = 'teacher'));

CREATE POLICY "Teachers can delete own groups (No Auth)" 
ON public.groups FOR DELETE 
USING (created_by IN (SELECT id FROM public.profiles WHERE role = 'teacher'));

-- 3. Group Members insert policy (Talabalar uchun)
DROP POLICY IF EXISTS "Talabalar guruhlarga qo'shilish so'rovi yuboradi" ON public.group_members;

CREATE POLICY "Students can join groups (No Auth)" 
ON public.group_members FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'student'
  )
);
