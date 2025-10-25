/**
 * 日志中间件
 * 记录API请求和响应
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * 请求日志
 */
export interface RequestLog {
  requestId: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  userId?: string;
  timestamp: string;
  duration?: number;
  statusCode?: number;
}

/**
 * 生成请求ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 记录请求
 */
export function logRequest(
  request: NextRequest,
  userId?: string
): RequestLog {
  const requestId = generateRequestId();
  
  const log: RequestLog = {
    requestId,
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    userId,
    timestamp: new Date().toISOString(),
  };
  
  // 开发环境下打印详细日志
  if (process.env.NODE_ENV === 'development') {
    console.log('📥 API Request:', {
      id: requestId,
      method: request.method,
      url: request.url,
      userId,
    });
  }
  
  return log;
}

/**
 * 记录响应
 */
export function logResponse(
  log: RequestLog,
  response: NextResponse,
  startTime: number
): void {
  const duration = Date.now() - startTime;
  log.duration = duration;
  log.statusCode = response.status;
  
  // 开发环境下打印详细日志
  if (process.env.NODE_ENV === 'development') {
    const emoji = response.status < 400 ? '✅' : '❌';
    console.log(`${emoji} API Response:`, {
      id: log.requestId,
      status: response.status,
      duration: `${duration}ms`,
    });
  }
  
  // 生产环境下只记录错误
  if (process.env.NODE_ENV === 'production' && response.status >= 400) {
    console.error('API Error:', {
      ...log,
      duration: `${duration}ms`,
    });
  }
}

/**
 * 添加请求ID到响应头
 */
export function addRequestIdHeader(
  response: NextResponse,
  requestId: string
): NextResponse {
  response.headers.set('X-Request-ID', requestId);
  return response;
}

