# 🚀 LinguaFlow 快速启动

## ✅ 环境已配置完成

项目已经配置好开发环境，可以直接启动！

---

## 🎯 一键启动

```bash
pnpm dev
```

然后访问：**http://localhost:3000**

---

## 📊 当前配置

### 开发模式（默认）
- ✅ 使用本地存储
- ✅ 无需配置后端
- ✅ 快速开发测试

### 配置文件
```bash
.env.local
├── NEXT_PUBLIC_ENABLE_BACKEND_SYNC=false  # 本地存储模式
├── NEXT_PUBLIC_APP_URL=http://localhost:3000
└── NODE_ENV=development
```

---

## 🔄 切换到生产模式

当需要连接后端时：

### 1. 编辑 `.env.local`

```bash
# 修改为 true
NEXT_PUBLIC_ENABLE_BACKEND_SYNC=true

# 添加 Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. 重启服务器

```bash
# Ctrl+C 停止
# 重新启动
pnpm dev
```

### 3. 同步本地数据到后端

```typescript
import { dataSyncManager } from '@/lib/sync/data-sync'

// 一键同步所有本地数据
await dataSyncManager.syncToBackend()
```

---

## 📚 功能演示

### Feed 流
- 📱 类似 X (Twitter) 的信息流
- ♾️ 无限滚动加载
- 🔄 下拉刷新
- ❤️ 点赞、评论、分享

### 数据存储
- 💾 开发模式：本地存储（IndexedDB + localStorage）
- ☁️ 生产模式：Supabase 云端同步

### 性能
- ⚡ 首屏加载 102 kB
- 🚀 60 FPS 滚动
- 💨 即时交互反馈

---

## 🛠️ 常用命令

```bash
# 开发模式
pnpm dev

# 生产构建
pnpm build

# 启动生产服务器
pnpm start

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

---

## 📖 文档导航

### 快速入门
- **[开始.md](./doc/开始.md)** - 中文快速指南
- **[LEARN.md](./doc/LEARN.md)** - 详细学习指南

### 技术文档
- **[ARCHITECTURE.md](./doc/ARCHITECTURE.md)** - 架构设计
- **[数据同步完全指南.md](./doc/数据同步完全指南.md)** - 数据同步详解
- **[最终检查清单.md](./doc/最终检查清单.md)** - 完整性检查

---

## 💡 提示

### 端口被占用？
```bash
# 修改 package.json
"dev": "next dev -p 3002"
```

### 依赖问题？
```bash
rm -rf node_modules
pnpm install
```

### 清理缓存？
```bash
rm -rf .next
pnpm dev
```

---

## 🎉 开始使用

现在就运行 `pnpm dev`，打开浏览器体验吧！

**祝你开发愉快！** 🚀

