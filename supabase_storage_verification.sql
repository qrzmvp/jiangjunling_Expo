-- 验证 Supabase Storage 配置
-- 在 Supabase SQL Editor 中运行此脚本进行验证

-- 1. 检查 avatars 存储桶配置
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'avatars';

-- 预期结果：
-- id: avatars
-- name: avatars
-- public: true
-- file_size_limit: 5242880 (5MB)
-- allowed_mime_types: {image/jpeg, image/png, image/jpg, image/webp}

-- 2. 检查存储策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%avatar%';

-- 预期结果：应该有 4 个策略
-- 1. Users can upload their own avatar (INSERT)
-- 2. Users can update their own avatar (UPDATE)
-- 3. Users can delete their own avatar (DELETE)
-- 4. Anyone can view avatars (SELECT)

-- 3. 检查用户表的 avatar_url 列
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name = 'avatar_url';

-- 预期结果：
-- column_name: avatar_url
-- data_type: text
-- is_nullable: YES

-- 4. 查看当前用户的头像信息
SELECT 
  id,
  email,
  username,
  avatar_url,
  created_at
FROM users
WHERE email = 'qrzmvp@gmail.com';

-- 5. 查看已上传的头像文件（如果有）
SELECT 
  id,
  name,
  bucket_id,
  owner_id,
  created_at,
  updated_at,
  metadata->>'size' as file_size,
  metadata->>'mimetype' as mime_type
FROM storage.objects
WHERE bucket_id = 'avatars'
ORDER BY created_at DESC
LIMIT 10;

-- 6. 测试存储桶的公开访问
-- 运行后，使用返回的 URL 在浏览器中测试
SELECT 
  id,
  name,
  'https://qzcblykahxzktiprxhbf.supabase.co/storage/v1/object/public/avatars/' || name as public_url
FROM storage.objects
WHERE bucket_id = 'avatars'
ORDER BY created_at DESC
LIMIT 5;
