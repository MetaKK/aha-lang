/**
 * Quest Submit API Route
 * POST /api/quests/submit - 提交Quest答案
 */

import { NextRequest, NextResponse } from 'next/server';
import { QuestService } from '@/lib/api/services/quest.service';
import { authenticate } from '@/lib/api/middleware/auth.middleware';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/api/middleware/cors.middleware';
import { handleApiError } from '@/lib/api/middleware/error.middleware';
import { logRequest, logResponse, addRequestIdHeader } from '@/lib/api/middleware/logger.middleware';
import { createSuccessResponse } from '@/lib/api/types/response';

export async function OPTIONS(request: NextRequest) {
  return handleOptionsRequest(request);
}

/**
 * POST /api/quests/submit
 * 提交Quest答案
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestLog = logRequest(request);
  
  try {
    const authContext = await authenticate(request);
    const body = await request.json();
    
    const questService = new QuestService();
    const result = await questService.submitQuestResult(authContext.userId, body);
    
    const response = NextResponse.json(
      createSuccessResponse(result, '提交成功'),
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

