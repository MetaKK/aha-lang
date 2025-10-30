'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircleIcon, BookOpenIcon, PlayIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { getContentById } from '@/lib/api/novel-mock-data';
import type { NovelContent } from '@/lib/api/novel-mock-data';
import { cn } from '@/lib/utils';

// 内容类型定义
type ContentType = 'novel' | 'quest' | 'course' | 'exercise';
type InteractionMode = 'read' | 'practice' | 'challenge';

interface ContentMode {
  id: InteractionMode;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  available: boolean;
}

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState<NovelContent | null>(null);
  const [loading, setLoading] = useState(true);

  const contentType = params.type as ContentType;
  const contentId = params.id as string;

  // 定义可用的交互模式
  const getAvailableModes = (type: ContentType): ContentMode[] => {
    const baseModes: ContentMode[] = [
      {
        id: 'read',
        label: '阅读模式',
        description: '沉浸式阅读体验',
        icon: BookOpenIcon,
        href: `/content/${type}/${contentId}/read`,
        available: true
      },
      {
        id: 'practice',
        label: '练习模式',
        description: '互动式学习练习',
        icon: PlayIcon,
        href: `/content/${type}/${contentId}/practice`,
        available: type === 'novel' || type === 'quest'
      },
      {
        id: 'challenge',
        label: '挑战模式',
        description: '游戏化学习挑战',
        icon: TrophyIcon,
        href: `/content/${type}/${contentId}/challenge`,
        available: type === 'novel' || type === 'quest'
      }
    ];

    return baseModes.filter(mode => mode.available);
  };

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      
      try {
        // 根据内容类型加载不同的数据
        switch (contentType) {
          case 'novel':
          case 'quest':
            const novelData = getContentById(contentId);
            setContent(novelData || null);
            break;
          case 'course':
          case 'exercise':
            // 未来可以添加其他内容类型的加载逻辑
            setContent(null);
            break;
          default:
            setContent(null);
        }
      } catch (error) {
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [contentType, contentId]);

  const handleBack = () => {
    router.back();
  };

  const handleModeSelect = (mode: ContentMode) => {
    router.push(mode.href);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center px-6">
          <XCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Content Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            This content doesn't exist or has been removed.
          </p>
          <button
            onClick={handleBack}
            className="px-8 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const availableModes = getAvailableModes(contentType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-subtle">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <BookOpenIcon className="w-4 h-4 text-amber-700 dark:text-amber-300" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {contentType === 'novel' ? 'Novel' : contentType === 'quest' ? 'Quest' : 'Content'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Content Cover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="relative inline-block">
              <img
                src={content.coverImage}
                alt={content.title}
                className="w-48 h-72 rounded-2xl shadow-2xl object-cover mx-auto"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 to-transparent" />
              {/* Cover meta info (top-left) */}
              <div className="absolute top-3 left-3 right-3 text-left">
                <div
                  className="text-[11px] sm:text-xs md:text-sm text-white/70"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}
                >
                  Chapters {content.chapters.length} · Level {content.difficulty || 'A2'} · {content.estimatedTime || '15 min'}
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-sm font-medium opacity-90">{content.author}</div>
                <div className="text-lg font-bold">{content.title}</div>
              </div>
            </div>
          </motion.div>

          {/* Content Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-center mb-4"
          >
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {content.title}
            </span>
          </motion.h1>

          {/* Content Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 text-center mb-8 max-w-2xl mx-auto"
          >
            {content.excerpt}
          </motion.p>

          {/* Interaction Modes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {availableModes.map((mode, index) => (
              <motion.button
                key={mode.id}
                onClick={() => handleModeSelect(mode)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-subtle hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <mode.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {mode.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {mode.description}
                </div>
              </motion.button>
            ))}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
