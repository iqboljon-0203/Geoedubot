-- ============================================================================
-- FIX STORAGE RLS (Tasks & Answers & Avatars)
-- ============================================================================
-- Muammo: Storage bucketlarga yozish uchun RLS policies kerak.
-- Auth.uid() ishlatolmaymiz, shuning uchun Public yoki Custom tekshiruv kerak.
-- ============================================================================

-- TASKS BUCKET POLICIES
-- Create separate policies for SELECT, INSERT, UPDATE, DELETE

-- 1. Hamma ko'ra oladi (SELECT)
CREATE POLICY "Public Access Tasks"
ON storage.objects FOR SELECT
USING ( bucket_id = 'tasks' );

-- 2. Hamma yuklay oladi (INSERT) - (Vaqtinchalik yechim: Test User uchun)
CREATE POLICY "Public Upload Tasks"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'tasks' );

-- 3. Hamma o'chira oladi/yangilay oladi
CREATE POLICY "Public Update Tasks"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'tasks' );

CREATE POLICY "Public Delete Tasks"
ON storage.objects FOR DELETE
USING ( bucket_id = 'tasks' );


-- AVATARS BUCKET POLICIES
CREATE POLICY "Public Access Avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Public Upload Avatars"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' );


-- ANSWERS BUCKET POLICIES
CREATE POLICY "Public Access Answers"
ON storage.objects FOR SELECT
USING ( bucket_id = 'answers' );

CREATE POLICY "Public Upload Answers"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'answers' );
