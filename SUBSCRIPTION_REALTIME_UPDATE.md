# 订阅和关注功能实时更新实现文档

## 📋 功能概述

实现了当用户在 Traders 页面点击订阅或关注按钮后，"我的"页面的统计数据能够实时更新。

## 🔧 实现方案

### 1. 数据库函数

使用 Supabase 数据库函数 `get_user_stats` 一次性获取所有统计数据：

```sql
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_follow_count INTEGER;
  v_subscription_count INTEGER;
  v_exchange_account_count INTEGER;
BEGIN
  -- 统计关注数量
  SELECT COUNT(*) INTO v_follow_count
  FROM user_follows
  WHERE user_id = p_user_id;

  -- 统计订阅数量
  SELECT COUNT(*) INTO v_subscription_count
  FROM user_subscriptions
  WHERE user_id = p_user_id;

  -- 统计交易所账户数量
  SELECT COUNT(*) INTO v_exchange_account_count
  FROM exchange_accounts
  WHERE user_id = p_user_id;

  -- 返回 JSON 格式的统计数据
  RETURN json_build_object(
    'followCount', v_follow_count,
    'subscriptionCount', v_subscription_count,
    'exchangeAccountCount', v_exchange_account_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**优势：**
- ✅ 单次 RPC 调用获取所有统计（而非 3 次 HTTP 请求）
- ✅ 性能优化，减少网络开销
- ✅ 数据一致性更好

### 2. TraderCard 组件改造

**文件：** `components/TraderCard.tsx`

**核心改动：**

#### 2.1 添加新的 Props

```typescript
export const TraderCard = ({ 
  traderId,                    // ✅ 新增：交易员ID
  name, 
  avatar, 
  // ...其他属性
  initialIsSubscribed = false,  // ✅ 新增：初始订阅状态
  initialIsFavorite = false,    // ✅ 新增：初始关注状态
  onSubscriptionChange,         // ✅ 新增：订阅变化回调
  onFavoriteChange,             // ✅ 新增：关注变化回调
  onPress
}: {
  traderId: string,
  // ...
  initialIsSubscribed?: boolean,
  initialIsFavorite?: boolean,
  onSubscriptionChange?: () => void,
  onFavoriteChange?: () => void,
  // ...
})
```

#### 2.2 实现真实的订阅/关注逻辑

```typescript
// 处理订阅/取消订阅
const handleSubscriptionToggle = async () => {
  if (!user?.id) {
    console.log('请先登录');
    return;
  }

  if (loading) return;

  try {
    setLoading(true);
    
    if (isSubscribed) {
      const result = await unsubscribeTrader(user.id, traderId);
      if (result.success) {
        setIsSubscribed(false);
        onSubscriptionChange?.();  // 🔄 触发回调
      }
    } else {
      const result = await subscribeTrader(user.id, traderId);
      if (result.success) {
        setIsSubscribed(true);
        onSubscriptionChange?.();  // 🔄 触发回调
      }
    }
  } catch (error) {
    console.error('订阅操作失败:', error);
  } finally {
    setLoading(false);
  }
};
```

#### 2.3 按钮添加加载状态

```tsx
<TouchableOpacity 
  style={[styles.cardCopyBtn, ...]}
  onPress={handleSubscriptionToggle}
  disabled={loading}  // ✅ 防止重复点击
>
  <Text style={styles.cardCopyBtnText}>
    {loading ? '...' : (isSubscribed ? '已订阅' : '订阅')}
  </Text>
</TouchableOpacity>
```

### 3. Traders 页面改造

**文件：** `app/(tabs)/index.tsx`

**核心改动：**

#### 3.1 添加订阅/关注状态管理

```typescript
const CopyTabContent = ({ activeFilters, setActiveFilters }) => {
  const { user } = useAuth();
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ 新增：跟踪用户已订阅和已关注的交易员
  const [subscribedTraders, setSubscribedTraders] = useState<Set<string>>(new Set());
  const [followedTraders, setFollowedTraders] = useState<Set<string>>(new Set());
  
  // ...
}
```

#### 3.2 加载时获取用户订阅/关注状态

```typescript
const loadTraders = async () => {
  try {
    setLoading(true);
    const data = await getTraders();
    setTraders(data);

    // ✅ 如果用户已登录，获取订阅和关注状态
    if (user?.id) {
      const [subscribed, followed] = await Promise.all([
        getSubscribedTraders(user.id),
        getFollowedTraders(user.id)
      ]);
      
      setSubscribedTraders(new Set(subscribed.map(item => item.trader_id)));
      setFollowedTraders(new Set(followed.map(item => item.trader_id)));
    }
  } catch (error) {
    console.error('加载交易员数据失败:', error);
  } finally {
    setLoading(false);
  }
};
```

#### 3.3 实现回调函数刷新状态

```typescript
// ✅ 当用户订阅/取消订阅后刷新状态
const handleSubscriptionChange = async () => {
  if (!user?.id) return;
  
  try {
    const subscribed = await getSubscribedTraders(user.id);
    setSubscribedTraders(new Set(subscribed.map(item => item.trader_id)));
  } catch (error) {
    console.error('刷新订阅状态失败:', error);
  }
};

