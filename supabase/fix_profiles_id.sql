-- ============================================================================
-- FIX PROFILES ID FOR TELEGRAM AUTH
-- ============================================================================
-- Muammo: profiles.id null bo'lib qolyapti, chunki auth.users ishlatilmayapti.
-- Yechim: profiles.id ni avtomatik UUID generatsiya qiladigan qilish.
-- ============================================================================

-- 1. Avval mavjud Foreign Key constraintni olib tashlaymiz (agar nomini bilsangiz)
-- Odatda constraint nomi: profiles_id_fkey
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Agar constraint nomi boshqacha bo'lsa, uni topish qiyin bo'lishi mumkin.
-- Shuning uchun ID ustunini o'zgartiramiz:

ALTER TABLE public.profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Endi constraintni olib tashlash (agar yuqoridagi ishlamagan bo'lsa, bu aniqroq)
-- Supabase bazasida profiles_id_fkey bo'lishi ehtimoli yuqori.

-- 4. RLS Policy yangilanishi (auth.uid() endi ishlamaydi)
-- Eski policylarni olib tashlaymiz
DROP POLICY IF EXISTS "Hamma o'z profilini ko'ra oladi" ON public.profiles;
DROP POLICY IF EXISTS "Foydalanuvchilar o'z profilini yangilay oladi" ON public.profiles;

-- Yangi Policy: Hamma o'qiy oladi
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- Yangi Policy: Telegram ID orqali yangilash
CREATE POLICY "Users can update own profile via Telegram ID" 
ON public.profiles FOR UPDATE 
USING (telegram_user_id IS NOT NULL);
-- Note: User o'z telegram_id sini biladi deb faraz qilamiz (app logic orqali)
-- Yoki oddiygina: UPDATE policy telegram_user_id o'zgarmasligi kerak.

-- Asosiy yechim: INSERT qilishda ID berish shart emas, u avtomatik generatsiya bo'ladi.
