#!/bin/bash

# =============================================
# Supabase 数据迁移脚本
# =============================================

echo "📦 Supabase 数据迁移工具"
echo "========================================"
echo ""

# 旧项目信息
OLD_PROJECT_URL="https://gbspfrjxokthzvdmibuo.supabase.co"
OLD_SERVICE_ROLE_KEY="<你的旧项目 service_role key>"

# 新项目信息（新加坡区域）
NEW_PROJECT_URL="<新项目URL>"
NEW_SERVICE_ROLE_KEY="<新项目 service_role key>"

echo "⚠️  注意事项："
echo "1. 请先在新项目中运行 supabase-migration.sql"
echo "2. 确保已填写正确的 service_role key"
echo "3. 此脚本将迁移 auth.users 和 public.users 表数据"
echo ""

# =============================================
# 数据导出步骤（手动操作）
# =============================================

cat << 'EOF'

📋 数据迁移步骤：

方法 1️⃣：使用 Supabase Dashboard
---------------------------------
1. 登录旧项目 Dashboard
2. 进入 Table Editor
3. 选择 users 表
4. 点击右上角 "..." -> "Export as CSV"
5. 保存 CSV 文件

6. 登录新项目 Dashboard
7. 进入 Table Editor
8. 选择 users 表
9. 点击 "Insert" -> "Import CSV"
10. 上传之前导出的 CSV

方法 2️⃣：使用 SQL 直接导出
---------------------------------
在旧项目的 SQL Editor 中运行：

```sql
-- 导出 users 表数据为 INSERT 语句
SELECT 
    'INSERT INTO public.users (id, email, username, account_id, avatar_url, is_verified, vip_status) VALUES (' ||
    '''' || id || ''', ' ||
    '''' || email || ''', ' ||
    COALESCE('''' || username || '''', 'NULL') || ', ' ||
    COALESCE('''' || account_id || '''', 'NULL') || ', ' ||
    COALESCE('''' || avatar_url || '''', 'NULL') || ', ' ||
    is_verified || ', ' ||
    '''' || vip_status || '''' ||
    ');'
FROM public.users;
```

复制输出结果，在新项目的 SQL Editor 中运行。

方法 3️⃣：对于 auth.users（需要重新注册）
---------------------------------
⚠️ Supabase auth.users 表的密码是加密的，无法直接迁移

建议：
1. 通知用户系统升级
2. 让用户使用"忘记密码"功能重置密码
3. 或者让用户重新注册

EOF

echo ""
echo "✅ 迁移准备完成"
echo "请按照上述步骤手动迁移数据"
