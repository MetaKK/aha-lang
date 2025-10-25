/**
 * CORS中间件
 * 处理跨域请求
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS配置
 */
interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders?: string[];
  credentials: boolean;
  maxAge?: number;
}

/**
 * 默认CORS配置
 */
const defaultConfig: CorsConfig = {
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://*.vercel.app',
    // 微信小程序域名
    'https://servicewechat.com',
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Request-ID', 'X-Total-Count'],
  credentials: true,
  maxAge: 86400, // 24小时
};

/**
 * 检查Origin是否允许
 */
function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.some((allowed) => {
    if (allowed === '*') return true;
    if (allowed.includes('*')) {
      const pattern = new RegExp(
        '^' + allowed.replace(/\*/g, '.*').replace(/\./g, '\\.') + '$'
      );
      return pattern.test(origin);
    }
    return allowed === origin;
  });
}

/**
 * 添加CORS头
 */
export function addCorsHeaders(
  response: NextResponse,
  request: NextRequest,
  config: CorsConfig = defaultConfig
): NextResponse {
  const origin = request.headers.get('origin') || '';
  
  // 检查Origin是否允许
  if (origin && isOriginAllowed(origin, config.allowedOrigins)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  // 设置其他CORS头
  response.headers.set(
    'Access-Control-Allow-Methods',
    config.allowedMethods.join(', ')
  );
  
  response.headers.set(
    'Access-Control-Allow-Headers',
    config.allowedHeaders.join(', ')
  );
  
  if (config.exposedHeaders) {
    response.headers.set(
      'Access-Control-Expose-Headers',
      config.exposedHeaders.join(', ')
    );
  }
  
  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  if (config.maxAge) {
    response.headers.set('Access-Control-Max-Age', config.maxAge.toString());
  }
  
  return response;
}

/**
 * 处理OPTIONS预检请求
 */
export function handleOptionsRequest(
  request: NextRequest,
  config: CorsConfig = defaultConfig
): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response, request, config);
}

