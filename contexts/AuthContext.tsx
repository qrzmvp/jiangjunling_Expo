import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserProfile = {
  id: string;
  email: string;
  username: string | null;
  account_id: string;
  avatar_url: string | null;
  is_verified: boolean;
  vip_status: string;
  invite_code: string | null;
  subscription_count: number;
  following_count: number;
  friends_count: number;
  favorites_count: number;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithOtp: (email: string) => Promise<{ error: any }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: any; data?: any }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signInWithOtp: async () => ({ error: null }),
  verifyOtp: async () => ({ error: null }),
  signInWithPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// 将 Supabase 错误信息翻译为中文
const translateAuthError = (errorMessage: string): string => {
  const errorMap: { [key: string]: string } = {
    'Token has expired or is invalid': '验证码已过期或无效，请重新获取',
    'Invalid login credentials': '邮箱或密码错误',
    'Email not confirmed': '邮箱未确认',
    'User already registered': '该邮箱已注册',
    'Invalid email': '邮箱格式不正确',
    'Password should be at least 6 characters': '密码至少需要6个字符',
    'Unable to validate email address: invalid format': '邮箱格式不正确',
    'Signup requires a valid password': '请输入有效的密码',
    'Email rate limit exceeded': '发送验证码过于频繁，请稍后再试',
  };

  // 检查是否有匹配的翻译
  for (const [enMsg, zhMsg] of Object.entries(errorMap)) {
    if (errorMessage.includes(enMsg)) {
      return zhMsg;
    }
  }

  // 如果没有匹配，返回原始错误信息
  return errorMessage;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as UserProfile;
    } catch (e) {
      console.error('Exception fetching profile:', e);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const data = await fetchProfile(user.id);
      if (data) setProfile(data);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Exception in fetchSession:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Small delay to allow trigger to run if it's a new registration
        if (_event === 'SIGNED_IN') {
           setTimeout(async () => {
             const profileData = await fetchProfile(session.user.id);
             setProfile(profileData);
           }, 500);
        } else {
           const profileData = await fetchProfile(session.user.id);
           setProfile(profileData);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });
    
    if (error) {
      // 转换为中文错误信息
      const errorMessage = translateAuthError(error.message);
      return { error: { ...error, message: errorMessage } };
    }
    
    return { error: null };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    
    if (error) {
      // 转换为中文错误信息
      const errorMessage = translateAuthError(error.message);
      return { data, error: { ...error, message: errorMessage } };
    }
    
    return { data, error: null };
  };

  const signInWithPassword = async (email: string, password: string) => {
    console.log('signInWithPassword 开始:', email);
    
    // 1. 先尝试用密码登录
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // 如果登录成功，直接返回
    if (!signInError && signInData.session) {
      console.log('✅ 密码登录成功');
      return { data: signInData, error: null };
    }

    // 2. 登录失败，尝试注册
    if (signInError) {
      console.log('❌ 登录失败:', signInError.message, 'Status:', signInError.status);
      
      // 尝试注册新用户
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      // 注册成功
      if (!signUpError && signUpData.user) {
        if (signUpData.session) {
          console.log('✅ 注册成功并自动登录');
          return { data: signUpData, error: null };
        } else {
          console.log('⚠️ 注册成功但需要邮箱确认');
          return { 
            data: null, 
            error: { message: '请检查您的邮箱以确认账户' } 
          };
        }
      }

      // 注册失败
      if (signUpError) {
        console.log('❌ 注册失败:', signUpError.message);
        
        // 用户已存在（说明是密码错误，或者是验证码注册的用户没有密码）
        if (signUpError.message.includes('already registered') || 
            signUpError.message.includes('User already registered')) {
          console.log('ℹ️ 用户已存在，建议使用验证码登录');
          return { 
            data: null, 
            error: { message: '该邮箱已注册，请先使用验证码登录后进入个人资料页面设置密码' } 
          };
        }
        
        return { data: null, error: { message: signUpError.message } };
      }
    }

    // 其他情况
    console.log('❌ 未知错误');
    return { 
      data: null, 
      error: { message: '登录失败，请重试' } 
    };
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('更新密码失败:', error);
        return { error };
      }
      
      console.log('密码更新成功');
      return { error: null };
    } catch (error) {
      console.error('更新密码异常:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signInWithOtp, verifyOtp, signInWithPassword, updatePassword, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
