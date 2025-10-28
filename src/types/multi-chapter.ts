/**
 * 多章节Quest相关类型定义
 * 符合TypeScript最佳实践，提供严格的类型安全
 */

import type { NovelContent } from '@/lib/api/novel-mock-data';
import type { SceneInfo, ScoreDimensions } from './scene';

// 章节信息
export interface Chapter {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly scene: SceneInfo;
  readonly order: number;
  readonly isCompleted: boolean;
  readonly score?: number;
  readonly completedAt?: Date;
}

// 多章节Quest信息
export interface MultiChapterQuest {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly novel: NovelContent;
  readonly chapters: readonly Chapter[];
  readonly totalChapters: number;
  readonly difficulty: 'A2' | 'B1' | 'B2';
  readonly estimatedTime: number; // 分钟
  readonly tags: readonly string[];
}

// 章节进度
export interface ChapterProgress {
  readonly chapterId: string;
  readonly isRead: boolean;
  readonly isSceneCompleted: boolean;
  readonly score?: number;
  readonly completedAt?: Date;
}

// Quest进度
export interface QuestProgress {
  readonly questId: string;
  readonly currentChapterIndex: number;
  readonly chaptersProgress: readonly ChapterProgress[];
  readonly totalScore: number;
  readonly averageScore: number;
  readonly isCompleted: boolean;
  readonly startedAt: Date;
  readonly completedAt?: Date;
}

// 章节状态
export type ChapterStatus = 'locked' | 'available' | 'in-progress' | 'completed';

// 章节步骤
export type ChapterStep = 'reading' | 'scene-practice' | 'scoring' | 'transition' | 'final-settlement';

// 多章节Quest组件属性
export interface MultiChapterQuestProps {
  readonly quest: MultiChapterQuest;
  readonly onComplete: (finalScore: number, passed: boolean) => void;
  readonly onBack: () => void;
}

// 章节阅读组件属性
export interface ChapterReadingProps {
  readonly chapter: Chapter;
  readonly onComplete: () => void;
  readonly onBack: () => void;
}

// 章节过渡组件属性
export interface ChapterTransitionProps {
  readonly currentChapter: Chapter;
  readonly nextChapter: Chapter | null;
  readonly score: number;
  readonly onContinue: () => void;
  readonly onBack: () => void;
}

// 最终结算组件属性
export interface FinalSettlementProps {
  readonly quest: MultiChapterQuest;
  readonly finalScore: number;
  readonly averageScore: number;
  readonly passed: boolean;
  readonly onShare: () => void;
  readonly onBackToFeed: () => void;
}

// 章节导航组件属性
export interface ChapterNavigationProps {
  readonly chapters: readonly Chapter[];
  readonly currentChapterIndex: number;
  readonly onChapterSelect: (chapterIndex: number) => void;
  readonly isLocked: (chapterIndex: number) => boolean;
}

// 进度统计
export interface ProgressStats {
  readonly totalChapters: number;
  readonly completedChapters: number;
  readonly currentChapter: number;
  readonly progressPercentage: number;
  readonly averageScore: number;
  readonly totalScore: number;
  readonly timeSpent: number; // 分钟
  readonly estimatedTimeRemaining: number; // 分钟
}
