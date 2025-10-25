'use client';

import { memo } from 'react';
import { LoadingSpinner } from './loading-spinner';

interface AuthLoadingProps {
  message?: string;
}

export const AuthLoading = memo<AuthLoadingProps>(({ message = '加载中...' }) => {
  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#ffffff',
        gap: '16px'
      }}
    >
      <LoadingSpinner size="lg" />
      <p style={{ 
        color: 'var(--c-texSec)', 
        fontSize: '16px', 
        margin: 0,
        fontWeight: '500'
      }}>
        {message}
      </p>
    </div>
  );
});

AuthLoading.displayName = 'AuthLoading';
