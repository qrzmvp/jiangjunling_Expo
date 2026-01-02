# 交易员搜索功能说明

## 功能概述

实现了完整的交易员搜索功能，支持：
- ✅ 模糊搜索交易员名称和描述
- ✅ 展示搜索历史记录
- ✅ 使用真实数据库数据
- ✅ 搜索防抖优化
- ✅ 自动保存搜索历史

## 文件修改

### 1. 新增文件

#### `/lib/searchHistoryService.ts`
搜索历史管理服务，提供以下功能：
- `getSearchHistory()` - 获取搜索历史
- `addSearchHistory(keyword)` - 添加搜索关键词
- `clearSearchHistory()` - 清空搜索历史
- `removeSearchHistoryItem(keyword)` - 删除指定历史项

使用 AsyncStorage 持久化存储，最多保存 10 条历史记录。

### 2. 更新文件

#### `/lib/traderService.ts`
新增 `searchTraders()` 函数：
```typescript
export async function searchTraders(
  query: string,
  userId?: string,
  limit: number = 20
): Promise<TraderWithStats[]>
```

特性：
- 使用 PostgreSQL `ilike` 进行不区分大小写的模糊搜索
- 同时搜索交易员名称和描述字段
- 返回完整的交易员统计数据
- 包含用户的订阅/关注状态
- 按粉丝数降序排序

#### `/app/search.tsx`
完全重构搜索页面：
- 移除所有模拟数据
- 集成真实数据库查询
- 添加搜索防抖（500ms）
- 添加加载状态显示
- 集成搜索历史功能
- 优化空状态展示

## 使用方法

### 搜索交易员
1. 打开搜索页面
2. 输入交易员名称或描述关键词
3. 系统自动进行模糊搜索（500ms 防抖）
4. 点击搜索结果跳转到交易员详情页

### 搜索历史
1. 未输入搜索词时，展示搜索历史
2. 点击历史记录快速填充搜索框
3. 点击删除图标清空所有历史
4. 搜索后自动保存到历史（最多 10 条）

## 技术实现

### 数据库查询
```typescript
// 模糊搜索示例
supabase
  .from('traders')
  .select('*')
  .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
  .order('followers_count', { ascending: false })
  .limit(20)
```

### 性能优化
- ⚡ 搜索防抖：避免频繁查询
- ⚡ 限制结果：默认最多返回 20 条
- ⚡ 本地缓存：搜索历史存储在本地

### 用户体验
- 🎯 自动聚焦搜索框
- 🔄 实时搜索反馈
- 💾 持久化搜索历史
- 🎨 优雅的加载和空状态

## 数据流程

```
用户输入 → 防抖处理(500ms) → 数据库查询 
    ↓
返回结果 → 展示列表 → 点击跳转详情
    ↓
保存历史 → AsyncStorage持久化
```

## 注意事项

1. **真实数据**：所有搜索结果来自 Supabase 数据库，无模拟数据
2. **模糊匹配**：使用 PostgreSQL 的 `ilike` 操作符，支持部分匹配
3. **历史管理**：自动去重，最新的显示在前，最多保存 10 条
4. **订阅状态**：需要用户登录才能显示订阅/关注状态
5. **防抖机制**：输入停止 500ms 后才执行搜索，减少服务器压力

## 后续优化建议

- [ ] 添加热门搜索推荐
- [ ] 支持搜索过滤器（按胜率、粉丝数等）
- [ ] 添加搜索结果排序选项
- [ ] 实现搜索结果分页加载
- [ ] 添加搜索统计和分析
