'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuthGuard } from '@/components/auth/auth-guard';

interface AuthPromptProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actionText?: string;
}

/**
 * 优雅的登录提示组件
 * 
 * 特性：
 * 1. 非阻塞式设计 - 不阻止用户浏览内容
 * 2. 优雅的动画效果 - 平滑的进入/退出
 * 3. 清晰的行动召唤 - 引导用户登录
 * 4. 可自定义内容 - 支持不同场景
 */
export const AuthPrompt = memo<AuthPromptProps>(({
  isVisible,
  onClose,
  title = '需要登录',
  message = '请先登录以使用此功能',
  actionText = '立即登录'
}) => {
  const { redirectToAuth } = useAuthGuard();

  const handleLogin = () => {
    onClose();
    redirectToAuth();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* 背景蒙层 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* 提示卡片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
          style={{ minWidth: '280px', maxWidth: '384px' }}
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* 内容区域 */}
          <div className="p-6 pt-8">
            {/* 图标 */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.05, type: 'spring', stiffness: 300 }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            >
              <UserIcon className="w-8 h-8 text-white" />
            </motion.div>

            {/* 标题 */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2"
            >
              {title}
            </motion.h3>

            {/* 消息 */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-gray-600 dark:text-gray-400 text-center mb-6"
            >
              {message}
            </motion.p>

            {/* 操作按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-3"
            >
              <button
                onClick={handleLogin}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {actionText}
              </button>
              
              <button
                onClick={onClose}
                className="w-full px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                稍后再说
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

AuthPrompt.displayName = 'AuthPrompt';

/**
 * 简化的登录提示Hook
 */
export function useAuthPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const { redirectToAuth } = useAuthGuard();

  const showPrompt = () => setIsVisible(true);
  const hidePrompt = () => setIsVisible(false);
  
  const handleLogin = () => {
    hidePrompt();
    redirectToAuth();
  };

  return {
    isVisible,
    showPrompt,
    hidePrompt,
    handleLogin,
    AuthPrompt: (props: Omit<AuthPromptProps, 'isVisible' | 'onClose'>) => (
      <AuthPrompt
        {...props}
        isVisible={isVisible}
        onClose={hidePrompt}
      />
    )
  };
}
