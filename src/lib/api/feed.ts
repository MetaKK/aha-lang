/*
 * @Author: meta-kk 11097094+teacher-kk@user.noreply.gitee.com
 * @Date: 2025-10-27 11:14:15
 * @LastEditors: meta-kk 11097094+teacher-kk@user.noreply.gitee.com
 * @LastEditTime: 2025-10-27 11:46:23
 * @FilePath: /aha-lang/src/lib/api/feed.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Feed API - Client-side implementation with Supabase integration
import type { FeedCard, FeedResponse, FeedFilters, PostThread, ThreadPost } from '@/types/feed';
import { createMockData } from './mock-data';
import { getSupabaseClient, isBackendSyncEnabled } from '@/lib/supabase/client';
import { getMockPosts } from './content';
import { commentStorage, interactionStorage } from '@/lib/utils/session-storage';

// Check if mock data should be enabled
const MOCK_DATA_ENABLED = !isBackendSyncEnabled();



// Generate mock cards for different scenarios
const mockCards: FeedCard[] = createMockData();

/**
 * Fetch feed cards with pagination
 */
export async function fetchFeed(options: {
  cursor?: string;
  limit?: number;
  filters?: FeedFilters;
}): Promise<FeedResponse> {
  const { cursor, limit = 20, filters } = options;


  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (MOCK_DATA_ENABLED) {
    // 获取动态创建的内容
    const dynamicPosts = getMockPosts();
    
    // 合并静态mock数据和动态创建的内容
    const allCards = [...dynamicPosts, ...mockCards];
    
    // Mock data for development
    const start = cursor ? parseInt(cursor) : 0;
    const end = start + limit;
    const cards = allCards.slice(start, end);


    return {
      cards,
      cursor: end < allCards.length ? String(end) : undefined,
      hasMore: end < allCards.length,
    };
  }

  // Supabase implementation
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[fetchFeed] Supabase client not available');
      return {
        cards: [],
        hasMore: false,
      };
    }

    const start = cursor ? parseInt(cursor) : 0;
    const end = start + limit - 1;


    // Get current user for viewer state
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await (supabase as any)
      .from('feed_cards')
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
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) {
      console.error('[fetchFeed] Supabase error:', error);
      throw error;
    }


    // Get user interactions if logged in
    let userInteractions: any[] = [];
    if (user) {
      const { data: interactions } = await (supabase as any)
        .from('interactions')
        .select('target_id, type')
        .eq('user_id', user.id)
        .eq('target_type', 'card')
        .in('target_id', (data || []).map((item: any) => item.id));
      
      userInteractions = interactions || [];
    }

    // Transform database response to FeedCard format
    const cards: FeedCard[] = (data || []).map((item: any) => {
      const liked = userInteractions.some(i => i.target_id === item.id && i.type === 'like');
      const bookmarked = userInteractions.some(i => i.target_id === item.id && i.type === 'bookmark');
      const reposted = userInteractions.some(i => i.target_id === item.id && i.type === 'repost');

      return {
        id: item.id,
        type: item.type,
        author: {
          id: item.profiles?.id || 'unknown',
          handle: item.profiles?.username || 'user',
          displayName: item.profiles?.display_name || item.profiles?.username || 'User',
          avatar: item.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.profiles?.id}`,
          verified: false,
        },
        content: item.content?.text || '',
        createdAt: item.created_at,
        stats: {
          replies: item.comments_count || 0,
          reposts: item.shares_count || 0,
          likes: item.likes_count || 0,
          bookmarks: 0,
          views: item.views_count || 0,
        },
        viewer: {
          liked,
          reposted,
          bookmarked,
        },
        ...(item.content?.media ? { media: item.content.media } : {}),
      };
    });

    return {
      cards,
      cursor: cards.length === limit ? String(end + 1) : undefined,
      hasMore: cards.length === limit,
    };
  } catch (error) {
    console.error('Failed to fetch feed:', error);
    throw error;
  }
}

/**
 * Fetch a single post with thread context
 */
export async function fetchPostThread(postId: string): Promise<PostThread> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  if (MOCK_DATA_ENABLED) {
    // 获取动态创建的内容
    const dynamicPosts = getMockPosts();
    
    // 合并静态mock数据和动态创建的内容
    const allCards = [...dynamicPosts, ...mockCards];
    
    const post = allCards.find(card => card.id === postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Get stored comments and interactions from session storage
    const storedCommentTree = commentStorage.getCommentTree(postId);
    const storedInteractions = interactionStorage.getByPostId(postId);
    
    // Get current user's interaction state
    const mockUserId = 'currentUser';
    const userInteractions = storedInteractions.filter(i => i.userId === mockUserId);
    const viewerState = {
      liked: userInteractions.some(i => i.type === 'like'),
      bookmarked: userInteractions.some(i => i.type === 'bookmark'),
      reposted: userInteractions.some(i => i.type === 'repost'),
    };
    
    // Helper function to convert comment tree to ThreadPost format
    const convertCommentToThreadPost = (comment: any): ThreadPost => {
      const replies = comment.replies?.map(convertCommentToThreadPost) || [];
      return {
        id: comment.id,
        type: 'text' as const,
        content: comment.content,
        author: {
          id: comment.author.id,
          handle: comment.author.handle,
          displayName: comment.author.displayName,
          avatar: comment.author.avatar,
          verified: false,
        },
        createdAt: comment.createdAt,
        reply: {
          root: { uri: postId, cid: postId },
          parent: { uri: comment.parentId || postId, cid: comment.parentId || postId },
        },
        stats: {
          replies: replies.length,
          reposts: 0,
          likes: 0,
          bookmarks: 0,
          views: 0,
        },
        replyCount: replies.length,
        replies: replies.length > 0 ? replies : undefined,
      };
    };

    // Generate mock replies with proper avatar URLs and nested structure
    const defaultReplies: ThreadPost[] = [
      {
        ...mockCards[1],
        type: 'text',
        id: `reply-${postId}-1`,
        content: 'This is amazing! I\'ve been looking for something like this.',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        author: {
          ...mockCards[1].author,
          avatar: mockCards[1].author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockCards[1].author.id}`,
        },
        reply: {
          root: { uri: post.id, cid: post.id },
          parent: { uri: post.id, cid: post.id },
        },
        stats: {
          replies: 2,
          reposts: 12,
          likes: 234,
          bookmarks: 45,
          views: 2340,
        },
        replyCount: 2,
        replies: [
          {
            ...mockCards[3],
            type: 'text',
            id: `reply-${postId}-1-1`,
            content: 'Totally agree! This is exactly what we need.',
            createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
            author: {
              ...mockCards[3].author,
              avatar: mockCards[3].author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockCards[3].author.id}`,
            },
            reply: {
              root: { uri: post.id, cid: post.id },
              parent: { uri: `reply-${postId}-1`, cid: `reply-${postId}-1` },
            },
            stats: {
              replies: 0,
              reposts: 0,
              likes: 45,
              bookmarks: 5,
              views: 450,
            },
            replyCount: 0,
          } as ThreadPost,
          {
            ...mockCards[4],
            type: 'text',
            id: `reply-${postId}-1-2`,
            content: 'Thanks for sharing! 🙏',
            createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
            author: {
              ...mockCards[4].author,
              avatar: mockCards[4].author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockCards[4].author.id}`,
            },
            reply: {
              root: { uri: post.id, cid: post.id },
              parent: { uri: `reply-${postId}-1`, cid: `reply-${postId}-1` },
            },
            stats: {
              replies: 0,
              reposts: 0,
              likes: 23,
              bookmarks: 2,
              views: 230,
            },
            replyCount: 0,
          } as ThreadPost,
        ],
      } as ThreadPost,
      {
        ...mockCards[2],
        type: 'text',
        id: `reply-${postId}-2`,
        content: 'Great initiative! 🎉',
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        author: {
          ...mockCards[2].author,
          avatar: mockCards[2].author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockCards[2].author.id}`,
        },
        reply: {
          root: { uri: post.id, cid: post.id },
          parent: { uri: post.id, cid: post.id },
        },
        stats: {
          replies: 0,
          reposts: 5,
          likes: 89,
          bookmarks: 12,
          views: 890,
        },
        replyCount: 0,
      } as ThreadPost,
    ];

    // Convert stored comments to ThreadPost format with nested structure
    const storedReplies: ThreadPost[] = storedCommentTree.map(convertCommentToThreadPost);

    // Combine default replies with stored comments
    // 最新的评论排在最前面（降序排列）
    const replies: ThreadPost[] = [...storedReplies, ...defaultReplies].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      post: {
        ...post,
        viewer: viewerState,
        replyCount: replies.length,
      } as ThreadPost,
      replies,
    };
  }

  // Supabase implementation
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Fetch main post with author info
    const { data: postData, error: postError } = await (supabase as any)
      .from('feed_cards')
      .select(`
        *,
        author:profiles!feed_cards_author_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          level
        )
      `)
      .eq('id', postId)
      .single();

    if (postError) {
      console.error('[fetchPostThread] Post fetch error:', postError);
      throw new Error('Post not found');
    }

    if (!postData) {
      throw new Error('Post not found');
    }

    // Get current user for interaction state
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch user's interaction state
    let viewerState = { liked: false, bookmarked: false, reposted: false };
    if (user) {
      const { data: interactions } = await (supabase as any)
        .from('interactions')
        .select('type')
        .eq('target_id', postId)
        .eq('target_type', 'card')
        .eq('user_id', user.id)
        .in('type', ['like', 'bookmark', 'repost']);

      if (interactions) {
        viewerState = {
          liked: interactions.some((i: any) => i.type === 'like'),
          bookmarked: interactions.some((i: any) => i.type === 'bookmark'),
          reposted: interactions.some((i: any) => i.type === 'repost'),
        };
      }
    }

    // 批量获取所有评论和回复（包括嵌套的）
    const { data: allRepliesData, error: allRepliesError } = await (supabase as any)
      .from('interactions')
      .select(`
        *,
        author:profiles!interactions_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          level
        )
      `)
      .eq('target_id', postId)
      .eq('target_type', 'card')
      .in('type', ['comment', 'reply'])
      .order('created_at', { ascending: false });

    if (allRepliesError) {
      console.error('[fetchPostThread] All replies fetch error:', allRepliesError);
    }

    // 收集所有评论ID用于批量查询点赞信息
    const allCommentIds = (allRepliesData || []).map((r: any) => r.id);
    
    // 批量获取所有评论的点赞数
    const likesCountMap = new Map<string, number>();
    if (allCommentIds.length > 0) {
      const { data: likesData } = await (supabase as any)
        .from('interactions')
        .select('target_id')
        .eq('target_type', 'comment')
        .eq('type', 'like')
        .in('target_id', allCommentIds);
      
      // 统计每个评论的点赞数
      (likesData || []).forEach((like: any) => {
        likesCountMap.set(like.target_id, (likesCountMap.get(like.target_id) || 0) + 1);
      });
    }

    // 批量获取当前用户对所有评论的点赞状态
    const userLikesSet = new Set<string>();
    if (user && allCommentIds.length > 0) {
      const { data: userLikesData } = await (supabase as any)
        .from('interactions')
        .select('target_id')
        .eq('target_type', 'comment')
        .eq('type', 'like')
        .eq('user_id', user.id)
        .in('target_id', allCommentIds);
      
      (userLikesData || []).forEach((like: any) => {
        userLikesSet.add(like.target_id);
      });
    }

    // 构建评论树结构
    const buildCommentTree = (comments: any[], parentId: string | null = null): ThreadPost[] => {
      return comments
        .filter(c => (parentId ? c.parent_id === parentId : !c.parent_id))
        .map(comment => {
          const childReplies = buildCommentTree(comments, comment.id);
          const likesCount = likesCountMap.get(comment.id) || 0;
          const userLiked = userLikesSet.has(comment.id);
          
          return {
            id: comment.id,
            type: 'text',
            content: comment.content || '',
            author: {
              id: comment.author.id,
              handle: comment.author.username,
              displayName: comment.author.display_name || comment.author.username,
              avatar: comment.author.avatar_url,
              verified: comment.author.level >= 10,
            },
            stats: {
              replies: childReplies.length,
              reposts: 0,
              likes: likesCount,
              bookmarks: 0,
              views: 0,
            },
            viewer: {
              liked: userLiked,
              reposted: false,
              bookmarked: false,
            },
            createdAt: comment.created_at,
            reply: {
              root: { uri: postId, cid: postId },
              parent: { uri: parentId || postId, cid: parentId || postId },
            },
            replyCount: childReplies.length,
            replies: childReplies.length > 0 ? childReplies : undefined,
          };
        });
    };

    // 构建评论树
    const replies = buildCommentTree(allRepliesData || []);

    // Transform post data to FeedCard format
    const mainPost: ThreadPost = {
      id: postData.id,
      type: postData.type || 'text',
      content: postData.content?.text || '',
      author: {
        id: postData.author.id,
        handle: postData.author.username,
        displayName: postData.author.display_name || postData.author.username,
        avatar: postData.author.avatar_url,
        verified: postData.author.level >= 10,
      },
      stats: {
        replies: replies.length,
        reposts: postData.shares_count || 0,
        likes: postData.likes_count || 0,
        bookmarks: 0,
        views: postData.views_count || 0,
      },
      viewer: viewerState,
      createdAt: postData.created_at,
      media: postData.content?.media,
      novel: postData.metadata?.novel,
      replyCount: replies.length,
    };

    return {
      post: mainPost,
      replies,
    };
  } catch (error) {
    console.error('Failed to fetch post thread:', error);
    throw error;
  }
}

/**
 * Create a comment on a post
 */
export async function createComment(
  postId: string,
  content: string,
  parentId?: string
): Promise<void> {
  // 移除人工网络延迟，提升响应速度
  // await new Promise(resolve => setTimeout(resolve, 300));

  if (MOCK_DATA_ENABLED) {
    
    // Get current user info (mock)
    const mockUser = {
      id: 'currentUser',
      handle: 'you',
      displayName: 'You',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
    };
    
    // Store comment in session storage
    const comment = commentStorage.add({
      postId,
      content,
      author: mockUser,
      parentId,
    });
    
    return;
  }

  // Supabase implementation
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // 所有评论和回复都以帖子为target，通过parent_id区分层级
    // 这样查询时只需要 target_id = postId 就能获取所有相关评论
    const interactionType = parentId ? 'reply' : 'comment';
    
    // Insert comment/reply interaction
    const { error } = await (supabase as any)
      .from('interactions')
      .insert({
        user_id: user.id,
        target_id: postId, // ✅ 统一使用 postId 作为 target_id
        target_type: 'card', // ✅ 统一使用 'card' 作为 target_type
        type: interactionType,
        content: content,
        parent_id: parentId || null, // 用 parent_id 来维护层级关系
      });

    if (error) {
      console.error('[createComment] Error:', error);
      throw error;
    }

    // Update comment count on the post (only for top-level comments)
    if (!parentId) {
      // 先获取当前评论数，然后更新
      const { data: currentCard, error: cardError } = await (supabase as any)
        .from('feed_cards')
        .select('comments_count')
        .eq('id', postId)
        .maybeSingle();

      if (currentCard && !cardError) {
        const { error: updateError } = await (supabase as any)
          .from('feed_cards')
          .update({
            comments_count: currentCard.comments_count + 1
          })
          .eq('id', postId);

        if (updateError) {
          console.error('[createComment] Update count error:', updateError);
        }
      } else {
        console.error('[createComment] Card not found or error:', cardError);
      }
    }

  } catch (error) {
    console.error(`Failed to create comment:`, error);
    throw error;
  }
}

/**
 * Create a reply to a comment
 */
export async function createReply(
  commentId: string,
  content: string
): Promise<void> {
  // Get the parent comment to find the post ID
  if (MOCK_DATA_ENABLED) {
    const mockUser = {
      id: 'currentUser',
      handle: 'you',
      displayName: 'You',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
    };
    
    commentStorage.add({
      postId: commentId, // In mock mode, we'll use commentId as postId
      content,
      author: mockUser,
      parentId: commentId,
    });
    
    return;
  }

  // Supabase implementation
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get parent comment to find the post ID
    const { data: parentComment, error: parentError } = await (supabase as any)
      .from('interactions')
      .select('target_id')
      .eq('id', commentId)
      .maybeSingle();

    if (parentError || !parentComment) {
      throw new Error('Parent comment not found');
    }

    // Insert reply
    const { error } = await (supabase as any)
      .from('interactions')
      .insert({
        user_id: user.id,
        target_id: commentId, // Reply targets the comment, not the post
        target_type: 'comment',
        type: 'reply',
        content: content,
        parent_id: commentId,
      });

    if (error) {
      console.error('[createReply] Error:', error);
      throw error;
    }

  } catch (error) {
    console.error(`Failed to create reply:`, error);
    throw error;
  }
}

/**
 * Interact with a comment (like/unlike)
 */
export async function interactWithComment(
  commentId: string,
  action: 'like' | 'unlike'
): Promise<void> {
  // 移除人工延迟，提升响应速度

  if (MOCK_DATA_ENABLED) {
    const mockUserId = 'currentUser';
    
    if (action === 'like') {
      interactionStorage.add({
        postId: commentId, // Using commentId as postId in mock mode
        type: 'like',
        userId: mockUserId,
      });
    } else {
      // Remove like
      const interactions = interactionStorage.getAll();
      const filtered = interactions.filter(
        i => !(i.postId === commentId && i.type === 'like' && i.userId === mockUserId)
      );
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('user_interactions', JSON.stringify(filtered));
      }
    }
    return;
  }

  // Supabase implementation
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    if (action === 'like') {
      // Add like to comment
      const { error } = await (supabase as any)
        .from('interactions')
        .insert({
          user_id: user.id,
          target_id: commentId,
          target_type: 'comment',
          type: 'like',
        });

      if (error) {
        console.error('[interactWithComment] Like error:', error);
        throw error;
      }
    } else {
      // Remove like from comment
      const { error } = await (supabase as any)
        .from('interactions')
        .delete()
        .eq('user_id', user.id)
        .eq('target_id', commentId)
        .eq('target_type', 'comment')
        .eq('type', 'like');

      if (error) {
        console.error('[interactWithComment] Unlike error:', error);
        throw error;
      }
    }

  } catch (error) {
    console.error(`Failed to ${action} comment:`, error);
    throw error;
  }
}

/**
 * Perform interaction on a post
 */
export async function interactWithPost(
  postId: string,
  action: 'like' | 'unlike' | 'repost' | 'unrepost' | 'bookmark' | 'unbookmark'
): Promise<void> {
  // 移除人工网络延迟，提升响应速度
  // await new Promise(resolve => setTimeout(resolve, 300));

  if (MOCK_DATA_ENABLED) {
    
    // Get current user info (mock)
    const mockUser = {
      id: 'currentUser',
      handle: 'you',
      displayName: 'You',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
    };
    
    // Handle different actions in mock mode
    if (action === 'like' || action === 'bookmark' || action === 'repost') {
      // Add interaction
      const interaction = interactionStorage.add({
        postId,
        type: action,
        userId: mockUser.id,
      });
    } else if (action === 'unlike' || action === 'unbookmark' || action === 'unrepost') {
      // Remove interaction
      const type = action.replace('un', '') as 'like' | 'bookmark' | 'repost';
      const interactions = interactionStorage.getByPostId(postId);
      const existingInteraction = interactions.find(i => 
        i.userId === mockUser.id && i.type === type
      );
      
      if (existingInteraction) {
        interactionStorage.remove(existingInteraction.id);
      }
    }
    
    return;
  }

  // Supabase implementation
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }


    // Handle different actions
    if (action === 'like') {
      // Insert like interaction
      const { error } = await (supabase as any)
        .from('interactions')
        .insert({
          user_id: user.id,
          target_id: postId,
          target_type: 'card',
          type: 'like',
        });

      if (error) {
        console.error('[interactWithPost] Like error:', error);
        throw error;
      }
    } else if (action === 'unlike') {
      // Delete like interaction
      const { error } = await (supabase as any)
        .from('interactions')
        .delete()
        .eq('user_id', user.id)
        .eq('target_id', postId)
        .eq('target_type', 'card')
        .eq('type', 'like');

      if (error) {
        console.error('[interactWithPost] Unlike error:', error);
        throw error;
      }
    } else if (action === 'bookmark') {
      // Insert bookmark interaction
      const { error } = await (supabase as any)
        .from('interactions')
        .insert({
          user_id: user.id,
          target_id: postId,
          target_type: 'card',
          type: 'bookmark',
        });

      if (error) {
        console.error('[interactWithPost] Bookmark error:', error);
        throw error;
      }
    } else if (action === 'unbookmark') {
      // Delete bookmark interaction
      const { error } = await (supabase as any)
        .from('interactions')
        .delete()
        .eq('user_id', user.id)
        .eq('target_id', postId)
        .eq('target_type', 'card')
        .eq('type', 'bookmark');

      if (error) {
        console.error('[interactWithPost] Unbookmark error:', error);
        throw error;
      }
    } else if (action === 'repost') {
      // Insert repost interaction
      const { error } = await (supabase as any)
        .from('interactions')
        .insert({
          user_id: user.id,
          target_id: postId,
          target_type: 'card',
          type: 'repost',
        });

      if (error) {
        console.error('[interactWithPost] Repost error:', error);
        throw error;
      }
    } else if (action === 'unrepost') {
      // Delete repost interaction
      const { error } = await (supabase as any)
        .from('interactions')
        .delete()
        .eq('user_id', user.id)
        .eq('target_id', postId)
        .eq('target_type', 'card')
        .eq('type', 'repost');

      if (error) {
        console.error('[interactWithPost] Unrepost error:', error);
        throw error;
      }
    }

  } catch (error) {
    console.error(`Failed to ${action} post:`, error);
    throw error;
  }
}

/**
 * Create a new post
 */
export async function createPost(options: {
  content: string;
  type?: 'text' | 'novel' | 'media' | 'audio';
  media?: any[];
}): Promise<FeedCard> {
  const { content, type = 'text', media } = options;
  

  if (MOCK_DATA_ENABLED) {
    // Simulate network delay for mock mode
    await new Promise(resolve => setTimeout(resolve, 800));

    const newPost: any = {
      id: `post-${Date.now()}`,
      type: type,
      author: {
        id: 'currentUser',
        handle: 'you',
        displayName: 'You',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
        verified: false,
      },
      content: content,
      createdAt: new Date().toISOString(),
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
      ...(media && media.length > 0 ? { media } : {}),
    };

    // Add to mock cards array for persistence in this session
    mockCards.unshift(newPost);

    return newPost;
  }

  // Supabase implementation
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Prepare content based on type
    const contentData: any = { text: content };
    if (media && media.length > 0) {
      contentData.media = media;
    }

    // Insert post into database
    const { data, error } = await (supabase as any)
      .from('feed_cards')
      .insert({
        type,
        content: contentData,
        author_id: user.id,
        visibility: 'public',
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
      console.error('[createPost] Supabase error:', error);
      throw error;
    }

    // Transform database response to FeedCard format
    const newPost: any = {
      id: data.id,
      type: data.type as any,
      author: {
        id: (data.profiles as any)?.id || user.id,
        handle: (data.profiles as any)?.username || 'user',
        displayName: (data.profiles as any)?.full_name || 'User',
        avatar: (data.profiles as any)?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        verified: false,
      },
      content: (data.content as any)?.text || content,
      createdAt: data.created_at,
      stats: {
        replies: data.comments_count || 0,
        reposts: data.shares_count || 0,
        likes: data.likes_count || 0,
        bookmarks: 0,
        views: data.views_count || 1,
      },
      viewer: {
        liked: false,
        reposted: false,
        bookmarked: false,
      },
      ...(media && media.length > 0 ? { media } : {}),
    };

    return newPost;
  } catch (error) {
    console.error('[createPost] Failed to create post:', error);
    throw error;
  }
}

/**
 * Post a reply
 */
export async function postReply(options: {
  parentId: string;
  content: string;
  facets?: any[];
}): Promise<FeedCard> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (MOCK_DATA_ENABLED) {
    const newReply: FeedCard = {
      id: `reply-${Date.now()}`,
      type: 'text',
      author: {
        id: 'currentUser',
        handle: 'you',
        displayName: 'You',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
      },
      content: options.content,
      createdAt: new Date().toISOString(),
      stats: {
        replies: 0,
        reposts: 0,
        likes: 0,
        bookmarks: 0,
        views: 0,
      },
      viewer: {
        liked: false,
        reposted: false,
        bookmarked: false,
      },
      reply: {
        root: { uri: options.parentId, cid: options.parentId },
        parent: { uri: options.parentId, cid: options.parentId },
      },
    };

    return newReply;
  }

  // TODO: Implement Supabase integration
  throw new Error('Not implemented');
}

