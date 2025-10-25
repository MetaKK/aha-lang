'use client';

import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './loading-spinner';

interface SmartLoadingProps {
  message?: string;
  showProgress?: boolean;
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

/**
 * 智能加载组件 - 基于最佳实践的优化版本
 * 
 * 特性：
 * 1. 渐进式消息显示 - 避免用户焦虑
 * 2. 进度指示 - 让用户了解加载状态
 * 3. 超时处理 - 防止无限加载
 * 4. 优雅降级 - 提供备选方案
 */
export const SmartLoading = memo<SmartLoadingProps>(({
  message = '加载中...',
  showProgress = false,
  duration = 5000,
  onComplete,
  className = ''
}) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  // 渐进式消息显示
  const messages = [
    '正在初始化...',
    '验证身份中...',
    '加载用户数据...',
    '准备就绪...'
  ];

  useEffect(() => {
    let messageIndex = 0;
    let progressValue = 0;
    
    const messageInterval = setInterval(() => {
      if (messageIndex < messages.length) {
        setCurrentMessage(messages[messageIndex]);
        messageIndex++;
      }
    }, 800);

    const progressInterval = setInterval(() => {
      if (showProgress && progressValue < 90) {
        progressValue += Math.random() * 15;
        setProgress(Math.min(progressValue, 90));
      }
    }, 200);

    // 超时处理
    const timeout = setTimeout(() => {
      if (showProgress) {
        setProgress(100);
      }
      setCurrentMessage('加载完成');
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 500);
    }, duration);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [showProgress, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex items-center justify-center min-h-screen bg-white ${className}`}
    >
      <div className="text-center max-w-md mx-auto px-6">
        {/* 加载指示器 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="mb-6"
        >
          <LoadingSpinner size="lg" />
        </motion.div>

        {/* 进度条 */}
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full bg-gray-200 rounded-full h-2 mb-4"
          >
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </motion.div>
        )}

        {/* 消息文本 */}
        <motion.p
          key={currentMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-gray-600 dark:text-gray-400 text-lg"
        >
          {currentMessage}
        </motion.p>

        {/* 副标题 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 dark:text-gray-500 text-sm mt-2"
        >
          请稍候，我们正在为您准备最佳体验
        </motion.p>
      </div>
    </motion.div>
  );
});

SmartLoading.displayName = 'SmartLoading';

/**
 * 页面级加载组件 - 用于路由切换
 */
interface PageLoadingProps {
  message?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const PageLoading = memo<PageLoadingProps>(({
  message = '页面加载中...',
  showBackButton = false,
  onBack
}) => {
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
          {message}
        </motion.p>
        
        {showBackButton && onBack && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={onBack}
            className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            返回上一页
          </motion.button>
        )}
      </div>
    </motion.div>
  );
});

PageLoading.displayName = 'PageLoading';
