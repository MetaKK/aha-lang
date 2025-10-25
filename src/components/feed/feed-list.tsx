'use client';

import { memo, useEffect, useRef, useCallback } from 'react';
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
  });

  // Flatten all cards from all pages
  const allCards = data?.pages.flatMap((page) => page.cards) ?? [];

  // Virtual scrolling for performance - Optimized
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allCards.length + 1 : allCards.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      // Estimate size based on card type for better accuracy
      const card = allCards[index];
      if (!card) return 200; // Default for loader
      
      // Different card types have different heights
      if (card.type === 'novel') return 280;
      if (card.type === 'image' || card.type === 'video') {
        const mediaCount = (card as any).media?.length || 0;
        if (mediaCount > 1) return 350;
        return 300;
      }
      return 180; // Text cards are shorter
    },
    overscan: 5, // Increased overscan for smoother scrolling
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });

  // Memoized render function for better performance
  const renderVirtualRow = useCallback((virtualRow: any) => {
    const isLoaderRow = virtualRow.index > allCards.length - 1;
    const card = allCards[virtualRow.index];

    return (
      <div
        key={virtualRow.key}
        data-index={virtualRow.index}
        ref={rowVirtualizer.measureElement}
        className="absolute top-0 left-0 w-full border-b"
        style={{
          transform: `translateY(${virtualRow.start}px)`,
          borderBottomColor: 'rgb(240, 244, 248)',
          willChange: 'transform', // GPU acceleration hint
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
  }, [allCards, hasNextPage, onCardInteraction, rowVirtualizer.measureElement]);

  // Load more when scrolling near bottom
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

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
    rowVirtualizer.getVirtualItems(),
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
        // Improve scroll performance
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'auto',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
          // Enable hardware acceleration
          transform: 'translateZ(0)',
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

