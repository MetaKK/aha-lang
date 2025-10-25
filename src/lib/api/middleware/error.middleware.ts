/**
 * 错误处理中间件
 * 统一处理API错误
 */

import { NextResponse } from 'next/server';
import {
  ApiException,
  createErrorResponse,
  ErrorCode,
  HttpStatus,
} from '../types/response';

/**
 * 处理API异常
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  // 处理自定义API异常
  if (error instanceof ApiException) {
    return NextResponse.json(
      createErrorResponse(
        error.code,
        error.message,
        error.details,
        error.field
      ),
      { status: error.statusCode }
    );
  }
  
  // 处理Supabase错误
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as any;
    return NextResponse.json(
      createErrorResponse(
        ErrorCode.DATABASE_ERROR,
        supabaseError.message || '数据库操作失败',
        supabaseError
      ),
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
  
  // 处理验证错误
  if (error instanceof Error && error.name === 'ValidationError') {
    return NextResponse.json(
      createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        error.message
      ),
      { status: HttpStatus.UNPROCESSABLE_ENTITY }
    );
  }
  
  // 处理未知错误
  return NextResponse.json(
    createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      '服务器内部错误',
      process.env.NODE_ENV === 'development' ? error : undefined
    ),
    { status: HttpStatus.INTERNAL_SERVER_ERROR }
  );
}

/**
 * 异步错误处理包装器
 */
export function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  return handler().catch(handleApiError);
}

