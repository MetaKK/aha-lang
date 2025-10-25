'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from '@/components/auth/loading-spinner';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  showBackdrop?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 优雅的Loading蒙层组件
 * 
 * 特性：
 * 1. 非阻塞式设计 - 不阻止用户操作
 * 2. 优雅的动画效果 - 平滑的进入/退出
 * 3. 可自定义样式 - 支持不同场景
 * 4. 无障碍支持 - 完整的ARIA标签
 */
export const LoadingOverlay = memo<LoadingOverlayProps>(({
  isVisible,
  message = '加载中...',
  showBackdrop = true,
  size = 'md',
  className = ''
}) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}
        role="status"
        aria-live="polite"
        aria-label="加载中"
      >
        {/* 背景蒙层 */}
        {showBackdrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
        )}
        
        {/* Loading内容 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative p-8"
        >
          {/* 加载指示器 */}
          <div className="flex flex-col items-center">
            <LoadingSpinner size={size} />
            
            {/* 消息文本 */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-gray-700 dark:text-gray-300 font-medium"
            >
              {message}
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';

/**
 * 内联Loading组件 - 用于表单或按钮
 */
interface InlineLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export const InlineLoading = memo<InlineLoadingProps>(({
  isLoading,
  children,
  loadingText = '处理中...',
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center"
        >
          <div className="flex flex-col items-center">
            <LoadingSpinner size="sm" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {loadingText}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
});

InlineLoading.displayName = 'InlineLoading';

/**
 * 按钮Loading组件 - 用于按钮状态
 */
interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
}

export const ButtonLoading = memo<ButtonLoadingProps>(({
  isLoading,
  children,
  loadingText,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`relative ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" />
          {loadingText && (
            <span className="ml-2">{loadingText}</span>
          )}
        </div>
      ) : (
        children
      )}
    </button>
  );
});

ButtonLoading.displayName = 'ButtonLoading';
