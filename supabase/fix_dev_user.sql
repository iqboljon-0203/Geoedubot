-- Ushbu skript barcha mavjud foydalanuvchilar uchun 'profiles' jadvalida 
-- 'teacher' roli bilan yozuv yaratadi yoki yangilaydi.
-- Buni Supabase Dashboard -> SQL Editor orqali yuriting.

INSERT INTO public.profiles (id, full_name, role)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', email, 'Unknown User'), 'teacher'
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET role = 'teacher';

-- Shuningdek, 42501 xatoligini vaqtincha aylanib o'tish uchun:
-- Agar development paytida RLS xalal berayotgan bo'lsa, siz uni o'chirib turishingiz mumkin (tavsiya etilmaydi lekin ishlaydi):
-- ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
