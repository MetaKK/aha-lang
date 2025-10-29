'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { NovelReader } from '@/components/reader/novel-reader';
import { MultiChapterReader } from '@/components/reader/multi-chapter-reader';
import { getContentById } from '@/lib/api/novel-mock-data';
import type { NovelContent } from '@/lib/api/novel-mock-data';

export default function ContentReadPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState<NovelContent | null>(null);
  const [loading, setLoading] = useState(true);

  const contentType = params.type as string;
  const contentId = params.id as string;

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      
      try {
        // 根据内容类型加载数据
        if (contentType === 'novel' || contentType === 'quest') {
          const novelData = getContentById(contentId);
          setContent(novelData || null);
        } else {
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

  const handleClose = () => {
    router.back();
  };

  const handleComplete = () => {
    // 根据内容类型导航到不同的挑战页面
    if (contentType === 'novel') {
      router.push(`/content/${contentType}/${contentId}/challenge`);
    } else if (contentType === 'quest') {
      router.push(`/content/${contentType}/${contentId}/practice`);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center px-6">
          <XCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Content Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            This content doesn't exist or has been removed.
          </p>
          <button
            onClick={handleClose}
            className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 默认显示第一章，确保章节存在
  const chapter = content.chapters?.[0];
  
  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Chapters Available</h2>
          <p className="text-gray-600 mb-6">This content doesn't have any chapters to read.</p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 判断是否使用多章节阅读器
  const useMultiChapter = content.chapters.length > 1;

  return useMultiChapter ? (
    <MultiChapterReader
      novel={content}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  ) : (
    <NovelReader
      novel={content}
      chapter={chapter}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
}
