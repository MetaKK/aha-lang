"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrophyIcon, FireIcon, CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { SceneService } from "@/services/scene.service";
import { getScoreGrade, getScoreDescription } from "@/utils/score-calculator";
import type { NovelContent } from "@/lib/api/novel-mock-data";

interface SettlementProps {
  novel: NovelContent;
  score: number;
  passed: boolean;
  onShare: () => void;
  onBackToFeed: () => void;
  buttonText?: string;
}

// 创建场景服务实例
const createSceneService = (apiKey?: string) => new SceneService({ apiKey });

export function Settlement({ novel, score, passed, onShare, onBackToFeed, buttonText = "Back to Feed" }: SettlementProps) {
  const router = useRouter();
  const [characterFeedback, setCharacterFeedback] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // 创建场景服务实例
  const sceneService = useMemo(() => {
    const apiKey = sessionStorage.getItem('api_key_openai') || undefined;
    return createSceneService(apiKey);
  }, []);

  // 生成角色反馈
  const generateCharacterFeedback = useCallback(async () => {
    return await sceneService.generateCharacterFeedback(novel, score, passed);
  }, [novel, score, passed, sceneService]);

  useEffect(() => {
    generateCharacterFeedback()
      .then(feedback => {
        setCharacterFeedback(feedback);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [generateCharacterFeedback]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {/* Header with Trophy */}
          <div className="relative p-8 pb-6">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-pink-500/10" />
            
            {/* Trophy Icon */}
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
                passed
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
              } shadow-2xl`}>
                <TrophyIcon className="w-16 h-16 text-white" />
                
                {/* Sparkles Animation */}
                {passed && (
                  <>
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
                      className="absolute inset-0 rounded-full bg-green-400/30"
                    />
                    <SparklesIcon className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
                  </>
                )}
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-center mb-2"
            >
              {passed ? (
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Congratulations! 🎉
                </span>
              ) : (
                <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Keep Practicing! 💪
                </span>
              )}
            </motion.h1>

            {/* Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-4"
            >
              <div className="text-6xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                {score}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                out of 100 points
              </div>
            </motion.div>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full ${
                passed
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
              }`}>
                {passed ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="font-semibold">Challenge Completed</span>
                  </>
                ) : (
                  <>
                    <FireIcon className="w-5 h-5" />
                    <span className="font-semibold">Try Again</span>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* Character Feedback Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="px-8 py-6 bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-orange-50/50 dark:from-gray-700/30 dark:via-purple-900/20 dark:to-gray-700/30"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">📖</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Message from {novel.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  by {novel.author}
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50"
              >
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed italic">
                  "{characterFeedback}"
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="px-8 py-6 grid grid-cols-3 gap-4"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                +{passed ? 30 : 15}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                XP Earned
              </div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <FireIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                5
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Rounds
              </div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrophyIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {getScoreGrade(score)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Grade
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="px-8 py-6 space-y-3"
          >
            <button
              onClick={onShare}
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              📊 Share Your Achievement
            </button>
            
            <button
              onClick={onBackToFeed}
              className="w-full h-12 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-all border-2 border-gray-200 dark:border-gray-600 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {buttonText}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

