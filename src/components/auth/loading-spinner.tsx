'use client';

import { memo } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingSpinner = memo<LoadingSpinnerProps>(({ 
  size = 'md', 
  color = '#007AFF',
  className = '' 
}) => {
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '32px'
  };

  const spinnerSize = sizeMap[size];

  return (
    <div 
      className={className}
      style={{
        display: 'inline-block',
        width: spinnerSize,
        height: spinnerSize,
        border: `2px solid ${color}20`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
      role="status"
      aria-label="加载中"
    >
      <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        加载中
      </span>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';
