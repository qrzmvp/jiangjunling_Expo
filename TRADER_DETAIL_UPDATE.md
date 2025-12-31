# 交易员详情页更新说明

## 更新时间
2026年1月1日

## 更新内容

### 1. 去掉"合约"和"模拟"标签
- 移除了交易员名称旁边的"合约"和"模拟"标签
- 简化了界面展示，让信息更加清晰

### 2. 使用真实数据源
交易员详情页现在使用与列表页相同的数据源和交互操作：

#### 数据来源
- **头像**: 从 `trader.avatar_url` 获取（来自数据库）
- **名称**: 从 `trader.name` 获取（来自数据库）
- **描述**: 从 `trader.bio` 获取（来自数据库）
- **订阅状态**: 通过查询 `user_trader_subscriptions` 表获取
- **关注状态**: 通过查询 `user_trader_follows` 表获取

#### 交互操作
- **关注/取消关注**: 使用 `followTrader()` 和 `unfollowTrader()` 函数
- **订阅/取消订阅**: 使用 `subscribeTrader()` 和 `unsubscribeTrader()` 函数
- 这些函数与列表页 `TraderCard` 组件使用的完全相同

### 3. 路由参数传递
更新了导航逻辑，确保从列表跳转到详情页时正确传递 `traderId`：

```typescript
// 交易员列表跳转
router.push({
  pathname: '/trader/detail',
  params: { traderId: trader.id }
})

// 信号卡片跳转
router.push({
  pathname: '/trader/detail',
  params: { traderId: signal.trader_id }
})
```

### 4. 状态管理
- 添加了 `loading` 状态，显示加载指示器
- 添加了 `actionLoading` 状态，防止重复点击
- 在组件加载时自动获取交易员数据和用户的订阅/关注状态

### 5. 用户体验改进
- 显示加载状态，避免空白页面
- 如果未找到交易员，显示友好提示
- 操作按钮在加载时显示"..."，防止重复提交
- 操作成功后立即更新UI状态

## 技术实现

### 新增导入
```typescript
import { useAuth } from '../../contexts/AuthContext';
import { subscribeTrader, unsubscribeTrader, followTrader, unfollowTrader } from '../../lib/userTraderService';
import { getTraders } from '../../lib/traderService';
import type { Trader } from '../../types';
```

### 状态定义
```typescript
const [trader, setTrader] = useState<Trader | null>(null);
const [loading, setLoading] = useState(true);
const [actionLoading, setActionLoading] = useState(false);
const [isSubscribed, setIsSubscribed] = useState(false);
const [isFavorite, setIsFavorite] = useState(false);
```

### 数据加载流程
1. 从路由参数获取 `traderId`
2. 调用 `getTraders()` 获取所有交易员
3. 查找对应的交易员数据
4. 如果用户已登录，检查订阅和关注状态
5. 更新组件状态

## 文件修改列表

1. `/app/trader/detail.tsx`
   - 添加数据加载逻辑
   - 集成订阅/关注功能
   - 移除硬编码的标签

2. `/app/(tabs)/index.tsx`
   - 更新路由跳转，传递 `traderId` 参数

## 注意事项

- 确保用户已登录才能执行订阅/关注操作
- 订阅和关注状态的更改会实时反映在UI上
- 所有操作都有错误处理，避免应用崩溃
- 使用相同的服务函数确保数据一致性

## 后续优化建议

1. 可以考虑将交易员的统计数据（如ROI、胜率等）也从数据库获取
2. 添加缓存机制，避免重复请求相同的交易员数据
3. 考虑添加下拉刷新功能
4. 可以添加骨架屏提升加载体验
