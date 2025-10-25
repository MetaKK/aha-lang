/*
 * @Author: meta-kk 11097094+teacher-kk@user.noreply.gitee.com
 * @Date: 2025-10-25 11:40:57
 * @LastEditors: meta-kk 11097094+teacher-kk@user.noreply.gitee.com
 * @LastEditTime: 2025-10-25 12:16:40
 * @FilePath: /aha-lang/src/contexts/auth-context.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getMockSession, isLocalDevelopment } from '@/lib/auth/mock-auth';
import type { AuthContextType, User, Profile, AuthError } from '@/types/auth';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  // 转换Supabase用户为内部用户类型
  const transformUser = (supabaseUser: SupabaseUser): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    email_confirmed_at: supabaseUser.email_confirmed_at || undefined,
    created_at: supabaseUser.created_at,
    updated_at: supabaseUser.updated_at || supabaseUser.created_at,
  });

  // 获取用户资料（带缓存）
  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, [supabase]);

  // 刷新用户信息
  const refreshUser = useCallback(async () => {
    if (!supabase) return;

    try {
      setLoading(true);
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error getting user:', error);
        setUser(null);
        setProfile(null);
        return;
      }

      if (supabaseUser) {
        const transformedUser = transformUser(supabaseUser);
        setUser(transformedUser);
        
        // 获取用户资料
        const userProfile = await fetchProfile(supabaseUser.id);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchProfile]);

  // 初始化认证状态
  useEffect(() => {
    // 检查是否为本地开发且启用了模拟认证
    if (isLocalDevelopment() && process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true') {
      // 使用模拟认证
      const mockSession = getMockSession();
      if (mockSession) {
        const transformedUser = transformUser(mockSession.user);
        setUser(transformedUser);
        
        // 创建模拟用户资料
        const mockProfile: Profile = {
          id: mockSession.user.id,
          username: mockSession.user.user_metadata?.username || 'mock_user',
          display_name: mockSession.user.user_metadata?.display_name || 'Mock User',
          avatar_url: mockSession.user.user_metadata?.avatar_url || null,
          level: mockSession.user.user_metadata?.level || 1,
          experience: mockSession.user.user_metadata?.experience || 0,
          streak_days: mockSession.user.user_metadata?.streak_days || 0,
          last_active_at: new Date().toISOString(),
          created_at: mockSession.user.created_at,
          updated_at: mockSession.user.updated_at || mockSession.user.created_at,
        };
        setProfile(mockProfile);
      }
      setLoading(false);
      return;
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    // 获取初始用户状态
    refreshUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const transformedUser = transformUser(session.user);
          setUser(transformedUser);
          
          // 获取用户资料
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
          
          toast.success('登录成功！');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          toast.success('已退出登录');
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const transformedUser = transformUser(session.user);
          setUser(transformedUser);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, refreshUser, fetchProfile]);

  // 用户注册
  const signUp = useCallback(async (email: string, password: string, username: string) => {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      setLoading(true);
      setError(null);

      // 注册用户
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // 创建用户资料
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username,
            display_name: username,
            level: 1,
            experience: 0,
            streak_days: 0,
          } as any);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        toast.success('注册成功！请检查邮箱验证链接');
      }
    } catch (err: any) {
      let errorMessage = '注册失败';
      
      // 详细的错误处理
      if (err.message?.includes('User already registered')) {
        errorMessage = '该邮箱已被注册';
      } else if (err.message?.includes('Password should be at least')) {
        errorMessage = '密码至少需要6位字符';
      } else if (err.message?.includes('Invalid email')) {
        errorMessage = '邮箱格式不正确';
      } else if (err.message?.includes('Username already taken')) {
        errorMessage = '用户名已被使用';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 用户登录
  const signIn = useCallback(async (email: string, password: string) => {
    // 检查是否为模拟认证模式
    if (isLocalDevelopment() && process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true') {
      try {
        setLoading(true);
        setError(null);

        // 模拟登录延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        // 根据邮箱确定用户类型
        let userType: 'admin' | 'user' | 'guest' = 'user';
        if (email.includes('admin')) {
          userType = 'admin';
        } else if (email.includes('guest')) {
          userType = 'guest';
        }

        // 使用模拟认证
        const { mockSignIn } = await import('@/lib/auth/mock-auth');
        const mockSession = mockSignIn(userType);
        
        const transformedUser = transformUser(mockSession.user);
        setUser(transformedUser);
        
        // 创建模拟用户资料
        const mockProfile: Profile = {
          id: mockSession.user.id,
          username: mockSession.user.user_metadata?.username || 'mock_user',
          display_name: mockSession.user.user_metadata?.display_name || 'Mock User',
          avatar_url: mockSession.user.user_metadata?.avatar_url || null,
          level: mockSession.user.user_metadata?.level || 1,
          experience: mockSession.user.user_metadata?.experience || 0,
          streak_days: mockSession.user.user_metadata?.streak_days || 0,
          last_active_at: new Date().toISOString(),
          created_at: mockSession.user.created_at,
          updated_at: mockSession.user.updated_at || mockSession.user.created_at,
        };
        setProfile(mockProfile);
        
        toast.success('模拟登录成功！');
      } catch (err: any) {
        const errorMessage = err.message || '模拟登录失败';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const transformedUser = transformUser(data.user);
        setUser(transformedUser);
        
        // 获取用户资料
        const userProfile = await fetchProfile(data.user.id);
        setProfile(userProfile);
        
        toast.success('登录成功！');
      }
    } catch (err: any) {
      let errorMessage = '登录失败';
      
      // 详细的错误处理
      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = '邮箱或密码错误';
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = '请先验证邮箱地址';
      } else if (err.message?.includes('Too many requests')) {
        errorMessage = '登录尝试过于频繁，请稍后再试';
      } else if (err.message?.includes('User not found')) {
        errorMessage = '用户不存在';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchProfile]);

  // 用户登出
  const signOut = useCallback(async () => {
    // 检查是否为模拟认证模式
    if (isLocalDevelopment() && process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true') {
      try {
        setLoading(true);
        
        // 使用模拟登出
        const { mockSignOut } = await import('@/lib/auth/mock-auth');
        mockSignOut();
        
        setUser(null);
        setProfile(null);
        toast.success('模拟登出成功！');
      } catch (err: any) {
        const errorMessage = err.message || '模拟登出失败';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setProfile(null);
      toast.success('已退出登录');
    } catch (err: any) {
      const errorMessage = err.message || '登出失败';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 更新用户资料
  const updateProfile = useCallback(async (data: Partial<Profile>) => {
    if (!supabase || !user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // 刷新用户资料
      const updatedProfile = await fetchProfile(user.id);
      setProfile(updatedProfile);
      
      toast.success('资料更新成功！');
    } catch (err: any) {
      const errorMessage = err.message || '更新失败';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase, user, fetchProfile]);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 认证Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
