'use client';

import { memo, useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PlayIcon, PauseIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import type { MediaCard as MediaCardType } from '@/types/feed';
import { cn } from '@/lib/utils';
import { PostAuthor } from './post-author';
import { PostContent } from './post-content';
import { PostActions } from './post-actions';
import { Skeleton } from '@/components/ui/skeleton';

interface MediaCardProps {
  card: MediaCardType;
  onReply?: () => void;
  onRepost?: () => void;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onAuthorClick?: () => void;
  onClick?: () => void;
}

const MediaCard = memo(function MediaCard({
  card,
  onReply,
  onRepost,
  onLike,
  onBookmark,
  onShare,
  onAuthorClick,
  onClick,
}: MediaCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Safe access to media array
  const media = card.media?.[0];
  const mediaArray = card.media || [];

  const getGridClass = () => {
    const count = mediaArray.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-2';
    return 'grid-cols-2';
  };

  // Handle video play/pause
  const handleVideoPlay = (mediaId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click
    if (playingVideo === mediaId) {
      videoRef.current?.pause();
      setPlayingVideo(null);
    } else {
      videoRef.current?.play();
      setPlayingVideo(mediaId);
    }
  };

  // Handle audio play/pause
  const handleAudioPlay = (mediaId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click
    if (playingAudio === mediaId) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      audioRef.current?.play();
      setPlayingAudio(mediaId);
    }
  };

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
          {card.content && (
            <div className="mt-2">
              <PostContent 
                content={card.content}
                entities={card.facets ? {} : undefined}
              />
            </div>
          )}

              {/* Media Grid - 平面设计，无边框 */}
              <div className={cn(
                'mt-3 grid gap-0.5 rounded-[16px] overflow-hidden',
                'transition-all duration-200',
                getGridClass()
              )}>
          {mediaArray.map((mediaItem, index) => {
            // Show max 4 media items
            if (index >= 4) return null;

            const isVideo = mediaItem.type === 'video';
            const isAudio = mediaItem.type === 'audio';
            const isImage = mediaItem.type === 'image' || mediaItem.type === 'gif';
            const aspectRatio = mediaItem.aspectRatio || '16/9';

            return (
              <div
                key={mediaItem.id}
                className={cn(
                  'relative bg-gray-100 dark:bg-gray-900',
                  mediaArray.length === 3 && index === 0 && 'col-span-2'
                )}
                style={{
                  aspectRatio: mediaArray.length === 1 ? aspectRatio : '1',
                }}
              >
                {/* Audio Player */}
                {isAudio && (
                  <>
                    <audio
                      ref={audioRef}
                      src={mediaItem.url}
                      onEnded={() => setPlayingAudio(null)}
                      className="hidden"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleAudioPlay(mediaItem.id, e)}
                        className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                      >
                        {playingAudio === mediaItem.id ? (
                          <PauseIcon className="w-8 h-8 text-white" />
                        ) : (
                          <SpeakerWaveIcon className="w-8 h-8 text-white" />
                        )}
                      </motion.button>
                      
                      {/* Audio Duration */}
                      {mediaItem.duration && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-[6px] bg-black/80 backdrop-blur-sm text-white text-xs font-semibold">
                          {Math.floor(mediaItem.duration / 60)}:{String(mediaItem.duration % 60).padStart(2, '0')}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Image/Video Content */}
                {!isAudio && !imageError && (
                  <>
                    {!imageLoaded[mediaItem.id] && (
                      <Skeleton className="absolute inset-0" />
                    )}
                    <Image
                      src={mediaItem.thumbnail || mediaItem.url}
                      alt={mediaItem.alt || ''}
                      fill
                      className={`object-cover transition-opacity duration-300 ${
                        imageLoaded[mediaItem.id] ? 'opacity-100' : 'opacity-0'
                      }`}
                      unoptimized
                      onLoad={() => setImageLoaded(prev => ({ ...prev, [mediaItem.id]: true }))}
                      onError={() => setImageError(true)}
                    />

                    {/* Video Player */}
                    {isVideo && (
                      <>
                        <video
                          ref={videoRef}
                          src={mediaItem.url}
                          className="absolute inset-0 w-full h-full object-cover"
                          onEnded={() => setPlayingVideo(null)}
                          style={{ display: playingVideo === mediaItem.id ? 'block' : 'none' }}
                        />
                        
                        {/* Video Play Button */}
                        {playingVideo !== mediaItem.id && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleVideoPlay(mediaItem.id, e)}
                            className={cn(
                              'absolute inset-0 flex items-center justify-center',
                              'bg-black/30 backdrop-blur-[2px]'
                            )}
                          >
                            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
                              <PlayIcon className="w-7 h-7 text-white ml-0.5" />
                            </div>

                            {/* Duration */}
                            {mediaItem.duration && (
                              <div className="absolute bottom-2 right-2 px-2 py-1 rounded-[6px] bg-black/80 backdrop-blur-sm text-white text-xs font-semibold">
                                {Math.floor(mediaItem.duration / 60)}:{String(mediaItem.duration % 60).padStart(2, '0')}
                              </div>
                            )}
                          </motion.button>
                        )}
                      </>
                    )}

                    {/* More Images Indicator */}
                    {index === 3 && mediaArray.length > 4 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <span className="text-4xl font-bold text-white">
                          +{mediaArray.length - 4}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* Error State */}
                {!isAudio && imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                      Media failed to load
                    </span>
                  </div>
                )}
              </div>
            );
          })}
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

MediaCard.displayName = 'MediaCard';

export { MediaCard };

