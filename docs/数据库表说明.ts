/**
 * Supabase 用户表结构说明
 * 
 * ============================================
 * 📊 数据库表关系
 * ============================================
 * 
 * 1️⃣ auth.users (系统认证表)
 * -------------------------
 * 位置: auth schema (系统schema)
 * 作用: 存储用户认证信息
 * 管理: 由 Supabase Auth 自动管理
 * 
 * 字段:
 * - id (UUID) - 用户唯一标识
 * - email - 邮箱地址
 * - encrypted_password - 加密后的密码
 * - email_confirmed_at - 邮箱确认时间
 * - created_at - 创建时间
 * - updated_at - 更新时间
 * - last_sign_in_at - 最后登录时间
 * - raw_user_meta_data - 元数据
 * 
 * 操作方式:
 * - supabase.auth.signUp()
 * - supabase.auth.signIn()
 * - supabase.auth.updateUser()
 * - supabase.auth.signOut()
 * 
 * 
 * 2️⃣ public.users (自定义用户资料表)
 * -------------------------------
 * 位置: public schema (公共schema)
 * 作用: 存储用户的业务信息
 * 管理: 由你的应用管理
 * 
 * 字段:
 * - id (UUID) - 关联到 auth.users.id (外键)
 * - email - 冗余存储邮箱
 * - username - 用户昵称
 * - avatar_url - 头像URL
 * - account_id - 账户ID
 * - is_verified - 是否认证
 * - vip_status - VIP状态
 * - invite_code - 邀请码
 * - subscription_count - 订阅数
 * - following_count - 关注数
 * - friends_count - 好友数
 * - favorites_count - 收藏数
 * 
 * 操作方式:
 * - supabase.from('users').select()
 * - supabase.from('users').update()
 * - supabase.from('users').insert()
 * 
 * 
 * ============================================
 * 🔄 关联关系
 * ============================================
 * 
 * auth.users.id <---> public.users.id (一对一)
 * 
 * 当用户注册时:
 * 1. Supabase Auth 在 auth.users 创建记录
 * 2. 数据库触发器在 public.users 创建对应记录
 * 
 * 
 * ============================================
 * 🔐 修改密码的流程
 * ============================================
 * 
 * 1. 用户在前端输入新密码
 * 2. 调用 supabase.auth.updateUser({ password: newPassword })
 * 3. Supabase 更新 auth.users 表中的 encrypted_password
 * 4. public.users 表不受影响（它不存储密码）
 * 
 * ⚠️ 注意: 密码只存在于 auth.users，你永远不需要在 public.users 中存储密码
 * 
 * 
 * ============================================
 * ❓ 为什么需要两个表？
 * ============================================
 * 
 * ✅ 职责分离
 *    - auth.users: 专注认证和安全
 *    - public.users: 专注业务数据
 * 
 * ✅ 安全性
 *    - auth.users 由 Supabase 管理，更安全
 *    - 你的应用代码不会直接接触密码
 * 
 * ✅ 灵活性
 *    - 可以随意扩展 public.users 的字段
 *    - 不影响认证系统
 * 
 * ✅ 权限控制
 *    - auth.users 只能通过 auth API 操作
 *    - public.users 可以设置 RLS (Row Level Security)
 */

// 示例代码

// ❌ 错误: 不要这样做
// const { error } = await supabase
//   .from('users')
//   .update({ password: 'newpassword' }) // users 表没有 password 字段！

// ✅ 正确: 修改密码
const { error } = await supabase.auth.updateUser({
  password: 'newpassword'
});

// ✅ 正确: 修改用户资料
const { error2 } = await supabase
  .from('users')
  .update({ username: 'newname', avatar_url: 'url' })
  .eq('id', userId);

export {};
