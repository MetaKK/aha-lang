/**
 * Feed API Routes
 * GET /api/feed - 获取Feed流
 * POST /api/feed - 创建新卡片
 */

import { NextRequest, NextResponse } from 'next/server';
import { FeedService } from '@/lib/api/services/feed.service';
import { authenticate, optionalAuthenticate } from '@/lib/api/middleware/auth.middleware';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/api/middleware/cors.middleware';
import { handleApiError } from '@/lib/api/middleware/error.middleware';
import { logRequest, logResponse, addRequestIdHeader } from '@/lib/api/middleware/logger.middleware';
import { createSuccessResponse, createPaginatedResponse } from '@/lib/api/types/response';
import { contentCreationToRequest } from '@/lib/api/types/dto';

/**
 * OPTIONS - 处理CORS预检请求
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptionsRequest(request);
}

/**
 * GET /api/feed
 * 获取Feed流（公开访问，但会获取用户状态）
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestLog = logRequest(request);
  
  try {
    // 可选认证（允许匿名访问）
    const authContext = await optionalAuthenticate(request);
    
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const type = searchParams.get('type') || undefined;
    const difficulty = searchParams.get('difficulty') 
      ? parseInt(searchParams.get('difficulty')!) 
      : undefined;
    const tags = searchParams.get('tags')?.split(',') || undefined;
    
    // 调用Service
    const feedService = new FeedService();
    const result = await feedService.getFeed({
      page,
      pageSize,
      type,
      difficulty,
      tags,
    });
    
    // 返回分页响应
    const response = NextResponse.json(
      createPaginatedResponse(result.cards, page, pageSize, result.total)
    );
    
    // 添加中间件处理
    addCorsHeaders(response, request);
    addRequestIdHeader(response, requestLog.requestId);
    logResponse(requestLog, response, startTime);
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/feed
 * 创建新卡片（需要认证）
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestLog = logRequest(request);
  
  try {
    // 必须认证
    const authContext = await authenticate(request);
    
    // 解析请求体
    const body = await request.json();
    
    // 转换为标准请求格式
    const createRequest = contentCreationToRequest(body);
    
    // 调用Service
    const feedService = new FeedService();
    const card = await feedService.createCard(authContext.userId, createRequest);
    
    // 返回成功响应
    const response = NextResponse.json(
      createSuccessResponse(card, '创建成功'),
      { status: 201 }
    );
    
    // 添加中间件处理
    addCorsHeaders(response, request);
    addRequestIdHeader(response, requestLog.requestId);
    logResponse(requestLog, response, startTime);
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

