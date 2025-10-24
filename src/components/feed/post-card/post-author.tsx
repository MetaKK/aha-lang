'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckBadgeIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid';
import type { Author } from '@/types/feed';
import { cn } from '@/lib/utils';
import { AvatarSkeleton } from '@/components/ui/skeleton';

interface PostAuthorProps {
  author: Author;
  timestamp: string;
  onAuthorClick?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  avatarOnly?: boolean;
  hideAvatar?: boolean;
}

const PostAuthor = memo(function PostAuthor({
  author,
  timestamp,
  onAuthorClick,
  variant = 'default',
  avatarOnly = false,
  hideAvatar = false,
}: PostAuthorProps) {
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const isCompact = variant === 'compact';
  const avatarSize = 40; // iOS standard 40dp

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'verified':
        return <CheckBadgeIcon className="w-4 h-4 text-blue-500" />;
      case 'organization':
        return <BuildingOfficeIcon className="w-4 h-4 text-gray-500" />;
      case 'premium':
        return <CheckBadgeIcon className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getRelativeTime = (isoString: string) => {
    const now = Date.now();
    const timestamp = new Date(isoString).getTime();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Avatar only mode - just show avatar
  if (avatarOnly) {
    return (
      <Link
        href={`/profile/${author.handle}`}
        onClick={onAuthorClick}
        className="relative flex-shrink-0 group"
      >
        <div className="relative overflow-hidden rounded-full hover:opacity-90 transition-all duration-200 ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          {author.avatar ? (
            <>
              {!avatarLoaded && !avatarError && (
                <AvatarSkeleton size="md" />
              )}
              <Image
                src={author.avatar}
                alt={author.displayName}
                width={avatarSize}
                height={avatarSize}
                className={`object-cover rounded-full transition-opacity duration-300 ${
                  avatarLoaded ? 'opacity-100' : 'opacity-0 absolute'
                }`}
                unoptimized
                onLoad={() => setAvatarLoaded(true)}
                onError={() => setAvatarError(true)}
              />
              {avatarError && (
                <div 
                  className="bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold rounded-full"
                  style={{ width: avatarSize, height: avatarSize }}
                >
                  {author.displayName[0]}
                </div>
              )}
            </>
          ) : (
            <div 
              className="bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold rounded-full"
              style={{ width: avatarSize, height: avatarSize }}
            >
              {author.displayName[0]}
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Hide avatar mode - just show author info
  if (hideAvatar) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        <Link
          href={`/profile/${author.handle}`}
          onClick={onAuthorClick}
          className="inline-flex items-center gap-1 hover:underline"
        >
          <span className="font-semibold text-[15px] text-gray-900 dark:text-white truncate">
            {author.displayName}
          </span>
          {author.badges?.map((badge) => (
            <span key={badge} className="flex-shrink-0">
              {getBadgeIcon(badge)}
            </span>
          ))}
        </Link>
        <span className="text-[15px] text-gray-500 dark:text-gray-400">
          @{author.handle}
        </span>
        <span className="text-gray-500 dark:text-gray-400">·</span>
        <time
          dateTime={timestamp}
          className="text-[15px] text-gray-500 dark:text-gray-400 hover:underline cursor-pointer"
          title={new Date(timestamp).toLocaleString()}
        >
          {getRelativeTime(timestamp)}
        </time>
      </div>
    );
  }

  // Default mode - show avatar and info
  return (
    <div className="flex items-start gap-3">
      <Link
        href={`/profile/${author.handle}`}
        onClick={onAuthorClick}
        className="relative flex-shrink-0"
      >
        <div className="relative overflow-hidden rounded-full hover:opacity-90 transition-all duration-200 ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          {author.avatar ? (
            <>
              {!avatarLoaded && !avatarError && (
                <AvatarSkeleton size="md" />
              )}
              <Image
                src={author.avatar}
                alt={author.displayName}
                width={avatarSize}
                height={avatarSize}
                className={`object-cover rounded-full transition-opacity duration-300 ${
                  avatarLoaded ? 'opacity-100' : 'opacity-0 absolute'
                }`}
                unoptimized
                onLoad={() => setAvatarLoaded(true)}
                onError={() => setAvatarError(true)}
              />
              {avatarError && (
                <div 
                  className="bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold rounded-full"
                  style={{ width: avatarSize, height: avatarSize }}
                >
                  {author.displayName[0]}
                </div>
              )}
            </>
          ) : (
            <div 
              className="bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold rounded-full"
              style={{ width: avatarSize, height: avatarSize }}
            >
              {author.displayName[0]}
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap">
          <Link
            href={`/profile/${author.handle}`}
            onClick={onAuthorClick}
            className="inline-flex items-center gap-1 hover:underline"
          >
            <span className="font-bold text-[15px] text-gray-900 dark:text-white truncate">
              {author.displayName}
            </span>
            {author.badges?.map((badge) => (
              <span key={badge} className="flex-shrink-0">
                {getBadgeIcon(badge)}
              </span>
            ))}
          </Link>
          <span className="text-[15px] text-gray-500 dark:text-gray-400 truncate">
            @{author.handle}
          </span>
          <span className="text-gray-500 dark:text-gray-400">·</span>
          <time
            dateTime={timestamp}
            className="text-[15px] text-gray-500 dark:text-gray-400 hover:underline cursor-pointer"
            title={new Date(timestamp).toLocaleString()}
          >
            {getRelativeTime(timestamp)}
          </time>
        </div>

        {variant === 'detailed' && author.description && (
          <p className="text-[15px] text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {author.description}
          </p>
        )}
      </div>
    </div>
  );
});

PostAuthor.displayName = 'PostAuthor';

export { PostAuthor };

