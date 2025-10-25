/**
 * 本地开发认证系统
 * 提供默认账户和模拟登录功能
 */

import { User } from '@supabase/supabase-js';

/**
 * 默认用户账户
 */
export const MOCK_USERS = {
  admin: {
    id: 'mock-admin-001',
    email: 'admin@linguaflow.com',
    username: 'admin',
    displayName: '管理员',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    level: 50,
    experience: 5000,
    streakDays: 30,
    permissions: ['create_post', 'create_quest', 'edit_profile', 'admin'],
  },
  user: {
    id: 'mock-user-001',
    email: 'user@linguaflow.com',
    username: 'user',
    displayName: '普通用户',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    level: 10,
    experience: 1000,
    streakDays: 7,
    permissions: ['create_post', 'create_quest', 'edit_profile'],
  },
  guest: {
    id: 'mock-guest-001',
    email: 'guest@linguaflow.com',
    username: 'guest',
    displayName: '访客',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
    level: 1,
    experience: 0,
    streakDays: 0,
    permissions: [],
  },
};

export type MockUserType = keyof typeof MOCK_USERS;

/**
 * 模拟用户会话
 */
export interface MockSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

/**
 * 创建模拟用户对象
 */
export function createMockUser(userType: MockUserType): User {
  const mockUser = MOCK_USERS[userType];
  
  return {
    id: mockUser.id,
    email: mockUser.email,
    user_metadata: {
      username: mockUser.username,
      display_name: mockUser.displayName,
      avatar_url: mockUser.avatarUrl,
      level: mockUser.level,
      experience: mockUser.experience,
      streak_days: mockUser.streakDays,
      permissions: mockUser.permissions,
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * 创建模拟会话
 */
export function createMockSession(userType: MockUserType): MockSession {
  const user = createMockUser(userType);
  const expiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24小时后过期
  
  return {
    user,
    access_token: `mock_token_${userType}_${Date.now()}`,
    refresh_token: `mock_refresh_${userType}_${Date.now()}`,
    expires_at: expiresAt,
  };
}

/**
 * 检查是否为本地开发环境
 */
export function isLocalDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' && 
         process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true';
}

/**
 * 获取默认用户类型
 */
export function getDefaultUserType(): MockUserType {
  const userType = process.env.NEXT_PUBLIC_MOCK_USER_TYPE as MockUserType;
  return userType && MOCK_USERS[userType] ? userType : 'user';
}

/**
 * 模拟登录
 */
export function mockSignIn(userType: MockUserType = getDefaultUserType()): MockSession {
  if (!isLocalDevelopment()) {
    throw new Error('Mock authentication is only available in development mode');
  }
  
  const session = createMockSession(userType);
  
  // 存储到 sessionStorage
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('mock_session', JSON.stringify(session));
    sessionStorage.setItem('mock_user_type', userType);
  }
  
  return session;
}

/**
 * 模拟登出
 */
export function mockSignOut(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('mock_session');
    sessionStorage.removeItem('mock_user_type');
  }
}

/**
 * 获取当前模拟会话
 */
export function getMockSession(): MockSession | null {
  if (!isLocalDevelopment() || typeof window === 'undefined') {
    return null;
  }
  
  try {
    const sessionData = sessionStorage.getItem('mock_session');
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    
    // 检查是否过期
    if (session.expires_at && Date.now() / 1000 > session.expires_at) {
      mockSignOut();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Failed to parse mock session:', error);
    mockSignOut();
    return null;
  }
}

/**
 * 获取当前用户类型
 */
export function getCurrentUserType(): MockUserType | null {
  if (typeof window === 'undefined') return null;
  
  const userType = sessionStorage.getItem('mock_user_type') as MockUserType;
  return userType && MOCK_USERS[userType] ? userType : null;
}

/**
 * 检查用户权限
 */
export function hasMockPermission(permission: string): boolean {
  const session = getMockSession();
  if (!session) return false;
  
  const permissions = session.user.user_metadata?.permissions || [];
  return permissions.includes(permission);
}

/**
 * 切换用户类型
 */
export function switchMockUser(userType: MockUserType): MockSession {
  return mockSignIn(userType);
}
