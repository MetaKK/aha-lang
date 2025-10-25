'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

interface ErrorMessageProps {
  error: string | null;
  className?: string;
}

export const ErrorMessage = memo<ErrorMessageProps>(({ error, className = '' }) => {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={className}
      style={{ 
        fontSize: '14px', 
        color: 'rgb(235, 87, 87)', 
        textAlign: 'center', 
        width: '100%', 
        margin: '12px 0px',
        padding: '12px 16px',
        backgroundColor: 'rgba(235, 87, 87, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(235, 87, 87, 0.2)'
      }}
      role="alert"
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          style={{ flexShrink: 0 }}
        >
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span>{error}</span>
      </div>
    </motion.div>
  );
});

ErrorMessage.displayName = 'ErrorMessage';
