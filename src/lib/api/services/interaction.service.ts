/**
 * Interaction Service
 * 处理用户互动相关的业务逻辑
 */

import { BaseService } from './base.service';
import { InteractionDTO, CreateInteractionRequest } from '../types/dto';
import { ApiException, ErrorCode, HttpStatus } from '../types/response';

export class InteractionService extends BaseService {
  /**
   * 创建互动（点赞、评论、分享等）
   */
  async createInteraction(
    userId: string,
    request: CreateInteractionRequest
  ): Promise<InteractionDTO> {
    // 验证目标是否存在
    await this.validateTarget(request.targetId, request.targetType);
    
    // 检查是否已存在相同互动（防止重复点赞/收藏）
    if (['like', 'bookmark', 'repost'].includes(request.type)) {
      const existing = await this.findExistingInteraction(
        userId,
        request.targetId,
        request.type
      );
      
      if (existing) {
        throw new ApiException(
          ErrorCode.ALREADY_EXISTS,
          `已经${this.getInteractionName(request.type)}过了`,
          HttpStatus.CONFLICT
        );
      }
    }
    
    const interactionData = {
      userId,
      targetId: request.targetId,
      targetType: request.targetType,
      type: request.type,
      content: request.content,
    };
    
    return await this.create<InteractionDTO>('interactions', interactionData);
  }
  
  /**
   * 删除互动（取消点赞、取消收藏等）
   */
  async deleteInteraction(
    userId: string,
    targetId: string,
    type: string
  ): Promise<void> {
    if (!this.supabase) return;
    
    const { error } = await (this.supabase as any)
      .from('interactions')
      .delete()
      .eq('user_id', userId)
      .eq('target_id', targetId)
      .eq('type', type);
    
    if (error) {
      throw new ApiException(
        ErrorCode.DATABASE_ERROR,
        `删除互动失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }
  
  /**
   * 获取用户的互动列表
   */
  async getUserInteractions(
    userId: string,
    type?: string,
    limit = 50
  ): Promise<InteractionDTO[]> {
    const filters: Record<string, any> = { userId };
    if (type) filters.type = type;
    
    return await this.findMany<InteractionDTO>('interactions', {
      filters,
      orderBy: { column: 'created_at', ascending: false },
      limit,
    });
  }
  
  /**
   * 获取目标的互动列表
   */
  async getTargetInteractions(
    targetId: string,
    type?: string,
    limit = 50
  ): Promise<InteractionDTO[]> {
    const filters: Record<string, any> = { targetId };
    if (type) filters.type = type;
    
    return await this.findMany<InteractionDTO>('interactions', {
      filters,
      orderBy: { column: 'created_at', ascending: false },
      limit,
    });
  }
  
  /**
   * 验证目标是否存在
   */
  private async validateTarget(
    targetId: string,
    targetType: string
  ): Promise<void> {
    let table: string;
    
    switch (targetType) {
      case 'card':
        table = 'feed_cards';
        break;
      case 'chapter':
        table = 'novel_chapters';
        break;
      case 'quest':
        table = 'quests';
        break;
      case 'comment':
        // 评论也存在interactions表中
        table = 'interactions';
        break;
      default:
        throw new ApiException(
          ErrorCode.INVALID_INPUT,
          `无效的目标类型: ${targetType}`,
          HttpStatus.BAD_REQUEST
        );
    }
    
    const exists = await this.findOne(table, targetId);
    
    if (!exists) {
      throw new ApiException(
        ErrorCode.NOT_FOUND,
        `目标${targetType}不存在`,
        HttpStatus.NOT_FOUND
      );
    }
  }
  
  /**
   * 查找已存在的互动
   */
  private async findExistingInteraction(
    userId: string,
    targetId: string,
    type: string
  ): Promise<InteractionDTO | null> {
    if (!this.supabase) return null;
    
    const { data } = await (this.supabase as any)
      .from('interactions')
      .select('*')
      .eq('user_id', userId)
      .eq('target_id', targetId)
      .eq('type', type)
      .single();
    
    return data ? data as InteractionDTO : null;
  }
  
  /**
   * 获取互动名称
   */
  private getInteractionName(type: string): string {
    const names: Record<string, string> = {
      like: '点赞',
      bookmark: '收藏',
      repost: '转发',
    };
    return names[type] || type;
  }
}

