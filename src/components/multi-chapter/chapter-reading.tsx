"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, BookOpenIcon, SparklesIcon, ClockIcon } from "lucide-react";
import type { ChapterReadingProps } from "@/types/multi-chapter";

export function ChapterReading({ chapter, onComplete, onBack }: ChapterReadingProps) {
  const [isReading, setIsReading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  // 开始阅读 - 一次性显示内容
  const startReading = useCallback(() => {
    setShowContent(true);
    setIsReading(true);
  }, []);

  // 完成阅读
  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // 自动滚动到顶部
  useEffect(() => {
    if (showContent && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [showContent]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BookOpenIcon className="w-4 h-4 text-purple-700 dark:text-purple-300" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Chapter {chapter.order}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Title */}
      <div className="flex-shrink-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-b border-gray-200/30 dark:border-gray-700/30 px-4 py-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2"
          >
            {chapter.title}
          </motion.h1>
          
          {/* Progress Bar - 简化版本 */}
          {showContent && (
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-4">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
          
          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span>~{Math.ceil(chapter.content.length / 1000)} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <SparklesIcon className="w-4 h-4" />
              <span>{chapter.scene.difficulty} Level</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {!showContent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <BookOpenIcon className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to read?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                This chapter will take you on an immersive journey through Harry Potter's world. 
                Take your time and enjoy the story.
              </p>
              <button
                onClick={startReading}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Start Reading
              </button>
            </motion.div>
          )}

          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="prose prose-lg max-w-none dark:prose-invert"
            >
              <div
                ref={contentRef}
                className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap"
              >
                {chapter.content}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <AnimatePresence>
        {isReading && showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-4"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Finished reading? Ready for the next step?
                </div>
                <button
                  onClick={handleComplete}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Continue to Scene Practice
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
