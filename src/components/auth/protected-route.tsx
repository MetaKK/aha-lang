'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/use-auth';
import { usePermission } from '@/hooks/use-auth';
import type { ProtectedRouteProps, Permission } from '@/types/auth';

export function ProtectedRoute({ 
  children, 
  fallback, 
  requireAuth = true,
  permissions = []
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuthState();
  const { hasPermission } = usePermission();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, loading, requireAuth, router]);

  // 加载中 - 使用轻量级loading，不阻塞页面
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        {/* 页面骨架屏 */}
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 dark:bg-gray-700"></div>
          <div className="max-w-4xl mx-auto p-4">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 需要认证但未登录 - 直接重定向，不显示fallback UI
  if (requireAuth && !isAuthenticated) {
    // 记录当前路径，登录后可以重定向回来
    const currentPath = window.location.pathname;
    if (currentPath !== '/auth') {
      sessionStorage.setItem('auth-redirect', currentPath);
    }
    
    // 直接重定向到登录页
    router.push('/auth');
    
    // 显示轻量级重定向状态
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">正在跳转...</p>
        </div>
      </div>
    );
  }

  // 检查权限
  if (permissions.length > 0) {
    const { hasAllPermissions } = usePermission();
    
    if (!hasAllPermissions(permissions)) {
      return fallback || (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">权限不足</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              你没有访问此内容的权限
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

// 权限检查Hook
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuthState();
  const router = useRouter();

  const requireAuth = () => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
      return false;
    }
    return isAuthenticated;
  };

  return { requireAuth, isAuthenticated, loading };
}

// 权限检查Hook
export function useRequirePermission(permission: Permission) {
  const { hasPermission } = usePermission();
  const { isAuthenticated, loading } = useAuthState();

  const requirePermission = () => {
    if (!isAuthenticated) {
      return false;
    }
    return hasPermission(permission);
  };

  return { requirePermission, hasPermission: hasPermission(permission), isAuthenticated, loading };
}
