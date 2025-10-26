'use client';

import { useState, memo, useCallback } from 'react';
import { useAuthActions, useAuthState } from '@/hooks/use-auth';
import { FormInput } from './form-input';
import { SubmitButton } from './submit-button';
import { ErrorMessage } from './error-message';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import type { RegisterFormData } from '@/types/auth';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm = memo<RegisterFormProps>(({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signUp } = useAuthActions();
  const { loading, error } = useAuthState();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await signUp(formData.email, formData.password, formData.username);
      onSuccess?.();
    } catch (err) {
      // 错误已在AuthContext中处理
    } finally {
      setIsSubmitting(false);
    }
  }, [formData.email, formData.password, formData.username, signUp, onSuccess]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // 表单验证
  const isUsernameValid = formData.username.length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPasswordValid = formData.password.length >= 8;
  const isPasswordMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';
  const isFormValid = isUsernameValid && isEmailValid && isPasswordValid && isPasswordMatch;

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        {/* 用户名输入 */}
        <FormInput
          id="register-username-input"
          name="username"
          type="text"
          label="用户名"
          placeholder="输入你的用户名…"
          value={formData.username}
          onChange={handleInputChange}
          disabled={isSubmitting || loading}
          autoComplete="username"
          required
          error={formData.username && !isUsernameValid ? '用户名至少需要3个字符' : undefined}
        />

        {/* 邮件地址输入 */}
        <FormInput
          id="register-email-input"
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
          id="register-password-input"
          name="password"
          type="password"
          label="密码"
          placeholder="输入你的密码…"
          value={formData.password}
          onChange={handleInputChange}
          disabled={isSubmitting || loading}
          autoComplete="new-password"
          showPasswordToggle
          required
          error={formData.password && !isPasswordValid ? '密码至少需要8个字符' : undefined}
        />

        {/* 确认密码输入 */}
        <FormInput
          id="register-confirm-password-input"
          name="confirmPassword"
          type="password"
          label="确认密码"
          placeholder="再次输入密码…"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          disabled={isSubmitting || loading}
          autoComplete="new-password"
          showPasswordToggle
          required
          error={formData.confirmPassword && !isPasswordMatch ? '两次输入的密码不一致' : undefined}
        />

        {/* 错误信息 */}
        <ErrorMessage error={error} />

        {/* 提交按钮 */}
        <SubmitButton
          type="submit"
          disabled={!isFormValid}
          loading={isSubmitting || loading}
          variant="success"
        >
          继续
        </SubmitButton>

        {/* 切换登录 */}
        <div className="text-center mt-5">
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            已有账号？{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-500 dark:text-blue-400 bg-transparent border-none cursor-pointer no-underline text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-transparent"
              disabled={isSubmitting || loading}
            >
              立即登录
            </button>
          </span>
        </div>
      </form>

      {/* 网络请求Loading蒙层 */}
      <LoadingOverlay
        isVisible={isSubmitting || loading}
        message={isSubmitting ? '正在注册...' : '验证中...'}
        showBackdrop={true}
        size="md"
      />
    </>
  );
});

RegisterForm.displayName = 'RegisterForm';