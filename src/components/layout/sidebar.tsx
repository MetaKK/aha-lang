'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  XMarkIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  StarIcon,
  BookmarkIcon,
  ListBulletIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  MegaphoneIcon,
  ChartBarIcon,
  BellIcon,
  HeartIcon,
  ShareIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuthState, useAuthActions } from '@/hooks/use-auth';
import { useAuthGuard } from '@/components/auth/auth-guard';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  badge?: string;
  isPremium?: boolean;
  isDestructive?: boolean;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, profile, isAuthenticated } = useAuthState();
  const { signOut } = useAuthActions();
  const { redirectToAuth } = useAuthGuard();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // 确保组件已挂载
  useEffect(() => {
    setMounted(true);
  }, []);

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // 处理ESC键关闭
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const displayName = profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url;

  // 侧边栏菜单项 - 一比一复刻X设计
  const menuItems: SidebarItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
      href: '/profile',
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: ChatBubbleLeftRightIcon,
      href: '/chat',
      badge: 'Beta',
    },
    {
      id: 'premium',
      label: 'Premium',
      icon: StarIcon,
      href: '/premium',
      isPremium: true,
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      icon: BookmarkIcon,
      href: '/bookmarks',
    },
    {
      id: 'lists',
      label: 'Lists',
      icon: ListBulletIcon,
      href: '/lists',
    },
    {
      id: 'ads',
      label: 'Ads',
      icon: MegaphoneIcon,
      href: '/ads',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: ChartBarIcon,
      href: '/analytics',
    },
    {
      id: 'settings',
      label: 'Settings and privacy',
      icon: Cog6ToothIcon,
      href: '/settings',
    },
    // 分隔线
    {
      id: 'divider',
      label: '',
      icon: () => null,
      href: '',
    },
    {
      id: 'logout',
      label: 'Log out',
      icon: ArrowRightOnRectangleIcon,
      onClick: handleSignOut,
      isDestructive: true,
    },
  ];

  const SidebarItem = ({ item }: { item: SidebarItem }) => {
    const Icon = item.icon;
    
    // 处理分隔线
    if (item.id === 'divider') {
      return (
        <div className="my-2 mx-4 h-px bg-gray-200/60 dark:bg-gray-700/60" />
      );
    }
    
    return (
      <motion.a
        href={item.href}
        onClick={(e) => {
          if (item.onClick) {
            e.preventDefault();
            item.onClick();
          }
        }}
        className={`
          flex items-center gap-4 px-4 py-3 text-gray-900 dark:text-gray-100
          hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200
          ${item.isDestructive ? 'text-red-600 hover:bg-red-50/80 dark:text-red-400 dark:hover:bg-red-900/20' : ''}
        `}
        whileHover={{ x: 6 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className={`w-5 h-5 ${item.isDestructive ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`} />
        <span className="flex-1 text-lg font-medium">{item.label}</span>
        {item.badge && (
          <span className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
            {item.badge}
          </span>
        )}
        {item.isPremium && (
          <StarIcon className="w-4 h-4 text-yellow-500" />
        )}
      </motion.a>
    );
  };

  // 如果未挂载，不渲染
  if (!mounted) return null;

  const sidebarContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 - Apple风格的毛玻璃效果 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
            onClick={onClose}
          />
          
          {/* 侧边栏 - 从左边滑出，Apple风格 */}
          <motion.div
            ref={sidebarRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300,
              duration: 0.35,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="fixed top-0 left-0 w-80 max-w-[85vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col"
            style={{
              // 安全区域适配 - 支持所有设备
              height: '100dvh', // 动态视口高度，自动适配移动端（fallback: 100vh）
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              // Apple风格的性能优化
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackdropFilter: 'blur(20px)',
              backdropFilter: 'blur(20px)',
            } as React.CSSProperties}
          >

            {/* 用户信息 - Apple风格 */}
            <div className="p-6 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-lg text-white font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-base text-gray-600 dark:text-gray-400 truncate">
                    @{profile?.username || user?.email?.split('@')[0] || 'user'}
                  </p>
                  <div className="flex items-center gap-6 mt-2">
                    <span className="text-base text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">{profile?.level || 1}</span> followers
                    </span>
                    <span className="text-base text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">{profile?.experience || 0}</span> following
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 菜单项 */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="py-2">
                {menuItems.map((item) => (
                  <SidebarItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* 底部推广卡片 - 一比一复刻X设计 */}
            <div className="px-4 pb-4 flex-shrink-0">
              <motion.div
                className="bg-gradient-to-br from-gray-50/95 to-gray-100/95 dark:from-gray-800/95 dark:to-gray-900/95 rounded-2xl p-5 shadow-xl border border-gray-200/20 dark:border-gray-700/20 backdrop-blur-md relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                {/* 微妙的光泽效果 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl pointer-events-none"></div>
                {/* 产品信息头部 - 一比一复刻X */}
                <div className="relative z-10 flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-white text-2xl font-bold">Aha</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      Learn through play.
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get the Aha app for the best experience
                    </p>
                  </div>
                </div>
                
                {/* 功能特色 - 一比一复刻X */}
                <div className="relative z-10 grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Real-time updates</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Push notifications</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>Offline reading</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>Dark mode</span>
                  </div>
                </div>
                
                {/* 下载按钮 - 一比一复刻X */}
                <motion.button
                  className="relative z-10 w-full bg-black dark:bg-white text-white dark:text-black py-4 px-6 rounded-xl text-base font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Get the app
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // 使用Portal挂载到body元素，避免被其他元素遮挡
  return createPortal(sidebarContent, document.body);
}
