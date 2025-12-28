# 头像上传功能测试指南

## 已完成的功能

### 1. Supabase 存储配置 ✅
- 创建了 `avatars` 存储桶
- 设置为公开访问（public: true）
- 文件大小限制：5MB
- 允许的文件类型：JPEG, PNG, JPG, WebP

### 2. 存储策略 ✅
已设置以下 RLS 策略：
- ✅ 用户可以上传自己的头像（文件夹路径必须是用户ID）
- ✅ 用户可以更新自己的头像
- ✅ 用户可以删除自己的头像
- ✅ 所有人可以查看头像（公开读取）

### 3. 重构的组件和服务 ✅

#### `lib/avatarService.ts` - 头像服务
- `uploadAvatar()` - 上传头像到 Supabase Storage
- `updateUserAvatar()` - 更新数据库中的头像URL
- `deleteOldAvatar()` - 删除旧头像文件
- `updateAvatarComplete()` - 完整的头像更新流程

#### `app/profile/_components/ImageCropper.tsx` - 圆形裁剪器
- 支持圆形裁剪框
- 双指缩放和拖动
- 优化的UI设计
- 裁剪后输出 500x500 的正方形图片

#### `app/profile/index.tsx` - 个人信息页面
- 拍照功能
- 从相册选择
- 圆形头像裁剪
- 上传到 Supabase Storage
- 自动刷新用户资料
- 上传状态指示器

## 测试步骤

### 1. 登录应用
使用以下账号登录：
- 邮箱: `qrzmvp@gmail.com`
- 密码: `Woshiqrz123456mvp1`

### 2. 进入个人信息页面
1. 打开应用
2. 点击底部导航的"我的"标签
3. 点击"个人信息"

### 3. 测试头像上传

#### 方式一：拍照
1. 点击"头像"行
2. 选择"拍照"
3. 拍摄照片
4. 双指缩放和拖动调整图片位置
5. 点击右上角的"✓"确认
6. 等待上传完成

#### 方式二：从相册选择
1. 点击"头像"行
2. 选择"从手机相册选择"
3. 选择一张图片
4. 双指缩放和拖动调整图片位置
5. 点击右上角的"✓"确认
6. 等待上传完成

### 4. 验证功能

#### 前端验证
- ✅ 圆形裁剪框显示正确
- ✅ 可以缩放和拖动图片
- ✅ 上传时显示加载动画
- ✅ 上传成功后头像立即更新
- ✅ 显示成功提示

#### 后端验证
使用以下 SQL 查询验证数据：

```sql
-- 查看当前用户的头像URL
SELECT id, email, avatar_url 
FROM users 
WHERE email = 'qrzmvp@gmail.com';
```

#### Storage 验证
```sql
-- 查看上传的文件
SELECT name, bucket_id, created_at, metadata
FROM storage.objects
WHERE bucket_id = 'avatars'
ORDER BY created_at DESC;
```

## 功能特性

### ✅ 完整的上传流程
1. 选择/拍摄照片
2. 圆形裁剪（500x500）
3. 上传到 Supabase Storage（路径：`userId/userId_timestamp.jpg`）
4. 更新数据库中的 `avatar_url`
5. 删除旧头像文件（如果存在）
6. 刷新用户资料
7. 显示成功提示

### ✅ 安全性
- RLS 策略确保用户只能访问自己的头像文件夹
- 文件路径必须以用户ID开头
- 公开读取，但私有写入
- 文件大小限制：5MB
- 文件类型限制：图片格式

### ✅ 用户体验
- 优雅的圆形裁剪界面
- 双指手势支持
- 实时预览
- 上传进度指示
- 错误处理和提示
- 自动刷新显示

## 可能的问题和解决方案

### 问题 1: 权限错误
如果看到权限错误，检查：
- 相机权限是否授予
- 相册权限是否授予

### 问题 2: 上传失败
如果上传失败，检查：
- 网络连接
- Supabase 配置是否正确
- Storage 策略是否正确设置

### 问题 3: 头像不显示
如果头像不显示，检查：
- URL 是否正确
- 存储桶是否设置为 public
- 文件是否成功上传

## 技术栈

- **图片选择**: `expo-image-picker`
- **图片裁剪**: `expo-image-manipulator`
- **文件系统**: `expo-file-system`
- **Base64 编码**: `base64-arraybuffer`
- **云存储**: Supabase Storage
- **数据库**: Supabase PostgreSQL

## 存储结构

```
avatars/
  ├── {userId}/
  │   ├── {userId}_1640000000000.jpg
  │   ├── {userId}_1640000001000.jpg
  │   └── ...
```

每个用户都有自己的文件夹，文件名格式为：`userId_timestamp.jpg`

## 下一步优化建议

1. ✨ 添加图片压缩优化
2. ✨ 添加上传进度条
3. ✨ 支持方形裁剪（可选）
4. ✨ 添加图片滤镜
5. ✨ 支持多种纵横比
6. ✨ 缓存优化
7. ✨ 离线支持
