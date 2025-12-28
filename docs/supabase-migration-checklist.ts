/**
 * 🔄 Supabase 项目迁移检查清单
 * 
 * ==========================================
 * 第一步：创建新的新加坡区域项目
 * ==========================================
 * 
 * 1. 访问 https://app.supabase.com
 * 2. 点击 "New Project"
 * 3. 选择你的 Organization
 * 4. 填写项目信息：
 *    - Name: jiangjunling-sg (或其他名称)
 *    - Database Password: <设置强密码>
 *    - Region: ⚠️ 选择 "Singapore (Southeast Asia)"
 *    - Pricing Plan: Free 或 Pro
 * 5. 点击 "Create new project"
 * 6. 等待项目初始化（约 2 分钟）
 * 
 * ==========================================
 * 第二步：运行数据库迁移脚本
 * ==========================================
 * 
 * 1. 在新项目中，进入 "SQL Editor"
 * 2. 点击 "+ New query"
 * 3. 复制 supabase-migration.sql 的全部内容
 * 4. 粘贴并点击 "Run"
 * 5. 验证没有错误
 * 6. 进入 "Table Editor" 确认 users 表已创建
 * 
 * ==========================================
 * 第三步：获取新项目的 API 密钥
 * ==========================================
 * 
 * 1. 在新项目中，进入 "Settings" -> "API"
 * 2. 复制以下信息：
 *    - Project URL: https://xxxxx.supabase.co
 *    - anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * ==========================================
 * 第四步：更新应用配置
 * ==========================================
 * 
 * 修改文件：lib/supabase.ts
 * 
 * 将：
 * const supabaseUrl = 'https://gbspfrjxokthzvdmibuo.supabase.co';
 * const supabaseAnonKey = 'eyJhbG...旧的key';
 * 
 * 改为：
 * const supabaseUrl = 'https://新项目ID.supabase.co';
 * const supabaseAnonKey = '新的anon key';
 * 
 * ==========================================
 * 第五步：测试功能
 * ==========================================
 * 
 * 1. 刷新应用
 * 2. 测试用户注册
 * 3. 测试用户登录
 * 4. 测试修改密码 ⚡（应该会快很多！）
 * 5. 测试修改昵称
 * 
 * ==========================================
 * 第六步：迁移现有用户数据（可选）
 * ==========================================
 * 
 * 如果旧项目有用户数据：
 * 
 * 选项 A - 通知用户重新注册（推荐）
 *   ✅ 最简单
 *   ✅ 最安全
 *   ❌ 用户需要重新注册
 * 
 * 选项 B - 迁移用户资料数据
 *   1. 从旧项目导出 public.users 表数据
 *   2. 导入到新项目
 *   3. 用户使用"忘记密码"重置密码
 *   ⚠️ auth.users 密码无法迁移
 * 
 * 选项 C - 同时使用两个项目（过渡期）
 *   1. 新用户使用新项目
 *   2. 旧用户继续使用旧项目
 *   3. 逐步引导用户迁移
 * 
 * ==========================================
 * 预期改进
 * ==========================================
 * 
 * 从美国区域 -> 新加坡区域（假设你在中国/东南亚）
 * 
 * 网络延迟：
 *   美国: 200-500ms
 *   新加坡: 50-150ms
 *   ✨ 提升 3-5 倍！
 * 
 * API 响应：
 *   美国: 经常超时
 *   新加坡: 快速稳定
 *   ✨ 成功率接近 100%
 * 
 * ==========================================
 * 需要帮助？
 * ==========================================
 * 
 * 如果遇到问题，请告诉我：
 * 1. 创建新项目时遇到的问题
 * 2. 运行 SQL 脚本的错误信息
 * 3. 更新配置后的测试结果
 */

// 示例：更新后的配置
export const SUPABASE_CONFIG = {
  // 🔴 旧配置（美国区域）
  OLD: {
    url: 'https://gbspfrjxokthzvdmibuo.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdic3Bmcmp4b2t0aHp2ZG1pYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTA3NDIsImV4cCI6MjA4MjA2Njc0Mn0.k3ThDJVhf8yf0kw4dpbqWwQpfJMQkPgX5bwmU7zLghc',
    region: 'US East / US West (慢)',
  },
  
  // 🟢 新配置（新加坡区域）- 请填写你的新项目信息
  NEW: {
    url: 'https://新项目ID.supabase.co',  // ⬅️ 替换这里
    anonKey: '新的anon_key',              // ⬅️ 替换这里
    region: 'Singapore (快 ⚡)',
  },
};

export {};
