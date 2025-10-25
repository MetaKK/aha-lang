// Feed API - Client-side implementation with Supabase integration
import type { FeedCard, FeedResponse, FeedFilters, PostThread, ThreadPost } from '@/types/feed';
import { createEnhancedMockData } from './mock-data';
import { getSupabaseClient, isBackendSyncEnabled } from '@/lib/supabase/client';
import { getMockPosts } from './content';

// Check if mock data should be enabled
const MOCK_DATA_ENABLED = !isBackendSyncEnabled();

console.log('[Feed API] Mock data enabled:', MOCK_DATA_ENABLED);
console.log('[Feed API] Backend sync enabled:', isBackendSyncEnabled());

// Generate mock data for testing virtual scrolling
const generateMockCards = (count: number): FeedCard[] => {
  const cards: FeedCard[] = [];
  
  const novels = [
    { title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling', difficulty: 3, tags: ['Fantasy', 'Adventure', 'Magic'] },
    { title: 'Pride and Prejudice', author: 'Jane Austen', difficulty: 5, tags: ['Romance', 'Classic', 'British English'] },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', difficulty: 4, tags: ['Classic', 'American Literature'] },
    { title: '1984', author: 'George Orwell', difficulty: 4, tags: ['Dystopian', 'Political', 'Classic'] },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', difficulty: 3, tags: ['Classic', 'American South'] },
  ];

  const authors = [
    { handle: 'harrypotter', displayName: 'Harry Potter Official', seed: 'harry' },
    { handle: 'elonmusk', displayName: 'Elon Musk', seed: 'elon' },
    { handle: 'bbclearning', displayName: 'BBC Learning English', seed: 'bbc' },
    { handle: 'prideandprejudice', displayName: 'Classic Literature', seed: 'classic' },
    { handle: 'readingclub', displayName: 'Reading Club', seed: 'reading' },
    { handle: 'englishteacher', displayName: 'English Teacher', seed: 'teacher' },
    { handle: 'bookworm', displayName: 'Book Worm', seed: 'bookworm' },
    { handle: 'literature_lover', displayName: 'Literature Lover', seed: 'literature' },
  ];

  const textContents = [
    'Learning English through storytelling is the most effective method! 📚✨',
    'Just finished reading an amazing chapter. The character development is incredible! 🎭',
    'Pro tip: Read for 30 minutes every day to improve your vocabulary naturally. 💡',
    'This book completely changed my perspective on language learning. Highly recommend! 🌟',
    'The best way to learn idioms is through context in novels. Try it! 📖',
    'Started my English learning journey today. Feeling excited! 🚀',
    'Reading classic literature helps with formal English. Give it a try! 🎩',
    'Just discovered this amazing novel. Perfect for intermediate learners! 🎯',
  ];

  for (let i = 0; i < count; i++) {
    // Enhanced card type distribution for better testing
    const cardType = i % 8 === 0 ? 'novel' : 
                     i % 6 === 0 ? 'audio' :
                     i % 4 === 0 ? 'media' : 'text';
    const author = authors[i % authors.length];
    const baseTime = Date.now() - 1000 * 60 * (i * 15 + Math.random() * 30);

    if (cardType === 'novel') {
      const novel = novels[i % novels.length];
      cards.push({
        id: `card-${i + 1}`,
        type: 'novel',
        author: {
          id: `author-${i % authors.length}`,
          handle: author.handle,
          displayName: author.displayName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.seed}-${i}`,
          verified: i % 3 === 0,
          badges: i % 3 === 0 ? ['verified'] : i % 5 === 0 ? ['verified', 'premium'] : undefined,
        },
        content: `Discover "${novel.title}" by ${novel.author}! ${textContents[i % textContents.length]}`,
        createdAt: new Date(baseTime).toISOString(),
        stats: {
          replies: Math.floor(Math.random() * 500) + 50,
          reposts: Math.floor(Math.random() * 2000) + 100,
          likes: Math.floor(Math.random() * 20000) + 500,
          bookmarks: Math.floor(Math.random() * 5000) + 100,
          views: Math.floor(Math.random() * 200000) + 10000,
        },
        viewer: {
          liked: i % 7 === 0,
          reposted: i % 11 === 0,
          bookmarked: i % 13 === 0,
        },
        novel: {
          id: `novel-${i}`,
          title: novel.title,
          excerpt: 'Click to start reading this amazing story...',
          coverImage: `https://picsum.photos/400/600?random=${i}`,
          difficulty: novel.difficulty as 1 | 2 | 3 | 4 | 5,
          totalChapters: Math.floor(Math.random() * 50) + 10,
          currentChapter: 1,
          tags: novel.tags,
          language: 'en-GB',
          estimatedTime: `${Math.floor(Math.random() * 40) + 20} min`,
        },
      });
    } else if (cardType === 'audio') {
      // Audio card with rich content
      cards.push({
        id: `card-${i + 1}`,
        type: 'audio',
        author: {
          id: `author-${i % authors.length}`,
          handle: author.handle,
          displayName: author.displayName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.seed}-${i}`,
          verified: i % 3 === 0,
          badges: i % 3 === 0 ? ['verified'] : undefined,
        },
        content: `🎧 ${textContents[i % textContents.length]} Listen to this audio lesson!`,
        createdAt: new Date(baseTime).toISOString(),
        stats: {
          replies: Math.floor(Math.random() * 200) + 20,
          reposts: Math.floor(Math.random() * 1000) + 100,
          likes: Math.floor(Math.random() * 5000) + 500,
          bookmarks: Math.floor(Math.random() * 2000) + 200,
          views: Math.floor(Math.random() * 50000) + 5000,
        },
        viewer: {
          liked: i % 6 === 0,
          reposted: false,
          bookmarked: i % 8 === 0,
        },
        audio: {
          id: `audio-${i}`,
          url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Sample audio
          title: `English Lesson ${i + 1}: Advanced Vocabulary`,
          duration: Math.floor(Math.random() * 600) + 120, // 2-12 minutes
          waveform: Array.from({ length: 50 }, () => Math.random()),
          coverImage: `https://picsum.photos/400/400?random=${i + 200}`,
        },
      });
    } else if (cardType === 'media') {
      // Enhanced media cards with different image counts
      const mediaCount = i % 5 === 0 ? 1 : 
                        i % 4 === 0 ? 2 : 
                        i % 3 === 0 ? 3 : 
                        i % 2 === 0 ? 4 : 5;
      
      const mediaItems = [];
      let cardType: 'image' | 'video' = 'image';
      for (let j = 0; j < mediaCount; j++) {
        const mediaType = j === 0 && i % 3 === 0 ? 'video' : 'image';
        if (j === 0) cardType = mediaType === 'image' ? 'image' : 'video';
        mediaItems.push({
          id: `media-${i}-${j}`,
          type: mediaType,
          url: `https://picsum.photos/800/600?random=${i * 10 + j}`,
          thumbnail: `https://picsum.photos/400/300?random=${i * 10 + j}`,
          alt: `Learning content ${j + 1}`,
          width: 1920,
          height: 1080,
          aspectRatio: mediaCount === 1 ? '16/9' : '1',
          duration: mediaType === 'video' ? Math.floor(Math.random() * 300) + 60 : undefined,
        });
      }

      cards.push({
        id: `card-${i + 1}`,
        type: cardType,
        author: {
          id: `author-${i % authors.length}`,
          handle: author.handle,
          displayName: author.displayName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.seed}-${i}`,
          verified: i % 3 === 0,
          badges: i % 3 === 0 ? ['verified', 'organization'] : undefined,
        },
        content: `${textContents[i % textContents.length]} 📸 Check out these ${mediaCount} ${mediaCount === 1 ? 'image' : 'images'}!`,
        createdAt: new Date(baseTime).toISOString(),
        stats: {
          replies: Math.floor(Math.random() * 400) + 30,
          reposts: Math.floor(Math.random() * 3000) + 200,
          likes: Math.floor(Math.random() * 15000) + 1000,
          bookmarks: Math.floor(Math.random() * 6000) + 500,
          views: Math.floor(Math.random() * 300000) + 20000,
        },
        viewer: {
          liked: i % 5 === 0,
          reposted: false,
          bookmarked: i % 9 === 0,
        },
        media: mediaItems as any,
      });
    } else {
      cards.push({
        id: `card-${i + 1}`,
        type: 'text',
        author: {
          id: `author-${i % authors.length}`,
          handle: author.handle,
          displayName: author.displayName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.seed}-${i}`,
          verified: i % 4 === 0,
          badges: i % 4 === 0 ? ['verified'] : i % 6 === 0 ? ['premium'] : undefined,
        },
        content: textContents[i % textContents.length],
        createdAt: new Date(baseTime).toISOString(),
        stats: {
          replies: Math.floor(Math.random() * 200) + 10,
          reposts: Math.floor(Math.random() * 1000) + 50,
          likes: Math.floor(Math.random() * 10000) + 100,
          bookmarks: Math.floor(Math.random() * 2000) + 50,
          views: Math.floor(Math.random() * 100000) + 5000,
        },
        viewer: {
          liked: i % 8 === 0,
          reposted: false,
          bookmarked: i % 10 === 0,
        },
        entities: {
          hashtags: i % 3 === 0 ? ['EnglishLearning', 'Reading'] : undefined,
        },
      });
    }
  }

  return cards;
};

