/**
 * Quest API Routes
 * GET /api/quests/[id] - 获取Quest详情
 */

import { NextRequest, NextResponse } from 'next/server';
import { QuestService } from '@/lib/api/services/quest.service';
import { optionalAuthenticate } from '@/lib/api/middleware/auth.middleware';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/api/middleware/cors.middleware';
import { handleApiError } from '@/lib/api/middleware/error.middleware';
import { logRequest, logResponse, addRequestIdHeader } from '@/lib/api/middleware/logger.middleware';
import { createSuccessResponse } from '@/lib/api/types/response';

export async function OPTIONS(request: NextRequest) {
  return handleOptionsRequest(request);
}

/**
 * GET /api/quests/[id]
 * 获取Quest详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestLog = logRequest(request);
  
  try {
    await optionalAuthenticate(request);
    const { id: questId } = await params;
    
    const questService = new QuestService();
    const quest = await questService.getQuestById(questId);
    
    const response = NextResponse.json(createSuccessResponse(quest));
    
    addCorsHeaders(response, request);
    addRequestIdHeader(response, requestLog.requestId);
    logResponse(requestLog, response, startTime);
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

