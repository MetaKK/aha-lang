'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FeedList } from '@/components/feed/feed-list';
import { UnifiedFAB } from '@/components/feed/unified-fab';
import { UnifiedCreateModal } from '@/components/feed/unified-create-modal';
import { useAuthGuard } from '@/components/auth/auth-guard';
import { UserAvatar } from '@/components/auth/user-avatar';
import { useAuthPrompt } from '@/components/auth/auth-prompt';
import { useAuthState, usePermission } from '@/hooks/use-auth';
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
  
  // 认证状态
  const { user, profile, isAuthenticated } = useAuthState();
  const { canCreatePost, canCreateChallenge } = usePermission();
  const { redirectToAuth } = useAuthGuard();
  const { AuthPrompt } = useAuthPrompt();

  const scrollToTab = (tabId: TabType) => {
    setSelectedTab(tabId);
    const container = scrollContainerRef.current;
    if (container) {
      const tabElement = container.querySelector(`[data-tab="${tabId}"]`);
      if (tabElement) {
        tabElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  };

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
    if (!isAuthenticated) {
      // 使用优雅的登录提示而不是直接跳转
      return;
    }
    setCreateCategory('post');
    setIsCreateModalOpen(true);
  };

  // 打开创建挑战模态框
  const handleCreateChallenge = () => {
    if (!isAuthenticated) {
      // 使用优雅的登录提示而不是直接跳转
      return;
    }
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
      {/* X-style Header */}
      <div className="flex-shrink-0 backdrop-blur-xl pb-2">
        <div className="max-w-[600px] mx-auto">
          {/* Top Navigation Bar with Dynamic Starfield Background */}
          <div className="relative flex items-center justify-between px-4 py-3 overflow-hidden">
            {/* AI Dynamic Tech Background - Simplified */}
            <div className="absolute inset-0 dark:starfield-bg">
              {/* Light Mode: Minimal AI Pattern */}
              <div className="absolute inset-0 dark:hidden">
                {/* AI Core Nodes - Clean & Minimal */}
                <div className="absolute top-3 left-6 w-1.5 h-1.5 bg-blue-500/60 rounded-full ai-pulse-subtle"></div>
                <div className="absolute top-5 right-8 w-1 h-1 bg-purple-500/50 rounded-full ai-pulse-subtle" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-7 left-12 w-1 h-1 bg-cyan-500/50 rounded-full ai-pulse-subtle" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-9 right-4 w-1.5 h-1.5 bg-blue-500/60 rounded-full ai-pulse-subtle" style={{animationDelay: '1.5s'}}></div>
                
                {/* Data Flow Particles - Subtle */}
                <div className="absolute top-4 left-8 w-0.5 h-4 bg-gradient-to-b from-blue-400/40 to-transparent ai-flow-subtle"></div>
                <div className="absolute top-6 right-6 w-0.5 h-3 bg-gradient-to-b from-purple-400/40 to-transparent ai-flow-subtle" style={{animationDelay: '0.7s'}}></div>
                <div className="absolute top-8 left-10 w-0.5 h-3 bg-gradient-to-b from-cyan-400/40 to-transparent ai-flow-subtle" style={{animationDelay: '1.4s'}}></div>
              </div>
              
              {/* Dark Mode: Original Starfield */}
              <div className="absolute inset-0 hidden dark:block">
                {/* Animated Stars */}
                <div className="absolute inset-0">
                  {/* Star Layer 1 - Large Stars */}
                  <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full twinkle opacity-80"></div>
                  <div className="absolute top-4 right-8 w-1 h-1 bg-blue-300 rounded-full twinkle opacity-60" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute top-6 left-12 w-1 h-1 bg-yellow-300 rounded-full twinkle opacity-70" style={{animationDelay: '1s'}}></div>
                  <div className="absolute top-8 right-4 w-1 h-1 bg-purple-300 rounded-full twinkle opacity-50" style={{animationDelay: '1.5s'}}></div>
                  <div className="absolute top-10 left-8 w-1 h-1 bg-cyan-300 rounded-full twinkle opacity-80" style={{animationDelay: '2s'}}></div>
                  
                  {/* Star Layer 2 - Medium Stars */}
                  <div className="absolute top-3 left-6 w-0.5 h-0.5 bg-white rounded-full twinkle opacity-60" style={{animationDelay: '0.3s'}}></div>
                  <div className="absolute top-5 right-6 w-0.5 h-0.5 bg-blue-200 rounded-full twinkle opacity-70" style={{animationDelay: '0.8s'}}></div>
                  <div className="absolute top-7 left-10 w-0.5 h-0.5 bg-yellow-200 rounded-full twinkle opacity-50" style={{animationDelay: '1.3s'}}></div>
                  <div className="absolute top-9 right-2 w-0.5 h-0.5 bg-purple-200 rounded-full twinkle opacity-60" style={{animationDelay: '1.8s'}}></div>
                  <div className="absolute top-11 left-4 w-0.5 h-0.5 bg-cyan-200 rounded-full twinkle opacity-80" style={{animationDelay: '2.3s'}}></div>
                  
                  {/* Star Layer 3 - Small Stars */}
                  <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-white rounded-full twinkle opacity-40" style={{animationDelay: '0.2s'}}></div>
                  <div className="absolute top-3 right-4 w-0.5 h-0.5 bg-blue-100 rounded-full twinkle opacity-30" style={{animationDelay: '0.7s'}}></div>
                  <div className="absolute top-5 left-14 w-0.5 h-0.5 bg-yellow-100 rounded-full twinkle opacity-50" style={{animationDelay: '1.2s'}}></div>
                  <div className="absolute top-7 right-10 w-0.5 h-0.5 bg-purple-100 rounded-full twinkle opacity-40" style={{animationDelay: '1.7s'}}></div>
                  <div className="absolute top-9 left-6 w-0.5 h-0.5 bg-cyan-100 rounded-full twinkle opacity-60" style={{animationDelay: '2.2s'}}></div>
                  <div className="absolute top-11 right-12 w-0.5 h-0.5 bg-white rounded-full twinkle opacity-30" style={{animationDelay: '2.7s'}}></div>
                  
                  {/* Shooting Stars */}
                  <div className="absolute top-2 left-0 w-2 h-0.5 bg-gradient-to-r from-white to-transparent rounded-full shooting-star opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  <div className="absolute top-6 right-0 w-2 h-0.5 bg-gradient-to-l from-blue-300 to-transparent rounded-full shooting-star opacity-0 group-hover:opacity-100 transition-opacity duration-1200 delay-500"></div>
                  <div className="absolute top-10 left-0 w-1.5 h-0.5 bg-gradient-to-r from-yellow-300 to-transparent rounded-full shooting-star opacity-0 group-hover:opacity-100 transition-opacity duration-800 delay-1000"></div>
                </div>
                
                {/* Nebula Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-pink-500/10 nebula-pulse"></div>
                
                {/* Cosmic Dust */}
                <div className="absolute inset-0">
                  <div className="absolute top-1 left-1/4 w-1 h-1 bg-white/20 rounded-full blur-sm cosmic-drift"></div>
                  <div className="absolute top-3 right-1/3 w-1 h-1 bg-blue-300/20 rounded-full blur-sm cosmic-drift" style={{animationDelay: '1s'}}></div>
                  <div className="absolute top-5 left-2/3 w-1 h-1 bg-purple-300/20 rounded-full blur-sm cosmic-drift" style={{animationDelay: '2s'}}></div>
                  <div className="absolute top-7 right-1/4 w-1 h-1 bg-pink-300/20 rounded-full blur-sm cosmic-drift" style={{animationDelay: '3s'}}></div>
                </div>
              </div>
              
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-cyan-50/50 dark:from-blue-500/10 dark:via-purple-500/5 dark:to-pink-500/10"></div>
            </div>
            
            {/* Content with backdrop blur */}
            <div className="relative z-20 flex items-center justify-between w-full">
            {/* User Avatar with Dropdown */}
            <UserAvatar 
              size="sm" 
              showDropdown={true}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1 transition-colors"
            />
            
            {/* AI Tech Logo - Simplified & Elegant */}
            <div className="flex items-center">
              <div className="relative group cursor-pointer py-2 px-3">
                {/* AI Tech Logo Text */}
                <h1 className="relative z-10 text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105" style={{
                  textShadow: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(147, 51, 234, 0.2)'
                }}>
                  AhaBook
                </h1>
                
                {/* AI Processing Indicator - Simplified */}
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gradient-to-br from-blue-500 to-cyan-400 dark:from-blue-400 dark:to-cyan-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping"></div>
                </div>
                
                {/* AI Glow Effect - Clean */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
            </div>
            
            {/* Empty space for balance */}
            <div className="w-8"></div>
            </div>
          </div>
          
          {/* Smooth Scrolling Tabs - X Style */}
          <div className="relative">
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {novelCategories.map((category) => (
                <button
                  key={category.id}
                  data-tab={category.id}
                  onClick={() => scrollToTab(category.id)}
                  className={cn(
                    'relative flex-shrink-0 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap',
                    selectedTab === category.id
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  {category.label}
                  {selectedTab === category.id && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-[3px] bg-blue-500 rounded-full"
                      style={{ width: '70%' }}
                      transition={{ type: 'spring', mass: 1, stiffness: 250, damping: 24 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

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
      
      {/* 登录提示 */}
      <AuthPrompt
        title="需要登录"
        message="请先登录以使用发帖功能"
        actionText="立即登录"
      />
      </div>
  );
}
