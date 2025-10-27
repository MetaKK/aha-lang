'use client';

import { use, useMemo, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartOutline, BookmarkIcon as BookmarkOutline, ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { fetchPostThread, interactWithPost, createComment } from '@/lib/api/feed';
import { PostCard } from '@/components/feed/post-card';
import type { FeedCard } from '@/types/feed';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default function PostPage({ params }: PostPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  // Fetch post thread
  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPostThread(id),
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const action = data?.post.viewer?.liked ? 'unlike' : 'like';
      await interactWithPost(id, action);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const action = data?.post.viewer?.bookmarked ? 'unbookmark' : 'bookmark';
      await interactWithPost(id, action);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  // Repost mutation
  const repostMutation = useMutation({
    mutationFn: async () => {
      const action = data?.post.viewer?.reposted ? 'unrepost' : 'repost';
      await interactWithPost(id, action);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await createComment(id, content);
    },
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  const handleLike = useCallback(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    likeMutation.mutate();
  }, [user, router, likeMutation]);

  const handleBookmark = useCallback(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    bookmarkMutation.mutate();
  }, [user, router, bookmarkMutation]);

  const handleRepost = useCallback(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    repostMutation.mutate();
  }, [user, router, repostMutation]);

  const handleComment = useCallback(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    if (commentText.trim()) {
      commentMutation.mutate(commentText.trim());
    }
  }, [user, router, commentText, commentMutation]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0A0A]">
        <Header onBack={() => router.back()} />
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
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
          <div className="text-center">
            <p className="text-[15px] text-gray-500 dark:text-gray-400 mb-2">
              Failed to load post
            </p>
            <p className="text-[13px] text-gray-400 dark:text-gray-500">
              Post ID: {id}
            </p>
          </div>
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
          <div className="border-b border-subtle">
            {data.ancestors.map((ancestor) => (
              <motion.div 
                key={'id' in ancestor ? ancestor.id : Math.random()} 
                className="relative"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <PostCard card={ancestor as FeedCard} />
                {/* Thread Line */}
                <div className="absolute left-8 top-16 bottom-0 w-[2px] bg-[var(--color-border-subtle)]" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Main Post - Enhanced Display with Apple & Notion Design */}
        <motion.article 
          className="bg-white dark:bg-[#1A1A1A] border-b border-subtle"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="px-6 py-6">
            {/* Author - X-style header */}
            <motion.div 
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05, duration: 0.2 }}
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

            {/* Stats - X-style responsive layout with interactions */}
            <motion.div 
              className="bg-white dark:bg-[#1A1A1A] border-t border-subtle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.2 }}
            >
              <div className="flex items-center justify-around px-2 py-2">
                <InteractionButton
                  icon="reply"
                  count={data.replies?.length || 0}
                  onClick={() => {
                    const input = document.getElementById('comment-input');
                    input?.focus();
                  }}
                  ariaLabel="Reply"
                />
                <InteractionButton
                  icon="repost"
                  count={data.post.stats?.reposts || 0}
                  active={data.post.viewer?.reposted}
                  onClick={handleRepost}
                  loading={repostMutation.isPending}
                  ariaLabel="Repost"
                />
                <InteractionButton
                  icon="like"
                  count={data.post.stats?.likes || 0}
                  active={data.post.viewer?.liked}
                  onClick={handleLike}
                  loading={likeMutation.isPending}
                  ariaLabel="Like"
                />
                <InteractionButton
                  icon="bookmark"
                  count={data.post.stats?.bookmarks || 0}
                  active={data.post.viewer?.bookmarked}
                  onClick={handleBookmark}
                  loading={bookmarkMutation.isPending}
                  ariaLabel="Bookmark"
                />
              </div>
            </motion.div>
          </div>
        </motion.article>

        {/* Comment Input - X-style */}
        {user && (
          <motion.div
            className="bg-white dark:bg-[#1A1A1A] border-b border-subtle p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.2 }}
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {(profile?.display_name || profile?.username)?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  id="comment-input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Post your reply"
                  className="w-full px-0 py-2 text-[15px] bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500"
                  rows={2}
                  maxLength={280}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleComment();
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="text-[13px] text-gray-500">
                    {commentText.length}/280
                  </div>
                  <motion.button
                    onClick={handleComment}
                    disabled={!commentText.trim() || commentMutation.isPending}
                    whileHover={{ scale: commentText.trim() ? 1.02 : 1 }}
                    whileTap={{ scale: commentText.trim() ? 0.98 : 1 }}
                    className={cn(
                      "px-4 py-2 rounded-full text-[15px] font-semibold transition-all",
                      commentText.trim() && !commentMutation.isPending
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    {commentMutation.isPending ? 'Posting...' : 'Reply'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Login prompt for non-authenticated users */}
        {!user && (
          <motion.div
            className="bg-white dark:bg-[#1A1A1A] border-b border-subtle p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.2 }}
          >
            <p className="text-[15px] text-gray-600 dark:text-gray-400 mb-3">
              Log in to reply to this post
            </p>
            <motion.button
              onClick={() => router.push('/auth')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-blue-600 text-white rounded-full text-[15px] font-semibold hover:bg-blue-700 transition-colors"
            >
              Log in
            </motion.button>
          </motion.div>
        )}

        {/* Replies - X-style layout */}
        {data.replies && data.replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.2 }}
          >
            {data.replies.map((reply, index) => (
              <motion.div
                key={'id' in reply ? reply.id : Math.random()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.03, duration: 0.2 }}
                className="border-b bg-white dark:bg-[#1A1A1A] border-subtle"
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
            transition={{ delay: 0.25, duration: 0.2 }}
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
    <header className="sticky top-0 z-10 bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border-b border-subtle">
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

// Interaction Button Component - X-style interactive buttons with real functionality
function InteractionButton({ 
  icon, 
  count, 
  active = false,
  onClick,
  loading = false,
  ariaLabel 
}: { 
  icon: 'reply' | 'repost' | 'like' | 'bookmark';
  count: number;
  active?: boolean;
  onClick: () => void;
  loading?: boolean;
  ariaLabel: string;
}) {
  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5";
    
    switch (icon) {
      case 'reply':
        return (
          <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor">
            <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/>
          </svg>
        );
      case 'repost':
        return active ? (
          <ArrowPathRoundedSquareIcon className={iconClass} />
        ) : (
          <ArrowPathRoundedSquareIcon className={iconClass} />
        );
      case 'like':
        return active ? (
          <HeartSolid className={iconClass} />
        ) : (
          <HeartOutline className={iconClass} />
        );
      case 'bookmark':
        return active ? (
          <BookmarkSolid className={iconClass} />
        ) : (
          <BookmarkOutline className={iconClass} />
        );
      default:
        return null;
    }
  };

  const getColorClass = () => {
    if (loading) return "text-gray-400";
    if (active) {
      switch (icon) {
        case 'like': return "text-red-500";
        case 'repost': return "text-green-500";
        case 'bookmark': return "text-blue-500";
        default: return "text-gray-500";
      }
    }
    return "text-gray-500";
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      aria-label={ariaLabel}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 flex-shrink-0",
        getColorClass()
      )}
    >
      <div className="flex items-center gap-2">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
          >
            <ArrowPathIcon className="w-5 h-5" />
          </motion.div>
        ) : (
          getIcon()
        )}
        {count > 0 && (
          <span className="text-[14px] font-medium whitespace-nowrap">
            {formatValue(count)}
          </span>
        )}
      </div>
    </motion.button>
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
              transition={{ delay: 0.1, duration: 0.2 }}
    >
      {/* Image Card - Support both 'image' and 'media' types */}
      {(post.type === 'image' || (post.type === 'media' && post.media?.[0]?.type === 'image')) && post.media && (
        <ImageCard media={post.media} />
      )}
      
      {/* Video Card - Support both 'video' and 'media' types */}
      {(post.type === 'video' || (post.type === 'media' && post.media?.[0]?.type === 'video')) && post.media && (
        <VideoCard media={post.media} />
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

// Image Card Component - Support multiple images with grid layout
function ImageCard({ media }: { media: any[] }) {
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  
  const mediaArray = Array.isArray(media) ? media : [media];
  const count = mediaArray.length;

  const getGridClass = () => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-2';
    return 'grid-cols-2';
  };

  const getImageClass = (index: number) => {
    if (count === 1) return 'aspect-[16/9]';
    if (count === 3 && index === 0) return 'col-span-2 aspect-[16/9]';
    return 'aspect-square';
  };

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden shadow-sm border grid gap-0.5",
      "border-subtle",
      getGridClass()
    )}>
      {mediaArray.slice(0, 4).map((item, index) => {
        const itemId = item.id || `img-${index}`;
        const isLastItem = index === 3 && count > 4;
        
        return (
          <div key={itemId} className={cn("relative overflow-hidden bg-gray-100 dark:bg-gray-800", getImageClass(index))}>
            {!imageLoaded[itemId] && !imageError[itemId] && (
              <Skeleton className="w-full h-full absolute inset-0" />
            )}
            <img 
              src={item.url || item.thumbnail} 
              alt={item.alt || `Image ${index + 1}`} 
              className={cn(
                "w-full h-full object-cover transition-opacity duration-300",
                imageLoaded[itemId] ? 'opacity-100' : 'opacity-0'
              )}
              loading="lazy"
              onLoad={() => setImageLoaded(prev => ({ ...prev, [itemId]: true }))}
              onError={() => setImageError(prev => ({ ...prev, [itemId]: true }))}
            />
            {imageError[itemId] && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Failed</p>
                </div>
              </div>
            )}
            {isLastItem && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <span className="text-white text-2xl font-bold">+{count - 4}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Video Card Component with skeleton - Support first video in array
function VideoCard({ media }: { media: any[] }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const mediaArray = Array.isArray(media) ? media : [media];
  const firstVideo = mediaArray.find(m => m.type === 'video') || mediaArray[0];

  if (!firstVideo) return null;

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-subtle">
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
        src={firstVideo.url} 
        controls 
        className={cn(
          "w-full h-auto transition-opacity duration-300",
          videoLoaded ? 'opacity-100' : 'opacity-0 absolute'
        )}
        poster={firstVideo.thumbnail}
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
    <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-subtle">
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
    <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-subtle">
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
    <div className="rounded-2xl border bg-gray-50 dark:bg-gray-800/50 border-subtle">
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
    <div className="rounded-2xl border bg-gray-50 dark:bg-gray-800/50 border-subtle">
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

