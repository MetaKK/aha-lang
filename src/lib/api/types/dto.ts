/**
 * DTO (Data Transfer Object) - 数据传输对象
 * 确保前端、后端、数据库三层字段对齐
 */

// ============================================================================
// 数据库 -> API -> 前端 的映射关系
// ============================================================================

/**
 * 用户资料 DTO
 * 对应数据库表: profiles
 */
export interface UserProfileDTO {
  id: string;
  username: string;
  displayName: string | null;
  fullName?: string | null;
  avatarUrl: string | null;
  bio: string | null;
  level: number;
  experience: number;
  streakDays: number;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Feed卡片 DTO
 * 对应数据库表: feed_cards
 */
export interface FeedCardDTO {
  id: string;
  type: 'novel' | 'text' | 'image' | 'video' | 'audio' | 'ad' | 'quote' | 'repost';
  authorId: string;
  title: string | null;
  content: Record<string, any>; // JSONB
  metadata: Record<string, any>; // JSONB
  visibility: 'public' | 'private' | 'followers';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  difficulty: number | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
  
  // 关联数据（JOIN查询）
  author?: UserProfileDTO;
  
  // 用户交互状态
  viewer?: {
    liked: boolean;
    bookmarked: boolean;
    reposted: boolean;
  };
}

/**
 * 小说章节 DTO
 * 对应数据库表: novel_chapters
 */
export interface NovelChapterDTO {
  id: string;
  feedCardId: string;
  chapterNumber: number;
  title: string;
  content: string;
  difficultyLevel: number | null;
  estimatedTime: number | null; // 分钟
  wordCount: number | null;
  keyVocabulary: any[]; // JSONB
  grammarPoints: any[]; // JSONB
  createdAt: string;
  updatedAt: string;
}

/**
 * Quest DTO
 * 对应数据库表: quests
 */
export interface QuestDTO {
  id: string;
  chapterId: string;
  type: 'vocabulary' | 'grammar' | 'comprehension' | 'speaking' | 'writing';
  orderIndex: number;
  config: Record<string, any>; // JSONB
  passingScore: number;
  timeLimit: number | null; // 秒
  createdAt: string;
}

/**
 * 用户进度 DTO
 * 对应数据库表: user_progress
 */
export interface UserProgressDTO {
  id: string;
  userId: string;
  chapterId: string;
  status: 'not_started' | 'reading' | 'questing' | 'completed' | 'failed';
  currentQuestIndex: number;
  bestScore: number;
  attempts: number;
  timeSpent: number; // 秒
  questsCompleted: any[]; // JSONB
  mistakes: any[]; // JSONB
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Quest结果 DTO
 * 对应数据库表: quest_results
 */
export interface QuestResultDTO {
  id: string;
  questId: string;
  userId: string;
  userAnswer: Record<string, any>; // JSONB
  score: number;
  passed: boolean;
  timeSpent: number; // 秒
  aiScore: Record<string, any> | null; // JSONB
  createdAt: string;
}

/**
 * 互动 DTO
 * 对应数据库表: interactions
 */
export interface InteractionDTO {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'card' | 'comment' | 'chapter' | 'quest';
  type: 'like' | 'unlike' | 'comment' | 'reply' | 'share' | 'repost' | 'unrepost' | 'bookmark' | 'unbookmark' | 'quote';
  content: string | null;
  createdAt: string;
}

/**
 * 卡片引用 DTO
 * 对应数据库表: card_references
 */
export interface CardReferenceDTO {
  id: string;
  sourceCardId: string;
  targetCardId: string;
  referenceType: 'quote' | 'repost';
  createdAt: string;
}

// ============================================================================
// 数据库字段 <-> DTO 字段映射工具
// ============================================================================

/**
 * 数据库字段名转换为DTO字段名（snake_case -> camelCase）
 */
export function dbFieldToDto<T = any>(
  dbRow: Record<string, any>
): T {
  const dto: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(dbRow)) {
    // 转换 snake_case 为 camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    dto[camelKey] = value;
  }
  
  return dto as T;
}

/**
 * DTO字段名转换为数据库字段名（camelCase -> snake_case）
 */
export function dtoFieldToDb<T = any>(
  dto: Record<string, any>
): T {
  const dbRow: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(dto)) {
    // 转换 camelCase 为 snake_case
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    dbRow[snakeKey] = value;
  }
  
