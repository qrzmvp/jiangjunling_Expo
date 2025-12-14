// 标签类型定义
export type TabType = 'home' | 'trade' | 'my';

// 资产信息类型
export interface AssetInfo {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
}

// 用户信息类型
export interface UserInfo {
  username: string;
  accountId: string;
  avatar?: string;
  verified?: boolean;
}

// 统计数据类型
export interface Stats {
  subscriptions: number;
  following: number;
  friends: number;
  favorites: number;
}

// 菜单项类型
export interface MenuItem {
  icon: string;
  label: string;
  onPress?: () => void;
  badge?: number;
}
