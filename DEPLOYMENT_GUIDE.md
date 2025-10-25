# 🚀 LinguaFlow 部署指南

## 目录
- [技术栈](#技术栈)
- [后端部署 - Supabase](#后端部署---supabase)
- [前端部署 - Vercel](#前端部署---vercel)
- [环境变量配置](#环境变量配置)
- [数据库初始化](#数据库初始化)
- [域名配置](#域名配置)
- [监控和日志](#监控和日志)

---

## 技术栈

### 前端
- **框架**: Next.js 15 (App Router)
- **部署平台**: Vercel
- **CDN**: Vercel Edge Network (全球加速)

### 后端
- **BaaS**: Supabase Cloud
- **数据库**: PostgreSQL 15
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **实时订阅**: Supabase Realtime
- **Serverless**: Supabase Edge Functions (Deno)

---

## 后端部署 - Supabase

### 1. 创建 Supabase 项目

#### 步骤 1: 注册账号
1. 访问 [https://supabase.com](https://supabase.com)
2. 使用 GitHub 账号登录（推荐）
3. 进入 Dashboard

#### 步骤 2: 创建新项目
```bash
项目名称: linguaflow-prod
数据库密码: [生成强密码并保存]
地区选择: 
  - 中国大陆用户: Singapore (ap-southeast-1) - 延迟最低
  - 北美用户: US West (us-west-1)
  - 欧洲用户: Europe (eu-west-1)
定价计划: 
  - 开发阶段: Free Plan (500MB 数据库, 1GB 存储)
  - 生产环境: Pro Plan ($25/月, 8GB 数据库, 100GB 存储)
```

#### 步骤 3: 等待项目初始化
- 需要 2-5 分钟
- 初始化完成后会进入项目主页

### 2. 配置数据库

#### 方式 1: 使用 SQL 编辑器（推荐）

1. 在 Supabase Dashboard 左侧菜单点击 **SQL Editor**
2. 点击 **New Query**
3. 复制项目中的 SQL 文件内容:

```bash
# 本地查看 SQL 文件
cat supabase/migrations/20250124000001_initial_schema.sql
```

4. 粘贴到 SQL 编辑器并点击 **Run**
5. 检查执行结果（应该显示 "Success. No rows returned"）

#### 方式 2: 使用 Supabase CLI

```bash
# 1. 安装 Supabase CLI
npm install -g supabase

# 2. 登录
supabase login

# 3. 关联项目
supabase link --project-ref <your-project-ref>
# 项目 ref 在 Project Settings > General > Reference ID

# 4. 推送数据库迁移
supabase db push

# 5. 生成 TypeScript 类型（可选）
supabase gen types typescript --linked > src/types/supabase.ts
```

#### 验证数据库
1. 进入 **Table Editor**
2. 应该看到以下表：
   - `profiles` - 用户资料
   - `feed_cards` - Feed 卡片
   - `novel_chapters` - 小说章节
   - `challenges` - 挑战题目
   - `user_progress` - 用户进度
   - `challenge_results` - 挑战结果
   - `interactions` - 社交互动
   - `user_achievements` - 用户成就

### 3. 配置认证

#### 启用认证方式
1. 进入 **Authentication > Providers**
2. 启用以下登录方式:

**Email/Password** (推荐)
```bash
Enable: ✅
Confirm email: ✅ (生产环境)
Secure email change: ✅
```

**Magic Link** (无密码登录)
```bash
Enable: ✅
```

**第三方登录** (可选)
- Google OAuth
- GitHub OAuth
- Apple Sign In

#### 配置邮件模板
1. 进入 **Authentication > Email Templates**
2. 自定义以下模板:
   - Confirm signup
   - Magic link
   - Change email address
   - Reset password

```html
<!-- 示例: Confirm signup -->
<h2>欢迎加入 LinguaFlow! 🎉</h2>
<p>点击下面的链接激活你的账号:</p>
<p><a href="{{ .ConfirmationURL }}">确认邮箱</a></p>
```

#### 配置重定向 URL
1. 进入 **Authentication > URL Configuration**
2. 添加允许的重定向 URL:

```bash
# 本地开发
http://localhost:3000
http://localhost:3000/auth/callback

# 生产环境
https://yourdomain.com
https://yourdomain.com/auth/callback
https://www.yourdomain.com
https://www.yourdomain.com/auth/callback
```

### 4. 配置存储

#### 创建存储桶
1. 进入 **Storage**
2. 创建以下桶 (Bucket):

**avatars** (用户头像)
```bash
名称: avatars
Public: ✅ (公开访问)
File size limit: 5MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

**covers** (封面图片)
```bash
名称: covers
Public: ✅
File size limit: 10MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

**media** (音频/视频)
```bash
名称: media
Public: ✅
File size limit: 100MB
Allowed MIME types: audio/*, video/*
```

#### 配置存储策略
1. 进入每个桶的 **Policies** 标签
2. 添加以下策略:

```sql
-- avatars 桶策略
-- 1. 所有人可以读取
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- 2. 认证用户可以上传自己的头像
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. 用户可以更新/删除自己的头像
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 5. 配置实时订阅

1. 进入 **Database > Replication**
2. 为以下表启用 Realtime:
   - ✅ `feed_cards` - Feed 实时更新
   - ✅ `interactions` - 点赞/评论实时
   - ✅ `user_progress` - 学习进度实时

### 6. 配置 Edge Functions（可选）

如果需要 AI 评分功能，需要部署 Edge Functions:

```bash
# 1. 创建 functions 目录（如果不存在）
mkdir -p supabase/functions/score-challenge

# 2. 创建函数文件
cat > supabase/functions/score-challenge/index.ts << 'EOF'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1"

serve(async (req) => {
  const { challengeId, userAnswer, context } = await req.json()
  
  const configuration = new Configuration({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
  })
  const openai = new OpenAIApi(configuration)
  
  // 调用 GPT-4 评分
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "你是一位专业的英语教师，负责评分学生的答案。"
      },
      {
        role: "user",
        content: `评分以下答案:\n问题: ${context.question}\n答案: ${userAnswer}`
      }
    ]
  })
  
  return new Response(
    JSON.stringify({ 
      score: 85,
      feedback: response.data.choices[0].message.content 
    }),
    { headers: { "Content-Type": "application/json" } }
  )
})
EOF

# 3. 部署函数
supabase functions deploy score-challenge

# 4. 设置环境变量
supabase secrets set OPENAI_API_KEY=sk-xxx
```

### 7. 获取 API 密钥

1. 进入 **Project Settings > API**
2. 复制以下信息（后面配置前端会用到）:

```bash
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (保密!)
```

⚠️ **重要**: 
- `anon public key` 可以暴露在前端代码中（已包含 RLS 保护）
- `service_role key` 绝不能暴露，只能在服务端使用

---

## 前端部署 - Vercel

### 1. 准备代码

#### 确保代码推送到 Git
```bash
# 初始化 Git（如果还没有）
git init

# 添加远程仓库
git remote add origin https://github.com/yourusername/linguaflow.git

# 提交代码
git add .
git commit -m "Ready for deployment"
git push -u origin main
```

### 2. 连接 Vercel

#### 方式 1: 通过 Vercel Dashboard（推荐）

1. 访问 [https://vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 **Add New** > **Project**
4. 选择你的 GitHub 仓库 `linguaflow`
5. Vercel 会自动检测 Next.js 项目

#### 配置构建设置
```bash
Framework Preset: Next.js
Build Command: pnpm build (自动检测)
Output Directory: .next (自动检测)
Install Command: pnpm install (自动检测)
Root Directory: ./ (项目根目录)
Node.js Version: 20.x
```

### 3. 配置环境变量

在 Vercel 项目设置中添加环境变量:

1. 进入 **Settings > Environment Variables**
2. 添加以下变量:

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 后端同步开关
NEXT_PUBLIC_ENABLE_BACKEND_SYNC=true

# OpenAI API（如果需要 AI 功能）
OPENAI_API_KEY=sk-xxx

# 应用配置
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

⚠️ **环境变量说明**:
- `NEXT_PUBLIC_*` 前缀的变量会暴露在浏览器中
- 不带前缀的变量只在服务端可用
- 可以为不同环境设置不同的值（Production, Preview, Development）

### 4. 部署项目

点击 **Deploy** 按钮，Vercel 会自动:
1. ✅ 克隆代码
2. ✅ 安装依赖 (`pnpm install`)
3. ✅ 构建项目 (`pnpm build`)
4. ✅ 部署到全球 CDN
5. ✅ 分配临时域名 `xxx.vercel.app`

部署时间: 约 2-5 分钟

### 5. 验证部署

访问 Vercel 分配的域名:
```
https://linguaflow-xxx.vercel.app
```

检查:
- ✅ 页面正常加载
- ✅ Feed 流数据显示
- ✅ 图片正常加载
- ✅ 实时更新功能正常
- ✅ 用户认证功能正常

### 6. 自定义域名（可选）

#### 添加域名
1. 在 Vercel 项目中进入 **Settings > Domains**
2. 输入你的域名: `linguaflow.com`
3. Vercel 会提供 DNS 配置说明

#### 配置 DNS
在你的域名服务商（如 Cloudflare, 阿里云, GoDaddy）配置:

**方式 1: A Record（推荐）**
```bash
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto
```

**方式 2: CNAME**
```bash
Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

#### 等待 DNS 生效
- 通常需要 5-30 分钟
- 最长可能需要 48 小时
- Vercel 会自动配置 SSL 证书

### 7. 配置自动部署

Vercel 默认已启用:
- ✅ **主分支部署**: `main` 分支的每次 push 都会自动部署到生产环境
- ✅ **预览部署**: 其他分支和 PR 会创建预览环境
- ✅ **回滚功能**: 可以一键回滚到任何历史版本

#### 配置部署钩子
```bash
# GitHub Actions 示例
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      
      # 运行测试（可选）
      - run: pnpm install
      - run: pnpm type-check
      
      # Vercel 会自动检测并部署
```

---

## 环境变量配置

### 开发环境 (.env.local)

创建 `.env.local` 文件:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 开发环境使用本地存储
NEXT_PUBLIC_ENABLE_BACKEND_SYNC=false

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 生产环境 (Vercel)

在 Vercel Dashboard 设置:

```bash
# Supabase 生产环境
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_ENABLE_BACKEND_SYNC=true

# 应用配置
NEXT_PUBLIC_APP_URL=https://linguaflow.com

# AI 服务（可选）
OPENAI_API_KEY=sk-xxx

# 监控（可选）
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 数据库初始化

### 添加初始数据

#### 方式 1: 使用 SQL Editor

在 Supabase SQL Editor 执行:

```sql
-- 1. 创建测试用户（需要先在 Authentication 中注册）
-- 然后关联 profile

-- 2. 添加示例 Feed 卡片
INSERT INTO public.feed_cards (type, author_id, title, content) VALUES
(
  'novel',
  'user-id-here',
  'The Great Adventure',
  '{
    "description": "An epic journey through time and space",
    "cover_image": "https://images.unsplash.com/photo-1...",
    "chapters_count": 10,
    "difficulty_level": 5
  }'::jsonb
),
(
  'text',
  'user-id-here',
  'English Learning Tips',
  '{
    "text": "Here are some tips to improve your English...",
    "category": "tips"
  }'::jsonb
);

-- 3. 添加小说章节
INSERT INTO public.novel_chapters (feed_card_id, chapter_number, title, content) VALUES
(
  'feed-card-id-here',
  1,
  'Chapter 1: The Beginning',
  'Once upon a time in a galaxy far, far away...'
);

-- 4. 添加挑战
INSERT INTO public.challenges (chapter_id, type, order_index, config) VALUES
(
  'chapter-id-here',
  'vocabulary',
  0,
  '{
    "words": [
      {
        "word": "adventure",
        "definition": "an exciting experience",
        "example": "The adventure begins now."
      }
    ]
  }'::jsonb
);
```

#### 方式 2: 使用脚本批量导入

```typescript
// scripts/seed-data.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 使用 service role key
)

