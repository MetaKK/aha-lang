'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FeedList } from '@/components/feed/feed-list';
import { UnifiedFAB } from '@/components/feed/unified-fab';
import { UnifiedCreateModal } from '@/components/feed/unified-create-modal';
import { createPost, createChallenge } from '@/lib/api/content';
import type { ContentCategory } from '@/types/content';
import { cn } from '@/lib/utils';

type TabType = 'foryou' | 'following' | 'romance' | 'fantasy' | 'mystery' | 'scifi' | 'thriller' | 'historical' | 'contemporary' | 'youngadult';

const novelCategories = [
  { id: 'foryou' as TabType, label: 'For you' },
  { id: 'following' as TabType, label: 'Following' },
  { id: 'romance' as TabType, label: 'Romance' },
  { id: 'fantasy' as TabType, label: 'Fantasy' },
  { id: 'mystery' as TabType, label: 'Mystery' },
  { id: 'scifi' as TabType, label: 'Sci-Fi' },
  { id: 'thriller' as TabType, label: 'Thriller' },
  { id: 'historical' as TabType, label: 'Historical' },
  { id: 'contemporary' as TabType, label: 'Contemporary' },
  { id: 'youngadult' as TabType, label: 'Young Adult' },
];

export default function HomePage() {
  const [selectedTab, setSelectedTab] = useState<TabType>('foryou');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState<ContentCategory>('post');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // 统一的内容创建mutation
  const createContentMutation = useMutation({
    mutationFn: async (data: {
      category: ContentCategory;
      text: string;
      media?: any[];
      metadata?: Record<string, any>;
    }) => {
      if (data.category === 'post') {
        return createPost({
          text: data.text,
          media: data.media,
          metadata: data.metadata,
        });
      } else {
        return createChallenge({
          text: data.text,
          media: data.media,
          metadata: data.metadata,
          challengeType: 'novel', // 默认类型，会被智能分发器覆盖
          difficulty: data.metadata?.difficulty,
          estimatedTime: data.metadata?.estimatedTime,
          tags: data.metadata?.tags,
        });
      }
    },
    onMutate: async (data) => {
      const actionText = data.category === 'post' ? '发布帖子' : '创建挑战';
      toast.loading(`${actionText}中...`, { id: 'create-content' });
      
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const previousFeed = queryClient.getQueryData(['feed', undefined]);

      console.log('[Mutation] Creating content:', {
        category: data.category,
        textLength: data.text.length,
      });

      return { previousFeed };
    },
    onSuccess: (response) => {
      const actionText = response.category === 'post' ? '帖子发布' : '挑战创建';
      console.log('[Mutation] Content created successfully:', {
        id: response.id,
        category: response.category,
        type: response.type,
        analysis: response.analysis,
      });
      
      toast.success(`${actionText}成功! 🎉`, { id: 'create-content' });
      
      // 刷新Feed列表
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (err, data, context) => {
      const actionText = data.category === 'post' ? '发布帖子' : '创建挑战';
      console.error('[Mutation] Failed to create content:', err);
      
      toast.error(`${actionText}失败，请重试`, { id: 'create-content' });
      
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed', undefined], context.previousFeed);
      }
    },
  });

  // 打开创建帖子模态框
  const handleCreatePost = () => {
    setCreateCategory('post');
    setIsCreateModalOpen(true);
  };

  // 打开创建挑战模态框
  const handleCreateChallenge = () => {
    setCreateCategory('challenge');
    setIsCreateModalOpen(true);
  };

  // 提交内容
  const handleSubmitContent = async (data: {
    text: string;
    media?: any[];
    metadata?: Record<string, any>;
  }) => {
    console.log('[HomePage] Submitting content:', {
      category: createCategory,
      textLength: data.text.length,
      hasMedia: !!(data.media && data.media.length > 0),
      hasMetadata: !!data.metadata,
    });

    try {
      await createContentMutation.mutateAsync({
        category: createCategory,
        ...data,
      });
      console.log('[HomePage] Content submitted successfully');
    } catch (error) {
      console.error('[HomePage] Failed to submit content:', error);
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-black">
      {/* Header with horizontal scroll tabs */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[600px] mx-auto">
          {/* Scrollable tabs */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide px-4 py-3 space-x-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {novelCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedTab(category.id)}
                className={cn(
                  'relative flex-shrink-0 text-sm font-medium transition-colors whitespace-nowrap pb-1',
                  selectedTab === category.id
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                {category.label}
                {selectedTab === category.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                    layoutId="activeTab"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden max-w-[600px] mx-auto w-full">
        <FeedList
          key={selectedTab}
          filters={selectedTab === 'following' ? {} : undefined}
        />
      </main>

      {/* 统一的浮动操作按钮 - 两个核心入口 */}
      <UnifiedFAB
        onCreatePost={handleCreatePost}
        onCreateChallenge={handleCreateChallenge}
      />

      {/* 统一的创建模态框 - 根据类别动态调整 */}
      <UnifiedCreateModal
        isOpen={isCreateModalOpen}
        category={createCategory}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleSubmitContent}
      />
    </div>
  );
}
