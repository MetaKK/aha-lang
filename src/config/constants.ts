/**
 * 应用配置常量
 */

// Feed 配置
export const FEED = {
  PAGE_SIZE: 20,
  PREFETCH_THRESHOLD: 0.8, // 滚动到80%时预加载
  CACHE_TIME: 5 * 60 * 1000, // 5分钟
  STALE_TIME: 2 * 60 * 1000, // 2分钟
} as const

// 学习配置
export const LEARNING = {
  MIN_PASSING_SCORE: 60,
  MAX_ATTEMPTS: 3,
  HINT_COOLDOWN: 30 * 1000, // 30秒
  AUTO_SAVE_INTERVAL: 10 * 1000, // 10秒
} as const

// 挑战配置
export const CHALLENGE = {
  DEFAULT_TIME_LIMIT: 300, // 5分钟
  WARNING_TIME: 60, // 剩余1分钟时警告
  MAX_QUESTIONS: 50,
  MIN_QUESTIONS: 5,
} as const

// AI 配置
export const AI = {
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.7,
  MODEL: 'gpt-4-turbo',
  STREAMING: true,
} as const

// 存储配置
export const STORAGE = {
  MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7天
  CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 每天清理一次
} as const

// 实时配置
export const REALTIME = {
  RECONNECT_DELAY: 3000, // 3秒
  MAX_RECONNECT_ATTEMPTS: 5,
  HEARTBEAT_INTERVAL: 30 * 1000, // 30秒
} as const

// 性能配置
export const PERFORMANCE = {
  VIRTUAL_SCROLL_OVERSCAN: 5,
  IMAGE_LAZY_LOAD_THRESHOLD: 200,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
} as const

// 路由
export const ROUTES = {
  HOME: '/',
  FEED: '/feed',
  CARD_DETAIL: (id: string) => `/card/${id}`,
  CHAPTER: (id: string) => `/chapter/${id}`,
  QUEST: (id: string) => `/content/quest/${id}`,
  NOVEL: (id: string) => `/content/novel/${id}`,
  POST: (id: string) => `/content/post/${id}`,
  PROFILE: (id: string) => `/profile/${id}`,
  SETTINGS: '/settings',
  LEADERBOARD: '/leaderboard',
} as const

// API 端点
export const API = {
  AI_SCORE: '/api/ai/score',
  AI_FEEDBACK: '/api/ai/feedback',
  AI_HINT: '/api/ai/hint',
  UPLOAD: '/api/upload',
} as const

// 本地存储键
export const STORAGE_KEYS = {
  FEED: 'feed-storage',
  USER: 'user-storage',
  PROGRESS: 'progress-storage',
  SETTINGS: 'settings-storage',
} as const

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
} as const

// 成功消息
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Saved successfully!',
  UPDATE_SUCCESS: 'Updated successfully!',
  DELETE_SUCCESS: 'Deleted successfully!',
  SUBMIT_SUCCESS: 'Submitted successfully!',
} as const
