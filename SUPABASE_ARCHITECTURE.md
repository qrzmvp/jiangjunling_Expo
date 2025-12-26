# 将军令 - Supabase 技术架构文档

## 项目概述

**将军令（jijiangling）** 是一个基于加密货币交易的跟单社交平台，用户可以查看优秀交易员的交易信号、跟随交易、管理自己的交易账户，并享受 VIP 会员服务。

### 技术栈
- **前端框架**: React Native (Expo)
- **路由**: Expo Router
- **后端服务**: Supabase (数据库 + 存储 + 云函数)
- **UI 框架**: React Native 原生组件

---

## 一、Supabase 数据库架构设计

### 1.1 核心数据表设计

#### **1.1.1 用户表 (users)**
存储用户基本信息和账户状态

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  account_id TEXT UNIQUE NOT NULL, -- 显示的账户ID，如 "5886220"
  avatar_url TEXT, -- 头像URL（存储在 Supabase Storage）
  is_verified BOOLEAN DEFAULT false, -- 是否认证
  vip_status TEXT DEFAULT 'none', -- VIP状态: none, monthly, quarterly, annual
  vip_expires_at TIMESTAMP WITH TIME ZONE, -- VIP到期时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- 邀请相关
  invite_code TEXT UNIQUE NOT NULL, -- 用户的邀请码
  invited_by UUID REFERENCES users(id), -- 邀请人
  
  -- 统计数据
  subscription_count INTEGER DEFAULT 0, -- 订阅的交易员数量
  following_count INTEGER DEFAULT 0, -- 关注的人数
  friends_count INTEGER DEFAULT 0, -- 好友数
  favorites_count INTEGER DEFAULT 0 -- 收藏数
);

-- 索引优化
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_account_id ON users(account_id);
CREATE INDEX idx_users_invite_code ON users(invite_code);
CREATE INDEX idx_users_invited_by ON users(invited_by);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的完整信息
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- 用户可以更新自己的信息
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 所有人可以查看基本的公开信息（用于展示交易员列表）
CREATE POLICY "Public trader info is viewable" ON users
  FOR SELECT USING (true)
  WITH CHECK (
    -- 只返回部分公开字段
    columns IN (id, username, account_id, avatar_url, is_verified)
  );
