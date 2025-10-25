import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要认证的路由
const protectedRoutes = [
  '/',
  '/post',
  '/profile',
  '/settings',
];

// 公开路由（不需要认证）
const publicRoutes = [
  '/auth',
  '/api/auth',
];

// 认证回调路由
const authCallbackRoutes = [
  '/auth/callback',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // 检查是否是公开路由
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // 检查是否是认证回调路由
  const isAuthCallback = authCallbackRoutes.some(route => 
    pathname.startsWith(route)
  );

  // 如果是认证回调，直接通过
  if (isAuthCallback) {
    return NextResponse.next();
  }

  // 如果是公开路由，直接通过
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 如果是受保护的路由，检查认证状态
  if (isProtectedRoute) {
    // 检查Supabase认证token
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;
    
    // 如果没有有效的认证token，重定向到登录页面
    if (!accessToken && !refreshToken) {
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
