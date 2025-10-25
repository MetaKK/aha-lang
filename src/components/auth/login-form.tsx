'use client';

import { useState, memo, useCallback } from 'react';
import { useAuthActions, useAuthState } from '@/hooks/use-auth';
import { FormInput } from './form-input';
import { SubmitButton } from './submit-button';
import { ErrorMessage } from './error-message';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import type { LoginFormData } from '@/types/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm = memo<LoginFormProps>(({ onSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn } = useAuthActions();
  const { loading, error } = useAuthState();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await signIn(formData.email, formData.password);
      onSuccess?.();
    } catch (err) {
      // 错误已在AuthContext中处理
    } finally {
      setIsSubmitting(false);
    }
  }, [formData.email, formData.password, signIn, onSuccess]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // 表单验证
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPasswordValid = formData.password.length >= 6;
  const isFormValid = isEmailValid && isPasswordValid;

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        {/* 邮件地址输入 */}
        <FormInput
          id="login-email-input"
          name="email"
          type="email"
          label="邮件地址"
          placeholder="输入你的邮件地址…"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isSubmitting || loading}
          autoComplete="email"
          required
          error={formData.email && !isEmailValid ? '请输入有效的邮箱地址' : undefined}
        />

        {/* 密码输入 */}
        <FormInput
          id="login-password-input"
          name="password"
          type="password"
          label="密码"
          placeholder="输入你的密码…"
          value={formData.password}
          onChange={handleInputChange}
          disabled={isSubmitting || loading}
          autoComplete="current-password"
          showPasswordToggle
          required
          error={formData.password && !isPasswordValid ? '密码至少需要6个字符' : undefined}
        />

        {/* 错误信息 */}
        <ErrorMessage error={error} />

        {/* 提交按钮 */}
        <SubmitButton
          type="submit"
          disabled={!isFormValid}
          loading={isSubmitting || loading}
        >
          继续
        </SubmitButton>

        {/* 切换注册 */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ color: 'var(--c-texSec)', fontSize: '14px' }}>
            还没有账号？{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              style={{ 
                color: '#007AFF', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                position: 'relative',
                overflow: 'hidden'
              }}
              disabled={isSubmitting || loading}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 122, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              立即注册
            </button>
          </span>
        </div>
      </form>

      {/* 网络请求Loading蒙层 */}
      <LoadingOverlay
        isVisible={isSubmitting || loading}
        message={isSubmitting ? '正在登录...' : '验证中...'}
        showBackdrop={true}
        size="md"
      />
    </>
  );
});

LoginForm.displayName = 'LoginForm';