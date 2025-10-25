/**
 * 认证中间件
 * 处理JWT验证、用户权限检查
 */

import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ApiException, ErrorCode, HttpStatus } from '../types/response';

/**
 * 认证上下文
 */
export interface AuthContext {
  userId: string;
  user: {
    id: string;
    email: string;
    username: string;
    level: number;
  };
  permissions: string[];
}

/**
 * 从请求中提取Token
 */
function extractToken(request: NextRequest): string | null {
  // 从Authorization header提取
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 从Cookie提取（Web应用）
  const cookieToken = request.cookies.get('sb-access-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  return null;
}

/**
 * 验证用户认证
 */
export async function authenticate(request: NextRequest): Promise<AuthContext> {
  const token = extractToken(request);
  
  if (!token) {
    throw new ApiException(
      ErrorCode.UNAUTHORIZED,
      '未提供认证令牌',
      HttpStatus.UNAUTHORIZED
    );
  }
  
  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Supabase 客户端未初始化',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    // 验证Token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new ApiException(
        ErrorCode.INVALID_TOKEN,
        '无效的认证令牌',
        HttpStatus.UNAUTHORIZED
      );
    }
    
    // 获取用户资料和权限
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, level')
      .eq('id', user.id)
      .single();
    
    if (!profile) {
      throw new ApiException(
        ErrorCode.NOT_FOUND,
        '用户资料不存在',
        HttpStatus.NOT_FOUND
      );
    }
    
    // 获取用户权限
    const { data: permissions } = await supabase
      .rpc('get_user_permissions', { user_id: user.id } as any);
    
    return {
      userId: user.id,
      user: {
        id: user.id,
        email: user.email!,
        username: (profile as any).username,
        level: (profile as any).level,
      },
      permissions: permissions || [],
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    
    throw new ApiException(
      ErrorCode.INTERNAL_ERROR,
      '认证过程发生错误',
      HttpStatus.INTERNAL_SERVER_ERROR,
      error
    );
  }
}

/**
 * 可选认证（允许匿名访问，但会尝试获取用户信息）
 */
export async function optionalAuthenticate(
  request: NextRequest
): Promise<AuthContext | null> {
  try {
    return await authenticate(request);
  } catch (error) {
    // 认证失败时返回null，允许继续处理
    return null;
  }
}

/**
 * 检查权限
 */
export function requirePermission(
  authContext: AuthContext,
  permission: string
): void {
  if (!authContext.permissions.includes(permission)) {
    throw new ApiException(
      ErrorCode.INSUFFICIENT_PERMISSION,
      `缺少必要权限: ${permission}`,
      HttpStatus.FORBIDDEN
    );
  }
}

/**
 * 检查是否为资源所有者
 */
export function requireOwnership(
  authContext: AuthContext,
  resourceOwnerId: string
): void {
  if (authContext.userId !== resourceOwnerId) {
    throw new ApiException(
      ErrorCode.FORBIDDEN,
      '无权访问此资源',
      HttpStatus.FORBIDDEN
    );
  }
}

