# 🌊 LinguaFlow

**社交化英语学习平台** - 通过小说阅读和游戏化闯关，让英语学习更有趣！

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e)](https://supabase.com/)

---

## ✨ 核心特性

### 📱 X-like Feed 流
- **类 Twitter 设计**: 熟悉的社交媒体体验
- **多种卡片类型**: 小说、文本、图片、视频、音频
- **实时更新**: Supabase Realtime 驱动
- **无限滚动**: 虚拟滚动优化性能
- **下拉刷新**: 原生般的交互体验

### 📚 小说阅读 + 闯关学习
- **电子书阅读器**: Apple 风格的优雅阅读体验
- **多级挑战系统**: 词汇、语法、听力、口语等
- **AI 智能评分**: GPT-4 驱动的个性化反馈
- **进度追踪**: 详细的学习数据分析
- **成就系统**: 游戏化激励机制

### 🎨 极致 UI/UX
- **Apple 设计语言**: 简洁、流畅、优雅
- **流畅动画**: Framer Motion 驱动
- **响应式设计**: 完美适配所有设备
- **深色模式**: 自动切换，保护眼睛
- **毛玻璃效果**: 现代化视觉体验

### 🚀 性能优化
- **虚拟滚动**: 处理海量数据
- **智能缓存**: React Query + IndexedDB
- **乐观更新**: 即时反馈用户操作
- **代码分割**: 按需加载，极速启动
- **图片优化**: Next.js Image 自动优化

---

## 🏗️ 技术栈

### 前端
- **框架**: Next.js 15 (App Router)
- **UI**: React 19 + TypeScript 5
- **样式**: Tailwind CSS 4 + Framer Motion
- **状态管理**: Zustand + React Query
- **组件库**: Radix UI + shadcn/ui

### 后端
- **BaaS**: Supabase (PostgreSQL + Realtime + Storage + Auth)
- **AI**: Vercel AI SDK + OpenAI GPT-4
- **Edge Functions**: Supabase Edge Functions

### 存储
- **数据库**: PostgreSQL (Supabase)
- **本地存储**: IndexedDB (idb-keyval)
- **缓存**: React Query + Zustand

---

## 🚀 快速开始

### 前置要求
- Node.js >= 20
- pnpm >= 9

### 方式 1: 一键启动（推荐）
```bash
./start.sh
```

### 方式 2: 手动启动
```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务器（无需配置，使用本地存储）
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 配置后端同步（可选）

开发阶段无需配置，生产环境需要：

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local
NEXT_PUBLIC_ENABLE_BACKEND_SYNC=true
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📖 项目结构

```
linguaflow/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/            # 主应用布局
│   │   │   └── feed/          # Feed 流页面
│   │   ├── layout.tsx         # 根布局
│   │   └── globals.css        # 全局样式
│   ├── components/            # React 组件
│   │   ├── feed/              # Feed 相关组件
│   │   │   ├── cards/         # 卡片组件
│   │   │   ├── feed-container.tsx
│   │   │   ├── feed-header.tsx
│   │   │   └── ...
│   │   └── providers/         # Context Providers
│   ├── hooks/                 # 自定义 Hooks
│   │   ├── use-feed.ts        # Feed 数据管理
│   │   ├── use-realtime.ts    # 实时订阅
│   │   └── ...
│   ├── lib/                   # 工具库
│   │   ├── challenges/        # 挑战系统
│   │   │   ├── plugin-system.ts
│   │   │   └── plugins/       # 挑战插件
│   │   ├── storage/           # 存储系统
│   │   │   └── hyper-storage.ts
│   │   └── supabase/          # Supabase 客户端
│   ├── store/                 # Zustand 状态管理
│   │   └── feed/              # Feed Store
│   │       ├── index.ts
│   │       └── slices/        # Store Slices
│   ├── types/                 # TypeScript 类型
│   │   ├── feed.ts
│   │   └── learn.ts
│   └── config/                # 配置文件
│       └── constants.ts
├── supabase/                  # Supabase 配置
│   └── migrations/            # 数据库迁移
├── public/                    # 静态资源
└── docs/                      # 文档
```

---

## 🎯 核心功能实现

### 1. Feed 流系统
- ✅ 无限滚动加载
- ✅ 实时内容更新
- ✅ 下拉刷新
- ✅ 多种卡片类型
- ✅ 点赞、评论、分享

### 2. 挑战系统（插件化）
- ✅ 插件注册表
- ✅ 词汇挑战插件
- ⏳ 语法挑战插件
- ⏳ 听力挑战插件
- ⏳ 口语挑战插件

### 3. 状态管理
- ✅ Zustand Slice 模式
- ✅ 混合存储策略
- ✅ 乐观更新
- ✅ 实时同步

### 4. 性能优化
- ✅ 虚拟滚动
- ✅ 智能缓存
- ✅ 代码分割
- ✅ 图片优化

---

## 📚 文档

- [快速启动指南](./QUICKSTART.md)
- [架构设计](./ARCHITECTURE.md)
- [优化方案](./OPTIMIZATION_PLAN.md)
- [项目总结](./PROJECT_SUMMARY.md)

---

## 🤝 贡献

欢迎贡献代码、提出问题或建议！

---

## 📄 License

MIT License

---

## 🙏 致谢

本项目参考了以下优秀开源项目的设计理念：

- [Supabase](https://github.com/supabase/supabase) - BaaS 架构
- [Lobe Chat](https://github.com/lobehub/lobe-chat) - 插件系统和状态管理
- [X (Twitter)](https://twitter.com) - UI/UX 设计

---

**Made with ❤️ by LinguaFlow Team**
