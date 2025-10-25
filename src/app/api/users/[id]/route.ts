/**
 * User API Routes
 * GET /api/users/[id] - 获取用户资料
 * PUT /api/users/[id] - 更新用户资料
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/api/services/user.service';
import { authenticate, optionalAuthenticate } from '@/lib/api/middleware/auth.middleware';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/api/middleware/cors.middleware';
import { handleApiError } from '@/lib/api/middleware/error.middleware';
import { logRequest, logResponse, addRequestIdHeader } from '@/lib/api/middleware/logger.middleware';
import { createSuccessResponse, ApiException, ErrorCode, HttpStatus } from '@/lib/api/types/response';

export async function OPTIONS(request: NextRequest) {
  return handleOptionsRequest(request);
}

/**
 * GET /api/users/[id]
 * 获取用户资料
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestLog = logRequest(request);
  
  try {
    await optionalAuthenticate(request);
    const { id: userId } = await params;
    
    const userService = new UserService();
    const profile = await userService.getUserProfile(userId);
    const stats = await userService.getUserStats(userId);
    
    const response = NextResponse.json(
      createSuccessResponse({ profile, stats })
    );
    
    addCorsHeaders(response, request);
    addRequestIdHeader(response, requestLog.requestId);
    logResponse(requestLog, response, startTime);
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/users/[id]
 * 更新用户资料
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestLog = logRequest(request);
  
  try {
    const authContext = await authenticate(request);
    const { id: userId } = await params;
    
    // 只能更新自己的资料
    if (authContext.userId !== userId) {
      throw new ApiException(
        ErrorCode.FORBIDDEN,
        '无权修改其他用户资料',
        HttpStatus.FORBIDDEN
      );
    }
    
    const body = await request.json();
    
    const userService = new UserService();
    const profile = await userService.updateUserProfile(userId, body);
    
    const response = NextResponse.json(
      createSuccessResponse(profile, '更新成功')
    );
    
    addCorsHeaders(response, request);
    addRequestIdHeader(response, requestLog.requestId);
    logResponse(requestLog, response, startTime);
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