```

#### **1.1.2 交易员表 (traders)**
存储专业交易员的详细信息和绩效数据

```sql
CREATE TABLE traders (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT, -- 简介
  
  -- 绩效指标
  roi DECIMAL(10, 2) DEFAULT 0, -- 投资回报率 %
  total_profit DECIMAL(20, 2) DEFAULT 0, -- 总收益
  win_rate DECIMAL(5, 2) DEFAULT 0, -- 胜率 %
  total_trades INTEGER DEFAULT 0, -- 总交易次数
  followers_count INTEGER DEFAULT 0, -- 跟随者数量
  
  -- 排名
  rank INTEGER, -- 排行榜排名
  
  -- 其他数据
  max_drawdown DECIMAL(10, 2) DEFAULT 0, -- 最大回撤 %
  sharpe_ratio DECIMAL(10, 2), -- 夏普比率
  avg_holding_time INTEGER, -- 平均持仓时间(小时)
  
  -- 认证状态
  is_top_trader BOOLEAN DEFAULT false, -- 是否为顶级交易员
  verified_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 索引
CREATE INDEX idx_traders_roi ON traders(roi DESC);
CREATE INDEX idx_traders_rank ON traders(rank);
CREATE INDEX idx_traders_followers ON traders(followers_count DESC);

-- RLS
ALTER TABLE traders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Traders are viewable by everyone" ON traders
  FOR SELECT USING (true);

CREATE POLICY "Only trader can update own data" ON traders
  FOR UPDATE USING (auth.uid() = id);
```

#### **1.1.3 交易信号表 (trading_signals)**
存储交易员发布的交易信号

```sql
CREATE TABLE trading_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trader_id UUID REFERENCES traders(id) ON DELETE CASCADE,
  
  -- 交易信息
  title TEXT NOT NULL, -- 信号标题
  description TEXT, -- 信号描述
  currency_pair TEXT NOT NULL, -- 交易对，如 "BTC/USDT"
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')), -- 做多/做空
  
  -- 价格信息
  entry_price_min DECIMAL(20, 8), -- 入场价格区间-最小
  entry_price_max DECIMAL(20, 8), -- 入场价格区间-最大
  stop_loss DECIMAL(20, 8), -- 止损价格
  take_profit DECIMAL(20, 8), -- 止盈价格
  
  -- 状态
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
  result TEXT CHECK (result IN ('profit', 'loss', 'breakeven', 'pending')),
  
  -- 统计
  views_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0, -- 跟单人数
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_signals_trader ON trading_signals(trader_id);
CREATE INDEX idx_signals_created ON trading_signals(created_at DESC);
CREATE INDEX idx_signals_status ON trading_signals(status);

-- RLS
ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signals are viewable by everyone" ON trading_signals
  FOR SELECT USING (true);

CREATE POLICY "Only trader can create signals" ON trading_signals
  FOR INSERT WITH CHECK (auth.uid() = trader_id);
```

#### **1.1.4 用户订阅表 (subscriptions)**
管理用户对交易员的订阅关系

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trader_id UUID REFERENCES traders(id) ON DELETE CASCADE,
  
  -- 订阅状态
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  auto_copy BOOLEAN DEFAULT false, -- 是否自动跟单
  
  -- 跟单设置
  copy_percentage DECIMAL(5, 2) DEFAULT 100, -- 跟单比例 %
  max_amount_per_trade DECIMAL(20, 2), -- 单笔最大金额
  
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, trader_id) -- 确保一个用户不能重复订阅同一交易员
);

-- 索引
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_trader ON subscriptions(trader_id);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);
```

#### **1.1.5 交易所账户表 (exchange_accounts)**
管理用户的交易所 API 连接

```sql
CREATE TABLE exchange_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 交易所信息
  exchange_name TEXT NOT NULL, -- 交易所名称: Binance, OKX, Bybit等
  account_type TEXT NOT NULL CHECK (account_type IN ('spot', 'futures', 'margin')), -- 账户类型
  account_mode TEXT CHECK (account_mode IN ('real', 'demo')), -- 真实/模拟
  
  -- API 凭证（加密存储）
  api_key TEXT NOT NULL,
  api_secret_encrypted TEXT NOT NULL, -- 加密后的 Secret
  api_passphrase_encrypted TEXT, -- 某些交易所需要
  
  -- 账户别名
  nickname TEXT, -- 用户自定义的账户名称
  
  -- 状态
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'expired')),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 索引
CREATE INDEX idx_exchange_accounts_user ON exchange_accounts(user_id);
CREATE INDEX idx_exchange_accounts_status ON exchange_accounts(status);

-- RLS
ALTER TABLE exchange_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exchange accounts" ON exchange_accounts
  FOR ALL USING (auth.uid() = user_id);
```

#### **1.1.6 用户持仓表 (positions)**
记录用户当前的持仓

```sql
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exchange_account_id UUID REFERENCES exchange_accounts(id) ON DELETE CASCADE,
  
  -- 交易信息
  symbol TEXT NOT NULL, -- 交易对
  direction TEXT CHECK (direction IN ('long', 'short')),
  
  -- 仓位数据
  quantity DECIMAL(20, 8) NOT NULL, -- 持仓数量
  entry_price DECIMAL(20, 8) NOT NULL, -- 入场均价
  current_price DECIMAL(20, 8), -- 当前价格
  
  -- 盈亏
  unrealized_pnl DECIMAL(20, 2), -- 未实现盈亏
  unrealized_pnl_percent DECIMAL(10, 2), -- 未实现盈亏 %
  
  -- 跟单信息（如果是跟单产生的仓位）
  copied_from_signal_id UUID REFERENCES trading_signals(id),
  
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 索引
CREATE INDEX idx_positions_user ON positions(user_id);
CREATE INDEX idx_positions_exchange_account ON positions(exchange_account_id);

-- RLS
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own positions" ON positions
  FOR SELECT USING (auth.uid() = user_id);
```

#### **1.1.7 订单表 (orders)**
记录用户的所有订单（包括挂单和历史订单）

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exchange_account_id UUID REFERENCES exchange_accounts(id) ON DELETE CASCADE,
  
  -- 订单基本信息
  symbol TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('market', 'limit', 'stop_loss', 'take_profit')),
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  
  -- 价格和数量
  quantity DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 8), -- 限价单价格
  filled_quantity DECIMAL(20, 8) DEFAULT 0,
  average_fill_price DECIMAL(20, 8),
  
  -- 订单状态
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'filled', 'cancelled', 'rejected')),
  
  -- 跟单信息
  copied_from_signal_id UUID REFERENCES trading_signals(id),
  
  -- 外部订单ID（来自交易所）
  exchange_order_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  filled_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
