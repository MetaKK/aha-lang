'use client';

import { useState, memo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { SocialLoginSection } from '@/components/auth/social-login-section';
import { AuthHeader } from '@/components/auth/auth-header';
import { useAuthGuard } from '@/components/auth/auth-guard';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const router = useRouter();
  const { isAuthenticated, getRedirectPath, clearRedirectPath } = useAuthGuard();

  // 如果用户已登录，重定向到原页面或首页
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = getRedirectPath() || '/';
      clearRedirectPath();
      router.push(redirectPath);
    }
  }, [isAuthenticated, getRedirectPath, clearRedirectPath, router]);

  const switchMode = useCallback((newMode: 'login' | 'register') => {
    setMode(newMode);
  }, []);

  const handleEmailLogin = useCallback(() => {
    setShowEmailForm(true);
  }, []);

  const handleBackToSocial = useCallback(() => {
    setShowEmailForm(false);
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes ripple {
          0% { 
            width: 0px; 
            height: 0px; 
            opacity: 1; 
          }
          100% { 
            width: 200px; 
            height: 200px; 
            opacity: 0; 
          }
        }
        
        @keyframes keyboardPress {
          0% { 
            transform: translateY(0) scale(1); 
          }
          50% { 
            transform: translateY(2px) scale(0.94); 
          }
          100% { 
            transform: translateY(0) scale(1); 
          }
        }
      `}</style>
      <div className="min-h-screen bg-white dark:bg-gray-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
      {/* 顶部导航栏 */}
      <div className="fixed z-50 w-full font-sans">
        <div className="text-[15px] whitespace-nowrap top-0 w-full bg-white dark:bg-gray-900 flex flex-col items-center justify-center shadow-none px-5">
          <nav className="flex items-center justify-between w-full h-[54px]">
            <div className="flex-shrink-0">
              <a href="/" rel="noopener noreferrer" aria-label="AhaBook" className="block text-inherit no-underline select-auto cursor-pointer">
                <div className="font-medium text-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent bg-[length:200%_200%] animate-[gradientShift_3s_ease-in-out_infinite]">
                  AhaBook
                </div>
              </a>
            </div>
            <div className="cursor-pointer text-gray-500 dark:text-gray-400 font-medium">帮助</div>
          </nav>
        </div>
      </div>

      {/* 占位空间 */}
      <div className="w-full h-[54px] flex-shrink-0 flex-grow-0"></div>

      {/* 主要内容 */}
      <main className="text-gray-900 dark:text-gray-100 fill-current leading-6 font-sans bg-white dark:bg-gray-900 text-[17px] antialiased min-h-0 flex-grow">
        <div className="flex flex-row w-full h-full max-h-screen">
          <section className="px-5 w-full mx-auto overflow-visible">
            <div className="w-full h-full rounded">
              <div className="w-full max-w-5xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className="min-h-[4vh] flex-1"></div>
                  
                  {/* 标题区域 */}
                  <AuthHeader 
                    title={mode === 'login' ? '登录你的账户' : '创建你的账户'}
                    subtitle={mode === 'login' ? '欢迎回来，请登录你的账户' : '加入我们，开始你的学习之旅'}
                  />

                  {/* 登录卡片 */}
                  <div className="w-full max-w-80 flex flex-col items-center mb-[4vh]">
                    <div className="flex w-full flex-col">
                      
                      {/* 社交登录按钮 */}
                      <SocialLoginSection 
                        onEmailLogin={handleEmailLogin}
                      />

                      {/* 分隔线 */}
                      <div>
                        <div className="flex items-center justify-center pointer-events-none w-full h-10 flex-none">
                          <div role="separator" className="w-full h-px visible border-b border-gray-200 dark:border-gray-700"></div>
                        </div>

                        {/* 表单内容 */}
                        <AnimatePresence mode="wait">
                          {showEmailForm ? (
                            <motion.div
                              key="email-form"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.2 }}
                            >
                              {mode === 'login' ? (
                                <LoginForm onSwitchToRegister={() => switchMode('register')} />
                              ) : (
                                <RegisterForm onSwitchToLogin={() => switchMode('login')} />
                              )}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="social-buttons"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="text-center py-5">
                                <p className="text-gray-500 dark:text-gray-400 text-sm m-0">
                                  选择登录方式
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* 错误信息 */}
                        <div aria-live="polite" role="alert" aria-atomic="true" tabIndex={-1} className="text-sm text-red-500 text-center hidden w-full my-3"></div>
                      </div>
                    </div>

                    {/* 底部链接 */}
                    <div className="w-full mb-0 text-xs leading-4 text-gray-500 dark:text-gray-400 text-center text-balance">
                      <p className="mb-0">
                        继续操作即表示你确认已理解并同意
                        <a href="#" target="_blank" rel="noopener noreferrer" className="inline text-blue-500 underline select-auto cursor-pointer">条款和条件</a>
                        和
                        <a href="#" target="_blank" rel="noopener noreferrer" className="inline text-blue-500 underline select-auto cursor-pointer">隐私政策</a>
                      </p>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1"></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
    </>
  );
}