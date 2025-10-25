/**
 * Feed Card Detail API Routes
 * GET /api/feed/[id] - 获取卡片详情
 * PUT /api/feed/[id] - 更新卡片
 * DELETE /api/feed/[id] - 删除卡片
 */

import { NextRequest, NextResponse } from 'next/server';
import { FeedService } from '@/lib/api/services/feed.service';
import { authenticate, optionalAuthenticate } from '@/lib/api/middleware/auth.middleware';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/api/middleware/cors.middleware';
import { handleApiError } from '@/lib/api/middleware/error.middleware';
import { logRequest, logResponse, addRequestIdHeader } from '@/lib/api/middleware/logger.middleware';
import { createSuccessResponse } from '@/lib/api/types/response';

export async function OPTIONS(request: NextRequest) {
  return handleOptionsRequest(request);
}

/**
 * GET /api/feed/[id]
 * 获取卡片详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestLog = logRequest(request);
  
  try {
    const authContext = await optionalAuthenticate(request);
    const { id: cardId } = await params;
    
    const feedService = new FeedService();
    const card = await feedService.getCardById(cardId, authContext?.userId);
    
    const response = NextResponse.json(createSuccessResponse(card));
    
    addCorsHeaders(response, request);
    addRequestIdHeader(response, requestLog.requestId);
    logResponse(requestLog, response, startTime);
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/feed/[id]
 * 更新卡片
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestLog = logRequest(request);
  
  try {
    const authContext = await authenticate(request);
    const { id: cardId } = await params;
    const body = await request.json();
    
    const feedService = new FeedService();
    const card = await feedService.updateCard(cardId, authContext.userId, body);
    
    const response = NextResponse.json(
      createSuccessResponse(card, '更新成功')
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
 * DELETE /api/feed/[id]
 * 删除卡片
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestLog = logRequest(request);
  
  try {
    const authContext = await authenticate(request);
    const { id: cardId } = await params;
    
    const feedService = new FeedService();
    await feedService.deleteCard(cardId, authContext.userId);
    
    const response = NextResponse.json(
      createSuccessResponse(null, '删除成功'),
      { status: 204 }
    );
    
    addCorsHeaders(response, request);
    addRequestIdHeader(response, requestLog.requestId);
    logResponse(requestLog, response, startTime);
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