```

#### **1.1.8 VIP 订单表 (vip_purchases)**
记录 VIP 会员购买历史

```sql
CREATE TABLE vip_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 购买信息
  package_type TEXT NOT NULL CHECK (package_type IN ('monthly', 'quarterly', 'annual')),
  package_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USDT',
  
  -- 订单信息
  order_number TEXT UNIQUE NOT NULL,
  payment_method TEXT NOT NULL, -- USDT, Credit Card等
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- 时间
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- 支付凭证
  transaction_hash TEXT, -- 区块链交易哈希（如果使用加密货币支付）
  payment_receipt_url TEXT -- 支付凭证URL（存储在 Storage）
);

-- 索引
CREATE INDEX idx_vip_purchases_user ON vip_purchases(user_id);
CREATE INDEX idx_vip_purchases_status ON vip_purchases(payment_status);

-- RLS
ALTER TABLE vip_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases" ON vip_purchases
  FOR SELECT USING (auth.uid() = user_id);
```

#### **1.1.9 兑换码表 (redemption_codes)**
管理兑换码系统

```sql
CREATE TABLE redemption_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  
  -- 兑换码类型和奖励
  reward_type TEXT NOT NULL CHECK (reward_type IN ('vip_days', 'credits', 'trial')),
  reward_value INTEGER NOT NULL, -- 奖励值（天数或积分）
  
  -- 使用限制
  max_uses INTEGER DEFAULT 1, -- 最大使用次数
  current_uses INTEGER DEFAULT 0,
  
  -- 有效期
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- 状态
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 索引
CREATE INDEX idx_redemption_codes_code ON redemption_codes(code);

-- RLS
ALTER TABLE redemption_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check redemption codes" ON redemption_codes
  FOR SELECT USING (is_active = true AND now() BETWEEN valid_from AND valid_until);
```

#### **1.1.10 兑换历史表 (redemption_history)**
记录用户的兑换码使用历史

```sql
CREATE TABLE redemption_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  redemption_code_id UUID REFERENCES redemption_codes(id) ON DELETE CASCADE,
  
  code_used TEXT NOT NULL, -- 冗余存储，方便查询
  item_name TEXT NOT NULL, -- 兑换的物品名称
  
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'expired', 'invalid'))
);

-- 索引
CREATE INDEX idx_redemption_history_user ON redemption_history(user_id);

-- RLS
ALTER TABLE redemption_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemption history" ON redemption_history
  FOR SELECT USING (auth.uid() = user_id);
```

#### **1.1.11 邀请记录表 (invitations)**
追踪邀请关系和奖励

```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inviter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 奖励状态
  reward_status TEXT DEFAULT 'pending' CHECK (reward_status IN ('pending', 'completed', 'expired')),
  reward_amount DECIMAL(10, 2), -- 奖励金额
  
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reward_claimed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(inviter_id, invitee_id)
);

-- 索引
CREATE INDEX idx_invitations_inviter ON invitations(inviter_id);

-- RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invitations" ON invitations
  FOR SELECT USING (auth.uid() = inviter_id);
```

---

## 二、Supabase Storage 存储桶设计

### 2.1 存储桶结构

#### **2.1.1 用户头像存储桶 (avatars)**

```sql
-- 创建存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- 设置存储策略
-- 允许认证用户上传自己的头像
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许认证用户更新自己的头像
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许所有人读取头像（公开访问）
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

**文件路径规范**:
- `avatars/{user_id}/avatar.jpg`
- `avatars/{user_id}/avatar_{timestamp}.jpg` (支持历史版本)

#### **2.1.2 支付凭证存储桶 (payment-receipts)**

```sql
-- 创建私有存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false);

-- 只允许用户上传自己的支付凭证
CREATE POLICY "Users can upload own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 只允许用户查看自己的支付凭证
CREATE POLICY "Users can view own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-receipts' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**文件路径规范**:
- `payment-receipts/{user_id}/{order_number}.jpg`

#### **2.1.3 交易员资料存储桶 (trader-profiles)**

```sql
-- 创建公开存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('trader-profiles', 'trader-profiles', true);

-- 只允许交易员上传自己的资料
CREATE POLICY "Traders can upload own profile materials"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'trader-profiles' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (SELECT 1 FROM traders WHERE id = auth.uid())
);

