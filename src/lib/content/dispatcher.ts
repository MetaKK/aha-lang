/**
 * 智能内容分发器
 * 
 * 职责：
 * 1. 分析用户输入的内容
 * 2. 自动识别内容类型（文本、媒体、音频等）
 * 3. 返回最适合的卡片呈现类型
 * 
 * 设计原则：
 * - 基于规则的分发（可扩展为AI分发）
 * - 优先级队列处理
 * - 可配置和可测试
 */

import type {
  BaseContentData,
  ContentAnalysis,
  PostSubType,
  ChallengeSubType,
  DispatchRule,
  DispatcherConfig,
  ContentCreationData,
  PostCreationData,
  ChallengeCreationData
} from '@/types/content';

// ============================================================================
// 默认分发规则
// ============================================================================

/**
 * 帖子分发规则
 */
const POST_DISPATCH_RULES: DispatchRule[] = [
  // 规则1: 包含媒体附件 → media类型
  {
    id: 'post-media-detection',
    name: '媒体内容检测',
    priority: 100,
    condition: (data) => {
      return !!(data.media && data.media.length > 0);
    },
    action: (data) => {
      const hasVideo = data.media?.some(m => m.type === 'video');
      const hasAudio = data.media?.some(m => m.type === 'audio');
      const hasImage = data.media?.some(m => m.type === 'image');
      
      return {
        suggestedType: hasAudio ? 'audio' : 'media',
        confidence: 0.95,
        reasons: [
          hasVideo ? '包含视频内容' : '',
          hasAudio ? '包含音频内容' : '',
          hasImage ? '包含图片内容' : '',
        ].filter(Boolean),
        metadata: {
          mediaCount: data.media?.length || 0,
          mediaTypes: data.media?.map(m => m.type) || [],
        }
      };
    }
  },
  
  // 规则2: 纯文本 → text类型
  {
    id: 'post-text-detection',
    name: '纯文本检测',
    priority: 50,
    condition: (data) => {
      return !!data.text && (!data.media || data.media.length === 0);
    },
    action: (data) => ({
      suggestedType: 'text',
      confidence: 0.9,
      reasons: ['纯文本内容'],
      metadata: {
        textLength: data.text.length,
        hasHashtags: /#\w+/.test(data.text),
        hasMentions: /@\w+/.test(data.text),
      }
    })
  },
  
  // 规则3: 长文本 → text类型（但可能需要特殊布局）
  {
    id: 'post-long-text-detection',
    name: '长文本检测',
    priority: 60,
    condition: (data) => {
      return data.text.length > 500;
    },
    action: (data) => ({
      suggestedType: 'text',
      confidence: 0.85,
      reasons: ['长文本内容（建议使用展开布局）'],
      metadata: {
        textLength: data.text.length,
        suggestedLayout: 'expanded',
      }
    })
  },
];

/**
 * 挑战分发规则
 */
const CHALLENGE_DISPATCH_RULES: DispatchRule[] = [
  // 规则1: 包含小说ID → novel类型
  {
    id: 'challenge-novel-detection',
    name: '小说挑战检测',
    priority: 100,
    condition: (data) => {
      return !!(data.metadata?.novelId || data.metadata?.isNovel);
    },
    action: (data) => ({
      suggestedType: 'novel',
      confidence: 0.98,
      reasons: ['包含小说元数据'],
      metadata: {
        novelId: data.metadata?.novelId,
        hasChapters: !!(data.metadata?.totalChapters),
      }
    })
  },
  
  // 规则2: 包含章节号 → chapter类型
  {
    id: 'challenge-chapter-detection',
    name: '章节挑战检测',
    priority: 95,
    condition: (data) => {
      return !!(data.metadata?.chapterNumber || data.metadata?.isChapter);
    },
    action: (data) => ({
      suggestedType: 'chapter',
      confidence: 0.97,
      reasons: ['包含章节元数据'],
      metadata: {
        chapterNumber: data.metadata?.chapterNumber,
        novelId: data.metadata?.novelId,
      }
    })
  },
  
  // 规则3: 包含词汇列表 → vocabulary类型
  {
    id: 'challenge-vocabulary-detection',
    name: '词汇挑战检测',
    priority: 90,
    condition: (data) => {
      return !!(data.metadata?.vocabulary || data.metadata?.words);
    },
    action: (data) => ({
      suggestedType: 'vocabulary',
      confidence: 0.95,
      reasons: ['包含词汇数据'],
      metadata: {
        vocabularyCount: data.metadata?.vocabulary?.length || 0,
      }
    })
  },
  
  // 规则4: 包含语法点 → grammar类型
  {
    id: 'challenge-grammar-detection',
    name: '语法挑战检测',
    priority: 90,
    condition: (data) => {
      return !!(data.metadata?.grammarPoints || data.metadata?.grammar);
    },
    action: (data) => ({
      suggestedType: 'grammar',
      confidence: 0.95,
      reasons: ['包含语法数据'],
      metadata: {
        grammarPointsCount: data.metadata?.grammarPoints?.length || 0,
      }
    })
  },
  
  // 规则5: 包含音频 → listening类型
  {
    id: 'challenge-listening-detection',
    name: '听力挑战检测',
    priority: 85,
    condition: (data) => {
      return !!(data.media?.some(m => m.type === 'audio') || data.metadata?.isListening);
    },
    action: (data) => ({
      suggestedType: 'listening',
      confidence: 0.93,
      reasons: ['包含音频内容'],
      metadata: {
        audioDuration: data.media?.find(m => m.type === 'audio')?.duration,
      }
    })
  },
];

