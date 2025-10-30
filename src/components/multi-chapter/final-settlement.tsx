"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrophyIcon, 
  StarIcon, 
  SparklesIcon, 
  HeartIcon, 
  WandIcon,
  BookOpenIcon,
  ShareIcon,
  ArrowLeftIcon
} from "lucide-react";
import { SceneService } from "@/services/scene.service";
import { getScoreGrade, getScoreDescription, hasPassed } from "@/utils/score-calculator";
import type { FinalSettlementProps } from "@/types/multi-chapter";

export function FinalSettlement({ 
  quest, 
  finalScore, 
  averageScore, 
  passed, 
  onShare, 
  onBackToFeed 
}: FinalSettlementProps) {
  const [harryFeedback, setHarryFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // 创建场景服务
  const sceneService = React.useMemo(() => {
    const apiKey = sessionStorage.getItem('api_key_openai') || undefined;
    return new SceneService({ apiKey });
  }, []);

  // 生成哈利波特的最终反馈
  const generateHarryFeedback = useCallback(async () => {
    return await sceneService.generateFinalImmersiveFeedback(quest, finalScore, averageScore, passed);
  }, [quest, finalScore, averageScore, passed, sceneService]);

  // 加载哈利反馈
  useEffect(() => {
    const loadFeedback = async () => {
      setIsLoading(true);
      try {
        const feedback = await generateHarryFeedback();
        setHarryFeedback(feedback);
      } catch (error) {
        console.error('Error loading feedback:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedback();
  }, [generateHarryFeedback]);

  // 显示动画序列
  useEffect(() => {
    const timer1 = setTimeout(() => setShowCelebration(true), 500);
    const timer2 = setTimeout(() => setShowStats(true), 1500);
    const timer3 = setTimeout(() => setShowFeedback(true), 2500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const grade = getScoreGrade(finalScore);
  const description = getScoreDescription(finalScore);
  const isExcellent = finalScore >= 90;
  const isGood = finalScore >= 80;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-4xl w-full"
      >
        {/* 庆祝动画 */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <div className="relative">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0, 
                      scale: 0,
                      x: 0,
                      y: 0,
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.cos(i * 12 * Math.PI / 180) * 300,
                      y: Math.sin(i * 12 * Math.PI / 180) * 300,
                    }}
                    transition={{ 
                      duration: 3,
                      delay: i * 0.1,
                      ease: "easeOut"
                    }}
                    className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-subtle overflow-hidden">
          {/* Header */}
          <div className="relative p-8 pb-6">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-indigo-500/10" />
            
            {/* 完成图标 */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
              className="relative flex justify-center mb-6"
            >
              <div className={`relative w-40 h-40 rounded-full flex items-center justify-center ${
                isExcellent
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                  : isGood
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                  : 'bg-gradient-to-br from-blue-400 to-purple-500'
              } shadow-2xl`}>
                <TrophyIcon className="w-20 h-20 text-white" />
                
                {/* 闪烁动画 */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full bg-white/40"
                />
                <SparklesIcon className="absolute -top-3 -right-3 w-10 h-10 text-yellow-400 animate-pulse" />
                <WandIcon className="absolute -bottom-2 -left-2 w-8 h-8 text-purple-400 animate-bounce" />
              </div>
            </motion.div>

            {/* 标题 */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-bold text-center mb-2"
            >
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Quest Complete! 🎊
              </span>
            </motion.h1>

            {/* 副标题 */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-center text-gray-600 dark:text-gray-400 mb-6"
            >
              You've completed "{quest.title}" with Harry Potter!
            </motion.p>
          </div>

          {/* 统计信息 */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="px-8 py-6 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-indigo-50/50 dark:from-gray-700/30 dark:via-purple-900/20 dark:to-gray-700/30"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 最终分数 */}
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                      {finalScore}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Final Score</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {grade} - {description}
                    </div>
                  </div>

                  {/* 平均分数 */}
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                      {averageScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Average Score</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      Across All Chapters
                    </div>
                  </div>

                  {/* 完成状态 */}
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                      {quest.chapters.length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Chapters</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {passed ? 'PASSED' : 'Keep Practicing!'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 哈利波特的反馈 */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="px-8 py-6"
              >
                <div className="bg-gradient-to-br from-yellow-50/80 via-orange-50/80 to-red-50/80 dark:from-gray-700/40 dark:via-yellow-900/20 dark:to-gray-700/40 rounded-2xl p-6 border-2 border-yellow-200/50 dark:border-yellow-700/50">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                      <WandIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        A Personal Letter from Harry Potter
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <HeartIcon className="w-4 h-4" />
                        <span>Written just for you</span>
                      </div>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-gray-600 dark:text-gray-400">Harry is writing your letter...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-serif">
                        {harryFeedback}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 操作按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="px-8 py-6 space-y-3"
          >
            <button
              onClick={onShare}
              className="w-full h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-3"
            >
              <ShareIcon className="w-6 h-6" />
              Share Your Achievement
            </button>
            
            <button
              onClick={onBackToFeed}
              className="w-full h-14 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-all border-2 border-gray-200 dark:border-gray-600 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Feed
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
