'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { EnhancedNovelReader } from '@/components/reader/enhanced-novel-reader';
import { getNovelById } from '@/lib/api/novel-mock-data';
import type { NovelContent } from '@/lib/api/novel-mock-data';

export default function NovelReadPage() {
  const params = useParams();
  const router = useRouter();
  const [novel, setNovel] = useState<NovelContent | null>(null);
  const [loading, setLoading] = useState(true);

  const novelId = params.id as string;

  useEffect(() => {
    // 模拟异步加载
    setTimeout(() => {
      const foundNovel = getNovelById(novelId);
      setNovel(foundNovel || null);
      setLoading(false);
    }, 300);
  }, [novelId]);

  const handleClose = () => {
    router.back();
  };

  const handleComplete = () => {
    // 导航到挑战页面
    router.push(`/quest/${novelId}/challenge`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading novel...</p>
        </div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center px-6">
          <XCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Novel Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            This novel doesn't exist or has been removed.
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

  // 默认显示第一章
  const chapter = novel.chapters[0];

  return (
    <EnhancedNovelReader
      novel={novel}
      chapter={chapter}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  );
}

