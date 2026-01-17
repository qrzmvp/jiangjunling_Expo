import { useEffect, useRef } from 'react';
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
  const hasRedirected = useRef(false);
  const isRedirecting = useRef(false);

  useEffect(() => {
    if (loading || isRedirecting.current) return;

    // 如果没有登录且不在登录页或启动页
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'splash';
    
    if (!session && !inAuthGroup && !hasRedirected.current) {
      hasRedirected.current = true;
      isRedirecting.current = true;
      
      // 使用 requestAnimationFrame 确保在渲染周期外执行
      requestAnimationFrame(() => {
        router.replace('/login');
      });
    }
    
    // 重置标志当用户重新登录时
    if (session) {
      hasRedirected.current = false;
      isRedirecting.current = false;
    }
  }, [session, loading, segments, router]);

  return { session, loading };
}
