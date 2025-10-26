// 认证相关hooks

import { useAuth as useAuthContext } from '@/contexts/auth-context';
import type { UseAuthReturn, UsePermissionReturn, Permission } from '@/types/auth';

// 重新导出核心 useAuth Hook
export { useAuth } from '@/contexts/auth-context';

/**
 * 基础认证Hook
 * 提供用户状态和认证操作
 */
export function useAuthState(): UseAuthReturn {
  const { user, profile, loading, error } = useAuthContext();

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    error,
  };
}

/**
 * 权限检查Hook
 * 提供细粒度的权限控制
 */
export function usePermission(): UsePermissionReturn {
  const { user, profile } = useAuthContext();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;

    // 基础权限：所有登录用户都可以创建内容
    const basicPermissions: Permission[] = [
      'create_post',
      'create_quest',
      'edit_profile',
    ];

    if (basicPermissions.includes(permission)) {
      return true;
    }

    // 高级权限：需要特定条件
    switch (permission) {
      case 'delete_content':
        // 用户可以删除自己的内容
        return true;
      case 'admin':
        // 管理员权限（可以根据用户等级或其他条件判断）
        return (profile?.level ?? 0) >= 50;
      default:
        return false;
    }
  };

  // 检查多个权限
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // 检查任意权限
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canCreatePost: hasPermission('create_post'),
    canCreateQuest: hasPermission('create_quest'),
    canEditProfile: hasPermission('edit_profile'),
    isAdmin: hasPermission('admin'),
  };
}

/**
 * 认证操作Hook
 * 提供登录、注册、登出等操作
 */
export function useAuthActions() {
  const { signUp, signIn, signOut, updateProfile, refreshUser } = useAuthContext();

  return {
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshUser,
  };
}

/**
 * 用户资料Hook
 * 专门处理用户资料相关操作
 */
export function useProfile() {
  const { profile, updateProfile, loading } = useAuthContext();

  const updateDisplayName = async (displayName: string) => {
    await updateProfile({ display_name: displayName });
  };

  const updateBio = async (bio: string) => {
    await updateProfile({ bio });
  };

  const updateAvatar = async (avatarUrl: string) => {
    await updateProfile({ avatar_url: avatarUrl });
  };

  return {
    profile,
    loading,
    updateDisplayName,
    updateBio,
    updateAvatar,
    updateProfile,
  };
}

/**
 * 认证状态Hook
 * 简化的认证状态检查
 */
export function useAuthStatus() {
  const { user, loading } = useAuthContext();

  return {
    isAuthenticated: !!user,
    isLoading: loading,
    isGuest: !user && !loading,
  };
}
