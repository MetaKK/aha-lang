'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FeedList } from '@/components/feed/feed-list';
import { EnhancedFAB } from '@/components/feed/enhanced-fab';
import { CreatePostModal } from '@/components/feed/create-post-modal';
import { createPost } from '@/lib/api/feed';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Create post mutation with optimistic update
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onMutate: async (newPost) => {
      // Show loading toast
      toast.loading('Creating post...', { id: 'create-post' });
      
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      // Snapshot the previous value
      const previousFeed = queryClient.getQueryData(['feed', undefined]);

      // Optimistically update to the new value (optional)
      console.log('[Mutation] Optimistically adding new post');

      return { previousFeed };
    },
    onSuccess: (data) => {
      console.log('[Mutation] Post created successfully:', data.id);
      
      // Show success toast
      toast.success('Post created successfully! 🎉', { id: 'create-post' });
      
      // Invalidate and refetch feed to show the new post
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: (err, newPost, context) => {
      console.error('[Mutation] Failed to create post:', err);
      
      // Show error toast
      toast.error('Failed to create post. Please try again.', { id: 'create-post' });
      
      // Rollback to previous value if error
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed', undefined], context.previousFeed);
      }
    },
  });

  const handleCreateText = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateImage = () => {
    console.log('Create image post');
    // TODO: 实现图片post创建
    setIsCreateModalOpen(true);
  };

  const handleCreateVideo = () => {
    console.log('Create video post');
    // TODO: 实现视频post创建
    setIsCreateModalOpen(true);
  };

  const handleCreateNovel = () => {
    console.log('Create new novel');
    // TODO: 实现小说创建
  };

  const handleCreateChapter = () => {
    console.log('Create new chapter');
    // TODO: 实现章节创建
  };

  const handleSubmitPost = async (content: string) => {
    console.log('[HomePage] Creating post:', content);
    
    try {
      // Call the mutation
      await createPostMutation.mutateAsync({
        content,
        type: 'text',
      });
      
      console.log('[HomePage] Post created and feed invalidated');
    } catch (error) {
      console.error('[HomePage] Failed to create post:', error);
      throw error;
    }
  };

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
            {/* Profile Button - X Style */}
            <button 
              aria-expanded="false" 
              aria-haspopup="menu" 
              aria-label="Profile menu" 
              role="button" 
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              type="button"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">U</span>
                </div>
              </div>
            </button>
            
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
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500 rounded-full"
                      transition={{ type: 'spring', mass: 1, stiffness: 250, damping: 24 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feed List - Flexible Height */}
      <main className="flex-1 overflow-hidden max-w-[600px] mx-auto w-full">
        <FeedList
          key={selectedTab}
          filters={selectedTab === 'following' ? {} : undefined}
        />
      </main>

      {/* Enhanced Floating Action Button */}
      <EnhancedFAB
        onCreateText={handleCreateText}
        onCreateImage={handleCreateImage}
        onCreateVideo={handleCreateVideo}
        onCreateNovel={handleCreateNovel}
        onCreateChapter={handleCreateChapter}
      />
      
      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleSubmitPost}
      />
    </div>
  );
}

