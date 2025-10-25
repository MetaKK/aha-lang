/**
 * 模拟 Supabase 客户端
 * 在本地开发时提供模拟的认证功能
 */

import { createMockUser, createMockSession, getMockSession, isLocalDevelopment, MockUserType } from './mock-auth';
import type { User, Session, AuthResponse } from '@supabase/supabase-js';

/**
 * 模拟 Supabase Auth 客户端
 */
export class MockSupabaseAuth {
  private currentSession: Session | null = null;

  constructor() {
    // 在开发环境中自动加载模拟会话
    if (isLocalDevelopment() && typeof window !== 'undefined') {
      this.loadMockSession();
    }
  }

  private loadMockSession() {
    const mockSession = getMockSession();
    if (mockSession) {
      this.currentSession = {
        user: mockSession.user,
        access_token: mockSession.access_token,
        refresh_token: mockSession.refresh_token,
        expires_at: mockSession.expires_at,
        expires_in: mockSession.expires_at - Math.floor(Date.now() / 1000),
        token_type: 'bearer',
      };
    }
  }

  /**
   * 模拟登录
   */
  async signInWithPassword(credentials: { email: string; password: string }): Promise<AuthResponse> {
    if (!isLocalDevelopment()) {
      throw new Error('Mock authentication is only available in development mode');
    }

    // 根据邮箱确定用户类型
    let userType: MockUserType = 'user';
    if (credentials.email.includes('admin')) {
      userType = 'admin';
    } else if (credentials.email.includes('guest')) {
      userType = 'guest';
    }

    const mockSession = createMockSession(userType);
    this.currentSession = {
      user: mockSession.user,
      access_token: mockSession.access_token,
      refresh_token: mockSession.refresh_token,
      expires_at: mockSession.expires_at,
      expires_in: mockSession.expires_at - Math.floor(Date.now() / 1000),
      token_type: 'bearer',
    };

    return {
      data: {
        user: mockSession.user,
        session: this.currentSession,
      },
      error: null,
    };
  }

  /**
   * 模拟注册
   */
  async signUp(credentials: { email: string; password: string }): Promise<AuthResponse> {
    if (!isLocalDevelopment()) {
      throw new Error('Mock authentication is only available in development mode');
    }

    // 创建新用户
    const newUser = createMockUser('user');
    const mockSession = createMockSession('user');
    
    this.currentSession = {
      user: mockSession.user,
      access_token: mockSession.access_token,
      refresh_token: mockSession.refresh_token,
      expires_at: mockSession.expires_at,
      expires_in: mockSession.expires_at - Math.floor(Date.now() / 1000),
      token_type: 'bearer',
    };

    return {
      data: {
        user: mockSession.user,
        session: this.currentSession,
      },
      error: null,
    };
  }

  /**
   * 模拟登出
   */
  async signOut(): Promise<{ error: null }> {
    this.currentSession = null;
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('mock_session');
      sessionStorage.removeItem('mock_user_type');
    }

    return { error: null };
  }

  /**
   * 获取当前用户
   */
  async getUser(): Promise<{ data: { user: User | null }; error: null }> {
    return {
      data: { user: this.currentSession?.user || null },
      error: null,
    };
  }

  /**
   * 获取当前会话
   */
  async getSession(): Promise<{ data: { session: Session | null }; error: null }> {
    return {
      data: { session: this.currentSession },
      error: null,
    };
  }

  /**
   * 刷新会话
   */
  async refreshSession(): Promise<AuthResponse> {
    if (!this.currentSession) {
      return {
        data: { user: null, session: null },
        error: null,
      };
    }

    // 模拟刷新，延长过期时间
    const newExpiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
    this.currentSession.expires_at = newExpiresAt;
    this.currentSession.expires_in = newExpiresAt - Math.floor(Date.now() / 1000);

    return {
      data: {
        user: this.currentSession.user,
        session: this.currentSession,
      },
      error: null,
    };
  }

  /**
   * 监听认证状态变化
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    // 模拟状态变化
    if (this.currentSession) {
      callback('SIGNED_IN', this.currentSession);
    } else {
      callback('SIGNED_OUT', null);
    }

    // 返回取消监听的函数
    return () => {};
  }
}

/**
 * 创建模拟 Supabase 客户端
 */
export function createMockSupabaseClient() {
  return {
    auth: new MockSupabaseAuth(),
    // 其他 Supabase 功能可以在这里添加
  };
}
