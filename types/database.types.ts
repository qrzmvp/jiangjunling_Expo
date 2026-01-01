export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      traders: {
        Row: {
          id: string
          name: string
          description: string | null
          avatar_url: string | null
          is_online_today: boolean | null
          is_online: boolean | null
          signal_count: number | null
          followers_count: number | null
          win_rate: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          avatar_url?: string | null
          is_online_today?: boolean | null
          is_online?: boolean | null
          signal_count?: number | null
          followers_count?: number | null
          win_rate?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          avatar_url?: string | null
          is_online_today?: boolean | null
          is_online?: boolean | null
          signal_count?: number | null
          followers_count?: number | null
          win_rate?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      signals: {
        Row: {
          id: string
          trader_id: string
          currency: string
          direction: string
          entry_price: string
          stop_loss: string
          take_profit: string
          leverage: string | null
          status: string | null
          signal_type: string | null
          signal_time: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          trader_id: string
          currency: string
          direction: string
          entry_price: string
          stop_loss: string
          take_profit: string
          leverage?: string | null
          status?: string | null
          signal_type?: string | null
          signal_time?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          trader_id?: string
          currency?: string
          direction?: string
          entry_price?: string
          stop_loss?: string
          take_profit?: string
          leverage?: string | null
          status?: string | null
          signal_type?: string | null
          signal_time?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          trader_id: string
          subscribed_at: string | null
        }
      }
      user_follows: {
        Row: {
          id: string
          user_id: string
          trader_id: string
          followed_at: string | null
        }
      }
    }
    Functions: {
      get_traders_with_stats: {
        Args: { 
          p_user_id?: string | null
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          name: string
          description: string
          avatar_url: string
          is_online_today: boolean
          is_online: boolean
          signal_count: number
          followers_count: number
          win_rate: number
          created_at: string
          updated_at: string
          total_signals: number
          active_signals: number
          closed_signals: number
          is_subscribed: boolean
          is_followed: boolean
        }[]
      }
      get_trader_detail: {
        Args: { 
          p_trader_id: string
          p_user_id?: string | null
        }
        Returns: {
          id: string
          name: string
          description: string
          avatar_url: string
          is_online_today: boolean
          is_online: boolean
          signal_count: number
          followers_count: number
          win_rate: number
          created_at: string
          updated_at: string
          total_signals: number
          active_signals: number
          closed_signals: number
          cancelled_signals: number
          long_signals: number
          short_signals: number
          spot_signals: number
          futures_signals: number
          margin_signals: number
          is_subscribed: boolean
          is_followed: boolean
        }[]
      }
      get_trader_signals: {
        Args: {
          p_trader_id: string
          p_status?: string | null
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          trader_id: string
          currency: string
          direction: string
          entry_price: string
          stop_loss: string
          take_profit: string
          leverage: string
          status: string
          signal_type: string
          signal_time: string
          created_at: string
          updated_at: string
          trader_name: string
          trader_avatar_url: string
          trader_is_online: boolean
        }[]
      }
      get_signals_with_traders: {
        Args: {
          p_status?: string
          p_direction?: string | null
          p_signal_type?: string | null
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          trader_id: string
          currency: string
          direction: string
          entry_price: string
          stop_loss: string
          take_profit: string
          leverage: string
          status: string
          signal_type: string
          signal_time: string
          created_at: string
          updated_at: string
          trader_name: string
          trader_description: string
          trader_avatar_url: string
          trader_signal_count: number
          trader_is_online: boolean
          trader_is_online_today: boolean
          trader_followers_count: number
          trader_win_rate: number
        }[]
      }
    }
  }
}
