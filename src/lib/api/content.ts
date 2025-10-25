/**
 * 统一的内容创建API
 * 
 * 设计理念：
 * - 统一的创建接口
 * - 智能类型分发
 * - 支持Mock和Supabase两种模式
 * - 完整的类型安全
 */

import type {
  ContentCreationData,
  ContentCreationResponse,
  PostCreationData,
  QuestCreationData,
  BaseContentData,
} from '@/types/content';
import { contentDispatcher } from '@/lib/content/dispatcher';
import { getSupabaseClient, isBackendSyncEnabled } from '@/lib/supabase/client';
import type { FeedCard } from '@/types/feed';

// Mock数据存储（用于本地测试）
const mockPosts: FeedCard[] = [];

// 检查是否启用Mock模式
const MOCK_DATA_ENABLED = !isBackendSyncEnabled();

console.log('[Content API] Mock data enabled:', MOCK_DATA_ENABLED);
console.log('[Content API] Backend sync enabled:', isBackendSyncEnabled());

// ============================================================================
// 核心创建函数
// ============================================================================

/**
 * 创建内容（统一入口）
 * 
 * 流程：
 * 1. 接收用户输入
 * 2. 智能分析内容类型
 * 3. 调用对应的创建逻辑
 * 4. 返回标准化响应
 */
export async function createContent(data: ContentCreationData): Promise<ContentCreationResponse> {
  console.log('[createContent] Creating content:', {
    category: data.category,
    textLength: data.text.length,
    hasMedia: !!(data.media && data.media.length > 0),
    MOCK_DATA_ENABLED,
  });

  // 1. 智能分析内容类型
  const analysis = contentDispatcher.analyze(data);
  
  console.log('[createContent] Content analysis:', analysis);

  // 2. 根据模式选择实现
  if (MOCK_DATA_ENABLED) {
    return createContentMock(data, analysis);
  } else {
    return createContentSupabase(data, analysis);
  }
}

// ============================================================================
// Mock模式实现
// ============================================================================

async function createContentMock(
  data: ContentCreationData,
  analysis: ReturnType<typeof contentDispatcher.analyze>
): Promise<ContentCreationResponse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800));

  const now = new Date().toISOString();
  const id = `${data.category}-${Date.now()}`;

  // 构建基础卡片数据
  const baseCard: Partial<FeedCard> = {
    id,
    type: analysis.suggestedType as any,
    author: {
      id: 'currentUser',
      handle: 'you',
      displayName: 'You',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
      verified: false,
    },
    content: data.text,
    createdAt: now,
    stats: {
      replies: 0,
      reposts: 0,
      likes: 0,
      bookmarks: 0,
      views: 1,
    },
    viewer: {
      liked: false,
      reposted: false,
      bookmarked: false,
    },
  };

  // 添加媒体
  if (data.media && data.media.length > 0) {
    (baseCard as any).media = data.media.map(m => ({
      id: m.id,
      type: m.type,
      url: m.url,
      thumbnail: m.thumbnail,
      width: m.width,
      height: m.height,
      duration: m.duration,
    }));
  }

  // 根据类型添加特定字段
  if (data.category === 'quest') {
    const questData = data as QuestCreationData;
    
    // 如果是小说类型，添加小说字段
    if (analysis.suggestedType === 'novel') {
      (baseCard as any).novel = {
        id: questData.novelId || `novel-${Date.now()}`,
        title: extractTitle(data.text) || '未命名小说',
        excerpt: data.text.substring(0, 100),
        coverImage: data.media?.[0]?.url || `https://picsum.photos/400/600?random=${Date.now()}`,
        difficulty: questData.difficulty || 3,
        totalChapters: 1,
        currentChapter: 1,
        tags: questData.tags || [],
        language: 'en-GB',
        estimatedTime: questData.estimatedTime || '30 min',
      };
    }
  }

  const feedCard = baseCard as FeedCard;
  
  // 添加到Mock数据存储
  mockPosts.unshift(feedCard);

  console.log('[createContentMock] Created:', {
    id: feedCard.id,
    type: feedCard.type,
    category: data.category,
  });

  return {
    id: feedCard.id,
    category: data.category,
    type: analysis.suggestedType,
    content: {
      text: data.text,
      media: data.media,
      metadata: data.metadata,
    },
    author: {
      id: feedCard.author.id,
      handle: feedCard.author.handle,
      displayName: feedCard.author.displayName,
      avatar: feedCard.author.avatar || 'https://picsum.photos/40/40?random=1',
    },
    createdAt: feedCard.createdAt,
    analysis,
  };
}

// ============================================================================
// Supabase模式实现
// ============================================================================

async function createContentSupabase(
  data: ContentCreationData,
  analysis: ReturnType<typeof contentDispatcher.analyze>
): Promise<ContentCreationResponse> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  // 获取当前用户
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  // 准备内容数据
  const contentData: any = {
    text: data.text,
  };

  if (data.media && data.media.length > 0) {
    contentData.media = data.media;
  }

  if (data.metadata) {
    contentData.metadata = data.metadata;
  }

  // 插入数据库
  const { data: insertedData, error } = await (supabase as any)
    .from('feed_cards')
    .insert({
      type: analysis.suggestedType,
      content: contentData,
      author_id: user.id,
      visibility: 'public',
      // 存储分析结果用于调试
      metadata: {
        analysis,
        category: data.category,
      },
    })
    .select(`
      id,
      type,
      content,
      created_at,
      likes_count,
      comments_count,
      shares_count,
      views_count,
      profiles:author_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .single();

  if (error) {
    console.error('[createContentSupabase] Error:', error);
    throw error;
  }

  console.log('[createContentSupabase] Created:', {
    id: insertedData.id,
    type: insertedData.type,
    category: data.category,
  });

  return {
    id: insertedData.id,
    category: data.category,
    type: analysis.suggestedType,
    content: {
      text: data.text,
      media: data.media,
      metadata: data.metadata,
    },
    author: {
      id: (insertedData.profiles as any)?.id || user.id,
      handle: (insertedData.profiles as any)?.username || 'user',
      displayName: (insertedData.profiles as any)?.full_name || 'User',
      avatar: (insertedData.profiles as any)?.avatar_url || 
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
    },
    createdAt: insertedData.created_at,
    analysis,
  };
}

// ============================================================================
// 便捷函数
// ============================================================================

/**
 * 创建帖子
 */
export async function createPost(data: Omit<PostCreationData, 'category'>): Promise<ContentCreationResponse> {
  return createContent({
    ...data,
    category: 'post',
  });
}

/**
 * 创建挑战
 */
export async function createQuest(data: Omit<QuestCreationData, 'category'>): Promise<ContentCreationResponse> {
  return createContent({
    ...data,
    category: 'quest',
  });
}

/**
 * 获取Mock数据（用于测试）
 */
export function getMockPosts(): FeedCard[] {
  return [...mockPosts];
}

/**
 * 清空Mock数据（用于测试）
 */
export function clearMockPosts(): void {
  mockPosts.length = 0;
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 从文本中提取标题
 */
function extractTitle(text: string): string | null {
  // 尝试提取第一行作为标题
  const lines = text.split('\n');
  const firstLine = lines[0]?.trim();
  
  if (firstLine && firstLine.length > 0 && firstLine.length < 100) {
    return firstLine;
  }
  
  // 如果第一行太长，截取前50个字符
  if (firstLine && firstLine.length >= 100) {
    return firstLine.substring(0, 50) + '...';
  }
  
  return null;
}

