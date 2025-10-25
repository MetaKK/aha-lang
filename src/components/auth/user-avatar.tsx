'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserIcon } from '@heroicons/react/24/outline';
import { useAuthState } from '@/hooks/use-auth';
import { useAuthGuard } from '@/components/auth/auth-guard';
import { Sidebar } from '@/components/layout/sidebar';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, profile, isAuthenticated } = useAuthState();
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

  const handleAvatarClick = () => {
    if (showDropdown) {
      setIsSidebarOpen(true);
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
    <>
      <motion.button
        onClick={handleAvatarClick}
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform ${className}`}
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

      {/* 侧边栏 */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </>
  );
}

// 简化的头像组件（仅显示头像）
export function SimpleAvatar({ 
  size = 'md', 
  className = '' 
}: Omit<UserAvatarProps, 'showDropdown'>) {
  return <UserAvatar size={size} showDropdown={false} className={className} />;
}
