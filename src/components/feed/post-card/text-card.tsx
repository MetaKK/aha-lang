'use client';

import { memo } from 'react';
import type { TextCard as TextCardType } from '@/types/feed';
import { cn } from '@/lib/utils';
import { PostAuthor } from './post-author';
import { PostContent } from './post-content';
import { PostActions } from './post-actions';

interface TextCardProps {
  card: TextCardType;
  onReply?: () => void;
  onRepost?: () => void;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onAuthorClick?: () => void;
  onClick?: () => void;
  showReplyLine?: boolean;
}

const TextCard = memo(function TextCard({
  card,
  onReply,
  onRepost,
  onLike,
  onBookmark,
  onShare,
  onAuthorClick,
  onClick,
  showReplyLine,
}: TextCardProps) {
  return (
    <article
      className={cn(
        'px-4 py-3 cursor-pointer',
        'transition-all duration-300 ease-out',
        'hover:bg-gray-50/40 dark:hover:bg-white/[0.02]',
        'active:scale-[0.999]'
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Author Avatar - Left Side */}
        <div className="flex-shrink-0 pt-0.5">
          <PostAuthor
            author={card.author}
            timestamp={card.createdAt}
            onAuthorClick={onAuthorClick}
            variant="compact"
            avatarOnly
          />
        </div>

        {/* Content - Right Side */}
        <div className="flex-1 min-w-0">
          {/* Author Info & Timestamp */}
          <PostAuthor
            author={card.author}
            timestamp={card.createdAt}
            onAuthorClick={onAuthorClick}
            variant="compact"
            hideAvatar
          />

          {/* Reply Indicator */}
          {card.reply && (
            <div className="mt-1 text-[14px] text-gray-500 dark:text-gray-400">
              Replying to{' '}
              <span className="text-primary hover:underline">
                @{card.reply.parent.uri}
              </span>
            </div>
          )}

          {/* Post Content */}
          <div className="mt-2">
            <PostContent 
              content={card.content}
              entities={card.entities}
            />
          </div>

          {/* Actions */}
          <div className="mt-3">
            <PostActions
              postId={card.id}
              stats={card.stats}
              viewer={card.viewer}
              onReply={onReply}
              onRepost={onRepost}
              onLike={onLike}
              onBookmark={onBookmark}
              onShare={onShare}
              variant="compact"
            />
          </div>
        </div>
      </div>
    </article>
  );
});

TextCard.displayName = 'TextCard';

export { TextCard };

