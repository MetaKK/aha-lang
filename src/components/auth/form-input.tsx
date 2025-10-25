'use client';

import { useState, memo, forwardRef } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface FormInputProps {
  id: string;
  name: string;
  type?: 'text' | 'email' | 'password';
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  autoComplete?: string;
  showPasswordToggle?: boolean;
  error?: string;
  required?: boolean;
}

export const FormInput = memo(forwardRef<HTMLInputElement, FormInputProps>(({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  autoComplete,
  showPasswordToggle = false,
  error,
  required = false,
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    fontSize: '15px',
    lineHeight: '30px',
    position: 'relative' as const,
    borderRadius: '6px',
    boxShadow: isFocused 
      ? '0 0 0 2px rgba(35, 131, 226, 0.2)' 
      : 'var(--cd-inpBoxSha)',
    backgroundColor: 'transparent',
    cursor: 'text',
    paddingTop: '4px',
    paddingBottom: '4px',
    paddingInline: '10px',
    marginTop: '4px',
    marginBottom: '8px',
    transition: 'all 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    border: isFocused 
      ? '1px solid rgba(35, 131, 226, 0.3)' 
      : 'none',
  };

  const inputStyles = {
    fontSize: 'inherit',
    lineHeight: 'inherit',
    border: 'none',
    background: 'none',
    width: '100%',
    display: 'block',
    resize: 'none' as const,
    padding: '0px',
    outline: 'none',
    color: 'var(--c-texPri)',
  };

  return (
    <div>
      <label 
        htmlFor={id} 
        style={{ 
          display: 'block', 
          marginBottom: '4px', 
          fontSize: '12px', 
          color: 'var(--c-texSec)', 
          fontWeight: 500 
        }}
      >
        {label}
        {required && <span style={{ color: 'rgb(235, 87, 87)', marginLeft: '4px' }}>*</span>}
      </label>
      
      <div style={containerStyles}>
        <input
          ref={ref}
          id={id}
          name={name}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-label={label}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={inputStyles}
          disabled={disabled}
        />
        
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ 
              position: 'absolute', 
              right: '10px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            disabled={disabled}
            aria-label={showPassword ? '隐藏密码' : '显示密码'}
          >
            {showPassword ? (
              <EyeSlashIcon style={{ width: '16px', height: '16px', color: 'var(--c-texSec)' }} />
            ) : (
              <EyeIcon style={{ width: '16px', height: '16px', color: 'var(--c-texSec)' }} />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <div 
          id={`${id}-error`}
          role="alert"
          style={{ 
            color: 'rgb(235, 87, 87)', 
            fontSize: '12px', 
            lineHeight: '16px', 
            marginTop: '4px', 
            marginBottom: '8px' 
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}));

FormInput.displayName = 'FormInput';
