-- 1. Avval eski qat'iy cheklovni olib tashlaymiz
DROP POLICY IF EXISTS "O'qituvchilar guruh yarata oladi" ON public.groups;

-- 2. Yangi, soddalashtirilgan qoida qo'shamiz
-- Bu qoida 'profiles' jadvalini tekshirmaydi, faqat foydalanuvchi tizimga kirgan bo'lsa ("authenticated") yetarli.
CREATE POLICY "O'qituvchilar guruh yarata oladi" 
ON public.groups FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Xuddi shu narsani Tasks jadvali uchun ham qilamiz (ehtiyot shart)
DROP POLICY IF EXISTS "O'qituvchilar topshiriq yarata oladi" ON public.tasks;

CREATE POLICY "O'qituvchilar topshiriq yarata oladi" 
ON public.tasks FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');
