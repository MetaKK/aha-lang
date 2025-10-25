'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuthState, useAuthActions } from '@/hooks/use-auth';
import { useAuthGuard } from '@/components/auth/auth-guard';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showDropdown?: boolean;
  className?: string;
}

export function UserAvatar({ 
  size = 'md', 
  showDropdown = false, 
  className = '' 
}: UserAvatarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, profile, isAuthenticated } = useAuthState();
  const { signOut } = useAuthActions();
  const { redirectToAuth } = useAuthGuard();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
      // 即使登出失败，也关闭下拉菜单
      setIsDropdownOpen(false);
    }
  };

  // 未登录时显示登录按钮
  if (!isAuthenticated || !user) {
    return (
      <motion.button
        onClick={() => redirectToAuth()}
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center hover:scale-105 transition-transform text-white font-semibold ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="点击登录"
      >
        <UserIcon className={`${sizeClasses[size]} text-white`} />
      </motion.button>
    );
  }

  const displayName = profile?.display_name || profile?.username || user.email.split('@')[0];
  const avatarUrl = profile?.avatar_url;

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => showDropdown && setIsDropdownOpen(!isDropdownOpen)}
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // 如果头像加载失败，显示默认头像
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <UserIcon className={`${sizeClasses[size]} text-white`} />
        )}
        
        {!avatarUrl && (
          <span className={`${textSizeClasses[size]} text-white font-semibold`}>
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </motion.button>

      {/* 用户信息显示 */}
      {showDropdown && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ 
            opacity: isDropdownOpen ? 1 : 0, 
            y: isDropdownOpen ? 0 : -10,
            scale: isDropdownOpen ? 1 : 0.95
          }}
          transition={{ duration: 0.2 }}
          className={`absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
            isDropdownOpen ? 'block' : 'hidden'
          }`}
        >
          {/* 用户信息头部 */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className={`${sizeClasses.sm} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center`}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-xs text-white font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* 用户统计 */}
          {profile && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {profile.level}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">等级</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {profile.experience}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">经验</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {profile.streak_days}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">连续</p>
                </div>
              </div>
            </div>
          )}

          {/* 操作菜单 */}
          <div className="p-2">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                // 这里可以添加编辑资料的功能
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              编辑资料
            </button>
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                // 这里可以添加设置的功能
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              设置
            </button>
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            <button
              onClick={handleSignOut}
              className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              退出登录
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// 简化的头像组件（仅显示头像）
export function SimpleAvatar({ 
  size = 'md', 
  className = '' 
}: Omit<UserAvatarProps, 'showDropdown'>) {
  return <UserAvatar size={size} showDropdown={false} className={className} />;
}
