-- ============================================================================
-- FIX GROUPS FOREIGN KEY
-- ============================================================================
-- Muammo: groups.created_by hali ham auth.users ga bog'langan.
-- Telegram Auth userlari auth.users da yo'q, shuning uchun Insert paytida Foreign Key xatosi (23503) yuz beryapti.
-- Yechim: groups.created_by ni public.profiles(id) ga bog'lash kerak.
-- ============================================================================

-- 1. Eski constraintni olib tashlash
ALTER TABLE public.groups DROP CONSTRAINT IF EXISTS groups_created_by_fkey;

-- 2. Yangi constraint yaratish (profiles jadvaliga bog'lash)
ALTER TABLE public.groups
ADD CONSTRAINT groups_created_by_fkey
FOREIGN KEY (created_by) REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 3. Xuddi shu muammo tasks va answers jadvallarida ham bor
-- Ularni ham to'g'irlab ketamiz

-- TASKS
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_created_by_fkey;
ALTER TABLE public.tasks
ADD CONSTRAINT tasks_created_by_fkey
FOREIGN KEY (created_by) REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- ANSWERS
ALTER TABLE public.answers DROP CONSTRAINT IF EXISTS answers_user_id_fkey;
ALTER TABLE public.answers
ADD CONSTRAINT answers_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- GROUP_MEMBERS
ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;
ALTER TABLE public.group_members
ADD CONSTRAINT group_members_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;
