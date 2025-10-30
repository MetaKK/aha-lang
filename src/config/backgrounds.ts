/**
 * 背景配置系统
 * 支持图片和视频背景，用于文本阅读和场景聊天
 */

export interface BackgroundConfig {
  readonly type: 'image' | 'video' | 'gradient';
  readonly src?: string;
  readonly poster?: string; // 视频封面图
  readonly gradient?: {
    readonly from: string;
    readonly to: string;
    readonly via?: string;
  };
  readonly overlay?: {
    readonly color: string;
    readonly opacity: number;
  };
  readonly animation?: {
    readonly type: 'parallax' | 'fade' | 'slide' | 'none';
    readonly duration?: number;
    readonly delay?: number;
  };
  readonly blur?: number; // 背景模糊程度
  readonly brightness?: number; // 背景亮度
  readonly contrast?: number; // 背景对比度
}

export interface QuestBackgroundConfig {
  readonly reading: BackgroundConfig;
  readonly scenePractice: BackgroundConfig;
  readonly settlement: BackgroundConfig;
}

// 哈利波特主题背景配置
export const harryPotterBackgrounds: QuestBackgroundConfig = {
  reading: {
    type: 'image',
    src: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1920&h=1080&fit=crop&q=80',
    overlay: {
      color: 'rgba(0, 0, 0, 0.4)',
      opacity: 0.6,
    },
    animation: {
      type: 'parallax',
      duration: 20,
    },
    blur: 0,
    brightness: 0.8,
    contrast: 1.1,
  },
  scenePractice: {
    type: 'gradient',
    gradient: {
      from: 'rgba(251, 191, 36, 0.2)',
      via: 'rgba(251, 146, 60, 0.2)',
      to: 'rgba(251, 191, 36, 0.2)',
    },
    animation: {
      type: 'fade',
      duration: 2,
    },
    blur: 0,
    brightness: 1.0,
    contrast: 1.0,
  },
  settlement: {
    type: 'gradient',
    gradient: {
      from: 'rgba(139, 69, 19, 0.9)',
      via: 'rgba(75, 0, 130, 0.8)',
      to: 'rgba(25, 25, 112, 0.9)',
    },
    animation: {
      type: 'fade',
      duration: 1.5,
    },
    blur: 0,
    brightness: 1.0,
    contrast: 1.2,
  },
};

// Visitor Zoo主题背景配置
export const visitorZooBackgrounds: QuestBackgroundConfig = {
  reading: {
    type: 'image',
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop&q=80',
    overlay: {
      color: 'rgba(0, 0, 0, 0.3)',
      opacity: 0.5,
    },
    animation: {
      type: 'parallax',
      duration: 15,
    },
    blur: 0,
    brightness: 0.9,
    contrast: 1.0,
  },
  scenePractice: {
    type: 'gradient',
    gradient: {
      from: 'rgba(251, 191, 36, 0.2)',
      via: 'rgba(251, 146, 60, 0.2)',
      to: 'rgba(251, 191, 36, 0.2)',
    },
    animation: {
      type: 'fade',
      duration: 2,
    },
    blur: 0,
    brightness: 1.0,
    contrast: 1.0,
  },
  settlement: {
    type: 'gradient',
    gradient: {
      from: 'rgba(30, 144, 255, 0.9)',
      via: 'rgba(0, 191, 255, 0.8)',
      to: 'rgba(135, 206, 250, 0.9)',
    },
    animation: {
      type: 'fade',
      duration: 1.5,
    },
    blur: 0,
    brightness: 1.0,
    contrast: 1.1,
  },
};

// 默认背景配置
export const defaultBackgrounds: QuestBackgroundConfig = {
  reading: {
    type: 'gradient',
    gradient: {
      from: 'rgba(147, 51, 234, 0.1)',
      via: 'rgba(59, 130, 246, 0.1)',
      to: 'rgba(99, 102, 241, 0.1)',
    },
    animation: {
      type: 'none',
    },
    blur: 0,
    brightness: 1.0,
    contrast: 1.0,
  },
  scenePractice: {
    type: 'gradient',
    gradient: {
      from: 'rgba(251, 191, 36, 0.2)',
      via: 'rgba(251, 146, 60, 0.2)',
      to: 'rgba(251, 191, 36, 0.2)',
    },
    animation: {
      type: 'fade',
      duration: 2,
    },
    blur: 0,
    brightness: 1.0,
    contrast: 1.0,
  },
  settlement: {
    type: 'gradient',
    gradient: {
      from: 'rgba(147, 51, 234, 0.1)',
      via: 'rgba(59, 130, 246, 0.1)',
      to: 'rgba(99, 102, 241, 0.1)',
    },
    animation: {
      type: 'none',
    },
    blur: 0,
    brightness: 1.0,
    contrast: 1.0,
  },
};

// 背景配置获取函数
export function getBackgroundConfig(questId: string): QuestBackgroundConfig {
  switch (questId) {
    case 'hp-a2':
      return harryPotterBackgrounds;
    case 'novel-001':
      return visitorZooBackgrounds;
    default:
      return defaultBackgrounds;
  }
}

// 背景配置类型
export type QuestId = 'hp-a2' | 'novel-001' | string;
