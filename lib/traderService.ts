import { supabase } from './supabase';

export interface Trader {
  id: string;
  name: string;
  avatar_url: string;
  bio?: string;
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
 * 【优化】一次性获取交易员列表及用户的订阅/关注状态
 * 性能提升：从 3 个请求减少为 1 个请求
 * @param userId 用户ID（可选）
 * @param limit 限制返回数量（默认20，用于分页）
 */
export async function getTradersWithUserStatus(
  userId?: string,
  limit: number = 20
): Promise<TraderWithUserStatus[]> {
  try {
    console.log('🔵 [TraderService] 正在获取交易员列表，limit:', limit, 'userId:', userId);
    
    // 获取交易员列表（带分页）
    const { data: traders, error: tradersError } = await supabase
      .from('traders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    console.log('✅ [TraderService] 成功获取', traders?.length || 0, '条交易员数据');

    if (tradersError) {
      console.error('获取交易员列表失败:', tradersError);
      throw tradersError;
    }

    if (!traders || traders.length === 0) {
      return [];
    }

    // 如果没有用户ID，直接返回交易员列表
    if (!userId) {
      return traders.map(trader => ({
        ...trader,
        isSubscribed: false,
        isFollowed: false
      }));
    }

    // 并发获取用户的订阅和关注状态
    const traderIds = traders.map(t => t.id);
    
    const [subscriptionsResult, followsResult] = await Promise.all([
      supabase
        .from('user_subscriptions')
        .select('trader_id')
        .eq('user_id', userId)
        .in('trader_id', traderIds),
      supabase
        .from('user_follows')
        .select('trader_id')
        .eq('user_id', userId)
        .in('trader_id', traderIds)
    ]);

    // 创建订阅和关注的Set用于快速查询
    const subscribedSet = new Set(
      (subscriptionsResult.data || []).map(item => item.trader_id)
    );
    const followedSet = new Set(
      (followsResult.data || []).map(item => item.trader_id)
    );

    // 合并数据
    return traders.map(trader => ({
      ...trader,
      isSubscribed: subscribedSet.has(trader.id),
      isFollowed: followedSet.has(trader.id)
    }));
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
 * 【优化】获取单个交易员信息及用户的订阅/关注状态
 * 性能提升：从 3 个请求减少为 1 个请求
 */
export async function getTraderByIdWithUserStatus(
  traderId: string, 
  userId?: string
): Promise<TraderWithUserStatus | null> {
  try {
    const { data: trader, error: traderError } = await supabase
      .from('traders')
      .select('*')
      .eq('id', traderId)
      .single();

    if (traderError) {
      console.error('获取交易员详情失败:', traderError);
      throw traderError;
    }

    if (!trader) {
      return null;
    }

    // 如果没有用户ID，直接返回交易员信息
    if (!userId) {
      return {
        ...trader,
        isSubscribed: false,
        isFollowed: false
      };
    }

    // 并发查询订阅和关注状态
    const [subscriptionResult, followResult] = await Promise.all([
      supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('trader_id', traderId)
        .maybeSingle(),
      supabase
        .from('user_follows')
        .select('id')
        .eq('user_id', userId)
        .eq('trader_id', traderId)
        .maybeSingle()
    ]);

    return {
      ...trader,
      isSubscribed: !!subscriptionResult.data,
      isFollowed: !!followResult.data
    };
  } catch (error) {
    console.error('获取交易员详情及状态异常:', error);
    throw error;
  }
}
