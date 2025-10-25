'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  UserCircleIcon 
} from '@heroicons/react/24/outline';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
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
        ref={buttonRef}
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
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className={`${textSizeClasses[size]} text-white font-semibold`}>
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </motion.button>

      {/* 用户信息下拉菜单 - 使用 Portal 样式 */}
      <AnimatePresence>
        {showDropdown && isDropdownOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 w-48 rounded-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-200/60 dark:border-gray-700/60 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl p-1.5"
            style={{
              top: buttonRef.current 
                ? `${buttonRef.current.getBoundingClientRect().bottom + 8}px`
                : '0px',
              left: buttonRef.current
                ? `${Math.max(8, buttonRef.current.getBoundingClientRect().right - 192)}px`
                : '0px',
            }}
          >
            {/* 用户信息头部 */}
            <div className="px-3 py-2.5 mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-sm text-white font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-gray-900 dark:text-gray-100 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    等级 {profile?.level || 1}
                  </p>
                </div>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="h-px bg-gray-200/60 dark:bg-gray-700/60 my-1" />

            {/* 菜单项 */}
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                // 编辑资料功能
              }}
              className="w-full flex items-center gap-2.5 text-sm outline-hidden rounded-[12px] py-2.5 px-3 cursor-pointer transition-all duration-150 hover:bg-gray-100/80 dark:hover:bg-gray-800/80"
            >
              <UserCircleIcon className="h-[18px] w-[18px] text-blue-600 dark:text-blue-400" />
              <span className="text-[14px] font-medium text-gray-900 dark:text-gray-100">
                编辑资料
              </span>
            </button>

            <button
              onClick={() => {
                setIsDropdownOpen(false);
                // 设置功能
              }}
              className="w-full flex items-center gap-2.5 text-sm outline-hidden rounded-[12px] py-2.5 px-3 cursor-pointer transition-all duration-150 hover:bg-gray-100/80 dark:hover:bg-gray-800/80"
            >
              <Cog6ToothIcon className="h-[18px] w-[18px] text-gray-600 dark:text-gray-400" />
              <span className="text-[14px] font-medium text-gray-900 dark:text-gray-100">
                设置
              </span>
            </button>

            {/* 分隔线 */}
            <div className="h-px bg-gray-200/60 dark:bg-gray-700/60 my-1" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 text-sm outline-hidden rounded-[12px] py-2.5 px-3 cursor-pointer transition-all duration-150 hover:bg-red-50/80 dark:hover:bg-red-900/20"
            >
              <ArrowRightOnRectangleIcon className="h-[18px] w-[18px] text-red-600 dark:text-red-400" />
              <span className="text-[14px] font-medium text-red-600 dark:text-red-400">
                退出登录
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
