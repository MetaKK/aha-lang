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
  
  const getButtonStyles = () => {
    const baseStyles = {
      userSelect: 'none' as const,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap' as const,
      height: '48px',
      borderRadius: '12px',
      fontSize: '16px',
      lineHeight: 1,
      paddingInline: '20px',
      fontWeight: 600,
      color: 'white',
      marginTop: '16px',
      marginBottom: '16px',
      width: '100%',
      border: 'none',
      position: 'relative' as const,
      overflow: 'hidden',
      transition: 'all 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    };

    if (variant === 'success') {
      return {
        ...baseStyles,
        background: isDisabled 
          ? 'linear-gradient(135deg, #E5E5EA 0%, #D1D1D6 100%)' 
          : 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
        boxShadow: isDisabled
          ? '0 1px 3px rgba(0, 0, 0, 0.1)'
          : '0 2px 8px rgba(52, 199, 89, 0.25), 0 1px 4px rgba(52, 199, 89, 0.15)',
      };
    }

    return {
      ...baseStyles,
      background: isDisabled 
        ? 'linear-gradient(135deg, #E5E5EA 0%, #D1D1D6 100%)' 
        : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
      boxShadow: isDisabled
        ? '0 1px 3px rgba(0, 0, 0, 0.1)'
        : '0 2px 8px rgba(0, 122, 255, 0.25), 0 1px 4px rgba(0, 122, 255, 0.15)',
    };
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    
    const target = e.currentTarget;
    target.style.transform = 'translateY(-1px) scale(1.005)';
    
    if (variant === 'success') {
      target.style.boxShadow = '0 4px 12px rgba(52, 199, 89, 0.3), 0 2px 6px rgba(52, 199, 89, 0.2)';
      target.style.background = 'linear-gradient(135deg, #2FB344 0%, #1E7E34 100%)';
    } else {
      target.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.3), 0 2px 6px rgba(0, 122, 255, 0.2)';
      target.style.background = 'linear-gradient(135deg, #0056CC 0%, #003D99 100%)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    
    const target = e.currentTarget;
    target.style.transform = 'translateY(0) scale(1)';
    
    if (variant === 'success') {
      target.style.boxShadow = '0 2px 8px rgba(52, 199, 89, 0.25), 0 1px 4px rgba(52, 199, 89, 0.15)';
      target.style.background = 'linear-gradient(135deg, #34C759 0%, #28A745 100%)';
    } else {
      target.style.boxShadow = '0 2px 8px rgba(0, 122, 255, 0.25), 0 1px 4px rgba(0, 122, 255, 0.15)';
      target.style.background = 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)';
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    
    const target = e.currentTarget;
    target.style.transform = 'translateY(1px) scale(0.98)';
    
    if (variant === 'success') {
      target.style.boxShadow = '0 1px 4px rgba(52, 199, 89, 0.3), 0 1px 2px rgba(52, 199, 89, 0.15)';
    } else {
      target.style.boxShadow = '0 1px 4px rgba(0, 122, 255, 0.3), 0 1px 2px rgba(0, 122, 255, 0.15)';
    }
    
    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(6);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    handleMouseEnter(e);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    
    const target = e.currentTarget;
    target.style.transform = 'translateY(1px) scale(0.98)';
    
    if (variant === 'success') {
      target.style.boxShadow = '0 1px 3px rgba(52, 199, 89, 0.2), 0 1px 2px rgba(52, 199, 89, 0.1)';
    } else {
      target.style.boxShadow = '0 1px 3px rgba(0, 122, 255, 0.2), 0 1px 2px rgba(0, 122, 255, 0.1)';
    }
    
    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(6);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    handleMouseEnter(e as any);
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={className}
      style={getButtonStyles()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-disabled={isDisabled}
    >
      {/* Apple风格光效背景 */}
      {!isDisabled && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.2) 100%)',
          borderRadius: '12px',
          opacity: 0,
          transition: 'opacity 300ms ease-in-out'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0';
        }}
        />
      )}
      
      {/* 按钮内容 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        textAlign: 'center', 
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
