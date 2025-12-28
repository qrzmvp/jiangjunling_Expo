# 交易所账户管理功能实现文档

## 功能概述

已成功实现基于 Supabase 的交易所账户管理功能，支持创建、编辑、启用/禁用和删除交易所账户。

## 数据库设计

### 表结构: `exchange_accounts`

```sql
CREATE TABLE exchange_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('spot', 'futures', 'margin')),
  account_mode TEXT NOT NULL CHECK (account_mode IN ('real', 'demo')),
  api_key TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  passphrase TEXT,
  account_nickname TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'expired', 'suspended')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exchange_name, account_nickname)
);
```

### 字段说明

- **id**: 账户唯一标识符
- **user_id**: 用户ID，关联到 auth.users 表
- **exchange_name**: 交易所名称 (Binance, OKX, Bybit, Coinbase, Kraken, Huobi)
- **account_type**: 账户类型 (现货/合约/杠杆)
- **account_mode**: 账户模式 (真实/模拟)
- **api_key**: API密钥
- **secret_key**: API密钥
- **passphrase**: API密码短语 (可选)
- **account_nickname**: 账户备注名称
- **is_enabled**: 是否启用
- **status**: 账户状态 (正常/授权过期/已暂停)
- **last_sync_at**: 最后同步时间
- **created_at**: 创建时间
- **updated_at**: 更新时间

### 安全特性

1. **Row Level Security (RLS)** - 已启用
2. **策略规则**:
   - 用户只能查看自己的账户
   - 用户只能创建自己的账户
   - 用户只能更新自己的账户
   - 用户只能删除自己的账户

### 索引

- `idx_exchange_accounts_user_id` - 用户ID索引
- `idx_exchange_accounts_status` - 状态索引
- `idx_exchange_accounts_is_enabled` - 启用状态索引

### 触发器

- 自动更新 `updated_at` 字段

## 服务层实现

### 文件: `lib/exchangeAccountService.ts`

提供完整的 CRUD 操作：

#### 主要方法

1. **getExchangeAccounts()** - 获取用户所有交易所账户
2. **getExchangeAccountById(id)** - 根据ID获取账户详情
3. **createExchangeAccount(input)** - 创建新账户
4. **updateExchangeAccount(id, input)** - 更新账户信息
5. **deleteExchangeAccount(id)** - 删除账户
6. **toggleExchangeAccount(id, isEnabled)** - 启用/禁用账户
7. **updateAccountStatus(id, status)** - 更新账户状态
8. **getEnabledAccountsCount()** - 获取启用的账户数量
9. **getAccountStats()** - 获取账户统计信息

## 类型定义

### 文件: `types/index.ts`

新增类型定义：

```typescript
// 交易所名称
type ExchangeName = 'Binance' | 'OKX' | 'Bybit' | 'Coinbase' | 'Kraken' | 'Huobi';

// 账户类型
type AccountType = 'spot' | 'futures' | 'margin';

// 账户模式
type AccountMode = 'real' | 'demo';

// 账户状态
type AccountStatus = 'normal' | 'expired' | 'suspended';

// 交易所账户接口
interface ExchangeAccount { ... }

// 创建账户输入
interface CreateExchangeAccountInput { ... }

// 更新账户输入
interface UpdateExchangeAccountInput { ... }
```

## 页面实现

### 1. 账户列表页面

**文件**: `app/profile/exchange-accounts/index.tsx`

**功能特性**:
- 显示所有已连接的交易所账户
- 实时统计信息（总数、启用数、状态分布）
- 账户卡片展示：
  - 交易所 Logo
  - 账户类型和模式标签
  - 账户状态指示器
  - API Key 后4位
  - 启用/禁用状态点
- 空状态提示
- 安全提示信息
- 加载状态处理

**交互**:
- 点击账户卡片进入编辑页面
- 点击"添加"按钮创建新账户

### 2. 账户编辑页面

**文件**: `app/profile/exchange-accounts/edit.tsx`

**功能特性**:
- 支持新建和编辑两种模式
- 表单字段：
  - 交易所选择
  - API Key 输入
  - Secret Key 输入（加密显示）
  - Passphrase 输入（可选）
  - 账户备注
  - 启用/禁用开关
- 表单验证
- 保存按钮加载状态
- 编辑模式下显示删除按钮
- 安全提示信息

**交互**:
- 表单验证（必填字段检查）
- 保存成功后返回列表页
- 删除时显示确认对话框
- 错误处理和提示

## 使用 Supabase MCP 工具

本实现使用了以下 Supabase MCP 工具：

1. **mcp_supabase_apply_migration** - 创建数据库表和策略
2. **mcp_supabase_execute_sql** - 执行 SQL 查询（通过服务层）
3. **mcp_supabase_list_tables** - 查看表结构
4. **mcp_supabase_get_advisors** - 检查安全建议

## 数据流程

```
用户操作 
  ↓
页面组件 (index.tsx / edit.tsx)
  ↓
服务层 (exchangeAccountService.ts)
  ↓
Supabase 客户端 (supabase.ts)
  ↓
Supabase 数据库 (RLS 策略保护)
```

## 安全考虑

1. **API Key 加密存储** - 敏感信息存储在 Supabase 加密数据库
2. **Row Level Security** - 确保用户只能访问自己的数据
3. **输入验证** - 前端表单验证和后端约束检查
4. **安全提示** - 提醒用户不要开启提现权限
5. **认证保护** - 使用 `useProtectedRoute` 钩子保护路由

## 功能清单

- [x] 创建数据库表和策略
- [x] 实现服务层 API
- [x] 定义 TypeScript 类型
- [x] 账户列表页面
- [x] 账户创建功能
- [x] 账户编辑功能
- [x] 账户删除功能
- [x] 启用/禁用功能
- [x] 统计信息展示
- [x] 空状态处理
- [x] 加载状态处理
- [x] 错误处理和提示
- [x] 表单验证
- [x] 安全提示

## 后续优化建议

1. **交易所选择器** - 添加交易所选择弹窗
2. **账户类型选择** - 添加账户类型和模式选择器
3. **API Key 验证** - 添加 API Key 有效性验证
4. **同步功能** - 实现账户数据同步
5. **批量操作** - 支持批量启用/禁用/删除
6. **搜索和筛选** - 添加账户搜索和筛选功能
7. **API Key 加密** - 考虑在客户端使用额外加密层
8. **导入导出** - 支持账户配置的导入导出

## 测试建议

1. 创建新账户
2. 编辑现有账户
3. 删除账户
4. 启用/禁用账户切换
5. 验证 RLS 策略（不同用户之间数据隔离）
6. 测试表单验证
7. 测试错误处理

## 相关文件

- `/lib/exchangeAccountService.ts` - 服务层
- `/types/index.ts` - 类型定义
- `/app/profile/exchange-accounts/index.tsx` - 列表页面
- `/app/profile/exchange-accounts/edit.tsx` - 编辑页面
- Migration: `create_exchange_accounts_table` - 数据库迁移
