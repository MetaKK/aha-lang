/**
 * 场景开发相关类型定义
 * 符合TypeScript最佳实践，提供严格的类型安全
 */

import type { NovelContent } from '@/lib/api/novel-mock-data';

// 评分维度 - 使用更严格的数值范围
export interface ScoreDimensions {
  readonly communication: number;  // 交际效果 (0-100)
  readonly accuracy: number;      // 语言准确性 (0-100)
  readonly scenario: number;      // 场景掌握 (0-100)
  readonly fluency: number;       // 对话流畅度 (0-100)
}

// 对话消息 - 使用更严格的类型
export interface Message {
  readonly id: string;
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly timestamp: Date;
  readonly score?: ScoreDimensions;
  readonly feedback?: string;
}

// 场景信息 - 使用更严格的难度类型
export interface SceneInfo {
  readonly title: string;
  readonly description: string;
  readonly context: string;
  readonly goal: string;
  readonly difficulty: 'A2' | 'B1' | 'B2';
}

// 场景练习组件属性
export interface ScenePracticeProps {
  readonly novel: NovelContent;
  readonly onComplete: (score: number, passed: boolean) => void;
  readonly onBack: () => void;
}

// 场景状态
export interface SceneState {
  readonly scene: SceneInfo | null;
  readonly messages: readonly Message[];
  readonly input: string;
  readonly currentTurn: number;
  readonly totalScore: number;
  readonly scoreChange: number | null;
  readonly turnScores: readonly number[];
  readonly isGeneratingScene: boolean;
  readonly isSending: boolean;
  readonly isTyping: boolean;
  readonly currentAIMessage: string;
  readonly isFinished: boolean;
  readonly apiKey: string | undefined;
}

// 场景动作类型
export type SceneAction =
  | { type: 'SET_SCENE'; payload: SceneInfo }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'INCREMENT_TURN' }
  | { type: 'SET_TOTAL_SCORE'; payload: number }
  | { type: 'SET_SCORE_CHANGE'; payload: number | null }
  | { type: 'ADD_TURN_SCORE'; payload: number }
  | { type: 'SET_GENERATING_SCENE'; payload: boolean }
  | { type: 'SET_SENDING'; payload: boolean }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_CURRENT_AI_MESSAGE'; payload: string }
  | { type: 'SET_FINISHED'; payload: boolean }
  | { type: 'SET_API_KEY'; payload: string | undefined }
  | { type: 'RESET_SCENE' };

// API响应类型
export interface SceneGenerationResponse {
  readonly title: string;
  readonly description: string;
  readonly context: string;
  readonly goal: string;
  readonly difficulty: 'A2' | 'B1' | 'B2';
}

export interface EvaluationResponse {
  readonly scores: ScoreDimensions;
  readonly feedback: string;
  readonly response: string;
  readonly hasChinese: boolean;
}
