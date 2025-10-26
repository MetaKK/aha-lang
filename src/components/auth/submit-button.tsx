'use client';

import { memo } from 'react';
import { LoadingSpinner } from './loading-spinner';

interface SubmitButtonProps {
  type?: 'submit' | 'button';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'success';
  className?: string;
}

export const SubmitButton = memo<SubmitButtonProps>(({
  type = 'submit',
  disabled = false,
  loading = false,
  children,
  onClick,
  variant = 'primary',
  className = ''
}) => {
  const isDisabled = disabled || loading;
  
  const getButtonClasses = () => {
    const baseClasses = "select-none inline-flex items-center justify-center whitespace-nowrap h-12 rounded-xl text-base font-semibold text-white mt-4 mb-4 w-full border-none relative overflow-hidden transition-all duration-100 backdrop-blur-sm";
    
    if (isDisabled) {
      return `${baseClasses} cursor-not-allowed bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-500 dark:to-gray-600 shadow-sm`;
    }

    if (variant === 'success') {
      return `${baseClasses} cursor-pointer bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-green-400 dark:to-green-500 dark:hover:from-green-500 dark:hover:to-green-600 shadow-lg hover:shadow-xl shadow-green-500/25 hover:shadow-green-500/30 dark:shadow-green-400/30 dark:hover:shadow-green-400/40`;
    }

    return `${baseClasses} cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-400 dark:to-blue-500 dark:hover:from-blue-500 dark:hover:to-blue-600 shadow-lg hover:shadow-xl shadow-blue-500/25 hover:shadow-blue-500/30 dark:shadow-blue-400/30 dark:hover:shadow-blue-400/40`;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    
    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(6);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    
    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(6);
    }
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${getButtonClasses()} ${className} hover:-translate-y-0.5 hover:scale-[1.005] active:translate-y-0.5 active:scale-[0.98]`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      aria-disabled={isDisabled}
    >
      {/* Apple风格光效背景 */}
      {!isDisabled && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-white/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
      
      {/* 按钮内容 */}
      <div className="flex items-center text-center justify-center relative z-10">
        {loading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" color="white" />
            <span>{children}</span>
          </div>
        ) : (
          children
        )}
      </div>
    </button>
  );
});

SubmitButton.displayName = 'SubmitButton';
