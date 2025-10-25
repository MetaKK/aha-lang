/**
 * 内容创建和分发系统的类型定义
 * 
 * 设计理念：
 * 1. 两个核心入口：新增帖子 (Post) 和 新增挑战 (Challenge)
 * 2. 智能分发器根据内容自动决定卡片类型
 * 3. 统一的内容创建接口，支持扩展
 */

// ============================================================================
// 核心入口类型
// ============================================================================

/**
 * 内容类别 - 两个核心入口
 */
export type ContentCategory = 'post' | 'quest';

/**
 * 帖子子类型 - 由智能分发器自动识别
 */
export type PostSubType = 
  | 'text'      // 纯文本帖子
  | 'media'     // 包含图片/视频的帖子
  | 'audio'     // 音频帖子
  | 'quote'     // 引用帖子
  | 'repost';   // 转发帖子

/**
 * Quest子类型 - 学习相关的quest内容
 */
export type QuestSubType = 
  | 'novel'     // 小说阅读quest
  | 'chapter'   // 章节学习quest
  | 'vocabulary'// 词汇quest
  | 'grammar'   // 语法quest
  | 'listening' // 听力quest
  | 'speaking'; // 口语quest

// ============================================================================
// 内容创建接口
// ============================================================================

/**
 * 基础内容数据
 */
export interface BaseContentData {
  text: string;                    // 文本内容
  media?: MediaAttachment[];       // 媒体附件
  metadata?: Record<string, any>;  // 扩展元数据
}

/**
 * 媒体附件
 */
export interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'gif';
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
}

/**
 * 帖子创建数据
 */
export interface PostCreationData extends BaseContentData {
  category: 'post';
  // 可选：用户可以手动指定类型，否则由智能分发器决定
  preferredType?: PostSubType;
  // 引用相关
  quotedPostId?: string;
  repostedPostId?: string;
}

/**
 * Quest创建数据
 */
export interface QuestCreationData extends BaseContentData {
  category: 'quest';
  // Quest特有字段
  questType: QuestSubType;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  estimatedTime?: string;
  tags?: string[];
  // 小说/章节特有
  novelId?: string;
  chapterNumber?: number;
  // Quest配置
  questConfig?: {
    vocabulary?: string[];
    grammarPoints?: string[];
    questions?: any[];
  };
}

/**
 * 统一的内容创建数据
 */
export type ContentCreationData = PostCreationData | QuestCreationData;

// ============================================================================
// 智能分发器
// ============================================================================

/**
 * 内容分析结果
 */
export interface ContentAnalysis {
  category: ContentCategory;
  suggestedType: PostSubType | QuestSubType;
  confidence: number;           // 0-1 置信度
  reasons: string[];            // 判断依据
  metadata: Record<string, any>;// 提取的元数据
}

/**
 * 分发规则
 */
export interface DispatchRule {
  id: string;
  name: string;
  priority: number;             // 优先级，数字越大越优先
  condition: (data: BaseContentData) => boolean;
  action: (data: BaseContentData) => Partial<ContentAnalysis>;
}

/**
 * 智能分发器配置
 */
export interface DispatcherConfig {
  rules: DispatchRule[];
  defaultPostType: PostSubType;
  defaultQuestType: QuestSubType;
  enableAIAnalysis?: boolean;   // 是否启用AI分析（未来扩展）
}

// ============================================================================
// 内容呈现
// ============================================================================

/**
 * 卡片渲染配置
 */
export interface CardRenderConfig {
  type: PostSubType | QuestSubType;
  component: string;            // 组件名称
  props: Record<string, any>;   // 组件属性
  layout: 'compact' | 'standard' | 'expanded';
  priority: number;             // 渲染优先级
}

/**
 * 卡片渲染策略
 */
export interface CardRenderStrategy {
  analyze: (content: ContentCreationData) => CardRenderConfig;
  render: (config: CardRenderConfig) => React.ReactNode;
}

// ============================================================================
// API 响应
// ============================================================================

/**
 * 内容创建响应
 */
export interface ContentCreationResponse {
  id: string;
  category: ContentCategory;
  type: PostSubType | QuestSubType;
  content: BaseContentData;
  author: {
    id: string;
    handle: string;
    displayName: string;
    avatar: string;
  };
  createdAt: string;
  analysis?: ContentAnalysis;   // 分析结果（调试用）
}

// ============================================================================
// 工具类型
// ============================================================================

/**
 * 类型守卫：判断是否为帖子创建数据
 */
export function isPostCreation(data: ContentCreationData): data is PostCreationData {
  return data.category === 'post';
}

/**
 * 类型守卫：判断是否为Quest创建数据
 */
export function isQuestCreation(data: ContentCreationData): data is QuestCreationData {
  return data.category === 'quest';
}