// ✅ 当用户关注/取消关注后刷新状态
const handleFavoriteChange = async () => {
  if (!user?.id) return;
  
  try {
    const followed = await getFollowedTraders(user.id);
    setFollowedTraders(new Set(followed.map(item => item.trader_id)));
  } catch (error) {
    console.error('刷新关注状态失败:', error);
  }
};
```

#### 3.4 传递正确的参数给 TraderCard

```tsx
{traders.map((trader) => (
  <TraderCard 
    key={trader.id}
    traderId={trader.id}  // ✅ 传递交易员ID
    name={trader.name}
    avatar={trader.avatar_url}
    initialIsSubscribed={subscribedTraders.has(trader.id)}  // ✅ 初始订阅状态
    initialIsFavorite={followedTraders.has(trader.id)}      // ✅ 初始关注状态
    onSubscriptionChange={handleSubscriptionChange}         // ✅ 订阅变化回调
    onFavoriteChange={handleFavoriteChange}                 // ✅ 关注变化回调
    // ...其他属性
  />
))}
```

### 4. "我的"页面自动更新

**文件：** `app/(tabs)/my.tsx`

**已实现机制：**

```typescript
// ✅ 使用 useFocusEffect 自动刷新
useFocusEffect(
  React.useCallback(() => {
    const loadStats = async () => {
      if (!user?.id) return;
      
      try {
        // 从数据库函数获取最新统计数据
        const stats = await getUserStats(user.id);
        setFollowCount(stats.followCount);
        setSubscriptionCount(stats.subscriptionCount);
        setExchangeAccountCount(stats.exchangeAccountCount);
      } catch (error) {
        console.error('刷新用户统计数据失败:', error);
      }
    };

    loadStats();
  }, [user?.id])
);
```

**工作原理：**
- 当用户从 Traders 页面切换到"我的"页面时
- `useFocusEffect` 会自动触发
- 调用 `getUserStats` 从数据库获取最新的统计数据
- 自动更新页面显示

## 🔄 数据流程图

```
用户点击订阅按钮
    ↓
TraderCard.handleSubscriptionToggle()
    ↓
调用 subscribeTrader(userId, traderId)
    ↓
写入 user_subscriptions 表
    ↓
操作成功后调用 onSubscriptionChange()
    ↓
CopyTabContent.handleSubscriptionChange()
    ↓
重新获取 getSubscribedTraders(userId)
    ↓
更新 subscribedTraders 状态
    ↓
TraderCard 显示"已订阅"
    ↓
用户切换到"我的"页面
    ↓
useFocusEffect 触发
    ↓
调用 getUserStats(userId) 数据库函数
    ↓
返回最新的 subscriptionCount
    ↓
"我的"页面显示更新后的订阅数量
```

## ✅ 测试场景

### 场景1：订阅操作
1. 进入 Traders 页面
2. 点击某个交易员的"订阅"按钮
3. 按钮变为"已订阅"
4. 切换到"我的"页面
5. ✅ 验证："订阅"数量 +1

### 场景2：取消订阅
1. 点击"已订阅"按钮
2. 按钮变回"订阅"
3. 切换到"我的"页面
4. ✅ 验证："订阅"数量 -1

### 场景3：关注操作
1. 点击星标图标（空心）
2. 图标变为实心星标（黄色）
3. 切换到"我的"页面
4. ✅ 验证："关注"数量 +1

### 场景4：多次操作
1. 订阅交易员 A
2. 关注交易员 B
3. 取消订阅交易员 A
4. 切换到"我的"页面
5. ✅ 验证：统计数据正确反映所有操作

## 📊 性能优化

### 1. 使用 Set 数据结构
```typescript
// ✅ 使用 Set 而非 Array，O(1) 查找时间
const [subscribedTraders, setSubscribedTraders] = useState<Set<string>>(new Set());

// 检查是否已订阅
subscribedTraders.has(trader.id)  // O(1) 时间复杂度
```

### 2. 并行请求
```typescript
// ✅ 并行获取订阅和关注数据
const [subscribed, followed] = await Promise.all([
  getSubscribedTraders(user.id),
  getFollowedTraders(user.id)
]);
```

### 3. 防抖和加载状态
```typescript
// ✅ 防止重复点击
const [loading, setLoading] = useState(false);

if (loading) return;  // 防止操作进行中再次点击
```

## 🔒 安全性

### 1. RLS (Row Level Security)
确保 Supabase 表有正确的 RLS 策略：

```sql
-- user_follows 表
CREATE POLICY "Users can view their own follows"
  ON user_follows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own follows"
  ON user_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- user_subscriptions 表
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 2. 用户验证
```typescript
// ✅ 每次操作前验证用户登录状态
if (!user?.id) {
  console.log('请先登录');
  return;
}
```

## 🐛 错误处理

### 1. 网络错误
```typescript
try {
  const result = await subscribeTrader(user.id, traderId);
  // ...
} catch (error) {
  console.error('订阅操作失败:', error);
  // 可以添加 Toast 提示用户
} finally {
  setLoading(false);  // 确保加载状态被重置
}
```

### 2. 数据库函数返回格式
```typescript
// userTraderService.ts 中已处理
return {
  followCount: data?.followCount || 0,
  subscriptionCount: data?.subscriptionCount || 0,
  exchangeAccountCount: data?.exchangeAccountCount || 0,
};
```

## 📝 总结

### 已完成的功能
✅ TraderCard 组件支持真实的订阅/关注操作  
✅ Traders 页面实时显示用户的订阅/关注状态  
✅ "我的"页面自动更新统计数据  
✅ 使用数据库函数优化性能  
✅ 防止重复操作和加载状态显示  

### 技术亮点
- 🚀 使用 Supabase RPC 函数减少网络请求
- 🔄 React hooks 实现状态管理
- ⚡ Set 数据结构优化查找性能
- 🎯 useFocusEffect 自动刷新数据
- 🛡️ 完善的错误处理和用户验证

### 后续可优化方向
1. 添加 Toast 提示组件显示操作结果
2. 实现乐观更新（先更新UI，后同步数据库）
3. 添加订阅/关注动画效果
4. 实现下拉刷新功能
