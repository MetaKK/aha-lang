'use client';

import { memo, useEffect, useRef, useCallback, useMemo, useState } from 'react';
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
  const [itemSizes, setItemSizes] = useState<Map<number, number>>(new Map());
  const [scrollPosition, setScrollPosition] = useState(0);

  // Infinite query for feed data with optimized caching
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
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });

  // Memoized flattening to prevent unnecessary re-renders
  const allCards = useMemo(() => 
    data?.pages.flatMap((page) => page.cards) ?? [], 
    [data?.pages]
  );

  // Optimized size estimation with caching
  const estimateSize = useCallback((index: number) => {
    // Return cached size if available
    if (itemSizes.has(index)) {
      return itemSizes.get(index)!;
    }

    const card = allCards[index];
    if (!card) return 200; // Default for loader
    
    // More accurate size estimation based on content
    let baseHeight = 120; // Base card height
    
    // Add height based on content type
    if (card.type === 'novel') {
      baseHeight += 160; // Novel cards are taller
    } else if (card.type === 'image' || card.type === 'video') {
      const mediaCount = (card as any).media?.length || 0;
      baseHeight += mediaCount > 1 ? 200 : 150;
    } else {
      // Text cards - estimate based on content length
      const contentLength = (card as any).content?.text?.length || 0;
      baseHeight += Math.min(Math.max(contentLength / 50, 40), 120);
    }
    
    return baseHeight;
  }, [allCards, itemSizes]);

  // Virtual scrolling with advanced optimizations
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allCards.length + 1 : allCards.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 10, // Increased for smoother scrolling
    measureElement: (element) => {
      if (!element) return 0;
      const height = element.getBoundingClientRect().height;
      
      // Cache the measured size
      const index = parseInt(element.getAttribute('data-index') || '0');
      setItemSizes(prev => new Map(prev).set(index, height));
      
      return height;
    },
    // Remove scrollMargin to fix top spacing issue
    scrollMargin: 0,
  });

  // Highly optimized render function with React.memo
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
          transform: `translate3d(0, ${virtualRow.start}px, 0)`, // Use translate3d for GPU acceleration
          borderBottomColor: 'rgb(240, 244, 248)',
          willChange: 'transform',
          contain: 'layout style paint', // CSS containment for better performance
          // Ensure proper positioning
          margin: 0,
          padding: 0,
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

  // Optimized scroll position tracking
  useEffect(() => {
    const handleScroll = () => {
      if (parentRef.current) {
        setScrollPosition(parentRef.current.scrollTop);
      }
    };

    const element = parentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true });
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Optimized load more with debouncing
  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    if (virtualItems.length === 0) return;

    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    // Load more when we're within 3 items of the end
    if (
      lastItem.index >= allCards.length - 3 &&
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
        // Advanced scroll performance optimizations
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'auto',
        // Enable hardware acceleration
        transform: 'translateZ(0)',
        // Optimize for smooth scrolling
        overscrollBehavior: 'contain',
        scrollbarGutter: 'stable',
        // Ensure proper scrolling behavior
        scrollPaddingTop: 0,
        scrollPaddingBottom: 0,
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
          // Advanced GPU acceleration
          transform: 'translateZ(0)',
          willChange: 'auto',
          // Optimize rendering
          contain: 'layout style paint',
          // Prevent layout thrashing
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          // Ensure content is not cut off
          paddingBottom: '0px',
          marginBottom: '0px',
        }}
      >
        {rowVirtualizer.getVirtualItems().map(renderVirtualRow)}
      </div>
    </div>
  );
});

FeedList.displayName = 'FeedList';

export { FeedList };

