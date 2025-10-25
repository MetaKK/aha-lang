/**
 * User Service
 * 处理用户相关的业务逻辑
 */

import { BaseService } from './base.service';
import { UserProfileDTO } from '../types/dto';
import { ApiException, ErrorCode, HttpStatus } from '../types/response';

export class UserService extends BaseService {
  /**
   * 获取用户资料
   */
  async getUserProfile(userId: string): Promise<UserProfileDTO> {
    const profile = await this.findOne<UserProfileDTO>('profiles', userId);
    
    if (!profile) {
      throw new ApiException(
        ErrorCode.NOT_FOUND,
        '用户不存在',
        HttpStatus.NOT_FOUND
      );
    }
    
    return profile;
  }
  
  /**
   * 通过用户名获取用户
   */
  async getUserByUsername(username: string): Promise<UserProfileDTO | null> {
    if (!this.supabase) return null;
    
    const { data } = await (this.supabase as any)
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    
    return data ? data as UserProfileDTO : null;
  }
  
  /**
   * 更新用户资料
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfileDTO>
  ): Promise<UserProfileDTO> {
    // 只允许更新特定字段
    const allowedFields = [
      'displayName',
      'fullName',
      'avatarUrl',
      'bio',
    ];
    
    const updateData: Record<string, any> = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        updateData[key] = value;
      }
    });
    
    if (Object.keys(updateData).length === 0) {
      throw new ApiException(
        ErrorCode.INVALID_INPUT,
        '没有可更新的字段',
        HttpStatus.BAD_REQUEST
      );
    }
    
    return await this.update<UserProfileDTO>('profiles', userId, updateData);
  }
  
  /**
   * 获取用户统计信息
   */
  async getUserStats(userId: string): Promise<{
    postsCount: number;
    questsCompleted: number;
    totalLikes: number;
    totalViews: number;
    followersCount: number;
    followingCount: number;
  }> {
    // 获取发帖数
    const postsCount = await this.count('feed_cards', { authorId: userId });
    
    // 获取完成的Quest数
    const { data: progressData } = this.supabase ? await (this.supabase as any)
      .from('user_progress')
      .select('quests_completed')
      .eq('user_id', userId) : { data: [] };
    
    const questsCompleted = progressData?.reduce(
      (total: number, p: any) => total + (p.quests_completed?.length || 0),
      0
    ) || 0;
    
    // 获取总点赞数
    const { data: likesData } = this.supabase ? await (this.supabase as any)
      .from('interactions')
      .select('id', { count: 'exact' })
      .eq('target_type', 'card')
      .eq('type', 'like')
      .in('target_id', 
        (this.supabase as any)
          .from('feed_cards')
          .select('id')
          .eq('author_id', userId)
      ) : { data: [] };
    
    const totalLikes = likesData?.length || 0;
    
    // 获取总浏览数
    const { data: cardsData } = this.supabase ? await (this.supabase as any)
      .from('feed_cards')
      .select('views_count')
      .eq('author_id', userId) : { data: [] };
    
    const totalViews = cardsData?.reduce(
      (total: number, c: any) => total + (c.views_count || 0),
      0
    ) || 0;
    
    return {
      postsCount,
      questsCompleted,
      totalLikes,
      totalViews,
      followersCount: 0, // TODO: 实现关注系统
      followingCount: 0,
    };
  }
  
  /**
   * 更新用户活跃时间
   */
  async updateLastActive(userId: string): Promise<void> {
    if (!this.supabase) return;
    
    await (this.supabase as any)
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId);
  }
  
  /**
   * 增加用户经验值
   */
  async addExperience(userId: string, amount: number): Promise<UserProfileDTO> {
    const profile = await this.getUserProfile(userId);
    
    const newExperience = profile.experience + amount;
    const newLevel = this.calculateLevel(newExperience);
    
    return await this.update<UserProfileDTO>('profiles', userId, {
      experience: newExperience,
      level: newLevel,
    });
  }
  
  /**
   * 计算等级（简单的等级算法）
   */
  private calculateLevel(experience: number): number {
    // 每100经验升1级
    return Math.min(Math.floor(experience / 100) + 1, 100);
  }
}

