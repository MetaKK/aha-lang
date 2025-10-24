'use client';

import { memo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PostContentProps {
  content: string;
  entities?: {
    mentions?: Array<{ handle: string; did: string }>;
    hashtags?: string[];
    urls?: Array<{ url: string; displayUrl: string }>;
  };
  truncate?: number;
  className?: string;
}

const PostContent = memo(function PostContent({
  content,
  entities,
  truncate,
  className,
}: PostContentProps) {
  // Rich text parsing
  const parseContent = () => {
    if (!entities) {
      return <p className="whitespace-pre-wrap break-words">{content}</p>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const text = content;

    // Find all entity positions
    const allEntities: Array<{
      start: number;
      end: number;
      type: 'mention' | 'hashtag' | 'url';
      data: any;
    }> = [];

    // Add mentions
    entities.mentions?.forEach(mention => {
      const handle = `@${mention.handle}`;
      let index = text.indexOf(handle, lastIndex);
      while (index !== -1) {
        allEntities.push({
          start: index,
          end: index + handle.length,
          type: 'mention',
          data: mention,
        });
        index = text.indexOf(handle, index + 1);
      }
    });

    // Add hashtags
    entities.hashtags?.forEach(tag => {
      const hashtag = `#${tag}`;
      let index = text.indexOf(hashtag, lastIndex);
      while (index !== -1) {
        allEntities.push({
          start: index,
          end: index + hashtag.length,
          type: 'hashtag',
          data: tag,
        });
        index = text.indexOf(hashtag, index + 1);
      }
    });

    // Add URLs
    entities.urls?.forEach(urlEntity => {
      let index = text.indexOf(urlEntity.url, lastIndex);
      while (index !== -1) {
        allEntities.push({
          start: index,
          end: index + urlEntity.url.length,
          type: 'url',
          data: urlEntity,
        });
        index = text.indexOf(urlEntity.url, index + 1);
      }
    });

    // Sort by start position
    allEntities.sort((a, b) => a.start - b.start);

    // Build the content with entities
    allEntities.forEach((entity, i) => {
      // Add text before entity
      if (entity.start > lastIndex) {
        parts.push(
          <span key={`text-${i}`}>
            {text.substring(lastIndex, entity.start)}
          </span>
        );
      }

      // Add entity
      switch (entity.type) {
        case 'mention':
          parts.push(
            <Link
              key={`mention-${i}`}
              href={`/profile/${entity.data.handle}`}
              className="text-blue-600 hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              @{entity.data.handle}
            </Link>
          );
          break;
        case 'hashtag':
          parts.push(
            <Link
              key={`hashtag-${i}`}
              href={`/search?q=${encodeURIComponent(`#${entity.data}`)}`}
              className="text-blue-600 hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              #{entity.data}
            </Link>
          );
          break;
        case 'url':
          parts.push(
            <a
              key={`url-${i}`}
              href={entity.data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {entity.data.displayUrl || entity.data.url}
            </a>
          );
          break;
      }

      lastIndex = entity.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return <p className="whitespace-pre-wrap break-words">{parts}</p>;
  };

  const displayContent = truncate && content.length > truncate
    ? `${content.substring(0, truncate)}...`
    : content;

  return (
    <div className={cn(
      'text-[17px] leading-[1.47] text-gray-900 dark:text-gray-100',
      'tracking-[-0.408px]',
      className
    )}>
      {entities ? parseContent() : (
        <p className="whitespace-pre-wrap break-words">{displayContent}</p>
      )}
    </div>
  );
});

PostContent.displayName = 'PostContent';

export { PostContent };

