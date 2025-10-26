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
    const storedComments = commentStorage.getByPostId(postId);
    const storedInteractions = interactionStorage.getByPostId(postId);
    
    // Get current user's interaction state
    const mockUserId = 'currentUser';
    const userInteractions = storedInteractions.filter(i => i.userId === mockUserId);
    const viewerState = {
      liked: userInteractions.some(i => i.type === 'like'),
      bookmarked: userInteractions.some(i => i.type === 'bookmark'),
      reposted: userInteractions.some(i => i.type === 'repost'),
    };
    
    // Generate mock replies with proper avatar URLs
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
          replies: 5,
          reposts: 12,
          likes: 234,
          bookmarks: 45,
          views: 2340,
        },
        replyCount: 5,
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
          replies: 2,
          reposts: 5,
          likes: 89,
          bookmarks: 12,
          views: 890,
        },
        replyCount: 2,
      } as ThreadPost,
    ];

    // Convert stored comments to ThreadPost format
    const storedReplies: ThreadPost[] = storedComments.map(comment => ({
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
        parent: { uri: postId, cid: postId },
      },
      stats: {
        replies: 0,
        reposts: 0,
        likes: 0,
        bookmarks: 0,
        views: 0,
      },
      replyCount: 0,
    }));

    // Combine default replies with stored comments
    const replies: ThreadPost[] = [...storedReplies, ...defaultReplies].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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

    // Fetch replies (comments)
    const { data: repliesData, error: repliesError } = await (supabase as any)
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
      .eq('type', 'comment')
      .order('created_at', { ascending: true });

    if (repliesError) {
      console.error('[fetchPostThread] Replies fetch error:', repliesError);
    }

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
        replies: postData.comments_count || 0,
        reposts: postData.shares_count || 0,
        likes: postData.likes_count || 0,
        bookmarks: 0,
        views: postData.views_count || 0,
      },
      viewer: viewerState,
      createdAt: postData.created_at,
      media: postData.content?.media,
      novel: postData.metadata?.novel,
      replyCount: postData.comments_count || 0,
    };

    // Transform replies data
    const replies: ThreadPost[] = (repliesData || []).map((reply: any) => ({
      id: reply.id,
      type: 'text',
      content: reply.content || '',
      author: {
        id: reply.author.id,
        handle: reply.author.username,
        displayName: reply.author.display_name || reply.author.username,
        avatar: reply.author.avatar_url,
        verified: reply.author.level >= 10,
      },
      stats: {
        replies: 0,
        reposts: 0,
        likes: 0,
        bookmarks: 0,
        views: 0,
      },
      createdAt: reply.created_at,
      reply: {
        root: { uri: postId, cid: postId },
        parent: { uri: postId, cid: postId },
      },
      replyCount: 0,
    }));


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
  content: string
): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

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


    // Insert comment interaction
    const { error } = await (supabase as any)
      .from('interactions')
      .insert({
        user_id: user.id,
        target_id: postId,
        target_type: 'card',
        type: 'comment',
        content: content,
      });

    if (error) {
      console.error('[createComment] Error:', error);
      throw error;
    }

    // Update comment count on the post
    const { error: updateError } = await (supabase as any)
      .from('feed_cards')
      .update({
        comments_count: (supabase as any).raw('comments_count + 1')
      })
      .eq('id', postId);

    if (updateError) {
      console.error('[createComment] Update count error:', updateError);
    }

  } catch (error) {
    console.error(`Failed to create comment:`, error);
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
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

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

