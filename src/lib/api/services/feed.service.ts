/**
 * Feed Service
 * 处理Feed流相关的业务逻辑
 */

import { BaseService } from './base.service';
import {
  FeedCardDTO,
  CreateFeedCardRequest,
  UpdateFeedCardRequest,
  FeedQueryParams,
  UserProfileDTO,
} from '../types/dto';
import { ApiException, ErrorCode, HttpStatus } from '../types/response';

export class FeedService extends BaseService {
  /**
   * 获取Feed流
   */
  async getFeed(params: FeedQueryParams = {}): Promise<{
    cards: FeedCardDTO[];
    total: number;
    hasMore: boolean;
  }> {
    const {
      page = 1,
      pageSize = 20,
      type,
      difficulty,
      tags,
      authorId,
    } = params;
    
    const offset = (page - 1) * pageSize;
    
    // 构建过滤条件
    const filters: Record<string, any> = {
      visibility: 'public',
    };
    
    if (type) filters.type = type;
    if (difficulty) filters.difficulty = difficulty;
    if (authorId) filters.author_id = authorId;
    
    // 查询卡片
    const cards = await this.findMany<FeedCardDTO>('feed_cards', {
      select: `
        *,
        author:profiles!author_id(
          id,
          username,
          display_name,
          avatar_url,
          level
        )
      `,
      filters,
      orderBy: { column: 'created_at', ascending: false },
      limit: pageSize,
      offset,
    });
    
    // 如果有tags过滤，需要额外处理
    let filteredCards = cards;
    if (tags && tags.length > 0) {
      filteredCards = cards.filter(card => 
        card.tags && tags.some(tag => card.tags!.includes(tag))
      );
    }
    
    // 获取总数
    const total = await this.count('feed_cards', filters);
    
    return {
      cards: filteredCards,
      total,
      hasMore: offset + filteredCards.length < total,
    };
  }
  
  /**
   * 获取单个卡片详情
   */
  async getCardById(cardId: string, userId?: string): Promise<FeedCardDTO> {
    const card = await this.findOne<FeedCardDTO>('feed_cards', cardId, `
      *,
      author:profiles!author_id(
        id,
        username,
        display_name,
        avatar_url,
        level
      )
    `);
    
    if (!card) {
      throw new ApiException(
        ErrorCode.NOT_FOUND,
        '卡片不存在',
        HttpStatus.NOT_FOUND
      );
    }
    
    // 如果提供了userId，获取用户的交互状态
    if (userId) {
      card.viewer = await this.getUserInteractionState(cardId, userId);
    }
    
    // 增加浏览次数
    await this.incrementViewCount(cardId);
    
    return card;
  }
  
  /**
   * 创建Feed卡片
   */
  async createCard(
    authorId: string,
    request: CreateFeedCardRequest
  ): Promise<FeedCardDTO> {
    // 验证内容
    if (!request.content || Object.keys(request.content).length === 0) {
      throw new ApiException(
        ErrorCode.VALIDATION_ERROR,
        '内容不能为空',
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }
    
    const cardData = {
      authorId,
      type: request.type,
      title: request.title,
      content: request.content,
      metadata: request.metadata || {},
      visibility: request.visibility || 'public',
      difficulty: request.difficulty,
      tags: request.tags,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 0,
    };
    
    const card = await this.create<FeedCardDTO>('feed_cards', cardData);
    
    // 获取作者信息
    const author = await this.findOne<UserProfileDTO>('profiles', authorId);
    if (author) {
      card.author = author;
    }
    
    return card;
  }
  
  /**
   * 更新Feed卡片
   */
  async updateCard(
    cardId: string,
    authorId: string,
    request: UpdateFeedCardRequest
  ): Promise<FeedCardDTO> {
    // 验证所有权
    const existingCard = await this.findOne<FeedCardDTO>('feed_cards', cardId);
    
    if (!existingCard) {
      throw new ApiException(
        ErrorCode.NOT_FOUND,
        '卡片不存在',
        HttpStatus.NOT_FOUND
      );
    }
    
    if (existingCard.authorId !== authorId) {
      throw new ApiException(
        ErrorCode.FORBIDDEN,
        '无权修改此卡片',
        HttpStatus.FORBIDDEN
      );
    }
    
    // 只更新允许修改的字段
    const updateData: Record<string, any> = {};
    if (request.title !== undefined) updateData.title = request.title;
    if (request.content !== undefined) updateData.content = request.content;
    if (request.metadata !== undefined) updateData.metadata = request.metadata;
    if (request.visibility !== undefined) updateData.visibility = request.visibility;
    if (request.difficulty !== undefined) updateData.difficulty = request.difficulty;
    if (request.tags !== undefined) updateData.tags = request.tags;
    
    return await this.update<FeedCardDTO>('feed_cards', cardId, updateData);
  }
  
  /**
   * 删除Feed卡片
   */
  async deleteCard(cardId: string, authorId: string): Promise<void> {
    // 验证所有权
    const existingCard = await this.findOne<FeedCardDTO>('feed_cards', cardId);
    
    if (!existingCard) {
      throw new ApiException(
        ErrorCode.NOT_FOUND,
        '卡片不存在',
        HttpStatus.NOT_FOUND
      );
    }
    
    if (existingCard.authorId !== authorId) {
      throw new ApiException(
        ErrorCode.FORBIDDEN,
        '无权删除此卡片',
        HttpStatus.FORBIDDEN
      );
    }
    
    await this.delete('feed_cards', cardId);
  }
  
  /**
   * 获取用户的交互状态
   */
  private async getUserInteractionState(
    cardId: string,
    userId: string
  ): Promise<{ liked: boolean; bookmarked: boolean; reposted: boolean }> {
    if (!this.supabase) {
      return { liked: false, bookmarked: false, reposted: false };
    }
    
    const { data } = await (this.supabase as any)
      .from('interactions')
      .select('type')
      .eq('target_id', cardId)
      .eq('target_type', 'card')
      .eq('user_id', userId)
      .in('type', ['like', 'bookmark', 'repost']);
    
    const interactions = data || [];
    
    return {
      liked: interactions.some((i: any) => i.type === 'like'),
      bookmarked: interactions.some((i: any) => i.type === 'bookmark'),
      reposted: interactions.some((i: any) => i.type === 'repost'),
    };
  }
  
  /**
   * 增加浏览次数
   */
  private async incrementViewCount(cardId: string): Promise<void> {
    if (!this.supabase) return;
    await (this.supabase as any).rpc('increment_view_count', { card_id: cardId });
  }
}

