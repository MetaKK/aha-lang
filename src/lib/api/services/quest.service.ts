/**
 * Quest Service
 * 处理Quest学习相关的业务逻辑
 */

import { BaseService } from './base.service';
import {
  QuestDTO,
  NovelChapterDTO,
  UserProgressDTO,
  QuestResultDTO,
  CreateQuestResultRequest,
  UpdateUserProgressRequest,
} from '../types/dto';
import { ApiException, ErrorCode, HttpStatus } from '../types/response';

export class QuestService extends BaseService {
  /**
   * 获取章节的所有Quests
   */
  async getChapterQuests(chapterId: string): Promise<QuestDTO[]> {
    return await this.findMany<QuestDTO>('quests', {
      filters: { chapterId },
      orderBy: { column: 'order_index', ascending: true },
    });
  }
  
  /**
   * 获取单个Quest详情
   */
  async getQuestById(questId: string): Promise<QuestDTO> {
    const quest = await this.findOne<QuestDTO>('quests', questId);
    
    if (!quest) {
      throw new ApiException(
        ErrorCode.NOT_FOUND,
        'Quest不存在',
        HttpStatus.NOT_FOUND
      );
    }
    
    return quest;
  }
  
  /**
   * 获取用户在某章节的进度
   */
  async getUserProgress(
    userId: string,
    chapterId: string
  ): Promise<UserProgressDTO | null> {
    if (!this.supabase) return null;
    
    const { data } = await (this.supabase as any)
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)
      .single();
    
    return data ? data as UserProgressDTO : null;
  }
  
  /**
   * 更新用户进度
   */
  async updateUserProgress(
    userId: string,
    request: UpdateUserProgressRequest
  ): Promise<UserProgressDTO> {
    // 查找现有进度
    const existing = await this.getUserProgress(userId, request.chapterId);
    
    if (existing) {
      // 更新现有进度
      const updateData: Record<string, any> = {};
      if (request.status) updateData.status = request.status;
      if (request.currentQuestIndex !== undefined) {
        updateData.currentQuestIndex = request.currentQuestIndex;
      }
      if (request.bestScore !== undefined) updateData.bestScore = request.bestScore;
      if (request.timeSpent !== undefined) {
        updateData.timeSpent = existing.timeSpent + request.timeSpent;
      }
      
      return await this.update<UserProgressDTO>(
        'user_progress',
        existing.id,
        updateData
      );
    } else {
      // 创建新进度
      const progressData = {
        userId,
        chapterId: request.chapterId,
        status: request.status || 'not_started',
        currentQuestIndex: request.currentQuestIndex || 0,
        bestScore: request.bestScore || 0,
        attempts: 0,
        timeSpent: request.timeSpent || 0,
        questsCompleted: [],
        mistakes: [],
      };
      
      return await this.create<UserProgressDTO>('user_progress', progressData);
    }
  }
  
  /**
   * 提交Quest结果
   */
  async submitQuestResult(
    userId: string,
    request: CreateQuestResultRequest
  ): Promise<QuestResultDTO> {
    // 验证Quest是否存在
    const quest = await this.getQuestById(request.questId);
    
    // 创建结果记录
    const resultData = {
      questId: request.questId,
      userId,
      userAnswer: request.userAnswer,
      score: request.score,
      passed: request.passed,
      timeSpent: request.timeSpent,
      aiScore: null,
    };
    
    const result = await this.create<QuestResultDTO>('quest_results', resultData);
    
    // 更新用户进度
    const progress = await this.getUserProgress(userId, quest.chapterId);
    if (progress) {
      const updateData: Record<string, any> = {
        attempts: progress.attempts + 1,
      };
      
      // 如果通过了Quest
      if (request.passed) {
        // 更新最佳分数
        if (request.score > progress.bestScore) {
          updateData.bestScore = request.score;
        }
        
        // 添加到已完成列表
        const completed = progress.questsCompleted || [];
        if (!completed.includes(request.questId)) {
          updateData.questsCompleted = [...completed, request.questId];
        }
        
        // 移动到下一个Quest
        updateData.currentQuestIndex = progress.currentQuestIndex + 1;
      }
      
      await this.update('user_progress', progress.id, updateData);
    }
    
    return result;
  }
  
  /**
   * 获取用户的Quest历史记录
   */
  async getUserQuestResults(
    userId: string,
    questId?: string,
    limit = 50
  ): Promise<QuestResultDTO[]> {
    const filters: Record<string, any> = { userId };
    if (questId) filters.questId = questId;
    
    return await this.findMany<QuestResultDTO>('quest_results', {
      filters,
      orderBy: { column: 'created_at', ascending: false },
      limit,
    });
  }
  
  /**
   * 获取章节详情
   */
  async getChapterById(chapterId: string): Promise<NovelChapterDTO> {
    const chapter = await this.findOne<NovelChapterDTO>('novel_chapters', chapterId);
    
    if (!chapter) {
      throw new ApiException(
        ErrorCode.NOT_FOUND,
        '章节不存在',
        HttpStatus.NOT_FOUND
      );
    }
    
    return chapter;
  }
  
  /**
   * 获取小说的所有章节
   */
  async getNovelChapters(feedCardId: string): Promise<NovelChapterDTO[]> {
    return await this.findMany<NovelChapterDTO>('novel_chapters', {
      filters: { feedCardId },
      orderBy: { column: 'chapter_number', ascending: true },
    });
  }
}
