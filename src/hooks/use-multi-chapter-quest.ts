/**
 * 多章节Quest状态管理Hook
 * 使用useReducer管理复杂状态，符合React最佳实践
 */

import { useReducer, useCallback, useMemo } from 'react';
import type { 
  MultiChapterQuest, 
  QuestProgress, 
  ChapterProgress, 
  ChapterStatus, 
  ChapterStep,
  ProgressStats,
  Chapter
} from '@/types/multi-chapter';

// 状态定义
export interface MultiChapterQuestState {
  readonly currentChapterIndex: number;
  readonly currentStep: ChapterStep;
  readonly questProgress: QuestProgress;
  readonly isTransitioning: boolean;
  readonly isLoading: boolean;
}

// 动作类型
export type MultiChapterQuestAction =
  | { type: 'SET_CURRENT_CHAPTER'; payload: number }
  | { type: 'SET_CURRENT_STEP'; payload: ChapterStep }
  | { type: 'UPDATE_CHAPTER_PROGRESS'; payload: { chapterIndex: number; progress: Partial<ChapterProgress> } }
  | { type: 'COMPLETE_CHAPTER'; payload: { chapterIndex: number; score: number } }
  | { type: 'SET_TRANSITIONING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'COMPLETE_QUEST'; payload: { finalScore: number; averageScore: number } }
  | { type: 'RESET_QUEST' };

// 初始状态
const createInitialState = (quest: MultiChapterQuest): MultiChapterQuestState => ({
  currentChapterIndex: 0,
  currentStep: 'reading',
  questProgress: {
    questId: quest.id,
    currentChapterIndex: 0,
    chaptersProgress: quest.chapters.map((chapter, index) => ({
      chapterId: chapter.id,
      isRead: index === 0, // 只有第一章可以开始阅读
      isSceneCompleted: false,
      score: undefined,
      completedAt: undefined,
    })),
    totalScore: 0,
    averageScore: 0,
    isCompleted: false,
    startedAt: new Date(),
  },
  isTransitioning: false,
  isLoading: false,
});

// 状态更新函数
function multiChapterQuestReducer(
  state: MultiChapterQuestState,
  action: MultiChapterQuestAction,
  quest: MultiChapterQuest
): MultiChapterQuestState {
  switch (action.type) {
    case 'SET_CURRENT_CHAPTER':
      return {
        ...state,
        currentChapterIndex: action.payload,
        currentStep: 'reading',
      };

    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };

    case 'UPDATE_CHAPTER_PROGRESS':
      const { chapterIndex, progress } = action.payload;
      const updatedChaptersProgress = state.questProgress.chaptersProgress.map((chapterProgress, index) =>
        index === chapterIndex
          ? { ...chapterProgress, ...progress }
          : chapterProgress
      );

      return {
        ...state,
        questProgress: {
          ...state.questProgress,
          chaptersProgress: updatedChaptersProgress,
        },
      };

    case 'COMPLETE_CHAPTER':
      const { chapterIndex: completedChapterIndex, score } = action.payload;
      const completedChaptersProgress = state.questProgress.chaptersProgress.map((chapterProgress, index) =>
        index === completedChapterIndex
          ? {
              ...chapterProgress,
              isSceneCompleted: true,
              score,
              completedAt: new Date(),
            }
          : chapterProgress
      );

      // 解锁下一章
      const nextChapterIndex = completedChapterIndex + 1;
      const unlockedChaptersProgress = completedChaptersProgress.map((chapterProgress, index) =>
        index === nextChapterIndex
          ? { ...chapterProgress, isRead: true }
          : chapterProgress
      );

      const newTotalScore = unlockedChaptersProgress
        .filter(cp => cp.score !== undefined)
        .reduce((sum, cp) => sum + (cp.score || 0), 0);

      const completedChaptersCount = unlockedChaptersProgress.filter(cp => cp.isSceneCompleted).length;
      const newAverageScore = completedChaptersCount > 0 ? newTotalScore / completedChaptersCount : 0;

      return {
        ...state,
        questProgress: {
          ...state.questProgress,
          chaptersProgress: unlockedChaptersProgress,
          totalScore: newTotalScore,
          averageScore: newAverageScore,
        },
        isTransitioning: true,
      };

    case 'SET_TRANSITIONING':
      return {
        ...state,
        isTransitioning: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'COMPLETE_QUEST':
      return {
        ...state,
        questProgress: {
          ...state.questProgress,
          isCompleted: true,
          completedAt: new Date(),
          totalScore: action.payload.finalScore,
          averageScore: action.payload.averageScore,
        },
      };

    case 'RESET_QUEST':
      return createInitialState(quest);

    default:
      return state;
  }
}

export interface UseMultiChapterQuestReturn {
  state: MultiChapterQuestState;
  actions: {
    setCurrentChapter: (chapterIndex: number) => void;
    setCurrentStep: (step: ChapterStep) => void;
    updateChapterProgress: (chapterIndex: number, progress: Partial<ChapterProgress>) => void;
    completeChapter: (chapterIndex: number, score: number) => void;
    setTransitioning: (transitioning: boolean) => void;
    setLoading: (loading: boolean) => void;
    completeQuest: (finalScore: number, averageScore: number) => void;
    resetQuest: () => void;
  };
  // 计算属性
  computed: {
    currentChapter: Chapter | null;
    nextChapter: Chapter | null;
    previousChapter: Chapter | null;
    canProceedToNextChapter: boolean;
    isLastChapter: boolean;
    isFirstChapter: boolean;
    chapterStatus: (chapterIndex: number) => ChapterStatus;
    progressStats: ProgressStats;
  };
}

export function useMultiChapterQuest(quest: MultiChapterQuest): UseMultiChapterQuestReturn {
  const [state, dispatch] = useReducer(
    (state: MultiChapterQuestState, action: MultiChapterQuestAction) => 
      multiChapterQuestReducer(state, action, quest),
    quest,
    createInitialState
  );

  // 动作函数
  const actions = {
    setCurrentChapter: useCallback((chapterIndex: number) => {
      dispatch({ type: 'SET_CURRENT_CHAPTER', payload: chapterIndex });
    }, []),

    setCurrentStep: useCallback((step: ChapterStep) => {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    }, []),

    updateChapterProgress: useCallback((chapterIndex: number, progress: Partial<ChapterProgress>) => {
      dispatch({ type: 'UPDATE_CHAPTER_PROGRESS', payload: { chapterIndex, progress } });
    }, []),

    completeChapter: useCallback((chapterIndex: number, score: number) => {
      dispatch({ type: 'COMPLETE_CHAPTER', payload: { chapterIndex, score } });
    }, []),

    setTransitioning: useCallback((transitioning: boolean) => {
      dispatch({ type: 'SET_TRANSITIONING', payload: transitioning });
    }, []),

    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),

    completeQuest: useCallback((finalScore: number, averageScore: number) => {
      dispatch({ type: 'COMPLETE_QUEST', payload: { finalScore, averageScore } });
    }, []),

    resetQuest: useCallback(() => {
      dispatch({ type: 'RESET_QUEST' });
    }, []),
  };

  // 计算属性
  const computed = useMemo(() => ({
    get currentChapter() {
      return quest.chapters[state.currentChapterIndex] || null;
    },

    get nextChapter() {
      return quest.chapters[state.currentChapterIndex + 1] || null;
    },

    get previousChapter() {
      return quest.chapters[state.currentChapterIndex - 1] || null;
    },

    get canProceedToNextChapter() {
      const currentChapterProgress = state.questProgress.chaptersProgress[state.currentChapterIndex];
      return currentChapterProgress?.isSceneCompleted || false;
    },

    get isLastChapter() {
      return state.currentChapterIndex === quest.chapters.length - 1;
    },

    get isFirstChapter() {
      return state.currentChapterIndex === 0;
    },

    chapterStatus: (chapterIndex: number): ChapterStatus => {
      const chapterProgress = state.questProgress.chaptersProgress[chapterIndex];
      
      if (chapterIndex > state.currentChapterIndex + 1) {
        return 'locked';
      }
      
      if (chapterIndex === state.currentChapterIndex) {
        return 'in-progress';
      }
      
      if (chapterProgress?.isSceneCompleted) {
        return 'completed';
      }
      
      return 'available';
    },

    get progressStats(): ProgressStats {
      const completedChapters = state.questProgress.chaptersProgress.filter(cp => cp.isSceneCompleted).length;
      const progressPercentage = (completedChapters / quest.chapters.length) * 100;
      
      return {
        totalChapters: quest.chapters.length,
        completedChapters,
        currentChapter: state.currentChapterIndex + 1,
        progressPercentage,
        averageScore: state.questProgress.averageScore,
        totalScore: state.questProgress.totalScore,
        timeSpent: Math.floor((Date.now() - state.questProgress.startedAt.getTime()) / 60000),
        estimatedTimeRemaining: Math.max(0, quest.estimatedTime - Math.floor((Date.now() - state.questProgress.startedAt.getTime()) / 60000)),
      };
    },
  }), [state, quest]);

  return {
    state,
    actions,
    computed,
  };
}