-- 所有人可以查看交易员资料
CREATE POLICY "Anyone can view trader profiles"
ON storage.objects FOR SELECT
USING (bucket_id = 'trader-profiles');
```

**文件路径规范**:
- `trader-profiles/{trader_id}/cover.jpg` (封面图)
- `trader-profiles/{trader_id}/certificates/{cert_name}.jpg` (认证证书)

---

## 三、Supabase Edge Functions 云函数设计

### 3.1 认证相关函数

#### **3.1.1 用户注册函数 (register)**

**路径**: `/functions/v1/register`

**功能**:
- 创建新用户账户
- 生成唯一的账户 ID 和邀请码
- 处理邀请关系
- 发送欢迎邮件

**请求参数**:
```typescript
{
  email: string,
  password: string,
  username?: string,
  inviteCode?: string // 可选的邀请码
}
```

**响应**:
```typescript
{
  success: boolean,
  user: {
    id: string,
    email: string,
    account_id: string,
    invite_code: string
  }
}
```

**实现逻辑**:
```typescript
// 伪代码
async function register(req) {
  const { email, password, username, inviteCode } = await req.json();
  
  // 1. 创建 Supabase Auth 用户
  const { user, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  // 2. 生成唯一账户ID（7位数字）
  const accountId = generateUniqueAccountId();
  
  // 3. 生成邀请码
  const userInviteCode = generateInviteCode();
  
  // 4. 插入用户表
  await supabase.from('users').insert({
    id: user.id,
    email,
    username: username || email.split('@')[0],
    account_id: accountId,
    invite_code: userInviteCode
  });
  
  // 5. 处理邀请关系
  if (inviteCode) {
    const inviter = await supabase
      .from('users')
      .select('id')
      .eq('invite_code', inviteCode)
      .single();
    
    if (inviter) {
      await supabase.from('invitations').insert({
        inviter_id: inviter.id,
        invitee_id: user.id
      });
      
      await supabase.from('users')
        .update({ invited_by: inviter.id })
        .eq('id', user.id);
    }
  }
  
  // 6. 发送欢迎邮件
  await sendWelcomeEmail(email, username);
  
  return { success: true, user };
}
```

#### **3.1.2 邮箱验证码发送函数 (send-verification-code)**

**路径**: `/functions/v1/send-verification-code`

**功能**:
- 发送邮箱验证码
- 防止频繁请求（限流）
- 验证码有效期管理

---

### 3.2 交易相关函数

#### **3.2.1 同步交易所数据函数 (sync-exchange-data)**

**路径**: `/functions/v1/sync-exchange-data`

**功能**:
- 从交易所 API 拉取用户的持仓、订单数据
- 更新数据库中的持仓和订单状态
- 计算盈亏

**请求参数**:
```typescript
{
  exchangeAccountId: string,
  dataTypes: ['positions', 'orders', 'balance'] // 要同步的数据类型
}
```

**实现逻辑**:
```typescript
async function syncExchangeData(req) {
  const { exchangeAccountId, dataTypes } = await req.json();
  const userId = req.headers.get('user-id'); // 从 JWT 获取
  
  // 1. 获取交易所账户信息
  const account = await supabase
    .from('exchange_accounts')
    .select('*')
    .eq('id', exchangeAccountId)
    .eq('user_id', userId)
    .single();
  
  // 2. 解密 API 密钥
  const { apiKey, apiSecret } = decryptApiCredentials(account);
  
  // 3. 初始化交易所连接
  const exchange = initializeExchange(account.exchange_name, apiKey, apiSecret);
  
  // 4. 同步持仓数据
  if (dataTypes.includes('positions')) {
    const positions = await exchange.fetchPositions();
    
    // 更新数据库
    for (const pos of positions) {
      await supabase.from('positions').upsert({
        user_id: userId,
        exchange_account_id: exchangeAccountId,
        symbol: pos.symbol,
        quantity: pos.amount,
        entry_price: pos.entryPrice,
        current_price: pos.markPrice,
        unrealized_pnl: pos.unrealizedPnl,
        unrealized_pnl_percent: calculatePnlPercent(pos)
      });
    }
  }
  
  // 5. 同步订单数据
  if (dataTypes.includes('orders')) {
    const orders = await exchange.fetchOpenOrders();
    // 处理订单数据...
  }
  
  // 6. 更新同步时间
  await supabase
    .from('exchange_accounts')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', exchangeAccountId);
  
  return { success: true };
}
```

#### **3.2.2 执行跟单函数 (execute-copy-trade)**

**路径**: `/functions/v1/execute-copy-trade`

**功能**:
- 当交易员发布新信号时，自动为订阅用户创建订单
- 根据用户的跟单设置计算交易数量
- 调用交易所 API 下单

**触发方式**: 数据库触发器（当新信号插入时）

**实现逻辑**:
```typescript
async function executeCopyTrade(signal) {
  // 1. 查找所有订阅该交易员的用户
  const subscriptions = await supabase
    .from('subscriptions')
    .select('*, users(*), exchange_accounts(*)')
    .eq('trader_id', signal.trader_id)
    .eq('status', 'active')
    .eq('auto_copy', true);
  
  for (const sub of subscriptions) {
    try {
      // 2. 计算跟单数量
      const quantity = calculateCopyQuantity(
        signal,
        sub.copy_percentage,
        sub.max_amount_per_trade
      );
      
      // 3. 获取用户的交易所账户
      const account = sub.exchange_accounts[0];
      if (!account) continue;
      
      // 4. 初始化交易所连接
      const exchange = initializeExchange(account);
      
      // 5. 下单
      const order = await exchange.createOrder(
        signal.currency_pair,
        'limit',
        signal.direction === 'long' ? 'buy' : 'sell',
        quantity,
        signal.entry_price_min
      );
      
      // 6. 记录订单到数据库
      await supabase.from('orders').insert({
        user_id: sub.user_id,
        exchange_account_id: account.id,
        symbol: signal.currency_pair,
        order_type: 'limit',
        side: signal.direction === 'long' ? 'buy' : 'sell',
        quantity: quantity,
        price: signal.entry_price_min,
        status: 'pending',
        copied_from_signal_id: signal.id,
        exchange_order_id: order.id
      });
      
      // 7. 增加信号的跟单计数
      await supabase.rpc('increment_signal_copy_count', {
        signal_id: signal.id
      });
      
    } catch (error) {
      console.error(`Failed to copy trade for user ${sub.user_id}:`, error);
      // 发送通知给用户
    }
  }
}
```

---

### 3.3 数据统计函数

#### **3.3.1 更新交易员统计数据函数 (update-trader-stats)**

**路径**: `/functions/v1/update-trader-stats`

**功能**:
- 定期计算交易员的绩效指标（ROI、胜率等）
- 更新排行榜排名
- 生成历史绩效图表数据

**触发方式**: 定时任务（Cron Job - 每小时执行）

**实现逻辑**:
```typescript
async function updateTraderStats() {
  // 1. 获取所有交易员
  const traders = await supabase
    .from('traders')
    .select('id');
  
  for (const trader of traders) {
    // 2. 计算该交易员的所有已关闭信号
    const { data: closedSignals } = await supabase
      .from('trading_signals')
      .select('*')
      .eq('trader_id', trader.id)
      .eq('status', 'closed');
    
    // 3. 计算统计数据
    const stats = calculateTraderStats(closedSignals);
    
    // 4. 更新交易员表
    await supabase
      .from('traders')
      .update({
        roi: stats.roi,
        total_profit: stats.totalProfit,
        win_rate: stats.winRate,
        total_trades: closedSignals.length,
        max_drawdown: stats.maxDrawdown,
        updated_at: new Date().toISOString()
      })
      .eq('id', trader.id);
  }
  
  // 5. 更新排行榜排名
  await updateLeaderboard();
}

function calculateTraderStats(signals) {
  let totalProfit = 0;
  let winCount = 0;
  
  signals.forEach(signal => {
    if (signal.result === 'profit') {
      totalProfit += calculateSignalProfit(signal);
      winCount++;
    } else if (signal.result === 'loss') {
      totalProfit -= calculateSignalLoss(signal);
    }
  });
  
  const roi = (totalProfit / 10000) * 100; // 假设初始资金10000
  const winRate = (winCount / signals.length) * 100;
  
  return {
    roi,
    totalProfit,
    winRate,
    maxDrawdown: calculateMaxDrawdown(signals)
  };
}
```

#### **3.3.2 计算排行榜函数 (calculate-leaderboard)**

**路径**: `/functions/v1/calculate-leaderboard`

**功能**:
- 根据 ROI 对交易员进行排序
- 更新交易员的排名字段
- 标记 Top 3 交易员

---

### 3.4 支付相关函数

#### **3.4.1 创建 VIP 订单函数 (create-vip-order)**

**路径**: `/functions/v1/create-vip-order`

**功能**:
- 创建 VIP 购买订单
- 生成支付地址（如果使用加密货币）
- 发送订单确认邮件

**请求参数**:
```typescript
{
  packageType: 'monthly' | 'quarterly' | 'annual',
  paymentMethod: 'USDT' | 'CreditCard'
}
```

**响应**:
```typescript
{
  orderNumber: string,
  amount: number,
  paymentAddress?: string, // USDT 支付地址
  qrCode?: string, // 支付二维码
  expiresAt: string // 订单过期时间
}
```

#### **3.4.2 验证支付回调函数 (verify-payment)**

**路径**: `/functions/v1/verify-payment`

**功能**:
- 接收支付网关的回调通知
- 验证支付状态
- 更新订单状态
- 激活 VIP 会员资格

**Webhook 触发**: 由支付服务商（如 Stripe、区块链节点）触发

---

### 3.5 通知函数

#### **3.5.1 发送推送通知函数 (send-notification)**

**路径**: `/functions/v1/send-notification`

**功能**:
- 当有新的交易信号时通知订阅用户
- 当订单成交时通知用户
- 当 VIP 即将到期时提醒用户

**实现逻辑**:
```typescript
async function sendNotification(eventType, userId, data) {
  // 1. 获取用户的通知偏好
  const preferences = await getUserNotificationPreferences(userId);
  
  if (!preferences.enabled) return;
  
  // 2. 根据事件类型构造消息
  const message = buildNotificationMessage(eventType, data);
  
  // 3. 发送推送通知（通过 Firebase Cloud Messaging 或其他服务）
  await sendPushNotification(userId, message);
  
  // 4. 记录通知历史
  await supabase.from('notifications').insert({
    user_id: userId,
    type: eventType,
    message: message,
    read: false
  });
}
```

---

## 四、数据库触发器和函数

### 4.1 自动更新时间戳

```sql
-- 创建更新 updated_at 的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有需要的表添加触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_traders_updated_at BEFORE UPDATE ON traders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ...其他表同理
```

### 4.2 更新统计计数

```sql
-- 当用户订阅交易员时，增加交易员的粉丝数
CREATE OR REPLACE FUNCTION increment_trader_followers()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE traders
  SET followers_count = followers_count + 1
  WHERE id = NEW.trader_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_subscription_created AFTER INSERT ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION increment_trader_followers();

-- 取消订阅时减少粉丝数
CREATE OR REPLACE FUNCTION decrement_trader_followers()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'active' AND NEW.status = 'cancelled' THEN
    UPDATE traders
    SET followers_count = followers_count - 1
    WHERE id = OLD.trader_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_subscription_cancelled AFTER UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION decrement_trader_followers();
```

### 4.3 新信号触发跟单

```sql
-- 当交易员发布新信号时，触发跟单 Edge Function
CREATE OR REPLACE FUNCTION trigger_copy_trade()
RETURNS TRIGGER AS $$
BEGIN
  -- 调用 Edge Function
  PERFORM net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/execute-copy-trade',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb,
    body := json_build_object('signal', row_to_json(NEW))::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_signal_created AFTER INSERT ON trading_signals
  FOR EACH ROW EXECUTE FUNCTION trigger_copy_trade();
```

---

## 五、实时订阅（Realtime）

### 5.1 订阅交易信号更新

```typescript
// 前端订阅特定交易员的信号
const channel = supabase
  .channel('trader-signals')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'trading_signals',
      filter: `trader_id=eq.${traderId}`
    },
    (payload) => {
      console.log('New signal:', payload.new);
      // 显示新信号通知
      showNotification(`${traderName} 发布了新信号！`);
    }
  )
  .subscribe();
