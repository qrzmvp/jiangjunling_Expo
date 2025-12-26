import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

/**
 * 保护路由的Hook
 * 如果用户未登录，自动重定向到登录页
 */
export function useProtectedRoute() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    // 如果没有登录且不在登录页或启动页
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'splash';
    
    if (!session && !inAuthGroup) {
      router.replace('/login');
    }
  }, [session, loading, segments]);

  return { session, loading };
}
