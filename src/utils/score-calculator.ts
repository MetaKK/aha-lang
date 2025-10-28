/**
 * 分数计算工具函数
 * 提供统一的分数计算逻辑，符合业务规则
 */

import type { ScoreDimensions } from '@/types/scene';
import { SCORE_WEIGHTS, SCENE_CONFIG } from '@/config/scene';

/**
 * 计算加权平均分
 */
export function calculateWeightedScore(scores: ScoreDimensions): number {
  const { COMMUNICATION, ACCURACY, SCENARIO, FLUENCY } = SCORE_WEIGHTS;
  
  return Math.round(
    scores.communication * COMMUNICATION +
    scores.accuracy * ACCURACY +
    scores.scenario * SCENARIO +
    scores.fluency * FLUENCY
  );
}

/**
 * 计算最终轮次分数（考虑中文扣分）
 */
export function calculateFinalTurnScore(
  scores: ScoreDimensions,
  hasChinese: boolean
): number {
  let finalScore = calculateWeightedScore(scores);
  
  if (hasChinese) {
    finalScore = Math.max(SCENE_CONFIG.MIN_SCORE, finalScore - SCENE_CONFIG.CHINESE_PENALTY);
  }
  
  return Math.min(finalScore, SCENE_CONFIG.MAX_SCORE);
}

/**
 * 计算新的总分
 */
export function calculateNewTotalScore(
  currentTotalScore: number,
  currentTurn: number,
  newTurnScore: number
): number {
  return Math.round(
    ((currentTotalScore * currentTurn) + newTurnScore) / (currentTurn + 1)
  );
}

/**
 * 计算分数变化
 */
export function calculateScoreChange(
  newTotalScore: number,
  oldTotalScore: number
): number {
  return newTotalScore - oldTotalScore;
}

/**
 * 验证分数是否有效
 */
export function isValidScore(score: number): boolean {
  return score >= SCENE_CONFIG.MIN_SCORE && score <= SCENE_CONFIG.MAX_SCORE;
}

/**
 * 验证评分维度是否有效
 */
export function isValidScoreDimensions(scores: ScoreDimensions): boolean {
  return Object.values(scores).every(score => isValidScore(score));
}

/**
 * 获取分数等级
 */
export function getScoreGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

/**
 * 获取分数描述
 */
export function getScoreDescription(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Fair';
  if (score >= 60) return 'Needs Improvement';
  return 'Poor';
}

/**
 * 计算进度百分比
 */
export function calculateProgressPercentage(
  currentTurn: number,
  maxTurns: number = SCENE_CONFIG.MAX_TURNS
): number {
  return Math.min((currentTurn / maxTurns) * 100, 100);
}

/**
 * 检查是否通过
 */
export function hasPassed(score: number): boolean {
  return score >= SCENE_CONFIG.PASS_SCORE;
}
