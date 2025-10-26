/*
 * @Author: meta-kk 11097094+teacher-kk@user.noreply.gitee.com
 * @Date: 2025-10-25 18:01:36
 * @LastEditors: meta-kk 11097094+teacher-kk@user.noreply.gitee.com
 * @LastEditTime: 2025-10-27 01:13:02
 * @FilePath: /aha-lang/src/app/api/quests/submit/route.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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

