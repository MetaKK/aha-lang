'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5分钟缓存，减少不必要的请求
            gcTime: 10 * 60 * 1000, // 10分钟垃圾回收
            refetchOnWindowFocus: false, // 避免窗口聚焦时重复请求
            refetchOnReconnect: true, // 网络重连时刷新
            retry: (failureCount, error: any) => {
              // 智能重试策略
              if (failureCount >= 2) return false;
              if (error?.status === 404) return false;
              if (error?.status >= 500) return true;
              return false;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1, // 操作只重试1次
            retryDelay: 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
