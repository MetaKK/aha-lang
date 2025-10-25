'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/use-auth';
import { LoadingSpinner } from './loading-spinner';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  showLoading?: boolean;
}

/**
 * 认证守卫组件 - 基于最佳实践的优化版本
 * 
 * 特性：
 * 1. 渐进式加载 - 避免突然的页面跳转
 * 2. 智能重定向 - 记住用户原始意图
 * 3. 优雅降级 - 提供友好的fallback UI
 * 4. 性能优化 - 最小化不必要的重渲染
 */
export function AuthGuard({ 
  children, 
  fallback,
  requireAuth = true,
  redirectTo = '/auth',
  showLoading = true
}: AuthGuardProps) {
  const { isAuthenticated, loading, user } = useAuthState();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [shouldShowContent, setShouldShowContent] = useState(false);

  // 智能重定向逻辑
  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        // 记录用户原始意图（可选）
        const currentPath = window.location.pathname;
        if (currentPath !== redirectTo) {
          sessionStorage.setItem('auth-redirect', currentPath);
        }
        
        setIsRedirecting(true);
        // 延迟重定向，让用户看到过渡效果
        const timer = setTimeout(() => {
          router.push(redirectTo);
        }, 300);
        
        return () => clearTimeout(timer);
      } else {
        // 用户已认证或不需要认证，显示内容
        setShouldShowContent(true);
      }
    }
  }, [isAuthenticated, loading, requireAuth, redirectTo, router]);

  // 加载状态 - 优雅的加载指示器
  if (loading && showLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center min-h-screen bg-white"
      >
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-600 dark:text-gray-400"
          >
            正在验证身份...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  // 重定向状态 - 平滑的过渡效果
  if (isRedirecting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center min-h-screen bg-white"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <LoadingSpinner size="lg" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-600 dark:text-gray-400"
          >
            正在跳转到登录页面...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  // 需要认证但未登录 - 优雅的fallback UI
  if (requireAuth && !isAuthenticated && shouldShowContent) {
    return fallback || (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-screen bg-white"
      >
        <div className="text-center max-w-md mx-auto px-6">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            需要登录
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 dark:text-gray-400 mb-8"
          >
            请先登录以访问此内容
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => router.push(redirectTo)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            立即登录
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // 显示内容
  return (
    <AnimatePresence mode="wait">
      {shouldShowContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * 简化的认证检查Hook
 */
export function useAuthGuard() {
  const { isAuthenticated, loading, user } = useAuthState();
  const router = useRouter();

  const redirectToAuth = (redirectPath?: string) => {
    const currentPath = window.location.pathname;
    if (currentPath !== '/auth') {
      sessionStorage.setItem('auth-redirect', redirectPath || currentPath);
    }
    router.push('/auth');
  };

  const getRedirectPath = () => {
    return sessionStorage.getItem('auth-redirect') || '/';
  };

  const clearRedirectPath = () => {
    sessionStorage.removeItem('auth-redirect');
  };

  return {
    isAuthenticated,
    loading,
    user,
    redirectToAuth,
    getRedirectPath,
    clearRedirectPath
  };
}
