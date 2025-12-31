import { supabase } from './supabase';

export interface Trader {
  id: string;
  name: string;
  avatar_url: string;
  description?: string;  // 修改：bio -> description
  created_at: string;
  updated_at: string;
  // 后续可以添加其他字段
}

export interface TraderWithUserStatus extends Trader {
  isSubscribed?: boolean;
  isFollowed?: boolean;
}

/**
 * 获取所有交易员列表（按创建时间降序排序）
 */
export async function getTraders(): Promise<Trader[]> {
  try {
    const { data, error } = await supabase
      .from('traders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取交易员列表失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取交易员列表异常:', error);
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