async function seedData() {
  // 添加 Feed 卡片
  const { data: cards } = await supabase
    .from('feed_cards')
    .insert([
      {
        type: 'novel',
        author_id: 'user-id',
        title: 'Sample Novel',
        content: { /* ... */ }
      }
    ])
    .select()
  
  console.log('Added cards:', cards)
}

seedData()
```

运行脚本:
```bash
npx tsx scripts/seed-data.ts
```

---

## 域名配置

### 1. 购买域名

推荐域名注册商:
- **Cloudflare** (最便宜，管理方便)
- **Namecheap** (便宜，界面友好)
- **GoDaddy** (贵但稳定)
- **阿里云** (国内用户)

### 2. 配置 Cloudflare（推荐）

#### 优势
- ✅ 免费 CDN
- ✅ 免费 SSL
- ✅ DDoS 防护
- ✅ 更快的 DNS 解析

#### 配置步骤
1. 在 Cloudflare 添加站点
2. 修改域名的 Nameservers 为 Cloudflare 提供的
3. 在 Cloudflare DNS 中配置:

```bash
# A Record
Type: A
Name: @
Content: 76.76.21.21 (Vercel IP)
Proxy: 启用 (橙色云朵)

# CNAME
Type: CNAME
Name: www
Content: cname.vercel-dns.com
Proxy: 启用
```

4. 在 Cloudflare SSL/TLS 设置中选择 **Full (strict)**

### 3. 配置 HTTPS

Vercel 自动提供 Let's Encrypt SSL 证书:
- ✅ 自动续期
- ✅ 支持通配符域名
- ✅ HTTP/2 和 HTTP/3

#### 强制 HTTPS
在 `next.config.ts` 中:

```typescript
const config = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://linguaflow.com/:path*',
        permanent: true,
      },
    ]
  },
}
```

---

## 监控和日志

### 1. Vercel Analytics

自动启用（免费）:
- ✅ 页面访问量
- ✅ 性能指标 (Core Web Vitals)
- ✅ 地理位置分布
- ✅ 设备类型统计

在代码中添加:
```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Supabase Logs

