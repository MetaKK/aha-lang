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
      <div className="min-h-screen" style={{ backgroundColor: '#ffffff', scrollbarColor: 'rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.05)' }}>
      {/* 顶部导航栏 */}
      <div style={{ position: 'fixed', zIndex: 99, fontFamily: 'inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"', width: '100%' }}>
        <div style={{ fontSize: '15px', whiteSpace: 'nowrap', top: '0px', width: '100%', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'none', paddingInline: '20px' }}>
          <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '54px' }}>
            <div style={{ flexShrink: 0 }}>
              <a href="/" rel="noopener noreferrer" aria-label="AhaBook" style={{ display: 'block', color: 'inherit', textDecoration: 'none', userSelect: 'auto', cursor: 'pointer' }}>
                <div style={{ 
                  fontWeight: 500, 
                  fontSize: '24px',
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 25%, #2563eb 50%, #1d4ed8 75%, #1e40af 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  backgroundSize: '200% 200%',
                  animation: 'gradientShift 3s ease-in-out infinite'
                }}>
                  AhaBook
                </div>
              </a>
            </div>
            <div style={{ cursor: 'pointer', color: '#8E8E93', fontWeight: '500' }}>帮助</div>
          </nav>
        </div>
      </div>

      {/* 占位空间 */}
      <div style={{ width: '100%', height: '54px', flexShrink: 0, flexGrow: 0 }}></div>

      {/* 主要内容 */}
      <main style={{ color: '#1D1D1F', fill: 'currentcolor', lineHeight: 1.5, fontFamily: 'inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"', background: '#ffffff', fontSize: '17px', WebkitFontSmoothing: 'antialiased', minHeight: '0px', flexGrow: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%', maxHeight: '100vh' }}>
          <section style={{ paddingInline: '20px', width: '100%', margin: '0px auto', overflow: 'visible' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '4px' }}>
              <div style={{ width: '100%', maxWidth: '1260px', margin: '0px auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ minHeight: '4vh', flex: '1 1 0%' }}></div>
                  
                  {/* 标题区域 */}
                  <AuthHeader 
                    title={mode === 'login' ? '登录你的账户' : '创建你的账户'}
                    subtitle={mode === 'login' ? '欢迎回来，请登录你的账户' : '加入我们，开始你的学习之旅'}
                  />

                  {/* 登录卡片 */}
                  <div className="notion-login" style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '4vh' }}>
                    <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
                      
                      {/* 社交登录按钮 */}
                      <SocialLoginSection 
                        onEmailLogin={handleEmailLogin}
                      />

                      {/* 分隔线 */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', width: '100%', height: '41px', flex: '0 0 auto' }}>
                          <div role="separator" style={{ width: '100%', height: '1px', visibility: 'visible', borderBottom: '1px solid var(--c-borSec)' }}></div>
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
                              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <p style={{ color: '#8E8E93', fontSize: '14px', margin: 0 }}>
                                  选择登录方式
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* 错误信息 */}
                        <div aria-live="polite" role="alert" aria-atomic="true" tabIndex={-1} style={{ fontSize: '14px', color: 'rgb(235, 87, 87)', textAlign: 'center', display: 'none', width: '100%', margin: '12px 0px' }}></div>
                      </div>
                    </div>

                    {/* 底部链接 */}
                    <div style={{ width: '100%', marginBottom: '0px', fontSize: '12px', lineHeight: '16px', color: '#8E8E93', textAlign: 'center', textWrap: 'balance' }}>
                      <p style={{ marginBottom: '0px' }}>
                        继续操作即表示你确认已理解并同意
                        <a href="#" target="_blank" rel="noopener noreferrer" style={{ display: 'inline', color: '#007AFF', textDecoration: 'underline', userSelect: 'auto', cursor: 'pointer' }}>条款和条件</a>
                        和
                        <a href="#" target="_blank" rel="noopener noreferrer" style={{ display: 'inline', color: '#007AFF', textDecoration: 'underline', userSelect: 'auto', cursor: 'pointer' }}>隐私政策</a>
                      </p>
                    </div>
                  </div>

                  <div style={{ minHeight: '0px', flex: '1 1 0%' }}></div>
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