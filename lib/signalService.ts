import { supabase } from './supabase';

export interface Signal {
  id: string;
  trader_id: string;
  currency: string;
  direction: 'long' | 'short';
  entry_price: string;
  stop_loss: string;
  take_profit: string;
  leverage: string;
  status: 'active' | 'closed' | 'cancelled';
  signal_type: 'spot' | 'futures' | 'margin';
  signal_time: string;
  created_at: string;
  // 关联的交易员信息
  trader?: {
    id: string;
    name: string;
    description: string;
    avatar_url: string;
    signal_count: number;
    is_online: boolean;
  };
}

export class SignalService {
  /**
   * 获取所有活跃的信号列表
   */
  static async getActiveSignals(limit: number = 20): Promise<Signal[]> {
    try {
      const { data, error } = await supabase
        .from('signals')
        .select(`
          *,
          trader:traders!inner (
            id,
            name,
            description,
            avatar_url,
            signal_count,
            is_online
          )
        `)
        .eq('status', 'active')
        .order('signal_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('获取信号失败:', error);
        throw error;
      }

      // 调试日志
      if (data && data.length > 0) {
        console.log('Signal data sample:', JSON.stringify(data[0], null, 2));
      }

      return data || [];
    } catch (error) {
      console.error('获取信号异常:', error);
      return [];
    }
  }

  /**
   * 根据方向筛选信号
   */
  static async getSignalsByDirection(
    direction: 'long' | 'short',
    limit: number = 20
  ): Promise<Signal[]> {
    try {
      const { data, error } = await supabase
        .from('signals')
        .select(`
          *,
          trader:traders!inner (
            id,
            name,
            description,
            avatar_url,
            signal_count,
            is_online
          )
        `)
        .eq('status', 'active')
        .eq('direction', direction)
        .order('signal_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('获取信号失败:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('获取信号异常:', error);
      return [];
    }
  }

  /**
   * 根据币种筛选信号
   */
  static async getSignalsByCurrency(
    currency: string,
    limit: number = 20
  ): Promise<Signal[]> {
    try {
      const { data, error } = await supabase
        .from('signals')
        .select(`
          *,
          trader:traders (
            id,
            name,
            description,
            avatar_url,
            signal_count,
            is_online
          )
        `)
        .eq('status', 'active')
        .eq('currency', currency)
        .order('signal_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('获取信号失败:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('获取信号异常:', error);
      return [];
    }
  }

  /**
   * 获取特定交易员的信号
   */
  static async getSignalsByTrader(
    traderId: string,
    limit: number = 20
  ): Promise<Signal[]> {
    try {
      const { data, error } = await supabase
        .from('signals')
        .select(`
          *,
          trader:traders (
            id,
            name,
            description,
            avatar_url,
            signal_count,
            is_online
          )
        `)
        .eq('trader_id', traderId)
        .order('signal_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('获取信号失败:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('获取信号异常:', error);
      return [];
    }
  }

  /**
   * 根据筛选条件获取信号
   */
  static async getSignalsWithFilters(filters: {
    direction?: 'long' | 'short';
    currency?: string;
    status?: string;
    limit?: number;
  }): Promise<Signal[]> {
    try {
      let query = supabase
        .from('signals')
        .select(`
          *,
          trader:traders (
            id,
            name,
            description,
            avatar_url,
            signal_count,
            is_online
          )
        `);

      // 应用筛选条件
      if (filters.direction) {
        query = query.eq('direction', filters.direction);
      }
      if (filters.currency) {
        query = query.eq('currency', filters.currency);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      } else {
        // 默认只显示活跃信号
        query = query.eq('status', 'active');
      }

      const { data, error } = await query
        .order('signal_time', { ascending: false })
        .limit(filters.limit || 20);

      if (error) {
        console.error('获取信号失败:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('获取信号异常:', error);
      return [];
    }
  }

  /**
   * 格式化信号时间显示
   */
  static formatSignalTime(signalTime: string): string {
    const date = new Date(signalTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
