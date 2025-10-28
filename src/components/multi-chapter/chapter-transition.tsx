"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightIcon, TrophyIcon, StarIcon, SparklesIcon, BookOpenIcon } from "lucide-react";
import { getScoreGrade, getScoreDescription } from "@/utils/score-calculator";
import type { ChapterTransitionProps } from "@/types/multi-chapter";

export function ChapterTransition({ 
  currentChapter, 
  nextChapter, 
  score, 
  onContinue, 
  onBack 
}: ChapterTransitionProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [showNextChapter, setShowNextChapter] = useState(false);

  useEffect(() => {
    // 显示庆祝动画
    const timer1 = setTimeout(() => setShowCelebration(true), 500);
    const timer2 = setTimeout(() => setShowNextChapter(true), 2000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const isLastChapter = !nextChapter;
  const grade = getScoreGrade(score);
  const description = getScoreDescription(score);
  const isExcellent = score >= 90;
  const isGood = score >= 80;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl w-full"
      >
        {/* 庆祝动画 */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="relative">
                {[...Array(20)].map((_, i) => (
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
                      x: Math.cos(i * 18 * Math.PI / 180) * 200,
                      y: Math.sin(i * 18 * Math.PI / 180) * 200,
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.1,
                      ease: "easeOut"
                    }}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
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
              <div className={`relative w-32 h-32 rounded-full flex items-center justify-center ${
                isExcellent
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                  : isGood
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                  : 'bg-gradient-to-br from-blue-400 to-purple-500'
              } shadow-2xl`}>
                <TrophyIcon className="w-16 h-16 text-white" />
                
                {/* 闪烁动画 */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full bg-white/30"
                />
                <SparklesIcon className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
            </motion.div>

            {/* 标题 */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-center mb-2"
            >
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Chapter Complete! 🎉
              </span>
            </motion.h1>

            {/* 章节信息 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                "{currentChapter.title}"
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                You've successfully completed this chapter!
              </p>
            </motion.div>

            {/* 分数显示 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-6"
            >
              <div className="inline-flex items-center gap-4 px-6 py-4 bg-white/60 dark:bg-gray-700/60 rounded-2xl border border-gray-200/50 dark:border-gray-600/50">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {score}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
                </div>
                
                <div className="w-px h-12 bg-gray-300 dark:bg-gray-600" />
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {grade}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Grade</div>
                </div>
                
                <div className="w-px h-12 bg-gray-300 dark:bg-gray-600" />
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {description}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Performance</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 下一章预览 */}
          <AnimatePresence>
            {showNextChapter && nextChapter && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="px-8 py-6 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-indigo-50/50 dark:from-gray-700/30 dark:via-purple-900/20 dark:to-gray-700/30"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <BookOpenIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Next: {nextChapter.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {nextChapter.scene.context}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <StarIcon className="w-3 h-3" />
                      <span>{nextChapter.scene.difficulty} Level</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 最终章节特殊处理 */}
          <AnimatePresence>
            {showNextChapter && isLastChapter && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="px-8 py-6 bg-gradient-to-br from-yellow-50/50 via-orange-50/50 to-red-50/50 dark:from-gray-700/30 dark:via-yellow-900/20 dark:to-gray-700/30"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <TrophyIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      🎊 Quest Complete! 🎊
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Congratulations! You've completed all chapters. Get ready for the final settlement with Harry Potter himself!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 操作按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="px-8 py-6 space-y-3"
          >
            <button
              onClick={onContinue}
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
            >
              {isLastChapter ? (
                <>
                  <TrophyIcon className="w-5 h-5" />
                  Final Settlement
                </>
              ) : (
                <>
                  <ArrowRightIcon className="w-5 h-5" />
                  Continue to Next Chapter
                </>
              )}
            </button>
            
            <button
              onClick={onBack}
              className="w-full h-12 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-all border-2 border-gray-200 dark:border-gray-600 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Back to Quest
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
