/**
 * Interactions API Routes
 * POST /api/interactions - 创建互动（点赞、评论等）
 * DELETE /api/interactions - 删除互动
 */

import { NextRequest, NextResponse } from 'next/server';
import { InteractionService } from '@/lib/api/services/interaction.service';
import { authenticate } from '@/lib/api/middleware/auth.middleware';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/api/middleware/cors.middleware';
import { handleApiError } from '@/lib/api/middleware/error.middleware';
import { logRequest, logResponse, addRequestIdHeader } from '@/lib/api/middleware/logger.middleware';
import { createSuccessResponse } from '@/lib/api/types/response';

export async function OPTIONS(request: NextRequest) {
  return handleOptionsRequest(request);
}

/**
 * POST /api/interactions
 * 创建互动
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestLog = logRequest(request);
  
  try {
    const authContext = await authenticate(request);
    const body = await request.json();
    
    const interactionService = new InteractionService();
    const interaction = await interactionService.createInteraction(
      authContext.userId,
      body
    );
    
    const response = NextResponse.json(
      createSuccessResponse(interaction, '操作成功'),
      { status: 201 }
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
 * DELETE /api/interactions
 * 删除互动（取消点赞、取消收藏等）
 */
export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  const requestLog = logRequest(request);
  
  try {
    const authContext = await authenticate(request);
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');
    const type = searchParams.get('type');
    
    if (!targetId || !type) {
      throw new Error('缺少必要参数');
    }
    
    const interactionService = new InteractionService();
    await interactionService.deleteInteraction(
      authContext.userId,
      targetId,
      type
    );
    
    const response = NextResponse.json(
      createSuccessResponse(null, '操作成功'),
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

