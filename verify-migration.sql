-- =============================================
-- 迁移验证脚本
-- 在新项目的 SQL Editor 中运行此脚本
-- =============================================

-- 1. 检查 users 表是否存在
SELECT 
    tablename,
    schemaname
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- 2. 检查 users 表的列
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. 检查索引
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'users';

-- 4. 检查 RLS 是否启用
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'users';

-- 5. 检查 RLS 策略
SELECT
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'users';

-- 6. 检查触发器
SELECT
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table = 'users';

-- 7. 检查函数
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('handle_new_user', 'update_updated_at_column');

-- 8. 检查视图
SELECT
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name = 'public_profiles';

-- =============================================
-- 预期结果：
-- =============================================
-- 1. users 表存在 ✅
-- 2. 应该有 14 个列 ✅
-- 3. 应该有 3 个索引 ✅
-- 4. RLS 应该启用 (rowsecurity = true) ✅
-- 5. 应该有 3 个策略 ✅
-- 6. 应该有 2 个触发器 ✅
-- 7. 应该有 2 个函数 ✅
-- 8. public_profiles 视图应该存在 ✅
-- =============================================
