/**
 * 学习相关类型定义
 */

export type ChallengeType = 
  | 'vocabulary'
  | 'grammar'
  | 'listening'
  | 'speaking'
  | 'reading'
  | 'writing'
  | 'pronunciation'
  | 'translation'

export type ChallengeStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'failed'

export interface ChallengeConfig {
  id: string
  type: ChallengeType
  title: string
  description?: string
  difficulty: number
  passingScore: number
  timeLimit?: number
  questions?: any[]
  metadata?: Record<string, any>
}

export interface UserAnswer {
  challengeId: string
  userId: string
  answers: any
  timeSpent: number
  attemptNumber: number
  timestamp: string
}

export interface Chapter {
  id: string
  novel_id: string
  chapter_number: number
  title: string
  content: string
  
  // 难度
  difficulty_level: number
  estimated_time: number
  word_count: number
  
  // AI生成的元数据
  key_vocabulary?: string[]
  grammar_points?: string[]
  themes?: string[]
  
  // 挑战
  challenges?: Challenge[]
  
  // 时间
  created_at: string
  updated_at: string
}

export interface Challenge {
  id: string
  chapter_id: string
  type: ChallengeType
  order_index: number
  config: ChallengeConfig
  passing_score: number
  time_limit?: number
  
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  chapter_id: string
  
  // 状态
  status: ChallengeStatus
  current_challenge_index: number
  
  // 分数
  best_score: number
  attempts: number
  time_spent: number
  
  // 详细数据
  challenges_completed: Record<string, boolean>
  mistakes: Record<string, any>
  
  // 时间
  started_at: string
  completed_at?: string
  last_accessed_at: string
}

export interface LearningPath {
  id: string
  title: string
  description: string
  difficulty_level: number
  
  // 路径配置
  chapters: string[] // chapter IDs
  prerequisites?: string[] // prerequisite path IDs
  
  // 统计
  enrolled_count: number
  completion_rate: number
  
  // 元数据
  created_by: string
  created_at: string
  updated_at: string
}

export interface UserLearningPath {
  id: string
  user_id: string
  path_id: string
  
  // 进度
  current_chapter_index: number
  completed_chapters: string[]
  progress_percentage: number
  
  // 时间
  started_at: string
  last_accessed_at: string
  completed_at?: string
}

export interface Achievement {
  id: string
  user_id: string
  type: string
  title: string
  description: string
  icon?: string
  
  // 进度
  current_value: number
  target_value: number
  completed: boolean
  
  // 奖励
  reward_points?: number
  reward_badge?: string
  
  // 时间
  earned_at?: string
  created_at: string
}

export interface StudySession {
  id: string
  user_id: string
  
  // 会话数据
  chapters_studied: string[]
  challenges_completed: number
  total_time: number
  
  // 统计
  correct_answers: number
  total_answers: number
  accuracy_rate: number
  
  // 时间
  started_at: string
  ended_at: string
}
