'use client';

import { memo } from 'react';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export const AuthHeader = memo<AuthHeaderProps>(({ title, subtitle }) => {
  return (
    <div style={{ 
      fontWeight: 700, 
      marginBottom: '23px', 
      textAlign: 'center', 
      lineHeight: 1.1, 
      maxWidth: '380px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center' 
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        textAlign: 'start', 
        width: '320px' 
      }}>
        <h1 style={{ 
          fontWeight: 600, 
          fontSize: '22px', 
          lineHeight: '26px', 
          margin: '0px', 
          textWrap: 'balance', 
          color: '#1D1D1F' 
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--c-texSec)', 
            margin: '8px 0 0 0',
            lineHeight: '18px'
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
});

AuthHeader.displayName = 'AuthHeader';
