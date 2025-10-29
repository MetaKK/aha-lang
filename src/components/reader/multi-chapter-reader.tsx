'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XCircleIcon, 
  BookOpenIcon, 
  PlayIcon, 
  TrophyIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { NovelReader } from './novel-reader';
import { ScenePractice } from '@/components/quest/scene-practice';
import { Settlement } from '@/components/quest/settlement';
import { hasPassed } from '@/utils/score-calculator';
import type { NovelContent, NovelChapter } from '@/lib/api/novel-mock-data';

interface MultiChapterReaderProps {
  novel: NovelContent;
  onClose: () => void;
  onComplete: () => void;
}

type ReadingPhase = 'reading' | 'practice' | 'settlement' | 'transition' | 'final-settlement';

interface ChapterProgress {
  chapterNumber: number;
  readingCompleted: boolean;
  practiceCompleted: boolean;
  practiceScore?: number;
  passed: boolean;
}

export function MultiChapterReader({ novel, onClose, onComplete }: MultiChapterReaderProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<ReadingPhase>('reading');
  const [chapterProgress, setChapterProgress] = useState<ChapterProgress[]>([]);
  const [practiceScore, setPracticeScore] = useState<number>(0);

  const currentChapter = novel.chapters[currentChapterIndex];
  const isLastChapter = currentChapterIndex === novel.chapters.length - 1;
  const totalChapters = novel.chapters.length;

  // 初始化章节进度
  useEffect(() => {
    const initialProgress = novel.chapters.map((_, index) => ({
      chapterNumber: index + 1,
      readingCompleted: false,
      practiceCompleted: false,
      passed: false
    }));
    setChapterProgress(initialProgress);
  }, [novel.chapters]);

  // 完成阅读阶段
  const handleReadingComplete = useCallback(() => {
    setCurrentPhase('practice');
    setChapterProgress(prev => 
      prev.map((progress, index) => 
        index === currentChapterIndex 
          ? { ...progress, readingCompleted: true }
          : progress
      )
    );
  }, [currentChapterIndex]);

  // 完成练习阶段
  const handlePracticeComplete = useCallback((score: number) => {
    setPracticeScore(score);
    const passed = hasPassed(score);
    
    setChapterProgress(prev => 
      prev.map((progress, index) => 
        index === currentChapterIndex 
          ? { 
              ...progress, 
              practiceCompleted: true, 
              practiceScore: score,
              passed 
            }
          : progress
      )
    );

    // 最后一章直接进入最终结算，其他章节进入小结算
    if (isLastChapter) {
      setCurrentPhase('final-settlement');
    } else {
      setCurrentPhase('settlement');
    }
  }, [currentChapterIndex, isLastChapter]);

  // 进入下一章（仅用于非最后一章）
  const handleNextChapter = useCallback(() => {
    // 最后一章不应该调用此函数，因为已经直接进入final-settlement
    if (isLastChapter) {
      console.warn('handleNextChapter called on last chapter, this should not happen');
      return;
    }

    setCurrentPhase('transition');
    
    setTimeout(() => {
      setCurrentChapterIndex(prev => prev + 1);
      setCurrentPhase('reading');
    }, 1000);
  }, [isLastChapter]);

  // 重新开始当前章节
  const handleRestartChapter = useCallback(() => {
    setCurrentPhase('reading');
    setPracticeScore(0);
  }, []);

  // 跳过练习（仅用于测试）
  const handleSkipPractice = useCallback(() => {
    handlePracticeComplete(85); // 给一个默认分数
  }, [handlePracticeComplete]);

  if (!currentChapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chapter Not Found</h2>
          <p className="text-gray-600 mb-6">The requested chapter could not be found.</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 过渡动画组件
  const TransitionScreen = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-6"
        >
          <BookOpenIcon className="w-full h-full text-purple-600" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Preparing Next Chapter...
        </h2>
        <p className="text-gray-600 text-lg">
          Chapter {currentChapterIndex + 2} of {totalChapters}
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="relative">
      
      <AnimatePresence mode="wait">
        {currentPhase === 'transition' ? (
          <TransitionScreen key="transition" />
        ) : currentPhase === 'reading' ? (
          <motion.div
            key="reading"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <NovelReader
              novel={novel}
              chapter={currentChapter}
              onClose={onClose}
              onComplete={handleReadingComplete}
            />
          </motion.div>
        ) : currentPhase === 'practice' ? (
          <motion.div
            key="practice"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100"
          >
            <div className="container mx-auto px-4 py-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Chapter {currentChapterIndex + 1} Practice
                </h1>
                <p className="text-gray-600">
                  Test your understanding of the chapter content
                </p>
              </div>
              
              <ScenePractice
                novel={novel}
                onComplete={(score, passed) => handlePracticeComplete(score)}
                onBack={handleRestartChapter}
              />
            </div>
          </motion.div>
        ) : currentPhase === 'settlement' ? (
          <motion.div
            key="settlement"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100"
          >
            <Settlement
              novel={novel}
              score={practiceScore}
              passed={hasPassed(practiceScore)}
              onShare={() => {}}
              onBackToFeed={handleNextChapter}
              buttonText={`Continue to Chapter ${currentChapterIndex + 2}`}
            />
          </motion.div>
        ) : currentPhase === 'final-settlement' ? (
          <motion.div
            key="final-settlement"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50"
          >
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              {/* 主角的信 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-purple-200/50"
              >
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-2xl">📜</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">A Letter from Harry</h2>
                  <p className="text-gray-600">Dear Friend,</p>
                </div>
                
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <p className="mb-4">
                    I can't believe we've come this far together. When I first stepped into the magical world, 
                    I was just a boy who didn't know he was a wizard. But with your help and encouragement, 
                    I've learned so much about courage, friendship, and the power of believing in yourself.
                  </p>
                  
                  <p className="mb-4">
                    You've been with me through every challenge - from discovering my true identity to 
                    facing the fears that once held me back. Your words of support have given me the 
                    strength to embrace my destiny, even when the path seemed uncertain.
                  </p>
                  
                  <p className="mb-4">
                    The magic isn't just in the spells or the wands - it's in the connections we make 
                    and the stories we share. You've helped me understand that being different isn't 
                    something to hide, but something to celebrate.
                  </p>
                  
                  <p className="mb-6">
                    Thank you for being such an amazing friend on this journey. The adventure doesn't 
                    end here - there are always new stories to discover and new magic to explore. 
                    I hope you'll continue to believe in the impossible, because that's where the 
                    most wonderful things begin.
                  </p>
                  
                  <div className="text-right">
                    <p className="text-gray-600 italic">With gratitude and friendship,</p>
                    <p className="text-purple-600 font-semibold">Harry Potter</p>
                  </div>
                </div>
              </motion.div>

              {/* 最终结果 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-purple-200/50"
              >
                <div className="text-center mb-6">
                  <TrophyIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Quest Complete!</h2>
                  <p className="text-gray-600 text-lg">Your magical journey has come to an end</p>
                </div>
                
                <div className="space-y-4">
                  {chapterProgress.map((progress, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {progress.chapterNumber}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">Chapter {progress.chapterNumber}</span>
                          <div className="flex items-center space-x-2 mt-1">
                            {progress.readingCompleted && (
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            )}
                            {progress.practiceCompleted && (
                              <TrophyIcon className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {progress.practiceScore || 0}%
                        </div>
                        <div className={`text-sm font-medium ${
                          progress.passed ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {progress.passed ? 'Excellent!' : 'Keep trying!'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* 行动按钮 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center space-x-4"
              >
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Close Quest
                </button>
                <button
                  onClick={onComplete}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center space-x-2"
                >
                  <span>Continue Learning</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
