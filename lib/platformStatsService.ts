import { supabase } from './supabase';

export interface PlatformStats {
  todaySignalCount: number;
  longSignalCount: number;
  shortSignalCount: number;
  activeTraderCount: number;
  tradingPairCount: number;
}

/**
 * 获取平台统计数据
 * 通过单个RPC调用获取所有平台级别的统计信息
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const { data, error } = await supabase.rpc('get_platform_stats');

    if (error) {
      console.error('获取平台统计数据失败:', error);
      throw error;
    }

    // RPC函数返回的是JSON对象，直接使用data
    const stats = data as any;

    return {
      todaySignalCount: stats?.today_signal_count || 0,
      longSignalCount: stats?.long_signal_count || 0,
      shortSignalCount: stats?.short_signal_count || 0,
      activeTraderCount: stats?.active_trader_count || 0,
      tradingPairCount: stats?.trading_pair_count || 0,
    };
  } catch (error) {
    console.error('获取平台统计数据异常:', error);
    return {
      todaySignalCount: 0,
      longSignalCount: 0,
      shortSignalCount: 0,
      activeTraderCount: 0,
      tradingPairCount: 0,
    };
  }
}
