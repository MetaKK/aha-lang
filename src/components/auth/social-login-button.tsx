'use client';

import { useState, memo } from 'react';

interface SocialLoginButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const SocialLoginButton = memo<SocialLoginButtonProps>(({ 
  children, 
  onClick, 
  disabled = false,
  className = '' 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePress = () => {
    if (disabled) return;
    
    setIsPressed(true);
    // 触觉反馈模拟
    if (navigator.vibrate) {
      navigator.vibrate(8);
    }
    setTimeout(() => setIsPressed(false), 80);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    handlePress();
    onClick?.();
  };

  const getButtonClasses = () => {
    const baseClasses = "select-none transition-all duration-120 cursor-pointer relative inline-flex items-center justify-center whitespace-nowrap h-11 rounded-xl text-gray-900 dark:text-gray-100 fill-current text-base leading-none px-4 font-semibold w-full mt-3 backdrop-blur-sm overflow-hidden";
    
    if (disabled) {
      return `${baseClasses} cursor-not-allowed opacity-60 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm`;
    }

    if (isPressed) {
      return `${baseClasses} bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-sm transform translate-y-0.5 scale-[0.98]`;
    }

    if (isHovered) {
      return `${baseClasses} bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transform -translate-y-0.5 scale-[1.005]`;
    }

    return `${baseClasses} bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md`;
  };

  return (
    <div 
      role="button" 
      tabIndex={disabled ? -1 : 0}
      className={`${getButtonClasses()} ${className}`}
      onClick={handleClick}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
      onMouseDown={handlePress}
      onTouchStart={handlePress}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
      aria-disabled={disabled}
    >
      {/* 弹性光效背景 */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/8 via-blue-500/4 to-blue-500/6 dark:from-blue-400/12 dark:via-blue-400/6 dark:to-blue-400/8 rounded-xl transition-opacity duration-120 pointer-events-none ${
        isHovered && !disabled ? 'opacity-100' : 'opacity-0'
      }`} />
      
      {/* 按压涟漪效果 */}
      {isPressed && !disabled && (
        <div className="absolute top-1/2 left-1/2 w-0 h-0 bg-black/10 dark:bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-[ripple_200ms_cubic-bezier(0.25,0.46,0.45,0.94)] pointer-events-none" />
      )}
      
      {children}
    </div>
  );
});

SocialLoginButton.displayName = 'SocialLoginButton';
