# Quest卡片类型和路由配置

## 📋 概述

本文档说明了Quest卡片（英文闯关）的类型定义、路由配置和实现细节。

## 🎯 Quest卡片类型分析

### 当前实现

#### 1. **创建类型**
- **FAB按钮**: `challenge` 类型，标签为 `Quest`
- **内容类别**: `challenge` 类别
- **智能分发**: 根据内容自动识别为 `novel` 类型

#### 2. **Feed显示类型**
- **数据库类型**: `novel` (通过智能分发器识别)
- **显示组件**: `QuestCard` 组件
- **标识字段**: `metadata.category = 'quest'`

#### 3. **路由配置**
- **详情页面**: `/quest/[id]` 
- **识别逻辑**: 检查 `metadata.category === 'quest'`
- **跳转逻辑**: Quest卡片 → Quest页面，其他卡片 → Post页面

## 🛠️ 技术实现

### 1. 类型定义

```typescript
// Quest卡片在Feed中的类型
interface QuestCard extends BaseCard {
  type: 'novel';  // 通过智能分发器识别
  novel: {
    id: string;
    title: string;
    excerpt: string;
    coverImage: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    totalChapters: number;
    currentChapter: number;
    tags: string[];
    language: string;
    estimatedTime: string;
  };
  metadata: {
    category: 'quest';  // 关键标识
    analysis: {
      category: 'quest';
      suggestedType: 'novel';
    };
  };
}
```

### 2. 路由识别逻辑

```typescript
// PostCard组件中的识别逻辑
const isQuestCard = (card as any).metadata?.category === 'quest' || 
                   (card as any).metadata?.analysis?.category === 'quest' ||
                   (card as any).novel?.questType;

if (isQuestCard) {
  router.push(`/quest/${card.id}`);
} else {
  router.push(`/post/${card.id}`);
}
```

### 3. 路由页面结构

```
src/app/(main)/
├── post/[id]/page.tsx          # 普通帖子详情页
└── quest/[id]/page.tsx     # Quest卡片详情页
```

## 🎮 Quest页面功能

### 核心特性
- ✅ **计时器功能** - 倒计时显示
- ✅ **题目导航** - 上一题/下一题
- ✅ **答案记录** - 用户答案存储
- ✅ **实时评分** - 自动计算分数
- ✅ **结果展示** - 通过/失败状态
- ✅ **重试功能** - 重新开始挑战

### 题目类型支持
- **选择题** (`multiple_choice`) - 单选答案
- **填空题** (`fill_blank`) - 文本输入
- **匹配题** (`matching`) - 配对练习
- **音频题** (`audio`) - 听力练习

### 交互流程
```
用户点击Quest卡片
    ↓
跳转到 /quest/[id]
    ↓
显示挑战详情和题目
    ↓
用户答题并提交
    ↓
显示结果和分数
    ↓
提供重试或返回选项
```

## 🔧 配置说明

### 1. 路由常量
```typescript
// src/config/constants.ts
export const ROUTES = {
  QUEST: (id: string) => `/quest/${id}`,
  // ... 其他路由
};
```

### 2. 类型检查
```typescript
// 检查是否为Quest卡片
function isQuestCard(card: FeedCard): boolean {
  return (card as any).metadata?.category === 'quest' || 
         (card as any).metadata?.analysis?.category === 'quest' ||
         (card as any).novel?.questType;
}
```

### 3. 内容创建
```typescript
// 创建Quest卡片时的数据流
const questData: QuestCreationData = {
  category: 'quest',
  questType: 'novel',
  text: '挑战内容...',
  difficulty: 3,
  tags: ['vocabulary', 'grammar'],
  estimatedTime: '15 min'
};

// 智能分发器识别为novel类型
const analysis = contentDispatcher.analyze(questData);
// analysis.suggestedType = 'novel'
// analysis.category = 'quest'
```

## 📊 数据流图

```
用户创建Quest
    ↓
FAB按钮 (quest类型)
    ↓
智能分发器分析
    ↓
识别为novel类型 + quest类别
    ↓
Feed中显示为QuestCard
    ↓
用户点击卡片
    ↓
检查metadata.category === 'quest'
    ↓
跳转到 /quest/[id]
    ↓
显示Quest页面
```

## 🎯 最佳实践

### 1. 类型安全
- 使用类型守卫检查Quest卡片
- 明确区分Quest卡片和普通小说卡片
- 保持路由逻辑的一致性

### 2. 用户体验
- 清晰的视觉标识区分Quest卡片
- 流畅的页面跳转体验
- 完整的挑战流程

### 3. 代码维护
- 统一的类型定义
- 清晰的识别逻辑
- 可扩展的题目类型支持

## 🚀 未来扩展

### 1. 更多题目类型
- 拖拽题 (`drag_drop`)
- 排序题 (`sorting`)
- 语音题 (`speaking`)

### 2. 高级功能
- 进度保存
- 离线支持
- 多人挑战

### 3. 数据分析
- 学习进度跟踪
- 知识点分析
- 个性化推荐

## 📝 总结

Quest卡片通过以下方式实现：

1. **类型标识**: 使用 `metadata.category = 'quest'` 标识
2. **路由识别**: PostCard组件检查metadata并跳转到正确页面
3. **页面实现**: `/quest/[id]` 页面提供完整的Quest体验
4. **用户体验**: 从Feed到Quest页面的无缝跳转

这种设计既保持了Feed的统一性，又为Quest卡片提供了专门的功能页面，实现了最佳的用户体验。
