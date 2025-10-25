// Supabase Client for Browser
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// 检查是否启用后端同步
export const isBackendSyncEnabled = () => {
  return process.env.NEXT_PUBLIC_ENABLE_BACKEND_SYNC === 'true';
};

// 创建Supabase客户端
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseClient() {
  // 如果未启用后端同步，返回null
  if (!isBackendSyncEnabled()) {
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

