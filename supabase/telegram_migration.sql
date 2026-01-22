-- ============================================================================
-- TELEGRAM AUTH MIGRATION
-- ============================================================================
-- Telegram WebApp integratsiyasi uchun profiles jadvaliga yangilanish
-- ============================================================================

-- 1. telegram_user_id ustunini qo'shish
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT UNIQUE;

-- 2. Telegram user ID uchun index
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_user_id 
ON public.profiles(telegram_user_id);

-- 3. Email maydonini ixtiyoriy qilish (Telegram'da email yo'q)
ALTER TABLE public.profiles 
ALTER COLUMN full_name DROP NOT NULL;

-- 4. Yangi RLS policy - Telegram user ID asosida
DROP POLICY IF EXISTS "Foydalanuvchilar o'z profilini yarata oladi" ON public.profiles;

CREATE POLICY "Telegram users can create their profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (telegram_user_id IS NOT NULL);

-- 5. COMMENT qo'shish
COMMENT ON COLUMN public.profiles.telegram_user_id IS 'Telegram WebApp user ID';

-- ============================================================================
-- MIGRATION TAYYOR ✅
-- ============================================================================
-- Telegram auth ishlatish uchun eski Supabase Auth'ni olib tashlash shart emas.
-- profiles.id hali ham auth.users'ga FK sifatida qoladi, lekin ishlatilmaydi.
-- telegram_user_id asosida login amalga oshiriladi.
-- ============================================================================
