// Supabase Client for Browser
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { createMockSupabaseClient } from '@/lib/auth/mock-supabase';
import { isLocalDevelopment } from '@/lib/auth/mock-auth';

// 检查是否启用后端同步
export const isBackendSyncEnabled = () => {
  return process.env.NEXT_PUBLIC_ENABLE_BACKEND_SYNC === 'true';
};

// 检查是否启用模拟认证
export const isMockAuthEnabled = () => {
  return process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true';
};

// 创建Supabase客户端
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;
let mockClient: ReturnType<typeof createMockSupabaseClient> | null = null;

export function getSupabaseClient() {
  // 如果启用了模拟认证，返回模拟客户端
  if (isMockAuthEnabled() && isLocalDevelopment()) {
    if (!mockClient) {
      mockClient = createMockSupabaseClient();
      console.log('[Supabase] Mock authentication enabled');
    }
    return mockClient as any;
  }

  // 如果未启用后端同步，返回null（但允许Mock Auth在预览环境工作）
  if (!isBackendSyncEnabled()) {
    // 在预览环境且启用了Mock Auth时，也返回Mock客户端
    if (process.env.VERCEL_ENV === 'preview' && isMockAuthEnabled()) {
      if (!mockClient) {
        mockClient = createMockSupabaseClient();
        console.log('[Supabase] Mock authentication enabled in preview');
      }
      return mockClient as any;
    }
    console.log('[Supabase] Backend sync disabled, using mock data');
    return null;
  }

  // 如果已经创建了客户端，直接返回
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '[Supabase] Missing environment variables:',
      {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
      }
    );
    return null;
  }

  supabaseClient = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          if (typeof document !== 'undefined') {
            const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
            return match ? decodeURIComponent(match[2]) : null;
          }
          return null;
        },
        set(name: string, value: string, options: any) {
          if (typeof document !== 'undefined') {
            let cookie = `${name}=${encodeURIComponent(value)}`;
            if (options?.maxAge) cookie += `; max-age=${options.maxAge}`;
            if (options?.path) cookie += `; path=${options.path}`;
            if (options?.domain) cookie += `; domain=${options.domain}`;
            if (options?.sameSite) cookie += `; samesite=${options.sameSite}`;
            if (options?.secure) cookie += '; secure';
            document.cookie = cookie;
          }
        },
        remove(name: string, options: any) {
          if (typeof document !== 'undefined') {
            this.set(name, '', { ...options, maxAge: 0 });
          }
        },
      },
    }
  );

  console.log('[Supabase] Client initialized successfully');
  return supabaseClient;
}

// 导出单例
export const supabase = getSupabaseClient();

// 为了兼容性，导出 createClient 别名
export const createClient = getSupabaseClient;

