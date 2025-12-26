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
  verifyOtp: (email: string, token: string) => Promise<{ error: any; session?: Session | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
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
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

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
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      }
      
      setLoading(false);
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
    return { error };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    return { data, error };
  };

  const signInWithPassword = async (email: string, password: string) => {
    // Strategy: Try to Sign Up first (Login is Registration)
    // If user exists, try to Sign In
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      // If user already exists, try to sign in
      if (signUpError.message.includes('already registered') || signUpError.status === 400) { // 400 is often used for validation or existing user
         const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return { data: signInData, error: signInError };
      }
      return { error: signUpError };
    }

    // If signUp successful but no session (email confirmation required), 
    // we might need to handle that. But per requirements, we expect direct login.
    // If session is null here, it means email confirmation is enabled.
    if (signUpData.user && !signUpData.session) {
        // Try to sign in immediately just in case (unlikely to work if confirmation needed)
        // Or return a specific error/message
        return { error: { message: "Please check your email to confirm your account." } };
    }

    return { data: signUpData, error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signInWithOtp, verifyOtp, signInWithPassword, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
