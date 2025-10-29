'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  FireIcon, 
  ClockIcon, 
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { useAuthState } from '@/hooks/use-auth';
import { getContentById } from '@/lib/api/novel-mock-data';
import type { NovelContent } from '@/lib/api/novel-mock-data';

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar' | 'comprehension' | 'speaking' | 'writing';
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedTime: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'matching' | 'audio';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  audioUrl?: string;
}

export default function ContentChallengePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthState();
  const [content, setContent] = useState<NovelContent | null>(null);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const contentType = params.type as string;
  const contentId = params.id as string;

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      
      try {
        if (contentType === 'novel' || contentType === 'quest') {
          const novelData = getContentById(contentId);
          setContent(novelData || null);
          
          // 创建基于内容的Quest
          if (novelData) {
            const mockQuest: Quest = {
              id: contentId,
              title: `${novelData.title} Challenge`,
              description: `Test your understanding of "${novelData.title}" with this interactive challenge`,
              type: 'comprehension',
              difficulty: 3,
              estimatedTime: '15 min',
              questions: [
                {
                  id: 'q1',
                  type: 'multiple_choice',
                  question: `What is the main theme of "${novelData.title}"?`,
                  options: [
                    'Adventure and exploration',
                    'Love and relationships',
                    'Good vs. evil',
                    'Coming of age'
                  ],
                  correctAnswer: 'Adventure and exploration',
                  explanation: 'This story primarily focuses on adventure and exploration themes.'
                },
                {
                  id: 'q2',
                  type: 'fill_blank',
                  question: `Complete the sentence: "The protagonist in "${novelData.title}" is a _____ character."`,
                  correctAnswer: 'brave',
                  explanation: 'The protagonist demonstrates courage throughout the story.'
                },
                {
                  id: 'q3',
                  type: 'multiple_choice',
                  question: `Which genre best describes "${novelData.title}"?`,
                  options: [
                    'Romance',
                    'Fantasy',
                    'Mystery',
                    'Science Fiction'
                  ],
                  correctAnswer: 'Fantasy',
                  explanation: 'The story contains magical elements and fantastical settings.'
                }
              ],
              passingScore: 70,
              timeLimit: 900 // 15 minutes in seconds
            };
            
            setQuest(mockQuest);
            setTimeRemaining(mockQuest.timeLimit || null);
          }
        } else {
          setContent(null);
          setQuest(null);
        }
      } catch (error) {
        setContent(null);
        setQuest(null);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [contentType, contentId]);

  // 计时器
  useEffect(() => {
    if (timeRemaining && timeRemaining > 0 && !isCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleSubmit();
    }
  }, [timeRemaining, isCompleted]);

  const handleAnswer = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quest!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!quest) return;

    let correctAnswers = 0;
    quest.questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / quest.questions.length) * 100);
    setScore(finalScore);
    setIsCompleted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!content || !quest) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Content Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">This content doesn't exist or has been removed.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quest.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="flex items-center space-x-4">
            {timeRemaining !== null && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <ClockIcon className="w-4 h-4" />
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentQuestion + 1} / {quest.questions.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {!isCompleted ? (
          <>
            {/* Quest Info */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-2">
                <FireIcon className="w-6 h-6 text-orange-500" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quest.title}
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {quest.description}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-4 h-4" />
                  <span>Difficulty: {quest.difficulty}/5</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{quest.estimatedTime}</span>
                </div>
              </div>
            </div>

            {/* Question */}
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Question {currentQuestion + 1}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {currentQ.question}
              </p>

              {/* Answer Options */}
              {currentQ.type === 'multiple_choice' && currentQ.options && (
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(currentQ.id, option)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        userAnswers[currentQ.id] === option
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {option}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'fill_blank' && (
                <div>
                  <input
                    type="text"
                    value={userAnswers[currentQ.id] || ''}
                    onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentQuestion === quest.questions.length - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </>
        ) : (
          /* Results */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-8">
              {score! >= quest.passingScore ? (
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {score! >= quest.passingScore ? 'Congratulations!' : 'Keep Learning!'}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {score! >= quest.passingScore 
                  ? 'You passed the challenge!' 
                  : `You need ${quest.passingScore}% to pass. Try again!`
                }
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-6">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {score}%
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Your Score
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setUserAnswers({});
                  setIsCompleted(false);
                  setScore(null);
                  setTimeRemaining(quest.timeLimit || null);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => router.push(`/content/${contentType}/${contentId}`)}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Content
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