查看后端日志:
1. 进入 Supabase Dashboard
2. **Logs** 标签
3. 可以查看:
   - API 请求日志
   - 数据库查询日志
   - Edge Functions 日志
   - Auth 日志

### 3. Sentry 错误追踪（可选）

```bash
# 安装
pnpm add @sentry/nextjs

# 初始化
npx @sentry/wizard -i nextjs

# 配置
# sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### 4. 性能监控

使用 Vercel Speed Insights:
```typescript
// src/app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

---

## 成本估算

### 开发阶段（几乎免费）

| 服务 | 方案 | 价格 | 限制 |
|------|------|------|------|
| Vercel | Hobby | **$0/月** | 100GB 带宽，无限部署 |
| Supabase | Free | **$0/月** | 500MB 数据库，1GB 存储 |
| Cloudflare | Free | **$0/月** | 无限流量 |
| **总计** | | **$0/月** | 适合开发和小规模测试 |

### 生产阶段（小规模）

| 服务 | 方案 | 价格 | 特性 |
|------|------|------|------|
| Vercel | Pro | **$20/月** | 1TB 带宽，高级分析 |
| Supabase | Pro | **$25/月** | 8GB 数据库，100GB 存储 |
| Cloudflare | Free | **$0/月** | 无限流量 |
| **总计** | | **$45/月** | 支持数千用户 |

