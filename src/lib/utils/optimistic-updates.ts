/**
 * 乐观更新工具函数
 * 用于在API请求完成前立即更新UI状态，提升用户体验
 */

import { QueryClient } from '@tanstack/react-query';
import type { FeedCard, PostThread, Comment, ThreadPost } from '@/types/feed';

/**
 * 乐观更新帖子交互状态
 */
export function optimisticUpdatePostInteraction(
  queryClient: QueryClient,
  postId: string,
  action: 'like' | 'unlike' | 'bookmark' | 'unbookmark' | 'repost' | 'unrepost'
) {
  // 更新帖子详情页缓存
  queryClient.setQueryData(['post', postId], (oldData: PostThread | undefined) => {
    if (!oldData) return oldData;

    const isLikeAction = action === 'like' || action === 'unlike';
    const isBookmarkAction = action === 'bookmark' || action === 'unbookmark';
    const isRepostAction = action === 'repost' || action === 'unrepost';
    
    const isAdding = !action.startsWith('un');

    return {
      ...oldData,
      post: {
        ...oldData.post,
        viewer: {
          liked: false,
          reposted: false,
          bookmarked: false,
          ...oldData.post.viewer,
          ...(isLikeAction && { liked: isAdding }),
          ...(isBookmarkAction && { bookmarked: isAdding }),
          ...(isRepostAction && { reposted: isAdding }),
        },
        stats: {
          ...oldData.post.stats,
          ...(isLikeAction && { 
            likes: oldData.post.stats.likes + (isAdding ? 1 : -1) 
          }),
          ...(isRepostAction && { 
            reposts: oldData.post.stats.reposts + (isAdding ? 1 : -1) 
          }),
        },
      },
    };
  });

  // 更新Feed列表缓存
  queryClient.setQueriesData(
    { queryKey: ['feed'] },
    (oldData: any) => {
      if (!oldData?.pages) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          cards: page.cards.map((card: FeedCard) => {
            if (card.id !== postId) return card;

            const isLikeAction = action === 'like' || action === 'unlike';
            const isBookmarkAction = action === 'bookmark' || action === 'unbookmark';
            const isRepostAction = action === 'repost' || action === 'unrepost';
            const isAdding = !action.startsWith('un');

            return {
              ...card,
              viewer: {
                ...card.viewer,
                ...(isLikeAction && { liked: isAdding }),
                ...(isBookmarkAction && { bookmarked: isAdding }),
                ...(isRepostAction && { reposted: isAdding }),
              },
              stats: {
                ...card.stats,
                ...(isLikeAction && { 
                  likes: card.stats.likes + (isAdding ? 1 : -1) 
                }),
                ...(isRepostAction && { 
                  reposts: card.stats.reposts + (isAdding ? 1 : -1) 
                }),
              },
            };
          }),
        })),
      };
    }
  );
}

/**
 * 乐观更新评论交互状态
 */
export function optimisticUpdateCommentInteraction(
  queryClient: QueryClient,
  postId: string,
  commentId: string,
  action: 'like' | 'unlike'
) {
  queryClient.setQueryData(['post', postId], (oldData: PostThread | undefined) => {
    if (!oldData) return oldData;

    const isAdding = action === 'like';

    const updateComment = (comment: ThreadPost): ThreadPost => {
      if (comment.id === commentId) {
        return {
          ...comment,
          viewer: {
            ...comment.viewer,
            liked: isAdding,
            reposted: comment.viewer?.reposted || false,
            bookmarked: comment.viewer?.bookmarked || false,
          },
          stats: {
            ...comment.stats,
            likes: (comment.stats?.likes || 0) + (isAdding ? 1 : -1),
          },
        };
      }

      // 递归更新子评论
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: comment.replies.map(updateComment),
        };
      }

      return comment;
    };

    return {
      ...oldData,
      replies: oldData.replies?.map(updateComment) || [],
    };
  });
}

/**
 * 乐观添加新评论
 */
export function optimisticAddComment(
  queryClient: QueryClient,
  postId: string,
  comment: Partial<ThreadPost>,
  parentId?: string
) {
  queryClient.setQueryData(['post', postId], (oldData: PostThread | undefined) => {
    if (!oldData) return oldData;

    const newComment: ThreadPost = {
      id: `temp-${Date.now()}`, // 临时ID
      type: 'text',
      author: comment.author || {
        id: 'current-user',
        handle: 'you',
        displayName: 'You',
        avatar: '',
      },
      content: comment.content || '',
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
      replyCount: 0,
      replies: [],
    };

    if (parentId) {
      // 添加为回复
      const addReplyToComment = (c: ThreadPost): ThreadPost => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newComment],
            replyCount: (c.replyCount || 0) + 1,
          };
        }
        
        if (c.replies && c.replies.length > 0) {
          return {
            ...c,
            replies: c.replies.map(addReplyToComment),
          };
        }
        
        return c;
      };

      return {
        ...oldData,
        replies: oldData.replies?.map(addReplyToComment) || [],
      };
    } else {
      // 添加为顶级评论
      return {
        ...oldData,
        post: {
          ...oldData.post,
          stats: {
            ...oldData.post.stats,
            replies: oldData.post.stats.replies + 1,
          },
          replyCount: (oldData.post.replyCount || 0) + 1,
        },
        replies: [newComment, ...(oldData.replies || [])],
      };
    }
  });

  // 更新Feed列表中的评论数
  queryClient.setQueriesData(
    { queryKey: ['feed'] },
    (oldData: any) => {
      if (!oldData?.pages) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          cards: page.cards.map((card: FeedCard) => {
            if (card.id !== postId) return card;
            
            return {
              ...card,
              stats: {
                ...card.stats,
                replies: card.stats.replies + 1,
              },
            };
          }),
        })),
      };
    }
  );
}

/**
 * 回滚乐观更新
 */
export function rollbackOptimisticUpdate(
  queryClient: QueryClient,
  queryKey: any[],
  previousData: any
) {
  queryClient.setQueryData(queryKey, previousData);
}
