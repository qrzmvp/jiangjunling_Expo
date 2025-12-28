-- =============================================
-- 用户数据迁移脚本（可选）
-- ⚠️ 仅在需要保留现有用户数据时使用
-- =============================================

-- 步骤 1: 在旧项目中导出数据
-- 在旧项目的 SQL Editor 中运行以下命令

-- 导出 users 表数据为 CSV
-- 方法：Table Editor -> users -> 右上角菜单 -> Export as CSV

-- 或者生成 INSERT 语句：
SELECT 
    'INSERT INTO public.users (id, email, username, account_id, avatar_url, is_verified, vip_status, invite_code, subscription_count, following_count, friends_count, favorites_count, created_at, updated_at) VALUES (' ||
    '''' || id || ''', ' ||
    '''' || email || ''', ' ||
    COALESCE('''' || username || '''', 'NULL') || ', ' ||
    COALESCE('''' || account_id || '''', 'NULL') || ', ' ||
    COALESCE('''' || avatar_url || '''', 'NULL') || ', ' ||
    is_verified || ', ' ||
    '''' || vip_status || ''', ' ||
    COALESCE('''' || invite_code || '''', 'NULL') || ', ' ||
    subscription_count || ', ' ||
    following_count || ', ' ||
    friends_count || ', ' ||
    favorites_count || ', ' ||
    '''' || created_at || ''', ' ||
    '''' || updated_at || '''' ||
    ');'
FROM public.users;

-- =============================================
-- 步骤 2: 在新项目中导入数据
-- =============================================

-- 方法 A: 使用 CSV 导入
-- Table Editor -> users -> Insert -> Import CSV

-- 方法 B: 执行上面生成的 INSERT 语句
-- 复制输出结果，在新项目的 SQL Editor 中运行

-- =============================================
-- ⚠️ 重要提示
-- =============================================
-- 
-- 1. auth.users 表的密码无法迁移（已加密）
-- 2. 用户需要使用"忘记密码"功能重置密码
-- 3. 或者让用户重新注册（推荐）
-- 
-- 建议流程：
-- 1. 迁移 public.users 数据
-- 2. 发送邮件通知用户
-- 3. 引导用户使用"忘记密码"功能
-- 
-- =============================================
