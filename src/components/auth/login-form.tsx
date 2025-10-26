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
        <div className="text-center mt-5">
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            还没有账号？{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-500 dark:text-blue-400 bg-transparent border-none cursor-pointer no-underline text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-transparent"
              disabled={isSubmitting || loading}
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