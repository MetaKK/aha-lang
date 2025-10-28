"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeftIcon, SparklesIcon, ClockIcon, StarIcon } from "lucide-react";
import { MultiChapterQuest } from "@/components/multi-chapter/multi-chapter-quest";
import { harryPotterMultiChapterQuest } from "@/data/harry-potter-quest";
import type { MultiChapterQuest as MultiChapterQuestType } from "@/types/multi-chapter";

export default function MultiChapterQuestPage() {
  const params = useParams();
  const router = useRouter();
  const [quest, setQuest] = useState<MultiChapterQuestType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuest, setShowQuest] = useState(false);

  const questId = params.id as string;

  // 加载Quest数据
  useEffect(() => {
    const loadQuest = async () => {
      // 模拟异步加载
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 根据ID加载对应的Quest
      if (questId === 'harry-potter-multi-chapter-a2') {
        setQuest(harryPotterMultiChapterQuest);
      } else {
        // 可以在这里添加更多Quest
        setQuest(null);
      }
      
      setLoading(false);
    };

    loadQuest().catch(console.error);
  }, [questId]);

  // 处理Quest完成
  const handleQuestComplete = useCallback((finalScore: number, passed: boolean) => {
    console.log('Quest completed:', { finalScore, passed });
    // 可以在这里保存进度到本地存储或发送到服务器
    router.push('/');
  }, [router]);

  // 处理返回
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // 开始Quest
  const handleStartQuest = useCallback(() => {
    setShowQuest(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading magical quest...</p>
        </div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Quest Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The magical quest you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 如果Quest已开始，显示Quest组件
  if (showQuest) {
    return (
      <MultiChapterQuest
        quest={quest}
        onComplete={handleQuestComplete}
        onBack={handleBack}
      />
    );
  }

  // 显示Quest介绍页面
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <SparklesIcon className="w-4 h-4 text-purple-700 dark:text-purple-300" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Multi-Chapter Quest
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quest Introduction */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Quest Cover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="relative inline-block">
              <img
                src={quest.novel.coverImage}
                alt={quest.title}
                className="w-48 h-72 rounded-2xl shadow-2xl object-cover mx-auto"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-sm font-medium opacity-90">{quest.novel.author}</div>
                <div className="text-lg font-bold">{quest.novel.title}</div>
              </div>
            </div>
          </motion.div>

          {/* Quest Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-center mb-4"
          >
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {quest.title}
            </span>
          </motion.h1>

          {/* Quest Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 text-center mb-8 max-w-2xl mx-auto"
          >
            {quest.description}
          </motion.p>

          {/* Quest Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200/50 dark:border-gray-700/50">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <StarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {quest.totalChapters}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Chapters</div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200/50 dark:border-gray-700/50">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {quest.estimatedTime}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200/50 dark:border-gray-700/50">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {quest.difficulty}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Level</div>
            </div>
          </motion.div>

          {/* Chapter Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Chapter Overview
            </h3>
            <div className="space-y-4">
              {quest.chapters.map((chapter, index) => (
                <div key={chapter.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {chapter.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {chapter.scene.description}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {chapter.scene.difficulty}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <button
              onClick={handleStartQuest}
              className="px-12 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold text-lg rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
            >
              Begin Magical Journey ✨
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
