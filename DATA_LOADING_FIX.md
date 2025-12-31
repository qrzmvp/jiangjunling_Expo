# 数据加载问题修复

## 问题描述
登录成功后切换到"信号列表"和"我的"页面时不会加载数据，需要杀掉进程重新进入才会加载数据，导致用户体验很差。

## 问题原因分析

### 1. Tab页面缓存机制
使用 `expo-router` 的 Tabs 布局时，所有Tab页面会被缓存，切换Tab时不会重新挂载组件，因此不会触发初始的 `useEffect`。

### 2. 首页内部Tab切换
首页（`app/(tabs)/index.tsx`）包含三个内部Tab：
- Overview（概览）
- Signals（信号列表）
- Traders（交易员）

这些Tab通过水平滚动视图实现，所有内容同时挂载，只是通过滚动来切换显示，因此：
- 普通的 `useEffect` 只在首次挂载时执行一次
- `useFocusEffect` 只在整个首页获得焦点时触发，不会在内部Tab切换时触发

### 3. 登录后的时序问题
在 `AuthContext` 中，登录成功后会有500ms的延迟来加载用户profile，可能导致页面在user已设置但profile未加载时就尝试获取数据。

## 解决方案

### 1. 添加 `useFocusEffect` Hook
在信号列表组件中添加了 `@react-navigation/native` 的 `useFocusEffect`，确保每次主Tab切换回首页时都会刷新数据。

**修改文件**: `app/(tabs)/index.tsx`

```tsx
import { useFocusEffect } from '@react-navigation/native';

// 在 SignalTabContent 组件中
useFocusEffect(
  React.useCallback(() => {
    // 只在用户已登录时刷新
    if (user?.id) {
      loadSignals(true);
    }
  }, [user?.id])
);
```

### 2. 添加内部Tab切换刷新机制
为了解决内部Tab切换时不刷新的问题，添加了一个 `refreshTrigger` 状态：

```tsx
// 在 HomePage 组件中
const [refreshSignalTab, setRefreshSignalTab] = React.useState(0);

const handleTabPress = (tab: 'overview' | 'copy' | 'signal') => {
  setActiveTab(tab);
  
  // 当切换到信号Tab时，触发刷新
  if (tab === 'signal') {
    setRefreshSignalTab(prev => prev + 1);
  }
  // ... 其他代码
};

// 在 SignalTabContent 组件中
useEffect(() => {
  if (refreshTrigger && refreshTrigger > 0) {
    loadSignals(true);
  }
}, [refreshTrigger]);
```

### 3. "我的"页面已有的刷新机制
"我的"页面（`app/(tabs)/my.tsx`）已经正确实现了 `useFocusEffect`，会在每次获得焦点时刷新用户统计数据：

```tsx
useFocusEffect(
  React.useCallback(() => {
    const loadStats = async () => {
      if (!user?.id) return;
      
      try {
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

## 修改的文件

1. **app/(tabs)/index.tsx**
   - 添加 `useFocusEffect` 导入
   - 添加 `refreshSignalTab` 状态
   - 在 `SignalTabContent` 中添加三个数据刷新触发点：
     - 筛选条件改变时（原有）
     - 内部Tab切换到信号Tab时（新增）
     - 主Tab切换回首页时（新增）
   - 修改 `handleTabPress` 在切换到信号Tab时触发刷新
   - 更新 `CopyTabContentProps` 接口添加 `refreshTrigger` 参数

2. **app/(tabs)/my.tsx**
   - 已有正确的 `useFocusEffect` 实现，无需修改

## 测试建议

### 1. 登录后首次进入测试
1. 启动应用并登录
2. 观察首页是否正常显示数据
3. 切换到"信号"Tab，确认数据正常加载
4. 切换到"我的"页面，确认统计数据正常显示

### 2. Tab切换测试
1. 在首页的三个内部Tab（Overview、Signals、Traders）之间切换
2. 确认切换到Signals时会刷新数据
3. 切换到其他主Tab（交易、我的），然后返回首页
4. 确认返回首页时Signals数据会刷新

### 3. 数据实时性测试
1. 在"我的"页面查看统计数据
2. 切换到其他页面进行操作（如关注交易员）
3. 返回"我的"页面
4. 确认统计数据已更新

### 4. 登录状态测试
1. 登录后立即切换Tab
2. 确认所有页面都能正确加载数据
3. 确认不会出现"未登录"或"数据为空"的情况

## 技术要点

### useFocusEffect vs useEffect
- **useEffect**: 只在组件挂载时执行，适用于初始化
- **useFocusEffect**: 每次页面获得焦点时执行，适用于需要刷新的数据

### React Navigation的焦点机制
`useFocusEffect` 来自 `@react-navigation/native`，会在以下情况触发：
- 页面首次渲染
- 从其他页面返回到当前页面
- Tab切换回当前Tab

### 内部Tab切换
对于不使用 React Navigation 的自定义Tab（如水平滚动视图），需要手动管理刷新逻辑。

## 后续优化建议

1. **添加加载状态指示器**: 在数据刷新时显示加载动画
2. **防抖处理**: 避免频繁切换Tab导致的多次请求
3. **错误处理**: 添加网络错误时的重试机制
4. **缓存策略**: 考虑添加短时间缓存，减少不必要的网络请求
5. **性能优化**: 监控数据加载时间，优化慢查询

## 注意事项

1. `useFocusEffect` 的依赖数组应该只包含必要的依赖，避免不必要的重复刷新
2. 在刷新数据前应检查用户登录状态（`user?.id`）
3. 内部Tab切换的刷新触发器使用递增数字，而不是布尔值，确保每次切换都能触发
