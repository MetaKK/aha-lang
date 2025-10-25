# API 文档

## 📋 概述

本文档描述了 LinguaFlow 后端 API 的完整接口规范。所有 API 遵循 RESTful 设计原则，支持 Web、小程序、App 等多端调用。

**Base URL**: `https://your-domain.vercel.app/api`

## 🔐 认证

### 认证方式

API 使用 JWT Bearer Token 认证：

```http
Authorization: Bearer <your-token>
```

### 获取 Token

通过 Supabase Auth 登录后获取：

```typescript
const { data } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

const token = data.session?.access_token;
```

## 📦 统一响应格式

### 成功响应

```typescript
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "timestamp": "2025-01-25T10:00:00.000Z"
}
```

### 错误响应

```typescript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": { ... },
    "field": "fieldName" // 表单验证错误时提供
  },
  "timestamp": "2025-01-25T10:00:00.000Z"
}
```

### 分页响应

```typescript
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2025-01-25T10:00:00.000Z"
}
```

## 📡 API 端点

### Feed 流

#### 获取 Feed 流

```http
GET /api/feed
```

**查询参数**:
- `page` (number, optional): 页码，默认 1
- `pageSize` (number, optional): 每页数量，默认 20
- `type` (string, optional): 卡片类型 (`novel`, `text`, `image`, `video`, `audio`)
- `difficulty` (number, optional): 难度等级 (1-5)
- `tags` (string, optional): 标签，逗号分隔

**响应**: 分页的 Feed 卡片列表

**示例**:
```bash
curl https://your-domain.vercel.app/api/feed?page=1&pageSize=20&type=novel
```

#### 获取卡片详情

```http
GET /api/feed/:id
```

**路径参数**:
- `id` (string): 卡片 ID

**响应**: 单个 Feed 卡片详情

#### 创建卡片

```http
POST /api/feed
```

**需要认证**: ✅

**请求体**:
```typescript
{
  "type": "novel" | "text" | "image" | "video" | "audio",
  "title": "标题",
  "content": {
    "text": "内容文本",
    "media": [ ... ]
  },
  "metadata": {
    "category": "quest" | "post",
    "novel": { ... } // Quest 类型时提供
  },
  "visibility": "public" | "private" | "followers",
  "difficulty": 3,
  "tags": ["英语", "学习"]
}
```

**响应**: 创建的卡片对象

#### 更新卡片

```http
PUT /api/feed/:id
```

**需要认证**: ✅

**权限**: 仅作者

**请求体**: 同创建卡片（部分字段）

#### 删除卡片

```http
DELETE /api/feed/:id
```

**需要认证**: ✅

**权限**: 仅作者

---

### 互动

#### 创建互动

```http
POST /api/interactions
```

**需要认证**: ✅

**请求体**:
```typescript
{
  "targetId": "card-id",
  "targetType": "card" | "comment" | "chapter" | "quest",
  "type": "like" | "comment" | "reply" | "share" | "repost" | "bookmark" | "quote",
  "content": "评论内容" // comment/reply 类型时提供
}
```

**响应**: 创建的互动对象

#### 删除互动

```http
DELETE /api/interactions?targetId=xxx&type=like
```

**需要认证**: ✅

**查询参数**:
- `targetId` (string): 目标 ID
- `type` (string): 互动类型

---

### Quest 学习

#### 获取 Quest 详情

```http
GET /api/quests/:id
```

**路径参数**:
- `id` (string): Quest ID

**响应**: Quest 详情对象

#### 提交 Quest 答案

```http
POST /api/quests/submit
```

**需要认证**: ✅

**请求体**:
```typescript
{
  "questId": "quest-id",
  "userAnswer": {
    "answers": [ ... ],
    "timeSpent": 120
  },
  "score": 85,
  "passed": true,
  "timeSpent": 120
}
```

**响应**: Quest 结果对象

---

### 用户

#### 获取用户资料

```http
GET /api/users/:id
```

**路径参数**:
- `id` (string): 用户 ID

**响应**: 用户资料和统计信息

```typescript
{
  "profile": {
    "id": "user-id",
    "username": "username",
    "displayName": "Display Name",
    "avatarUrl": "https://...",
    "level": 10,
    "experience": 1000
  },
  "stats": {
    "postsCount": 50,
    "questsCompleted": 30,
    "totalLikes": 200,
    "totalViews": 5000
  }
}
```

#### 更新用户资料

```http
PUT /api/users/:id
```

**需要认证**: ✅

**权限**: 仅自己

**请求体**:
```typescript
{
  "displayName": "新名字",
  "bio": "个人简介",
  "avatarUrl": "https://..."
}
```

---

## 🌐 CORS 配置

API 支持以下域名的跨域请求：

- `http://localhost:3000`
- `http://localhost:3001`
- `https://*.vercel.app`
- `https://servicewechat.com` (微信小程序)

## 🔒 权限系统

### 基础权限

所有登录用户自动拥有：
- `create_post`: 创建帖子
- `create_quest`: 创建 Quest
- `edit_profile`: 编辑个人资料

### 高级权限

- `admin`: 管理员权限（等级 >= 50）

## 📊 错误码

| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| `UNAUTHORIZED` | 401 | 未认证 |
| `INVALID_TOKEN` | 401 | 无效的 Token |
| `FORBIDDEN` | 403 | 无权限 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `ALREADY_EXISTS` | 409 | 资源已存在 |
| `VALIDATION_ERROR` | 422 | 验证错误 |
| `INTERNAL_ERROR` | 500 | 服务器错误 |
| `DATABASE_ERROR` | 500 | 数据库错误 |

## 🚀 使用示例

### Web 应用

```typescript
// 获取 Feed
const response = await fetch('/api/feed?page=1&pageSize=20');
const data = await response.json();

// 创建帖子
const response = await fetch('/api/feed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    type: 'text',
    content: { text: '我的第一篇帖子' }
  })
});
```

### 微信小程序

```javascript
// 获取 Feed
wx.request({
  url: 'https://your-domain.vercel.app/api/feed',
  method: 'GET',
  header: {
    'Authorization': 'Bearer ' + token
  },
  success: (res) => {
    console.log(res.data);
  }
});

// 点赞
wx.request({
  url: 'https://your-domain.vercel.app/api/interactions',
  method: 'POST',
  header: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  data: {
    targetId: cardId,
    targetType: 'card',
    type: 'like'
  }
});
```

## 📝 数据模型

### FeedCard

```typescript
{
  id: string;
  type: 'novel' | 'text' | 'image' | 'video' | 'audio' | 'ad' | 'quote' | 'repost';
  authorId: string;
  title: string | null;
  content: Record<string, any>;
  metadata: Record<string, any>;
  visibility: 'public' | 'private' | 'followers';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  difficulty: number | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
  author?: UserProfile;
  viewer?: {
    liked: boolean;
    bookmarked: boolean;
    reposted: boolean;
  };
}
```

### UserProfile

```typescript
{
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  level: number;
  experience: number;
  streakDays: number;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}
```

### Quest

```typescript
{
  id: string;
  chapterId: string;
  type: 'vocabulary' | 'grammar' | 'comprehension' | 'speaking' | 'writing';
  orderIndex: number;
  config: Record<string, any>;
  passingScore: number;
  timeLimit: number | null;
  createdAt: string;
}
```

## 🔄 版本控制

当前版本: `v1`

API 版本通过 URL 路径管理（未来可能实现）：
```
/api/v1/feed
/api/v2/feed
```

## 📞 技术支持

如有问题，请联系开发团队或查看项目文档。