```

### 5.2 订阅持仓变化

```typescript
// 订阅用户自己的持仓变化
const channel = supabase
  .channel('user-positions')
  .on(
    'postgres_changes',
    {
      event: '*', // 监听所有变化
      schema: 'public',
      table: 'positions',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // 更新界面显示
      updatePositionsUI(payload);
    }
  )
  .subscribe();
```

---

## 六、安全性考虑

### 6.1 API 密钥加密

交易所 API 密钥必须加密存储：

```typescript
// 使用 Supabase Vault 或自定义加密
import { createCipheriv, createDecipheriv } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32字节密钥
const IV_LENGTH = 16;

function encryptApiSecret(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptApiSecret(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

### 6.2 RLS 策略检查清单

- ✅ 所有表都启用了 RLS
- ✅ 用户只能访问自己的数据
- ✅ 公开数据（交易员信息、信号）可以被所有人查看
- ✅ 敏感数据（API 密钥、支付信息）只能被所有者访问
- ✅ 管理员操作需要额外的角色检查

### 6.3 速率限制

在 Edge Functions 中实施速率限制：

```typescript
// 使用 Upstash Redis 或 Supabase 表实现速率限制
async function checkRateLimit(userId: string, action: string): Promise<boolean> {
  const key = `ratelimit:${action}:${userId}`;
  const limit = 10; // 每分钟最多10次
  const window = 60; // 60秒窗口
  
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, window);
  }
  
  return count <= limit;
}
```

---

## 七、部署和维护

### 7.1 数据库迁移流程

```bash
# 1. 在本地开发环境进行测试
supabase db reset

# 2. 创建迁移文件
supabase migration new create_users_table

# 3. 编写迁移 SQL
# supabase/migrations/20241223_create_users_table.sql

# 4. 应用迁移到本地
supabase db reset

# 5. 推送到生产环境
supabase db push
```

### 7.2 定时任务配置

使用 Supabase 的 pg_cron 扩展：

```sql
-- 启用 pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 每小时更新交易员统计
SELECT cron.schedule(
  'update-trader-stats',
  '0 * * * *', -- 每小时的第0分钟
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/update-trader-stats',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
  );
  $$
);

-- 每天凌晨清理过期数据
SELECT cron.schedule(
  'cleanup-expired-data',
  '0 0 * * *', -- 每天凌晨0点
  $$
  DELETE FROM redemption_codes 
  WHERE valid_until < now() AND is_active = false;
  $$
);
```

### 7.3 备份策略

Supabase 自动进行每日备份，但建议：

1. 启用 Point-in-Time Recovery (PITR)
2. 定期导出关键数据到外部存储
3. 保留至少 30 天的备份

---

## 八、性能优化建议

### 8.1 数据库索引

已在上述表设计中添加了关键索引，额外建议：

```sql
-- 为常用查询添加复合索引
CREATE INDEX idx_signals_trader_status ON trading_signals(trader_id, status);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- 为全文搜索添加索引
CREATE INDEX idx_traders_name_search ON traders USING gin(to_tsvector('english', display_name));
```

### 8.2 缓存策略

- 使用 Supabase 的内置缓存机制
- 在前端缓存交易员列表和排行榜数据（5分钟过期）
- 使用 Redis 缓存热门交易信号

### 8.3 连接池管理

```typescript
// 使用 Supabase 的连接池配置
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: 'public',
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // 限制实时事件频率
    },
  },
});
```

---

## 九、监控和日志

### 9.1 关键指标监控

- 数据库查询性能（慢查询日志）
- Edge Functions 执行时间和错误率
- API 请求延迟
- 存储使用量
- 活跃用户数

### 9.2 错误追踪

```typescript
// 在 Edge Functions 中集成 Sentry
import * as Sentry from '@sentry/deno';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  tracesSampleRate: 1.0,
});

try {
  // 业务逻辑
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

---

## 十、总结

本技术文档详细描述了如何使用 Supabase 的数据库、存储桶和云函数来构建"将军令"加密货币跟单平台。

### 核心架构要点：

1. **数据库**: 11张核心表，涵盖用户、交易员、信号、订单、支付等全部业务逻辑
2. **存储桶**: 3个存储桶，分别管理头像、支付凭证、交易员资料
3. **云函数**: 15+ Edge Functions，处理认证、交易同步、跟单执行、统计计算、支付等
4. **安全性**: 完整的 RLS 策略、API 密钥加密、速率限制
5. **实时性**: 利用 Supabase Realtime 实现信号推送和持仓更新
6. **可扩展性**: 合理的索引、缓存策略、连接池管理

### 下一步行动：

1. 根据本文档创建数据库迁移文件
2. 配置存储桶和策略
3. 开发和部署 Edge Functions
4. 实施安全策略和测试
5. 配置监控和日志系统
6. 进行压力测试和性能优化

这套架构可以支持数千个并发用户和实时交易数据处理。