### 生产阶段（大规模）

| 服务 | 方案 | 价格 | 特性 |
|------|------|------|------|
| Vercel | Enterprise | **$150/月起** | 自定义，专属支持 |
| Supabase | Team | **$599/月** | 自定义资源 |
| Cloudflare | Pro | **$20/月** | 高级安全 |
| **总计** | | **$770/月起** | 支持数十万用户 |

---

## 部署检查清单

### 部署前

- [ ] 代码已推送到 Git 仓库
- [ ] 所有依赖已安装 (`pnpm install`)
- [ ] TypeScript 检查通过 (`pnpm type-check`)
- [ ] 本地构建成功 (`pnpm build`)
- [ ] 环境变量已准备好

### Supabase 配置

- [ ] 项目已创建
- [ ] 数据库表已创建
- [ ] RLS 策略已启用
- [ ] 认证方式已配置
- [ ] 存储桶已创建
- [ ] Realtime 已启用
- [ ] API 密钥已复制

### Vercel 配置

- [ ] 项目已导入
- [ ] 环境变量已设置
- [ ] 构建成功
- [ ] 预览环境可访问
- [ ] 生产环境已部署

### 上线后

- [ ] 域名解析正常
- [ ] HTTPS 证书有效
- [ ] 页面加载正常
- [ ] API 请求成功
- [ ] 用户认证功能正常
- [ ] 实时更新功能正常
- [ ] 图片加载正常
- [ ] 移动端显示正常