  return dbRow as T;
}

// ============================================================================
// API 请求/响应 DTO
// ============================================================================

/**
 * 创建Feed卡片请求
 */
export interface CreateFeedCardRequest {
  type: 'novel' | 'text' | 'image' | 'video' | 'audio';
  title?: string;
  content: Record<string, any>;
  metadata?: Record<string, any>;
  visibility?: 'public' | 'private' | 'followers';
  difficulty?: number;
  tags?: string[];
}

/**
 * 更新Feed卡片请求
 */
export interface UpdateFeedCardRequest {
  title?: string;
  content?: Record<string, any>;
  metadata?: Record<string, any>;
  visibility?: 'public' | 'private' | 'followers';
  difficulty?: number;
  tags?: string[];
}

/**
 * Feed查询参数
 */
export interface FeedQueryParams {
  page?: number;
  pageSize?: number;
  type?: string;
  difficulty?: number;
  tags?: string[];
  authorId?: string;
  cursor?: string;
}

/**
 * 创建互动请求
 */
export interface CreateInteractionRequest {
  targetId: string;
  targetType: 'card' | 'comment' | 'chapter' | 'quest';
  type: 'like' | 'comment' | 'reply' | 'share' | 'repost' | 'bookmark' | 'quote';
  content?: string;
}

/**
 * 创建Quest结果请求
 */
export interface CreateQuestResultRequest {
  questId: string;
  userAnswer: Record<string, any>;
  score: number;
  passed: boolean;
  timeSpent: number;
}

/**
 * 更新用户进度请求
 */
export interface UpdateUserProgressRequest {
  chapterId: string;
  status?: 'not_started' | 'reading' | 'questing' | 'completed' | 'failed';
  currentQuestIndex?: number;
  bestScore?: number;
  timeSpent?: number;
}

// ============================================================================
// 前端类型 <-> DTO 转换器
// ============================================================================

/**
 * 将FeedCardDTO转换为前端FeedCard类型
 */
export function feedCardDtoToFeedCard(dto: FeedCardDTO): any {
  return {
    id: dto.id,
    type: dto.type,
    author: dto.author ? {
      id: dto.author.id,
      handle: dto.author.username,
      displayName: dto.author.displayName || dto.author.username,
      avatar: dto.author.avatarUrl,
      verified: false,
    } : undefined,
    content: typeof dto.content === 'string' ? dto.content : JSON.stringify(dto.content),
    createdAt: dto.createdAt,
    stats: {
      likes: dto.likesCount,
      reposts: dto.sharesCount,
      replies: dto.commentsCount,
      bookmarks: 0,
      views: dto.viewsCount,
    },
    metadata: dto.metadata,
    viewer: dto.viewer,
    // 根据type添加特定字段
    ...(dto.type === 'novel' && dto.metadata?.novel ? {
      novel: {
        id: dto.metadata.novel.id,
        title: dto.metadata.novel.title || dto.title,
        excerpt: dto.metadata.novel.excerpt || '',
        coverImage: dto.metadata.novel.coverImage,
        difficulty: dto.difficulty || 3,
        totalChapters: dto.metadata.novel.totalChapters || 0,
        tags: dto.tags || [],
        language: dto.metadata.novel.language || 'en',
        estimatedTime: dto.metadata.novel.estimatedTime,
        questType: dto.metadata.novel.questType,
      }
    } : {}),
    ...(dto.type === 'image' || dto.type === 'video' ? {
      media: dto.metadata?.media || []
    } : {}),
  };
}

/**
 * 将前端创建数据转换为CreateFeedCardRequest
 */
export function contentCreationToRequest(data: any): CreateFeedCardRequest {
  const request: CreateFeedCardRequest = {
    type: data.category === 'quest' ? 'novel' : (data.media?.length > 0 ? 'image' : 'text'),
    content: {
      text: data.text,
      media: data.media,
    },
    metadata: {
      category: data.category,
      analysis: data.metadata?.analysis,
    },
  };
  
  // Quest特有字段
  if (data.category === 'quest') {
    request.difficulty = data.difficulty;
    request.tags = data.tags;
    request.metadata!.novel = {
      id: data.novelId,
      title: data.text.split('\n')[0], // 第一行作为标题
      excerpt: data.text,
      questType: data.questType,
      estimatedTime: data.estimatedTime,
    };
  }
  
  return request;
}

