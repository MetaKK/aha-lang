# Quest挑战系统使用文档

## 概述

Quest挑战系统是一个完整的语言学习游戏化体验，包含小说阅读、关卡挑战、系统结算和分享裂变四个核心环节。

## 功能特性

### 🎯 核心流程

```
Quest卡片 → 小说阅读 → 关卡挑战 → 系统结算 → 分享裂变
```

### 📖 天花板级别的小说阅读体验

#### 视觉设计
- **4种精美阅读主题**：Light、Sepia、Dark、Night
- **5档字体大小**：从Tiny到Huge，满足不同视力需求
- **优雅的排版**：首字下沉、行距优化、专业字体
- **沉浸式体验**：自动隐藏UI、渐进式动画

#### 交互设计
- **智能UI控制**：点击内容区域切换UI显示/隐藏
- **阅读进度条**：实时显示阅读进度
- **滚动监测**：自动检测阅读完成
- **流畅动画**：所有交互都有精心设计的动画效果

#### 功能特性
- **书签功能**：随时标记喜欢的内容
- **设置面板**：快速调整阅读体验
- **阅读统计**：实时显示字数、预计阅读时间
- **完成引导**：阅读完成后自动显示挑战卡片

### 🎮 关卡挑战系统

- **智能题目生成**：基于小说内容的理解题
- **进度可视化**：实时显示答题进度
- **即时反馈**：选择后立即进入下一题
- **词汇提示**：遇到困难可查看词汇帮助

### 🏆 系统结算

- **精美成绩展示**：动画效果展示最终得分
- **成就系统**：根据分数显示不同评价
- **数据统计**：正确率、经验值、等级展示
- **社交激励**：鼓励分享成就

### 📱 分享裂变（占位）

- 分享预览卡片
- 社交平台集成（待从其他项目引入）

## 技术架构

### 文件结构

```
src/
├── lib/api/
│   └── novel-mock-data.ts           # 小说内容数据
├── components/
│   └── reader/
│       └── novel-reader.tsx          # 核心阅读器组件
├── app/(main)/
│   ├── novel/[id]/
│   │   └── page.tsx                  # 小说阅读页面
│   └── quest/[id]/
│       └── challenge/
│           └── page.tsx              # 挑战页面
└── components/feed/post-card/
    └── quest-card.tsx                # Quest卡片组件（已更新）
```

### 核心组件

#### NovelReader 组件

**props:**
- `novel: NovelContent` - 小说数据
- `chapter: NovelChapter` - 章节数据
- `onClose: () => void` - 关闭回调
- `onComplete: () => void` - 完成回调

**特性:**
- 4种阅读主题切换
- 5档字体大小调整
- 自动UI隐藏（3秒无操作）
- 滚动进度检测（95%触发完成）
- 响应式设计

#### QuestCard 组件

**交互逻辑:**
- **点击卡片外围**：导航到帖子详情页
- **点击"Start Reading"按钮**：直接打开小说阅读器

## 数据结构

### NovelContent

```typescript
interface NovelContent {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  coverImage?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  language: string;
  estimatedTime: string;
  chapters: NovelChapter[];
  vocabulary?: VocabularyItem[];
  grammarPoints?: string[];
}
```

### NovelChapter

```typescript
interface NovelChapter {
  id: string;
  number: number;
  title: string;
  content: string;  // 段落用 \n\n 分隔
  wordCount: number;
  estimatedReadTime: number;
}
```

## 使用指南

### 添加新小说

1. 在 `src/lib/api/novel-mock-data.ts` 中添加小说数据：

```typescript
const NEW_NOVEL: NovelContent = {
  id: 'novel-002',
  title: '你的小说标题',
  author: '作者名',
  excerpt: '简短摘要...',
  coverImage: 'https://...',
  difficulty: 3,
  tags: ['标签1', '标签2'],
  language: 'English',
  estimatedTime: '10 min',
  chapters: [
    {
      id: 'ch-001',
      number: 1,
      title: '章节标题',
      content: `段落1\n\n段落2\n\n段落3`,
      wordCount: 500,
      estimatedReadTime: 5,
    },
  ],
  vocabulary: [
    {
      word: '单词',
      definition: '定义',
      example: '例句',
    },
  ],
  grammarPoints: ['语法点1', '语法点2'],
};

// 添加到库中
export const NOVEL_LIBRARY: NovelContent[] = [
  MOCK_NOVEL,
  NEW_NOVEL,  // 添加新小说
];
```

