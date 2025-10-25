'use client';

import { use, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { fetchPostThread } from '@/lib/api/feed';
import { PostCard } from '@/components/feed/post-card';
import type { FeedCard } from '@/types/feed';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default function PostPage({ params }: PostPageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Fetch post thread
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPostThread(id),
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0A0A]">
        <Header onBack={() => router.back()} />
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <ArrowPathIcon className="w-8 h-8 text-blue-600" />
          </motion.div>
          <p className="text-[15px] text-gray-500 dark:text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0A0A]">
        <Header onBack={() => router.back()} />
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <p className="text-[15px] text-gray-500 dark:text-gray-400">Failed to load post</p>
          <motion.button
            onClick={() => refetch()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 text-[15px] font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
          >
            Try again
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0A0A]">
      <Header onBack={() => router.back()} />

      <main className="max-w-[600px] mx-auto">
        {/* Parent/Ancestor Posts */}
        {data.ancestors && data.ancestors.length > 0 && (
          <div className="border-b" style={{borderColor: 'rgb(240, 244, 248)'}}>
            {data.ancestors.map((ancestor) => (
              <motion.div 
                key={'id' in ancestor ? ancestor.id : Math.random()} 
                className="relative"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PostCard card={ancestor as FeedCard} />
                {/* Thread Line */}
                <div className="absolute left-8 top-16 bottom-0 w-[2px]" style={{backgroundColor: 'rgb(240, 244, 248)'}} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Main Post - Enhanced Display with Apple & Notion Design */}
        <motion.article 
          className="bg-white dark:bg-[#1A1A1A] border-b" 
          style={{borderColor: 'rgb(240, 244, 248)'}}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="px-6 py-6">
            {/* Author - X-style header */}
            <motion.div 
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden">
                {'author' in data.post && data.post.author.avatar ? (
                  <img
                    src={data.post.author.avatar}
                    alt={data.post.author.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {'author' in data.post ? data.post.author.displayName[0] : 'U'}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-semibold text-[15px] text-gray-900 dark:text-white truncate">
                    {'author' in data.post ? data.post.author.displayName : 'Unknown'}
                  </div>
                  {'author' in data.post && data.post.author.verified && (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-[14px] text-gray-500 dark:text-gray-400 truncate">
                    @{'author' in data.post ? data.post.author.handle : 'unknown'}
                  </div>
                  <span className="text-gray-400">·</span>
                  <time className="text-[14px] text-gray-500 dark:text-gray-400">
                    {new Date('createdAt' in data.post ? data.post.createdAt : Date.now()).toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                  </svg>
                </button>
              </div>
            </motion.div>

            {/* Content - X-style typography */}
            <motion.div 
              className="text-[15px] leading-[22px] text-gray-900 dark:text-white mb-4 whitespace-pre-wrap break-words font-normal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {'content' in data.post ? data.post.content : ''}
            </motion.div>

            {/* Content Cards - Different Types */}
            <ContentRenderer post={data.post} />

            {/* Stats - X-style responsive layout */}
            <motion.div 
              className="border-y bg-white dark:bg-[#1A1A1A]" 
              style={{borderColor: 'rgb(240, 244, 248)'}}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide">
                  <StatButton 
                    icon="reply" 
                    label="Replies" 
                    value={data.replies?.length || 0} 
                    ariaLabel={`${data.replies?.length || 0} Replies. Reply`}
                  />
                  <StatButton 
                    icon="retweet" 
                    label="Reposts" 
                    value={data.post.stats?.reposts || 0} 
                    ariaLabel={`${data.post.stats?.reposts || 0} reposts. Repost`}
                  />
                  <StatButton 
                    icon="like" 
                    label="Likes" 
                    value={data.post.stats?.likes || 0} 
                    ariaLabel={`${data.post.stats?.likes || 0} Likes. Like`}
                  />
                  <StatButton 
                    icon="bookmark" 
                    label="Bookmarks" 
                    value={data.post.stats?.bookmarks || 0} 
                    ariaLabel={`${data.post.stats?.bookmarks || 0} Bookmarks. Bookmark`}
                  />
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <StatButton 
                    icon="share" 
                    label="Share" 
                    value={0} 
                    ariaLabel="Share post"
                    isShare={true}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.article>

        {/* Replies - X-style layout */}
        {data.replies && data.replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            {data.replies.map((reply, index) => (
              <motion.div
                key={'id' in reply ? reply.id : Math.random()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.05, duration: 0.3 }}
                className="border-b bg-white dark:bg-[#1A1A1A]" 
                style={{borderColor: 'rgb(240, 244, 248)'}}
              >
                <PostCard card={reply as FeedCard} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No replies state */}
        {(!data.replies || data.replies.length === 0) && (
          <motion.div 
            className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white dark:bg-[#1A1A1A]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <p className="text-[15px]">No replies yet</p>
            <p className="text-[13px] mt-2 opacity-60">Be the first to reply</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <header className="sticky top-0 z-10 bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border-b" style={{borderColor: 'rgb(240, 244, 248)'}}>
      <div className="flex items-center gap-4 h-[56px] px-4 max-w-[600px] mx-auto">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-900 dark:text-white" />
        </motion.button>
        <h1 className="text-[17px] font-semibold text-gray-900 dark:text-white">Post</h1>
      </div>
    </header>
  );
}

// Stat Button Component - X-style interactive buttons
function StatButton({ 
  icon, 
  label, 
  value, 
  ariaLabel, 
  isShare = false 
}: { 
  icon: string; 
  label: string; 
  value: number; 
  ariaLabel: string;
  isShare?: boolean;
}) {
  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  const getIcon = () => {
    switch (icon) {
      case 'reply':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
          </svg>
        );
      case 'retweet':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/>
          </svg>
        );
      case 'like':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>
          </svg>
        );
      case 'bookmark':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"/>
          </svg>
        );
      case 'share':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      aria-label={ariaLabel}
      role="button"
      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 flex-shrink-0 ${
        isShare ? 'hover:bg-gray-100 dark:hover:bg-gray-800/50' : ''
      }`}
      style={{ color: 'rgb(83, 100, 113)' }}
    >
      <div className="flex items-center gap-1 sm:gap-2">
        {getIcon()}
        {!isShare && (
          <span className="text-[13px] sm:text-[15px] font-medium whitespace-nowrap">
            {formatValue(value)}
          </span>
        )}
      </div>
    </button>
  );
}

function ContentRenderer({ post }: { post: any }) {
  if (!post.type || post.type === 'text') {
    return null;
  }

  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.3 }}
    >
      {/* Media Card - Images and Videos */}
      {post.type === 'media' && post.media && (
        <>
          {post.media[0]?.type === 'image' && <ImageCard media={post.media} />}
          {post.media[0]?.type === 'video' && <VideoCard media={post.media} />}
        </>
      )}
      
      {/* Audio Card */}
      {post.type === 'audio' && post.audio && <AudioCard audio={post.audio} />}
      
      {/* Novel Card */}
      {post.type === 'novel' && post.novel && <QuestCard content={post.novel} />}
      
      {/* Quote Card */}
      {post.type === 'quote' && post.quotedCard && <QuoteCard quotedCard={post.quotedCard} />}
      
      {/* Repost Card */}
      {post.type === 'repost' && post.originalCard && <RepostCard originalCard={post.originalCard} />}
    </motion.div>
  );
}

// Image Card Component - Notion-inspired flat design with skeleton
function ImageCard({ media }: { media: any }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border" style={{borderColor: 'rgb(240, 244, 248)'}}>
      {!imageLoaded && !imageError && (
        <Skeleton className="w-full h-64" />
      )}
      <img 
        src={media.url || media[0]?.url} 
        alt={media.alt || ''} 
        className={`w-full h-auto object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
        }`}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
      {imageError && (
        <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Video Card Component with skeleton
function VideoCard({ media }: { media: any }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border" style={{borderColor: 'rgb(240, 244, 248)'}}>
      {!videoLoaded && !videoError && (
        <Skeleton className="w-full h-64 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </Skeleton>
      )}
      <video 
        src={media.url || media[0]?.url} 
        controls 
        className={`w-full h-auto transition-opacity duration-300 ${
          videoLoaded ? 'opacity-100' : 'opacity-0 absolute'
        }`}
        poster={media.thumbnail}
        onLoadedData={() => setVideoLoaded(true)}
        onError={() => setVideoError(true)}
      >
        Your browser does not support the video tag.
      </video>
      {videoError && (
        <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">Failed to load video</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Audio Card Component with skeleton
function AudioCard({ audio }: { audio: any }) {
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border" style={{borderColor: 'rgb(240, 244, 248)'}}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white">{audio.title || 'Audio Content'}</h3>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">
            {audio.duration ? `${Math.floor(audio.duration / 60)}:${(audio.duration % 60).toString().padStart(2, '0')}` : 'Click play to listen'}
          </p>
        </div>
      </div>
      
      {!audioLoaded && !audioError && (
        <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4"></div>
      )}
      
      <audio 
        src={audio.url} 
        controls 
        className={`w-full transition-opacity duration-300 ${
          audioLoaded ? 'opacity-100' : 'opacity-0 absolute'
        }`}
        onLoadedData={() => setAudioLoaded(true)}
        onError={() => setAudioError(true)}
      >
        Your browser does not support the audio element.
      </audio>
      
      {audioError && (
        <div className="w-full h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p className="text-xs text-gray-500 dark:text-gray-400">Failed to load audio</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Novel Card Component
function QuestCard({ content }: { content: any }) {
  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border" style={{borderColor: 'rgb(240, 244, 248)'}}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white">{content.title || 'Novel Excerpt'}</h3>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">{content.author || 'Unknown Author'}</p>
        </div>
      </div>
      <div className="text-[15px] leading-[24px] text-gray-700 dark:text-gray-300 italic">
        {content.excerpt || content.text || 'No content available'}
      </div>
    </div>
  );
}

// Quote Card Component - X-style quote tweet
function QuoteCard({ quotedCard }: { quotedCard: any }) {
  return (
    <div className="rounded-2xl border bg-gray-50 dark:bg-gray-800/50" style={{borderColor: 'rgb(240, 244, 248)'}}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {quotedCard.author?.avatar ? (
              <img src={quotedCard.author.avatar} alt={quotedCard.author.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {quotedCard.author?.displayName?.[0] || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[14px] text-gray-900 dark:text-white truncate">
              {quotedCard.author?.displayName || 'Unknown'}
            </div>
            <div className="text-[13px] text-gray-500 dark:text-gray-400 truncate">
              @{quotedCard.author?.handle || 'unknown'}
            </div>
          </div>
        </div>
        <div className="text-[15px] leading-[22px] text-gray-900 dark:text-white">
          {quotedCard.content}
        </div>
      </div>
    </div>
  );
}

// Repost Card Component - X-style repost
function RepostCard({ originalCard }: { originalCard: any }) {
  return (
    <div className="rounded-2xl border bg-gray-50 dark:bg-gray-800/50" style={{borderColor: 'rgb(240, 244, 248)'}}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {originalCard.author?.avatar ? (
              <img src={originalCard.author.avatar} alt={originalCard.author.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {originalCard.author?.displayName?.[0] || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[14px] text-gray-900 dark:text-white truncate">
              {originalCard.author?.displayName || 'Unknown'}
            </div>
            <div className="text-[13px] text-gray-500 dark:text-gray-400 truncate">
              @{originalCard.author?.handle || 'unknown'}
            </div>
          </div>
        </div>
        <div className="text-[15px] leading-[22px] text-gray-900 dark:text-white">
          {originalCard.content}
        </div>
      </div>
    </div>
  );
}

