'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  SparklesIcon,
  TrophyIcon,
  FireIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { getNovelById } from '@/lib/api/novel-mock-data';
import type { NovelContent } from '@/lib/api/novel-mock-data';
import { cn } from '@/lib/utils';

/**
 * Quest挑战页面
 * 
 * 功能占位：
 * 1. 关卡挑战 - 从其他项目引入
 * 2. 系统结算 - 从其他项目引入
 * 3. 分享裂变 - 从其他项目引入
 * 
 * 当前实现：展示占位页面，说明功能即将到来
 */

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function QuestChallengePage() {
  const params = useParams();
  const router = useRouter();
  const [novel, setNovel] = useState<NovelContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<'challenge' | 'settlement' | 'share'>('challenge');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);

  const novelId = params.id as string;

  useEffect(() => {
    setTimeout(() => {
      const foundNovel = getNovelById(novelId);
      setNovel(foundNovel || null);
      setLoading(false);
    }, 300);
  }, [novelId]);

  // Mock题目 - 基于小说内容
  const questions: Question[] = [
    {
      id: 'q1',
      question: 'Where were Emma and the narrator traveling?',
      options: ['On Earth', 'In space', 'Under the sea', 'In the mountains'],
      correctAnswer: 'In space',
    },
    {
      id: 'q2',
      question: 'What did they discover was moving toward Earth?',
      options: ['A spaceship', 'An asteroid', 'A comet', 'A satellite'],
      correctAnswer: 'An asteroid',
    },
    {
      id: 'q3',
      question: 'What happened when they went back in time?',
      options: [
        'They found dinosaurs',
        'They found aliens',
        'They found ancient humans',
        'They found robots',
      ],
      correctAnswer: 'They found dinosaurs',
    },
    {
      id: 'q4',
      question: 'In the new timeline, who were the rulers of Earth?',
      options: ['Humans', 'Dinosaurs', 'Aliens', 'Robots'],
      correctAnswer: 'Dinosaurs',
    },
    {
      id: 'q5',
      question: 'What did the dinosaurs call the asteroid?',
      options: ['The Death Star', 'The Magic Star', 'The Savior Star', 'The Lucky Star'],
      correctAnswer: 'The Magic Star',
    },
  ];

  const handleAnswer = (answer: string) => {
    const currentQ = questions[currentQuestion];
    setAnswers(prev => ({ ...prev, [currentQ.id]: answer }));

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 500);
    } else {
      // 计算分数
      setTimeout(() => {
        let correct = 0;
        questions.forEach(q => {
          if (answers[q.id] === q.correctAnswer || answer === q.correctAnswer) {
            correct++;
          }
        });
        const finalScore = Math.round((correct / questions.length) * 100);
        setScore(finalScore);
        setCurrentStep('settlement');
      }, 500);
    }
  };

  const handleShare = () => {
    setCurrentStep('share');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-purple-600/5 dark:from-primary/10 dark:to-purple-600/10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {novel.title}
            </span>
          </div>

          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {currentStep === 'challenge' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Progress */}
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <div className="flex gap-1">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      index < currentQuestion
                        ? 'w-8 bg-green-500'
                        : index === currentQuestion
                        ? 'w-12 bg-primary'
                        : 'w-6 bg-gray-200 dark:bg-gray-700'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Question */}
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                {questions[currentQuestion].question}
              </h2>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option)}
                    className={cn(
                      'w-full p-4 text-left rounded-xl transition-all',
                      'border-2 border-gray-200 dark:border-gray-700',
                      'hover:border-primary hover:bg-primary/5',
                      'text-gray-900 dark:text-white font-medium',
                      answers[questions[currentQuestion].id] === option &&
                        'border-primary bg-primary/10'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Vocabulary Hint */}
            {novel.vocabulary && (
              <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <SparklesIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Vocabulary Hint
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Check the vocabulary section if you need help understanding the story!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {currentStep === 'settlement' && score !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Success Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
            >
              <TrophyIcon className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good Job!' : 'Keep Learning!'}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-8">
              You scored {score}% on this challenge
            </p>

            {/* Score Breakdown */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-6 shadow-lg">
              <div className="text-6xl font-bold text-primary mb-4">
                {score}%
              </div>
              <div className="text-gray-600 dark:text-gray-400 mb-6">
                Your Score
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round((score / 100) * questions.length)}
                  </div>
                  <div className="text-xs text-gray-500">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    +{score}
                  </div>
                  <div className="text-xs text-gray-500">XP Earned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {novel.difficulty}
                  </div>
                  <div className="text-xs text-gray-500">Level</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleShare}
                className="w-full py-4 px-6 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow"
              >
                Share Your Achievement
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full py-4 px-6 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Back to Feed
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'share' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg mb-6">
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
                  Completed "{novel.title}"
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Score: {score}% • Level {novel.difficulty}
                </div>
              </div>

              {/* Share Buttons - Placeholder */}
              <div className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                🔗 Share functionality coming soon from other project...
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full py-4 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Continue Learning
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

