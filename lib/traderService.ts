import { supabase } from './supabase';

export interface Trader {
  id: string;
  name: string;
  avatar_url: string;
  description?: string;
  is_online_today?: boolean;
  is_online?: boolean;
  signal_count?: number;
  followers_count?: number;
  win_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface TraderWithStats extends Trader {
  total_signals?: number;
  active_signals?: number;
  closed_signals?: number;
  long_signals?: number;
  short_signals?: number;
  is_subscribed?: boolean;
  is_followed?: boolean;
}

export interface TraderDetail extends Trader {
  total_signals?: number;
  active_signals?: number;
  closed_signals?: number;
  cancelled_signals?: number;
  long_signals?: number;
  short_signals?: number;
  spot_signals?: number;
  futures_signals?: number;
  margin_signals?: number;
  is_subscribed?: boolean;
  is_followed?: boolean;
}

export interface TraderWithUserStatus extends Trader {
  isSubscribed?: boolean;
  isFollowed?: boolean;
}

/**
 * 获取交易员列表及统计数据（使用RPC函数）
 * @param userId 用户ID（可选）
 * @param limit 限制返回数量
 * @param offset 偏移量（用于分页）
 */
export async function getTradersWithStats(
  userId?: string,
  limit: number = 20,
  offset: number = 0
): Promise<TraderWithStats[]> {
  try {
    console.log('🔵 [TraderService] 调用 RPC: get_traders_with_stats', { userId, limit, offset });
    
    const { data, error } = await supabase.rpc('get_traders_with_stats', {
      p_user_id: userId || null,
      p_limit: limit,
      p_offset: offset
    });
    
    if (error) {
      console.error('❌ [TraderService] 获取交易员列表失败:', error);
      throw error;
    }

    console.log('✅ [TraderService] 成功获取', data?.length || 0, '条交易员数据');
    return data || [];
  } catch (error) {
    console.error('❌ [TraderService] 获取交易员列表异常:', error);
    throw error;
  }
}

/**
 * 【优化 v2】一次性获取交易员列表及用户的订阅/关注状态
 * 性能提升：使用数据库函数，从 3 个请求减少为 1 个 RPC 调用
 * @param userId 用户ID（可选）
 * @param limit 限制返回数量（默认20，用于分页）
 */
export async function getTradersWithUserStatus(
  userId?: string,
  limit: number = 20
): Promise<TraderWithUserStatus[]> {
  try {
    console.log('🔵 [TraderService] 正在获取交易员列表（RPC函数），limit:', limit, 'userId:', userId);
    
    // 使用数据库 RPC 函数，一次性获取所有数据
    const { data, error } = await supabase.rpc('get_traders_with_user_status', {
      p_user_id: userId || null,
      p_limit: limit
    });
    
    if (error) {
      console.error('获取交易员列表失败:', error);
      throw error;
    }

    // 映射数据库字段（下划线命名）到前端字段（驼峰命名）
    const mappedData = (data || []).map((trader: any) => ({
      id: trader.id,
      name: trader.name,
      avatar_url: trader.avatar_url,
      description: trader.description,
      created_at: trader.created_at,
      updated_at: trader.updated_at,
      isSubscribed: trader.is_subscribed,  // 下划线 -> 驼峰
      isFollowed: trader.is_followed        // 下划线 -> 驼峰
    }));
    
    console.log('✅ [TraderService] 成功获取', mappedData?.length || 0, '条交易员数据');
    console.log('📊 [TraderService] 第一条数据状态:', {
      name: mappedData[0]?.name,
      isSubscribed: mappedData[0]?.isSubscribed,
      isFollowed: mappedData[0]?.isFollowed
    });

    return mappedData;
  } catch (error) {
    console.error('获取交易员列表及状态异常:', error);
    throw error;
  }
}

/**
 * 根据ID获取单个交易员信息
 */
export async function getTraderById(traderId: string): Promise<Trader | null> {
  try {
    const { data, error } = await supabase
      .from('traders')
      .select('*')
      .eq('id', traderId)
      .single();

    if (error) {
      console.error('获取交易员详情失败:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('获取交易员详情异常:', error);
    throw error;
  }
}

/**
 * 【优化 v2】获取单个交易员信息及用户的订阅/关注状态
 * 性能提升：使用数据库函数，从 3 个请求减少为 1 个 RPC 调用
 */
export async function getTraderByIdWithUserStatus(
  traderId: string, 
  userId?: string
): Promise<TraderWithUserStatus | null> {
  try {
    console.log('🔵 [TraderService] 正在获取交易员详情（RPC函数），traderId:', traderId, 'userId:', userId);
    
    // 使用数据库 RPC 函数，一次性获取所有数据
    const { data, error } = await supabase.rpc('get_trader_by_id_with_user_status', {
      p_trader_id: traderId,
      p_user_id: userId || null
    });

    if (error) {
      console.error('获取交易员详情失败:', error);
      throw error;
    }

    // RPC 返回数组，取第一个元素
    const rawTrader = data && data.length > 0 ? data[0] : null;
    
    if (!rawTrader) {
      console.log('⚠️ [TraderService] 未找到交易员详情');
      return null;
    }

    // 映射数据库字段（下划线命名）到前端字段（驼峰命名）
    const trader: TraderWithUserStatus = {
      id: rawTrader.id,
      name: rawTrader.name,
      avatar_url: rawTrader.avatar_url,
      description: rawTrader.description,
      created_at: rawTrader.created_at,
      updated_at: rawTrader.updated_at,
      isSubscribed: rawTrader.is_subscribed,  // 下划线 -> 驼峰
      isFollowed: rawTrader.is_followed        // 下划线 -> 驼峰
    };
    
    console.log('✅ [TraderService] 成功获取交易员详情:', trader.name);
    console.log('📊 [TraderService] 订阅/关注状态:', {
      isSubscribed: trader.isSubscribed,
      isFollowed: trader.isFollowed
    });

    return trader;
  } catch (error) {
    console.error('获取交易员详情及状态异常:', error);
    throw error;
  }
}

/**
 * 获取交易员详细信息（使用RPC函数）
 * @param traderId 交易员ID
 * @param userId 用户ID（可选，用于获取订阅/关注状态）
 * @returns 交易员详细信息，包含完整统计数据
 */
export async function getTraderDetail(
  traderId: string,
  userId?: string
): Promise<TraderDetail | null> {
  try {
    console.log('🔵 [TraderService] 调用 RPC: get_trader_detail', { traderId, userId });
    
    const { data, error } = await supabase.rpc('get_trader_detail', {
      p_trader_id: traderId,
      p_user_id: userId || null
    });
    
    if (error) {
      console.error('❌ [TraderService] 获取交易员详情失败:', error);
      throw error;
    }

    console.log('✅ [TraderService] 成功获取交易员详情:', data);
    // RPC 函数返回数组，取第一个元素
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('❌ [TraderService] 获取交易员详情异常:', error);
    throw error;
  }
}

/**
 * 获取交易员的信号列表（使用RPC函数）
 * @param traderId 交易员ID
 * @param status 信号状态（可选）
 * @param limit 限制返回数量
 * @param offset 偏移量
 */
export async function getTraderSignals(
  traderId: string,
  status?: 'active' | 'closed' | 'cancelled',
  limit: number = 20,
  offset: number = 0
) {
  try {
    console.log('🔵 [TraderService] 调用 RPC: get_trader_signals', { traderId, status, limit, offset });
    
    const { data, error } = await supabase.rpc('get_trader_signals', {
      p_trader_id: traderId,
      p_status: status || null,
      p_limit: limit,
      p_offset: offset
    });
    
    if (error) {
      console.error('❌ [TraderService] 获取交易员信号失败:', error);
      throw error;
    }

    console.log('✅ [TraderService] 成功获取', data?.length || 0, '条信号数据');
    return data || [];
  } catch (error) {
    console.error('❌ [TraderService] 获取交易员信号异常:', error);
    throw error;
  }
}

/**
 * 获取交易员信号趋势数据（按天统计）
 * @param traderId 交易员ID
 * @param days 天数（7, 30, 90）
 * @returns 每天的信号数量统计
 */
export async function getTraderSignalTrend(
  traderId: string,
  days: number = 7
): Promise<Array<{ date: string; signal_count: number }>> {
  try {
    console.log('🔵 [TraderService] 调用 RPC: get_trader_signal_trend', { traderId, days });
    
    const { data, error } = await supabase.rpc('get_trader_signal_trend', {
      p_trader_id: traderId,
      p_days: days
    });
    
    if (error) {
      console.error('❌ [TraderService] 获取信号趋势失败:', error);
      throw error;
    }

    console.log('✅ [TraderService] 成功获取', data?.length || 0, '天的信号趋势数据');
    return data || [];
  } catch (error) {
    console.error('❌ [TraderService] 获取信号趋势异常:', error);
    throw error;
  }
}

/**
 * 批量获取多个交易员的信号趋势数据（性能优化版本）
 * @param traderIds 交易员ID数组
 * @param days 天数（7, 30, 90）
 * @returns Map<traderId, 每天的信号数量统计>
 */
export async function getMultipleTradersSignalTrend(
  traderIds: string[],
  days: number = 7
): Promise<Map<string, Array<{ date: string; signal_count: number }>>> {
  try {
    if (traderIds.length === 0) {
      return new Map();
    }

    console.log('🔵 [TraderService] 批量调用 RPC: get_multiple_traders_signal_trend', { 
      count: traderIds.length, 
      days 
    });
    
    const { data, error } = await supabase.rpc('get_multiple_traders_signal_trend', {
      p_trader_ids: traderIds,
      p_days: days
    });
    
    if (error) {
      console.error('❌ [TraderService] 批量获取信号趋势失败:', error);
      throw error;
    }

    // 将数据按 trader_id 分组
    const trendMap = new Map<string, Array<{ date: string; signal_count: number }>>();
    
    if (data) {
      data.forEach((row: { trader_id: string; date: string; signal_count: number }) => {
        if (!trendMap.has(row.trader_id)) {
          trendMap.set(row.trader_id, []);
        }
        trendMap.get(row.trader_id)!.push({
          date: row.date,
          signal_count: row.signal_count
        });
      });
    }

    console.log('✅ [TraderService] 成功获取', trendMap.size, '个交易员的趋势数据');
    return trendMap;
  } catch (error) {
    console.error('❌ [TraderService] 批量获取信号趋势异常:', error);
    throw error;
  }
}

/**
 * 【优化版】搜索交易员（支持模糊搜索名称和描述）
 * 性能提升：使用数据库 RPC 函数，从 3-4 个查询优化为 1 个 RPC 调用
 * @param query 搜索关键词
 * @param userId 用户ID（可选，用于获取订阅/关注状态）
 * @param limit 限制返回数量
 */
export async function searchTraders(
  query: string,
  userId?: string,
  limit: number = 20
): Promise<TraderWithStats[]> {
  try {
    if (!query || query.trim() === '') {
      console.log('🔍 [TraderService] 搜索关键词为空');
      return [];
    }

    const trimmedQuery = query.trim();
    console.log('🔍 [TraderService] 搜索交易员 (RPC):', trimmedQuery, 'userId:', userId);

    // 使用优化的数据库 RPC 函数，一次性获取所有数据
    const { data, error } = await supabase.rpc('search_traders_with_stats', {
      p_query: trimmedQuery,
      p_user_id: userId || null,
      p_limit: limit
    });

    if (error) {
      console.error('❌ [TraderService] 搜索交易员失败:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('🔍 [TraderService] 未找到匹配的交易员');
      return [];
    }

    console.log('✅ [TraderService] 搜索完成，返回', data.length, '条结果');
    return data || [];
  } catch (error) {
    console.error('❌ [TraderService] 搜索交易员异常:', error);
    throw error;
  }
}

/**
 * 获取排行榜前5名交易员
 * 按信号总数排序，相同则按创建时间排序
 */
export interface LeaderboardTrader {
  id: string;
  name: string;
  avatar_url: string;
  signal_count: number;
  created_at: string;
  is_subscribed?: boolean;
  is_followed?: boolean;
}

export async function getLeaderboard(userId?: string): Promise<LeaderboardTrader[]> {
  try {
    console.log('🔵 [TraderService] 调用 RPC: get_leaderboard, userId:', userId);
    
    const { data, error } = await supabase.rpc('get_leaderboard', {
      p_user_id: userId || null
    });

    if (error) {
      console.error('❌ [TraderService] 获取排行榜失败:', error);
      throw error;
    }

    console.log('✅ [TraderService] 获取排行榜成功，返回', data?.length || 0, '条数据');
    return data || [];
  } catch (error) {
    console.error('❌ [TraderService] 获取排行榜异常:', error);
    throw error;
  }
}