2. 在 feed mock 数据中添加 Quest 卡片：

```typescript
{
  id: 'quest-novel-002',
  type: 'novel',
  author: { /* ... */ },
  content: '介绍文案',
  novel: {
    id: 'novel-002',  // 对应小说ID
    title: '你的小说标题',
    excerpt: '摘要',
    // ... 其他信息
  },
}
```

### 自定义阅读主题

在 `novel-reader.tsx` 中的 `READING_THEMES` 对象添加新主题：

```typescript
const READING_THEMES = {
  // 现有主题...
  custom: {
    id: 'custom',
    name: 'Custom',
    background: 'bg-你的颜色',
    text: 'text-你的颜色',
    secondary: 'text-你的颜色',
    icon: YourIcon,
  },
};
```

### 自定义字体大小

修改 `FONT_SIZES` 数组：

```typescript
const FONT_SIZES = [
  { id: 'xs', name: 'Tiny', size: 'text-base', lineHeight: 'leading-relaxed' },
  // 添加更多选项...
];
```

## 路由说明

### 小说阅读页面
- **路径**: `/novel/[id]`
- **参数**: `id` - 小说ID
- **功能**: 显示小说阅读器

### 挑战页面
- **路径**: `/quest/[id]/challenge`
- **参数**: `id` - 小说/Quest ID
- **功能**: 显示挑战题目和结算

## 性能优化

### 已实现
- ✅ 组件懒加载
- ✅ 动画性能优化（useTransform）
- ✅ 滚动性能优化（节流）
- ✅ 响应式图片加载

### 待优化
- 🔄 虚拟滚动（超长内容）
- 🔄 渐进式加载（多章节）
- 🔄 离线缓存
- 🔄 阅读进度保存

## 最佳实践

### 内容创作
1. **段落分隔**: 使用 `\n\n` 分隔段落，不要使用单个 `\n`
2. **字数控制**: 单章建议 300-800 字，保持适度长度
3. **词汇量**: 3-6个重点词汇最佳
4. **难度分级**: 
   - Level 1-2: 初学者（简单日常对话）
   - Level 3: 中级（故事性内容）
   - Level 4-5: 高级（复杂情节）

### UI/UX设计原则
1. **沉浸式优先**: 减少干扰，突出内容
2. **渐进式引导**: 动画引导用户关注点
3. **即时反馈**: 所有操作都有视觉反馈
4. **优雅降级**: 确保低配设备也有好体验

### 挑战题目设计
1. **理解优先**: 考察对内容的理解，不是记忆
2. **难度递增**: 从简单到复杂
3. **选项设计**: 3-4个选项，干扰项要有一定迷惑性
4. **反馈及时**: 答题后立即进入下一题

## 未来扩展

### 计划中的功能
- 🔮 多章节支持
- 🔮 阅读进度同步（云端）
- 🔮 个人阅读统计
- 🔮 社区笔记功能
- 🔮 AI生成个性化题目
- 🔮 语音朗读
- 🔮 划词翻译
- 🔮 阅读成就系统

### 集成计划
- 从其他项目引入关卡挑战组件（待定）
- 从其他项目引入系统结算组件（待定）
- 从其他项目引入分享裂变组件（待定）

## 常见问题

### Q: 如何调整阅读器的默认主题？
A: 修改 `novel-reader.tsx` 中的 `useState<ThemeId>('light')` 初始值。

### Q: 如何修改阅读完成的触发时机？
A: 修改 `handleScroll` 函数中的 `scrollPercentage >= 0.95` 阈值。

### Q: 如何添加新的阅读统计指标？
A: 在 NovelReader 组件中添加新的 state，并在完成卡片中展示。

### Q: 小说内容支持富文本吗？
A: 当前版本支持纯文本和段落格式，未来版本将支持更多富文本特性。

## 技术栈

- **框架**: Next.js 15+ (App Router)
- **UI库**: Tailwind CSS
- **动画**: Framer Motion
- **图标**: Heroicons
- **类型**: TypeScript

## 许可证

本功能模块遵循项目整体许可证。

---

**最后更新**: 2025-10-27
**维护者**: Aha Learning Team

