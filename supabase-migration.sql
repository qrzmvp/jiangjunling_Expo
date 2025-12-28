-- =============================================
-- Supabase 数据库迁移脚本
-- 从旧项目迁移到新加坡区域新项目
-- =============================================

-- 1. 创建 users 表
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT,
    account_id TEXT UNIQUE,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    vip_status TEXT DEFAULT 'free',
    invite_code TEXT UNIQUE,
    subscription_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    friends_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_account_id_idx ON public.users(account_id);
CREATE INDEX IF NOT EXISTS users_invite_code_idx ON public.users(invite_code);

-- 3. 启用 Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略
-- 用户可以查看自己的数据
CREATE POLICY "Users can view own data" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- 用户可以更新自己的数据
CREATE POLICY "Users can update own data" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- 用户可以插入自己的数据
CREATE POLICY "Users can insert own data" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 5. 创建触发器：新用户注册时自动创建 users 记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, account_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        UPPER(SUBSTRING(NEW.id::TEXT, 1, 8))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 创建新触发器
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. 创建 public_profiles 视图（如果需要）
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id,
    username,
    avatar_url,
    account_id,
    vip_status,
    subscription_count,
    following_count,
    friends_count,
    favorites_count,
    created_at
FROM public.users;

-- 7. 为视图设置权限
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 8. 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 创建更新时间戳的触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 完成！
-- =============================================
-- 
-- 下一步：
-- 1. 在新项目的 SQL Editor 中运行此脚本
-- 2. 验证表和触发器已创建
-- 3. 更新应用中的 Supabase URL 和 anon key
-- 4. 测试用户注册和登录功能
-- 
-- =============================================
