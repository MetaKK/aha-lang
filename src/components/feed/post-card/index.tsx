'use client';

import { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { FeedCard } from '@/types/feed';
import { NovelCard } from './novel-card';
import { TextCard } from './text-card';
import { MediaCard } from './media-card';
import { interactWithPost } from '@/lib/api/feed';
import { sharePost } from '@/lib/utils/share';

interface PostCardProps {
  card: FeedCard;
  onInteraction?: (cardId: string, action: string) => void;
}

/**
 * PostCard Factory Component
 * 
 * Based on X and social-app patterns, this component:
 * 1. Routes to the correct card type
 * 2. Handles interactions (like, repost, reply, etc.)
 * 3. Provides navigation
 * 4. Manages optimistic updates
 */
const PostCard = memo(function PostCard({ card, onInteraction }: PostCardProps) {
  const router = useRouter();

  // Handle click to post detail
  const handleClick = useCallback(() => {
    router.push(`/post/${card.id}`);
  }, [card.id, router]);

  // Handle author click
  const handleAuthorClick = useCallback(() => {
    // Prevent navigation to post detail
  }, []);

  // Handle reply
  const handleReply = useCallback(async () => {
    onInteraction?.(card.id, 'reply');
    // TODO: Open composer modal
    console.log('Reply to:', card.id);
  }, [card.id, onInteraction]);

  // Handle repost
  const handleRepost = useCallback(async () => {
    try {
      const action = card.viewer?.reposted ? 'unrepost' : 'repost';
      await interactWithPost(card.id, action);
      onInteraction?.(card.id, action);
    } catch (error) {
      console.error('Failed to repost:', error);
    }
  }, [card.id, card.viewer?.reposted, onInteraction]);

  // Handle like
  const handleLike = useCallback(async () => {
    try {
      const action = card.viewer?.liked ? 'unlike' : 'like';
      await interactWithPost(card.id, action);
      onInteraction?.(card.id, action);
    } catch (error) {
      console.error('Failed to like:', error);
    }
  }, [card.id, card.viewer?.liked, onInteraction]);

  // Handle bookmark
  const handleBookmark = useCallback(async () => {
    try {
      const action = card.viewer?.bookmarked ? 'unbookmark' : 'bookmark';
      await interactWithPost(card.id, action);
      onInteraction?.(card.id, action);
    } catch (error) {
      console.error('Failed to bookmark:', error);
    }
  }, [card.id, card.viewer?.bookmarked, onInteraction]);

  // Handle share
  const handleShare = useCallback(async () => {
    const success = await sharePost(
      card.id,
      card.content,
      card.author.displayName,
      () => {
        // Only call onInteraction if share was successful
        onInteraction?.(card.id, 'share');
      },
      (error) => {
        console.error('Failed to share:', error);
        // Optionally show error toast to user
      }
    );
    
    // success will be false if user cancelled, true if shared successfully
    if (success) {
      console.log('Post shared successfully');
    }
  }, [card.id, card.author.displayName, card.content, onInteraction]);

  // Factory pattern: render the appropriate card type
  const commonProps = {
    onReply: handleReply,
    onRepost: handleRepost,
    onLike: handleLike,
    onBookmark: handleBookmark,
    onShare: handleShare,
    onAuthorClick: handleAuthorClick,
    onClick: handleClick,
  };

  switch (card.type) {
    case 'novel':
      return <NovelCard card={card as any} {...commonProps} />;
    
    case 'media':
      return <MediaCard card={card as any} {...commonProps} />;
    
    case 'audio':
      // Audio cards should be handled by MediaCard but need special handling
      // Convert audio card to media card format for compatibility
      const audioCard = card as any;
      const mediaCard = {
        ...audioCard,
        type: 'media' as const,
        media: [{
          id: audioCard.audio.id,
          type: 'audio' as const,
          url: audioCard.audio.url,
          thumbnail: audioCard.audio.coverImage,
          alt: audioCard.audio.title,
          duration: audioCard.audio.duration,
        }]
      };
      return <MediaCard card={mediaCard} {...commonProps} />;
    
    case 'ad':
    case 'text':
    case 'quote':
    case 'repost':
    default:
      return <TextCard card={card as any} {...commonProps} />;
  }
});

PostCard.displayName = 'PostCard';

export { PostCard };
export type { PostCardProps };

