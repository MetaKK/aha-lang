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

  const buttonStyles = {
    userSelect: 'none' as const,
    transition: 'all 120ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap' as const,
    height: '44px',
    borderRadius: '12px',
    color: 'var(--c-texPri)',
    fill: 'var(--c-texPri)',
    background: isPressed 
      ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' 
      : isHovered 
        ? 'linear-gradient(135deg, #f1f3f4 0%, #e5e7eb 100%)' 
        : 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
    fontSize: '16px',
    lineHeight: 1,
    paddingInline: '16px',
    fontWeight: 600,
    border: `1px solid ${isPressed ? '#cbd5e1' : isHovered ? '#d1d5db' : '#e2e8f0'}`,
    width: '100%',
    boxShadow: isPressed 
      ? '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)' 
      : isHovered 
        ? '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06)' 
        : '0 1px 2px rgba(0, 0, 0, 0.06)',
    marginTop: '12px',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    overflow: 'hidden',
    transform: isPressed 
      ? 'translateY(1px) scale(0.98)' 
      : isHovered 
        ? 'translateY(-1px) scale(1.005)' 
        : 'translateY(0) scale(1)',
    willChange: 'transform, box-shadow, background',
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <div 
      role="button" 
      tabIndex={disabled ? -1 : 0}
      className={className}
      style={buttonStyles}
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
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(0, 122, 255, 0.04) 50%, rgba(0, 122, 255, 0.06) 100%)',
        borderRadius: '12px',
        opacity: isHovered && !disabled ? 1 : 0,
        transition: 'opacity 120ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        pointerEvents: 'none'
      }} />
      
      {/* 按压涟漪效果 */}
      {isPressed && !disabled && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '0px',
          height: '0px',
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'ripple 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          pointerEvents: 'none'
        }} />
      )}
      
      {children}
    </div>
  );
});

SocialLoginButton.displayName = 'SocialLoginButton';
