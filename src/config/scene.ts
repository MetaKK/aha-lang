/**
 * 场景开发配置常量
 * 集中管理所有场景相关的配置，便于维护和调整
 */

// 游戏规则配置
export const SCENE_CONFIG = {
  // 对话轮次
  MAX_TURNS: 5,
  MIN_TURNS: 5,
  
  // 评分系统
  PASS_SCORE: 80,
  MAX_SCORE: 100,
  MIN_SCORE: 0,
  
  // 打字机效果
  TYPING_SPEED: 30, // 毫秒
  
  // 分数变化动画
  SCORE_ANIMATION_DURATION: 2000, // 毫秒
  
  // 场景生成超时
  SCENE_GENERATION_TIMEOUT: 30000, // 30秒
  
  // 消息历史保留
  MAX_CONVERSATION_HISTORY: 6,
  
  // 中文检测扣分
  CHINESE_PENALTY: 15,
} as const;

// 评分权重配置
export const SCORE_WEIGHTS = {
  COMMUNICATION: 0.30,
  ACCURACY: 0.25,
  SCENARIO: 0.25,
  FLUENCY: 0.20,
} as const;

// 难度等级配置
export const DIFFICULTY_LEVELS = {
  A2: { minScore: 0, maxScore: 60, description: '基础' },
  B1: { minScore: 60, maxScore: 80, description: '中级' },
  B2: { minScore: 80, maxScore: 100, description: '中高级' },
} as const;

// 默认场景配置
export const DEFAULT_SCENE: SceneInfo = {
  title: "Coffee Shop Conversation",
  description: "Practice ordering at a coffee shop",
  context: "You are at a coffee shop. The barista is friendly and ready to help. You want to order a drink.",
  goal: "Successfully order a coffee drink using natural English expressions",
  difficulty: "A2",
} as const;

// 默认评分配置
export const DEFAULT_SCORES: ScoreDimensions = {
  communication: 80,
  accuracy: 75,
  scenario: 85,
  fluency: 80,
} as const;

// 类型导入
import type { SceneInfo, ScoreDimensions } from '@/types/scene';
