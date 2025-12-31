# 交易员详情页返回标签修复

## 问题描述
从交易员详情页点击返回按钮回到交易员列表时，默认切换到了 Overview 标签，而不是保持在 Traders 标签。

## 解决方案

### 1. 路由参数传递机制
实现了一个 `returnTab` 参数传递机制，用于在详情页返回时恢复原来的标签状态。

### 2. 修改内容

#### 首页 (`app/(tabs)/index.tsx`)

**添加返回标签恢复逻辑：**
```typescript
// 处理从详情页返回时恢复标签状态
React.useEffect(() => {
  if (params.returnTab) {
    const returnTab = params.returnTab as 'overview' | 'copy' | 'signal';
    if (returnTab !== activeTab) {
      handleTabPress(returnTab);
    }
  } else if (params.tab === 'copy') {
    handleTabPress('copy');
    if (params.filter) {
      setActiveFilters([params.filter as string]);
    }
  }
}, [params.returnTab, params.tab, params.filter]);
```

**更新 Props 接口：**
```typescript
interface CopyTabContentProps {
  activeFilters: string[];
  setActiveFilters: (filters: string[]) => void;
  refreshTrigger?: number;
  currentTab?: 'overview' | 'copy' | 'signal'; // 新增：当前激活的标签
}
```

**传递当前标签到子组件：**
- `CopyTabContent` 接收 `currentTab` 参数（默认为 'copy'）
- `SignalTabContent` 接收 `currentTab` 参数（默认为 'signal'）

**跳转时携带 returnTab 参数：**
```typescript
// 从交易员列表跳转
onPress={() => router.push({
  pathname: '/trader/detail',
  params: { 
    traderId: trader.id,
    returnTab: currentTab
  }
})}

// 从信号卡片跳转
onPress={() => router.push({
  pathname: '/trader/detail',
  params: { 
    traderId: signal.trader_id,
    returnTab: currentTab
  }
})}
```

#### 详情页 (`app/trader/detail.tsx`)

**接收 returnTab 参数：**
```typescript
const params = useLocalSearchParams();
const traderId = params.traderId as string;
const returnTab = params.returnTab as string | undefined;
```

**返回按钮逻辑：**
```typescript
onPress={() => {
  if (returnTab) {
    // 如果有returnTab参数，返回首页并切换到对应标签
    router.push({
      pathname: '/(tabs)',
      params: { returnTab }
    });
  } else {
    // 否则使用默认返回
    router.back();
  }
}}
```

### 3. 工作流程

1. **用户在 Traders 标签查看交易员列表**
   - `currentTab` = 'copy'

2. **点击某个交易员卡片**
   - 跳转到详情页，携带参数：`{ traderId: 'xxx', returnTab: 'copy' }`

3. **在详情页点击返回按钮**
   - 检测到 `returnTab` 参数存在
   - 返回首页并传递 `returnTab: 'copy'`

4. **首页接收到 returnTab 参数**
   - 通过 `useEffect` 检测到 `params.returnTab`
   - 调用 `handleTabPress('copy')` 切换到 Traders 标签
   - 用户回到了之前查看的标签

### 4. 优势

- **状态保持**：用户返回后仍在之前的标签，体验更流畅
- **灵活性**：支持从任何标签跳转和返回
- **兼容性**：如果没有 `returnTab` 参数，使用默认的 `router.back()` 保持向后兼容

### 5. 标签映射

- `'overview'` → Overview 标签
- `'signal'` → Signals 标签
- `'copy'` → Traders 标签

## 测试建议

1. 从 Traders 标签进入详情页，点击返回应回到 Traders
2. 从 Signals 标签进入详情页，点击返回应回到 Signals
3. 从 Overview 标签进入详情页（如果有），点击返回应回到 Overview
4. 使用系统返回手势也应正确切换标签
