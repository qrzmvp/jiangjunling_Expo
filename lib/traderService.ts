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