// Generate enhanced mock cards for testing different media scenarios
const enhancedMockCards = createEnhancedMockData();
const generatedMockCards = generateMockCards(42); // Reduced to make room for enhanced cards
const mockCards: FeedCard[] = [...enhancedMockCards, ...generatedMockCards];

/**
 * Fetch feed cards with pagination
 */
export async function fetchFeed(options: {
  cursor?: string;
  limit?: number;
  filters?: FeedFilters;
}): Promise<FeedResponse> {
  const { cursor, limit = 20, filters } = options;

  console.log('[fetchFeed] Called with:', { cursor, limit, filters, MOCK_DATA_ENABLED });

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

    console.log('[fetchFeed] Returning mock data:', { 
      start, 
      end, 
      cardsCount: cards.length, 
      dynamicPosts: dynamicPosts.length,
      staticMockCards: mockCards.length,
      totalCards: allCards.length 
    });

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

    console.log('[fetchFeed] Fetching from Supabase:', { start, end });

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

    console.log('[fetchFeed] Supabase data:', data);

    // Transform database response to FeedCard format
    const cards: FeedCard[] = (data || []).map((item: any) => ({
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
        liked: false,
        reposted: false,
        bookmarked: false,
      },
      ...(item.content?.media ? { media: item.content.media } : {}),
    }));

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
    const post = mockCards.find(card => card.id === postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Generate mock replies
    const replies: ThreadPost[] = [
      {
        ...mockCards[1],
        type: 'text',
        id: `reply-${postId}-1`,
        content: 'This is amazing! I\'ve been looking for something like this.',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
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

    return {
      post: {
        ...post,
        replyCount: replies.length,
      } as ThreadPost,
      replies,
    };
  }

  // TODO: Implement Supabase integration
  try {
    // const { data, error } = await supabase
    //   .from('feed_cards')
    //   .select('*')
    //   .eq('id', postId)
    //   .single();
    
    throw new Error('Not implemented');
  } catch (error) {
    console.error('Failed to fetch post thread:', error);
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
    console.log(`[Mock] ${action} post:`, postId);
    return;
  }

  // TODO: Implement Supabase integration
  try {
    // await supabase.from('interactions').insert({
    //   card_id: postId,
    //   type: action,
    //   timestamp: new Date().toISOString(),
    // });
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
  
  console.log('[createPost] Creating post:', { content, type, MOCK_DATA_ENABLED });

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

    console.log('[createPost] Mock post created:', newPost.id);
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

    console.log('[createPost] Supabase post created:', newPost.id);
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

