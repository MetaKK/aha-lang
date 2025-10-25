// Feed Types - Enhanced based on X and social-app best practices

export type FeedCardType = 
  | 'novel' 
  | 'text' 
  | 'image'      // 从数据库
  | 'video'      // 从数据库
  | 'audio' 
  | 'ad'
  | 'quote'
  | 'repost';

export type MediaType = 'image' | 'video' | 'gif' | 'audio';

export interface BaseCard {
  id: string;
  type: FeedCardType;
  author: Author;
  content: string;
  createdAt: string;
  stats: CardStats;
  metadata?: Record<string, unknown>;
  // Interaction state
  viewer?: {
    liked: boolean;
    reposted: boolean;
    bookmarked: boolean;
    likeUri?: string;
    repostUri?: string;
    bookmarkUri?: string;
  };
  // Reply info
  reply?: {
    root: CardRef;
    parent: CardRef;
  };
  // Repost info
  reason?: {
    type: 'repost';
    by: Author;
    indexedAt: string;
  };
}

export interface Author {
  id: string;
  did?: string;
  handle: string;
  displayName: string;
  avatar?: string;
  verified?: boolean;
  badges?: Array<'verified' | 'premium' | 'organization'>;
  description?: string;
}

export interface CardStats {
  replies: number;
  reposts: number;
  likes: number;
  bookmarks: number;
  views: number;
  quotes?: number;
}

export interface CardRef {
  uri: string;
  cid: string;
}

// Quest Card (原Novel Card)
export interface QuestCard extends BaseCard {
  type: 'novel';
  novel: {
    id: string;
    title: string;
    excerpt: string;
    coverImage?: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    totalChapters: number;
    currentChapter?: number;
    tags: string[];
    language: string;
    estimatedTime?: string; // e.g., "30 min"
    questType?: 'vocabulary' | 'grammar' | 'comprehension' | 'speaking' | 'writing';
  };
}

// Text Card (standard post)
export interface TextCard extends BaseCard {
  type: 'text';
  facets?: Facet[]; // For mentions, links, hashtags
  entities?: {
    mentions?: Mention[];
    hashtags?: string[];
    urls?: URL[];
  };
}

// Media Card (使用image或video类型)
export interface MediaCard extends BaseCard {
  type: 'image' | 'video';
  media: Media[];
  aspectRatio?: string;
  facets?: Facet[];
}

export interface Media {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  alt?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  // Video specific
  duration?: number;
  playCount?: number;
}

// Audio Card
export interface AudioCard extends BaseCard {
  type: 'audio';
  audio: {
    id: string;
    url: string;
    title: string;
    duration: number;
    waveform?: number[]; // For waveform visualization
    coverImage?: string;
  };
}

// Ad Card
export interface AdCard extends BaseCard {
  type: 'ad';
  ad: {
    id: string;
    advertiser: string;
    cta: string;
    ctaUrl: string;
    media?: Media[];
    sponsored: boolean;
  };
}

// Quote Card (quote tweet)
export interface QuoteCard extends BaseCard {
  type: 'quote';
  quotedCard: FeedCard;
  facets?: Facet[];
}

// Repost Card
export interface RepostCard extends BaseCard {
  type: 'repost';
  originalCard: FeedCard;
}

export type FeedCard = 
  | QuestCard 
  | TextCard 
  | MediaCard 
  | AudioCard 
  | AdCard 
  | QuoteCard 
  | RepostCard;

// Rich text facets (for mentions, links, hashtags)
export interface Facet {
  index: {
    byteStart: number;
    byteEnd: number;
  };
  features: Array<
    | { $type: 'app.bsky.richtext.facet#mention'; did: string }
    | { $type: 'app.bsky.richtext.facet#link'; uri: string }
    | { $type: 'app.bsky.richtext.facet#tag'; tag: string }
  >;
}

export interface Mention {
  handle: string;
  did: string;
  displayName?: string;
}

export interface URL {
  url: string;
  displayUrl: string;
  title?: string;
  description?: string;
  thumbnail?: string;
}

// Feed response
export interface FeedResponse {
  cards: FeedCard[];
  cursor?: string;
  hasMore: boolean;
}

// Feed filters
export interface FeedFilters {
  type?: FeedCardType;
  difficulty?: number;
  tags?: string[];
  language?: string;
}

// Thread data for detail page
export type ThreadPost = FeedCard & {
  replyCount: number;
  replies?: ThreadPost[];
  hasHiddenReplies?: boolean;
};

export interface PostThread {
  post: ThreadPost;
  parent?: ThreadPost;
  replies?: ThreadPost[];
  ancestors?: ThreadPost[];
}

// Interaction types
export type InteractionType = 
  | 'like'
  | 'unlike'
  | 'comment'    // 从数据库
  | 'reply'
  | 'share'
  | 'repost'
  | 'unrepost'
  | 'bookmark'
  | 'unbookmark'
  | 'quote';

export interface Interaction {
  cardId: string;
  type: InteractionType;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
