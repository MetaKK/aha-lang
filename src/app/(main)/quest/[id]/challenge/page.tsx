'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { getNovelById } from '@/lib/api/novel-mock-data';
import type { NovelContent } from '@/lib/api/novel-mock-data';
import { ScenePractice } from './scene-practice';
import { Settlement } from './settlement';

/**
 * Quest挑战页面 - 集成场景英语对话挑战
 * 
 * 流程：
 * 1. 场景英语对话练习（5轮，实时评分）
 * 2. 系统结算（以小说主角口吻反馈）
 * 3. 分享成就
 */

export default function QuestChallengePage() {
  const params = useParams();
  const router = useRouter();
  const [novel, setNovel] = useState<NovelContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<'scene-practice' | 'settlement' | 'share'>('scene-practice');
  const [finalScore, setFinalScore] = useState<number>(0);
  const [passed, setPassed] = useState<boolean>(false);

  const novelId = params.id as string;

  useEffect(() => {
    setTimeout(() => {
      const foundNovel = getNovelById(novelId);
      setNovel(foundNovel || null);
      setLoading(false);
    }, 300);
  }, [novelId]);

  // 处理场景练习完成
  const handleScenePracticeComplete = (score: number, isPassed: boolean) => {
    setFinalScore(score);
    setPassed(isPassed);
    setCurrentStep('settlement');
  };

  // 处理返回
  const handleBack = () => {
    router.back();
  };

  // 处理分享
  const handleShare = () => {
    setCurrentStep('share');
  };

  // 处理返回到 Feed
  const handleBackToFeed = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Challenge Not Found
          </h1>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 渲染不同步骤
  if (currentStep === 'scene-practice') {
    return (
      <ScenePractice 
        novel={novel!} 
        onComplete={handleScenePracticeComplete}
        onBack={handleBack}
      />
    );
  }

  if (currentStep === 'settlement') {
    return (
      <Settlement
        novel={novel!}
        score={finalScore}
        passed={passed}
        onShare={handleShare}
        onBackToFeed={handleBackToFeed}
      />
    );
  }

  if (currentStep === 'share') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center p-4"
      >
        <div className="">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg mb-6 text-center">
            <SparklesIcon className="w-16 h-16 text-primary mx-auto mb-4" />
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Share Your Success! 🎉
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Let your friends know about your achievement!
            </p>

            {/* Share Preview Card */}
            <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-xl p-6 mb-6">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Completed "{novel?.title}"
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Score: {finalScore}% • {passed ? 'Passed!' : 'Keep practicing!'}
              </div>
            </div>

            {/* Share Buttons - Placeholder */}
            <div className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              🔗 Share functionality: Twitter, Facebook, WeChat...
            </div>
          </div>

          <button
            onClick={handleBackToFeed}
            className="w-full py-4 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Continue Learning
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
}

