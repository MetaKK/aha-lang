'use client';

import { memo, useEffect, useRef, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import type { FeedFilters } from '@/types/feed';
import { fetchFeed } from '@/lib/api/feed';
import { PostCard } from './post-card';
import { CardSkeleton } from '@/components/ui/skeleton';

interface FeedListProps {
  filters?: FeedFilters;
  onCardInteraction?: (cardId: string, action: string) => void;
}

const FeedList = memo(function FeedList({
  filters,
  onCardInteraction,
}: FeedListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Infinite query for feed data
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['feed', filters],
    queryFn: async ({ pageParam }) => {
      const result = await fetchFeed({
        cursor: pageParam,
        limit: 20,
        filters,
      });
      return result;
    },
    getNextPageParam: (lastPage) => lastPage.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 2 * 60 * 1000, // 2分钟
    gcTime: 5 * 60 * 1000, // 5分钟
  });

  // Flatten all cards from all pages - memoized
  const allCards = useMemo(
    () => data?.pages.flatMap((page) => page.cards) ?? [],
    [data?.pages]
  );

  // Detect mobile device
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }, []);

  // Virtual scrolling for performance - Optimized for mobile
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allCards.length + 1 : allCards.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback((index: number) => {
      // Estimate size based on card type for better accuracy
      const card = allCards[index];
      if (!card) return 200; // Default for loader
      
      // Different card types have different heights
      if (card.type === 'novel') return 280;
      if (card.type === 'media') {
        const mediaCount = (card as any).media?.length || 0;
        if (mediaCount > 1) return 350;
        return 300;
      }
      return 180; // Text cards are shorter
    }, [allCards]),
    // 移动端优化：减少overscan，提高性能
    overscan: isMobile ? 2 : 5,
    // 移动端禁用动态测量，使用估算高度
    measureElement: isMobile ? undefined : (
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined
    ),
    // 启用平滑滚动
    scrollMargin: 0,
    // 移动端优化：使用更激进的缓存策略
    enabled: true,
  });

  // Memoized render function for better performance
  const renderVirtualRow = useCallback((virtualRow: any) => {
    const isLoaderRow = virtualRow.index > allCards.length - 1;
    const card = allCards[virtualRow.index];

    return (
      <div
        key={virtualRow.key}
        data-index={virtualRow.index}
        ref={!isMobile ? rowVirtualizer.measureElement : undefined}
        className="absolute top-0 left-0 w-full border-b"
        style={{
          transform: `translate3d(0, ${virtualRow.start}px, 0)`,
          borderBottomColor: 'rgb(240, 244, 248)',
          // 移动端优化：减少willChange使用
          ...(isScrollingRef.current ? { willChange: 'transform' } : {}),
          // 强制GPU加速
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {isLoaderRow ? (
          hasNextPage ? (
            <div className="flex items-center justify-center py-8 bg-white dark:bg-black">
              <ArrowPathIcon className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 bg-white dark:bg-black">
              <span className="text-sm text-gray-500">
                You've reached the end
              </span>
            </div>
          )
        ) : (
          <PostCard
            card={card}
            onInteraction={onCardInteraction}
          />
        )}
      </div>
    );
  }, [allCards, hasNextPage, onCardInteraction, rowVirtualizer.measureElement, isMobile]);

  // 滚动状态检测 - 优化willChange
  useEffect(() => {
    const element = parentRef.current;
    if (!element) return;

    const handleScroll = () => {
      isScrollingRef.current = true;
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Load more when scrolling near bottom - 优化触发逻辑
  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    const [lastItem] = [...virtualItems].reverse();

    if (!lastItem) return;

    if (
      lastItem.index >= allCards.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allCards.length,
    isFetchingNextPage,
    rowVirtualizer,
  ]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-0">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border-b" style={{borderBottomColor: 'rgb(240, 244, 248)'}}>
            <CardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8">
        <p className="text-[15px] text-gray-500 dark:text-gray-400 text-center mb-4">
          {error?.message || 'Failed to load feed'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // Empty state
  if (allCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8">
        <p className="text-[15px] text-gray-500 dark:text-gray-400">No posts yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-600 mt-2">Check back later for new content</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full w-full overflow-auto apple-scrollbar"
      style={{
        // 移动端滚动优化
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'auto',
        // 减少重绘
        contain: 'layout style paint',
        // 提升为合成层
        transform: 'translateZ(0)',
        // 移动端优化：禁用过度滚动效果
        overscrollBehavior: 'contain',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
          // 移动端优化：减少不必要的transform
          ...(isMobile ? {} : { transform: 'translateZ(0)' }),
          // 不使用willChange，让浏览器自动优化
          willChange: 'auto',
        }}
      >
        {rowVirtualizer.getVirtualItems().map(renderVirtualRow)}
      </div>
    </div>
  );
});

FeedList.displayName = 'FeedList';

export { FeedList };

