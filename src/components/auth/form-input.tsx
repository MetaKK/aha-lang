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

  const containerClass = `flex items-center w-full text-[15px] leading-[30px] relative rounded-md cursor-text pt-1 pb-1 px-2.5 mt-1 mb-2 transition-all duration-100 ${
    isFocused 
      ? 'ring-2 ring-blue-500/20 border border-blue-500/30 bg-white/50 dark:bg-gray-800/50' 
      : 'bg-gray-50/50 dark:bg-gray-800/50 border border-subtle'
  }`;

  const inputClass = "text-[15px] leading-[30px] border-none bg-transparent w-full block resize-none p-0 outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400";

  return (
    <div>
      <label 
        htmlFor={id} 
        className="block mb-1 text-xs text-gray-600 dark:text-gray-400 font-medium"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className={containerClass}>
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
          className={inputClass}
          disabled={disabled}
        />
        
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1 flex items-center justify-center"
            disabled={disabled}
            aria-label={showPassword ? '隐藏密码' : '显示密码'}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <EyeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <div 
          id={`${id}-error`}
          role="alert"
          className="text-red-500 text-xs leading-4 mt-1 mb-2"
        >
          {error}
        </div>
      )}
    </div>
  );
}));

FormInput.displayName = 'FormInput';