// ============================================================================
// 智能分发器类
// ============================================================================

export class ContentDispatcher {
  private config: DispatcherConfig;
  
  constructor(config?: Partial<DispatcherConfig>) {
    this.config = {
      rules: [],
      defaultPostType: 'text',
      defaultChallengeType: 'novel',
      enableAIAnalysis: false,
      ...config,
    };
  }
  
  /**
   * 分析内容并返回建议的类型
   */
  analyze(data: ContentCreationData): ContentAnalysis {
    const baseData: BaseContentData = {
      text: data.text,
      media: data.media,
      metadata: data.metadata,
    };
    
    // 根据类别选择规则集
    const rules = data.category === 'post' 
      ? POST_DISPATCH_RULES 
      : CHALLENGE_DISPATCH_RULES;
    
    // 按优先级排序
    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);
    
    // 执行规则匹配
    for (const rule of sortedRules) {
      if (rule.condition(baseData)) {
        const result = rule.action(baseData);
        
        console.log('[ContentDispatcher] Rule matched:', {
          ruleId: rule.id,
          ruleName: rule.name,
          priority: rule.priority,
          result,
        });
        
        return {
          category: data.category,
          suggestedType: result.suggestedType as any,
          confidence: result.confidence || 0.5,
          reasons: result.reasons || [],
          metadata: result.metadata || {},
        };
      }
    }
    
    // 如果没有规则匹配，使用默认类型
    const defaultType = data.category === 'post' 
      ? this.config.defaultPostType 
      : this.config.defaultChallengeType;
    
    console.log('[ContentDispatcher] No rule matched, using default:', defaultType);
    
    return {
      category: data.category,
      suggestedType: defaultType as any,
      confidence: 0.5,
      reasons: ['使用默认类型'],
      metadata: {},
    };
  }
  
  /**
   * 分析帖子内容
   */
  analyzePost(data: PostCreationData): ContentAnalysis {
    // 如果用户指定了类型，直接使用
    if (data.preferredType) {
      return {
        category: 'post',
        suggestedType: data.preferredType,
        confidence: 1.0,
        reasons: ['用户手动指定类型'],
        metadata: {},
      };
    }
    
    return this.analyze(data);
  }
  
  /**
   * 分析挑战内容
   */
  analyzeChallenge(data: ChallengeCreationData): ContentAnalysis {
    // 挑战类型由用户明确指定
    return {
      category: 'challenge',
      suggestedType: data.challengeType,
      confidence: 1.0,
      reasons: ['挑战类型由用户指定'],
      metadata: {
        difficulty: data.difficulty,
        estimatedTime: data.estimatedTime,
        tags: data.tags,
      },
    };
  }
  
  /**
   * 添加自定义规则
   */
  addRule(rule: DispatchRule): void {
    this.config.rules.push(rule);
  }
  
  /**
   * 移除规则
   */
  removeRule(ruleId: string): void {
    this.config.rules = this.config.rules.filter(r => r.id !== ruleId);
  }
  
  /**
   * 获取所有规则
   */
  getRules(): DispatchRule[] {
    return [...this.config.rules];
  }
}

// ============================================================================
// 单例实例
// ============================================================================

export const contentDispatcher = new ContentDispatcher();

// ============================================================================
// 便捷函数
// ============================================================================

/**
 * 快速分析内容
 */
export function analyzeContent(data: ContentCreationData): ContentAnalysis {
  return contentDispatcher.analyze(data);
}

/**
 * 快速分析帖子
 */
export function analyzePost(data: PostCreationData): ContentAnalysis {
  return contentDispatcher.analyzePost(data);
}

/**
 * 快速分析挑战
 */
export function analyzeChallenge(data: ChallengeCreationData): ContentAnalysis {
  return contentDispatcher.analyzeChallenge(data);
}

