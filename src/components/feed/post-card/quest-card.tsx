'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BookOpenIcon, 
  ClockIcon, 
  AcademicCapIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import type { QuestCard as QuestCardType } from '@/types/feed';
import { cn } from '@/lib/utils';
import { PostAuthor } from './post-author';
import { PostContent } from './post-content';
import { PostActions } from './post-actions';

interface QuestCardProps {
  card: QuestCardType;
  onReply?: () => void;
  onRepost?: () => void;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onAuthorClick?: () => void;
  onClick?: () => void;
}

const difficultyColors = {
  1: 'text-emerald-500 dark:text-emerald-400',
  2: 'text-blue-400 dark:text-blue-300',
  3: 'text-amber-400 dark:text-amber-300',
  4: 'text-orange-400 dark:text-orange-300',
  5: 'text-red-400 dark:text-red-300',
};

const difficultyLabels = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

const QuestCard = memo(function QuestCard({
  card,
  onReply,
  onRepost,
  onLike,
  onBookmark,
  onShare,
  onAuthorClick,
  onClick,
}: QuestCardProps) {
  const { novel } = card;

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

          {/* Post Content */}
          <div className="mt-2">
            <PostContent 
              content={card.content}
            />
          </div>

          {/* Novel Card */}
          <div className="mt-3">
            <motion.div
              whileHover={{ scale: 1.001, y: -1 }}
              transition={{ type: 'spring', mass: 0.8, stiffness: 300, damping: 30 }}
              className={cn(
                'rounded-2xl overflow-hidden',
                'bg-gray-50/50 dark:bg-white/[0.02]',
                'hover:bg-gray-100/70 dark:hover:bg-white/[0.04]',
                'shadow-sm hover:shadow-md',
                'transition-all duration-300 ease-out'
              )}
            >
            <div className="flex gap-3 p-3">
              {/* Cover Image */}
              {novel.coverImage && (
                <div className="relative w-20 h-28 flex-shrink-0 rounded-[8px] overflow-hidden shadow-sm">
                  <Image
                    src={novel.coverImage}
                    alt={novel.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {/* Difficulty Badge - Ultra Compact Apple Style */}
                  <div className="absolute top-1 right-1">
                    <div className={cn(
                      'px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold',
                      'backdrop-blur-xl bg-white/80 dark:bg-black/70',
                      'shadow-sm',
                      'transition-all duration-200',
                      difficultyColors[novel.difficulty]
                    )}>
                      L{novel.difficulty}
                    </div>
                  </div>
                </div>
              )}

              {/* Novel Info */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h3 className="font-bold text-[15px] text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                  {novel.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {novel.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <AcademicCapIcon className="w-3.5 h-3.5" />
                    <span>{difficultyLabels[novel.difficulty]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpenIcon className="w-3.5 h-3.5" />
                    <span>{novel.totalChapters} chapters</span>
                  </div>
                  {novel.estimatedTime && (
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" />
                      <span>{novel.estimatedTime}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {novel.tags && novel.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {novel.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 px-2 py-1 rounded-[6px] text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Start Learning Button */}
            <div className="px-3 pb-3">
              <Link 
                href={`/novel/${novel.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', mass: 1, stiffness: 250, damping: 24 }}
                  className={cn(
                    'w-full py-3 px-4 rounded-[12px]',
                    'bg-primary',
                    'text-white font-semibold text-[15px] text-center',
                    'flex items-center justify-center gap-2',
                    'shadow-sm hover:shadow-md',
                    'transition-shadow duration-200'
                  )}
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Start Reading</span>
                </motion.div>
              </Link>
            </div>
          </motion.div>
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

QuestCard.displayName = 'QuestCard';

export { QuestCard };