---

## 常见问题

### 1. 构建失败: "Module not found"

**原因**: 依赖未安装或路径错误

**解决**:
```bash
# 清除缓存
rm -rf .next node_modules
pnpm install
pnpm build
```

### 2. Supabase 连接失败

**原因**: API 密钥错误或 RLS 策略阻止

**解决**:
```bash
# 1. 检查环境变量
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 2. 检查 RLS 策略
# 在 Supabase SQL Editor 执行:
SELECT * FROM pg_policies WHERE tablename = 'feed_cards';

# 3. 临时禁用 RLS（仅测试用）
ALTER TABLE public.feed_cards DISABLE ROW LEVEL SECURITY;
```

### 3. 图片加载慢

**原因**: 图片未优化

**解决**:
```typescript
// 使用 Next.js Image 组件
import Image from 'next/image'

<Image
  src={url}
  width={800}
  height={600}
  quality={75}
  loading="lazy"
  placeholder="blur"
/>
```

### 4. 实时订阅不工作

**原因**: Realtime 未启用或通道名错误

**解决**:
```typescript
// 检查连接状态
const channel = supabase
  .channel('feed-changes')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'feed_cards' 
  }, (payload) => {
    console.log('Realtime update:', payload)
  })
  .subscribe((status) => {
    console.log('Subscription status:', status)
  })
```

### 5. 部署后环境变量不生效

**原因**: Vercel 环境变量未刷新

**解决**:
1. 在 Vercel Dashboard 修改环境变量后
2. 进入 **Deployments** 标签
3. 点击最新部署的 **...** 菜单
4. 选择 **Redeploy**
5. 勾选 **Use existing build cache** (更快)

---

## 下一步

- [ ] 配置 CDN 加速（Cloudflare）
- [ ] 设置监控告警（Sentry）
- [ ] 配置备份策略（Supabase）
- [ ] 添加分析工具（Google Analytics）
- [ ] 设置 CI/CD 流程（GitHub Actions）
- [ ] 编写 API 文档
- [ ] 进行性能测试
- [ ] 安全审计

---

## 相关资源

### 官方文档
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

### 社区支持
- [Vercel Discord](https://discord.gg/vercel)
- [Supabase Discord](https://discord.supabase.com)
- [Next.js Discussions](https://github.com/vercel/next.js/discussions)

---

**部署愉快! 🚀**

如有问题，请查阅文档或在社区寻求帮助。

