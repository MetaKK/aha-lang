# 📊 Mock数据分析和优化

## 当前Mock数据来源

### 1. 图片数据源
```typescript
// 来源：Picsum Photos (Lorem Picsum)
url: 'https://picsum.photos/800/600?random=1'
thumbnail: 'https://picsum.photos/400/300?random=1'
```

**特点**：
- ✅ 免费使用
- ✅ 随机图片
- ✅ 可指定尺寸
- ❌ 内容不相关（非英语学习主题）
- ❌ 加载速度一般

### 2. 视频数据源
```typescript
// 来源：Sample Videos
url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
```

**问题**：
- ❌ 链接可能失效
- ❌ 内容不相关
- ❌ 加载速度慢
- ❌ 无实际英语学习内容

### 3. 音频数据源
```typescript
// 来源：SoundJay
url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
```

**问题**：
- ❌ 链接可能失效
- ❌ 内容不相关（铃声而非英语音频）
- ❌ 无实际学习价值

### 4. 头像数据源
```typescript
// 来源：DiceBear Avatars
avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.seed}`
```

**特点**：
- ✅ 免费使用
- ✅ 可定制种子
- ✅ 矢量格式
- ✅ 加载速度快

## 当前问题分析

### 1. 视频打不开的原因
```typescript
// 问题链接
'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
```

**可能原因**：
- 网站服务不稳定
- 链接已失效
- 跨域问题
- 网络连接问题

### 2. 内容不相关
- 图片：随机风景/人物，非英语学习内容
- 视频：测试视频，非英语教学
- 音频：铃声，非英语音频

## 最佳实践建议

### 1. 图片数据源优化

#### 选项A：Unsplash API
```typescript
// 高质量、相关主题图片
url: `https://source.unsplash.com/800x600/?english,learning,book`
```

#### 选项B：Pexels API
```typescript
// 免费、高质量图片
url: `https://images.pexels.com/photos/123456/pexels-photo-123456.jpeg`
```

#### 选项C：本地图片资源
```typescript
// 本地英语学习相关图片
url: '/images/english-learning/grammar-1.jpg'
```

### 2. 视频数据源优化

#### 选项A：YouTube嵌入
```typescript
// 使用YouTube视频ID
videoId: 'dQw4w9WgXcQ'
embedUrl: `https://www.youtube.com/embed/${videoId}`
```

#### 选项B：Vimeo嵌入
```typescript
// 使用Vimeo视频ID
videoId: '123456789'
embedUrl: `https://player.vimeo.com/video/${videoId}`
```

#### 选项C：本地视频资源
```typescript
// 本地英语教学视频
url: '/videos/english-lessons/grammar-basics.mp4'
```

### 3. 音频数据源优化

#### 选项A：本地音频资源
```typescript
// 本地英语音频文件
url: '/audio/english-conversations/daily-dialogue-1.mp3'
```

#### 选项B：音频CDN
```typescript
// 使用音频CDN服务
url: 'https://cdn.example.com/audio/english-lesson-1.mp3'
```

## 推荐实施方案

### 阶段1：快速修复
```typescript
// 1. 替换失效的视频链接
const mockVideos = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
];

// 2. 使用稳定的图片源
const mockImages = [
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/800/600?random=3'
];
```

### 阶段2：内容优化
```typescript
// 1. 英语学习相关图片
const englishLearningImages = [
  '/images/english-learning/grammar-1.jpg',
  '/images/english-learning/vocabulary-1.jpg',
  '/images/english-learning/conversation-1.jpg'
];

// 2. 英语教学视频
const englishVideos = [
  '/videos/english-lessons/grammar-basics.mp4',
  '/videos/english-lessons/vocabulary-building.mp4',
  '/videos/english-lessons/pronunciation-guide.mp4'
];

// 3. 英语音频
const englishAudio = [
  '/audio/english-conversations/daily-dialogue-1.mp3',
  '/audio/english-conversations/business-english-1.mp3',
  '/audio/english-conversations/travel-english-1.mp3'
];
```

### 阶段3：动态内容
```typescript
// 1. 集成真实API
const fetchRealContent = async () => {
  const response = await fetch('/api/content/english-learning');
  return response.json();
};

// 2. 用户生成内容
const userGeneratedContent = {
  images: await fetchUserImages(),
  videos: await fetchUserVideos(),
  audio: await fetchUserAudio()
};
```

## 技术实现

### 1. 环境变量配置
```typescript
// .env.local
NEXT_PUBLIC_MOCK_DATA_SOURCE=local|external|mixed
NEXT_PUBLIC_IMAGE_CDN_URL=https://cdn.example.com/images
NEXT_PUBLIC_VIDEO_CDN_URL=https://cdn.example.com/videos
NEXT_PUBLIC_AUDIO_CDN_URL=https://cdn.example.com/audio
```

### 2. 数据源切换
```typescript
const getMediaUrl = (type: string, id: string) => {
  const source = process.env.NEXT_PUBLIC_MOCK_DATA_SOURCE;
  
  switch (source) {
    case 'local':
      return `/assets/${type}/${id}`;
    case 'external':
      return `${process.env.NEXT_PUBLIC_${type.toUpperCase()}_CDN_URL}/${id}`;
    default:
      return getFallbackUrl(type, id);
  }
};
```

### 3. 错误处理
```typescript
const handleMediaError = (media: MediaAttachment) => {
  console.warn(`Failed to load media: ${media.url}`);
  // 使用备用资源
  return getFallbackMedia(media.type);
};
```

## 测试验证

### 1. 链接有效性测试
```typescript
const testMediaUrls = async () => {
  const urls = mockData.flatMap(card => 
    card.media?.map(m => m.url) || []
  );
  
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`${url}: ${response.ok ? 'OK' : 'FAIL'}`);
    } catch (error) {
      console.error(`${url}: ERROR`, error);
    }
  }
};
```

### 2. 加载性能测试
```typescript
const measureLoadTime = async (url: string) => {
  const start = performance.now();
  await fetch(url);
  const end = performance.now();
  return end - start;
};
```

---

**当前状态**: 🔍 需要优化  
**主要问题**: 视频链接失效  
**建议方案**: 使用稳定的CDN资源  
**实施优先级**: 高
