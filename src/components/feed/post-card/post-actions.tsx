'use client';

import { memo, useState, useCallback } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  ChatBubbleOvalLeftIcon,
  ArrowPathRoundedSquareIcon,
  HeartIcon,
  BookmarkIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
} from '@heroicons/react/24/solid';
import type { CardStats } from '@/types/feed';
import { cn } from '@/lib/utils';

interface PostActionsProps {
  postId: string;
  stats: CardStats;
  viewer?: {
    liked: boolean;
    reposted: boolean;
    bookmarked: boolean;
  };
  onReply?: () => void;
  onRepost?: () => void;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  showViewCount?: boolean;
}

const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return String(count);
};

const iconVariants: Variants = {
  tap: { scale: 0.85 },
  hover: { scale: 1.1 },
};

const likeVariants: Variants = {
  liked: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.3,
      times: [0, 0.5, 1],
      ease: 'easeOut',
    },
  },
};

const PostActions = memo(function PostActions({
  postId,
  stats,
  viewer = { liked: false, reposted: false, bookmarked: false },
  onReply,
  onRepost,
  onLike,
  onBookmark,
  onShare,
  variant = 'default',
  showViewCount = true,
}: PostActionsProps) {
  const [isLiked, setIsLiked] = useState(viewer.liked);
  const [isReposted, setIsReposted] = useState(viewer.reposted);
  const [isBookmarked, setIsBookmarked] = useState(viewer.bookmarked);
  const [likeCount, setLikeCount] = useState(stats.likes);
  const [repostCount, setRepostCount] = useState(stats.reposts);

  const isCompact = variant === 'compact';

  const handleLike = useCallback(async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    
    try {
      await onLike?.();
    } catch (error) {
      // Revert on error
      setIsLiked(!newLiked);
      setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
      console.error('Failed to like:', error);
    }
  }, [isLiked, onLike]);

  const handleRepost = useCallback(async () => {
    const newReposted = !isReposted;
    setIsReposted(newReposted);
    setRepostCount(prev => newReposted ? prev + 1 : prev - 1);
    
    try {
      await onRepost?.();
    } catch (error) {
      // Revert on error
      setIsReposted(!newReposted);
      setRepostCount(prev => newReposted ? prev - 1 : prev + 1);
      console.error('Failed to repost:', error);
    }
  }, [isReposted, onRepost]);

  const handleBookmark = useCallback(async () => {
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);
    
    try {
      await onBookmark?.();
    } catch (error) {
      // Revert on error
      setIsBookmarked(!newBookmarked);
      console.error('Failed to bookmark:', error);
    }
  }, [isBookmarked, onBookmark]);

  return (
    <div className="flex items-center justify-between max-w-md -ml-2">
      {/* Reply */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReply?.();
        }}
        className="group flex items-center gap-1.5 text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
        aria-label={`Reply (${stats.replies})`}
        style={{ touchAction: 'manipulation' }}
      >
        <ChatBubbleOvalLeftIcon className="w-[18px] h-[18px]" />
        {stats.replies > 0 && (
          <span className="text-[13px] font-medium tabular-nums">
            {formatCount(stats.replies)}
          </span>
        )}
      </button>

      {/* Repost */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRepost();
        }}
        className={cn(
          'group flex items-center gap-1.5 transition-colors p-2 rounded-full',
          isReposted 
            ? 'text-green-600 hover:bg-green-500/10' 
            : 'text-gray-500 hover:text-green-600 hover:bg-green-500/10'
        )}
        aria-label={`Repost (${repostCount})`}
        style={{ touchAction: 'manipulation' }}
      >
        <ArrowPathRoundedSquareIcon className="w-[18px] h-[18px]" />
        {repostCount > 0 && (
          <span className="text-[13px] font-medium tabular-nums">
            {formatCount(repostCount)}
          </span>
        )}
      </button>

      {/* Like */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleLike();
        }}
        className={cn(
          'group flex items-center gap-1.5 transition-colors p-2 rounded-full',
          isLiked 
            ? 'text-rose-600 hover:bg-rose-500/10' 
            : 'text-gray-500 hover:text-rose-600 hover:bg-rose-500/10'
        )}
        aria-label={`Like (${likeCount})`}
        style={{ touchAction: 'manipulation' }}
      >
        {isLiked ? (
          <HeartIconSolid className="w-[18px] h-[18px]" />
        ) : (
          <HeartIcon className="w-[18px] h-[18px]" />
        )}
        {likeCount > 0 && (
          <span className="text-[13px] font-medium tabular-nums">
            {formatCount(likeCount)}
          </span>
        )}
      </button>

      {/* View Count */}
      {showViewCount && stats.views > 0 && (
        <div className="flex items-center gap-1 text-gray-500 p-2">
          <ChartBarIcon className="w-[18px] h-[18px]" />
          <span className="text-[13px] font-normal tabular-nums">
            {formatCount(stats.views)}
          </span>
        </div>
      )}

      {/* Secondary Actions */}
      <div className="flex items-center ml-auto">
        {/* Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleBookmark();
          }}
          className={cn(
            'group transition-colors p-2 rounded-full',
            isBookmarked 
              ? 'text-blue-600 hover:bg-blue-500/10' 
              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-500/10'
          )}
          aria-label="Bookmark"
          style={{ touchAction: 'manipulation' }}
        >
          {isBookmarked ? (
            <BookmarkIconSolid className="w-[18px] h-[18px]" />
          ) : (
            <BookmarkIcon className="w-[18px] h-[18px]" />
          )}
        </button>

        {/* Share */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare?.();
          }}
          className="group text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-500/10"
          aria-label="Share"
          style={{ touchAction: 'manipulation' }}
        >
          <ArrowUpTrayIcon className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  );
});

PostActions.displayName = 'PostActions';

export { PostActions };

