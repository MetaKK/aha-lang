/*
 * @Author: meta-kk 11097094+teacher-kk@user.noreply.gitee.com
 * @Date: 2025-10-26 23:17:51
 * @LastEditors: meta-kk 11097094+teacher-kk@user.noreply.gitee.com
 * @LastEditTime: 2025-10-26 23:52:16
 * @FilePath: /aha-lang/src/lib/utils/session-storage.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

// 存储键名常量
const STORAGE_KEYS = {
  POST_COMMENTS: 'post_comments',
  USER_INTERACTIONS: 'user_interactions',
  MOCK_POSTS: 'mock_posts',
} as const;

// 类型定义
interface StoredComment {
  id: string;
  postId: string;
  content: string;
  author: {
    id: string;
    handle: string;
    displayName: string;
    avatar: string;
  };
  parentId?: string;
  replyCount?: number;
  createdAt: string;
}

interface StoredInteraction {
  id: string;
  postId: string;
  type: 'like' | 'bookmark' | 'repost';
  userId: string;
  createdAt: string;
}

// 工具函数
const safeParse = <T>(data: string | null, fallback: T): T => {
  try {
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const safeStringify = (data: any): string => {
  try {
    return JSON.stringify(data);
  } catch {
    return '[]';
  }
};

// 评论存储
export const commentStorage = {
  // 获取所有评论
  getAll(): StoredComment[] {
    if (typeof window === 'undefined') return [];
    const data = window.sessionStorage.getItem(STORAGE_KEYS.POST_COMMENTS);
    return safeParse(data, []);
  },

  // 获取特定帖子的评论（仅顶级评论）
  getByPostId(postId: string): StoredComment[] {
    return this.getAll().filter(comment => comment.postId === postId && !comment.parentId);
  },

  // 获取特定评论的回复
  getRepliesByCommentId(commentId: string): StoredComment[] {
    return this.getAll().filter(comment => comment.parentId === commentId);
  },

  // 获取评论树（包含嵌套回复）
  getCommentTree(postId: string): StoredComment[] {
    const allComments = this.getAll().filter(c => c.postId === postId);
    const commentMap = new Map<string, StoredComment & { replies?: StoredComment[] }>();
    const topLevelComments: (StoredComment & { replies?: StoredComment[] })[] = [];

    // 第一遍：创建所有评论的映射
    allComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // 第二遍：构建树结构
    allComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        topLevelComments.push(commentWithReplies);
      }
    });

    return topLevelComments;
  },

  // 添加评论
  add(comment: Omit<StoredComment, 'id' | 'createdAt'>): StoredComment {
    const comments = this.getAll();
    const newComment: StoredComment = {
      ...comment,
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    comments.push(newComment);
    window.sessionStorage.setItem(STORAGE_KEYS.POST_COMMENTS, safeStringify(comments));
    
    return newComment;
  },

  // 删除评论
  remove(commentId: string): boolean {
    const comments = this.getAll();
    const filtered = comments.filter(comment => comment.id !== commentId);
    
    if (filtered.length === comments.length) {
      return false; // 没有找到要删除的评论
    }
    
    window.sessionStorage.setItem(STORAGE_KEYS.POST_COMMENTS, safeStringify(filtered));
    return true;
  },

  // 清空所有评论
  clear(): void {
    window.sessionStorage.removeItem(STORAGE_KEYS.POST_COMMENTS);
  },
};

// 交互存储
export const interactionStorage = {
  // 获取所有交互
  getAll(): StoredInteraction[] {
    if (typeof window === 'undefined') return [];
    const data = window.sessionStorage.getItem(STORAGE_KEYS.USER_INTERACTIONS);
    return safeParse(data, []);
  },

  // 获取特定帖子的交互
  getByPostId(postId: string): StoredInteraction[] {
    return this.getAll().filter(interaction => interaction.postId === postId);
  },

  // 获取特定用户的交互
  getByUserId(userId: string): StoredInteraction[] {
    return this.getAll().filter(interaction => interaction.userId === userId);
  },

  // 添加交互
  add(interaction: Omit<StoredInteraction, 'id' | 'createdAt'>): StoredInteraction {
    const interactions = this.getAll();
    const newInteraction: StoredInteraction = {
      ...interaction,
      id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    interactions.push(newInteraction);
    window.sessionStorage.setItem(STORAGE_KEYS.USER_INTERACTIONS, safeStringify(interactions));
    
    return newInteraction;
  },

  // 删除交互
  remove(interactionId: string): boolean {
    const interactions = this.getAll();
    const filtered = interactions.filter(interaction => interaction.id !== interactionId);
    
    if (filtered.length === interactions.length) {
      return false; // 没有找到要删除的交互
    }
    
    window.sessionStorage.setItem(STORAGE_KEYS.USER_INTERACTIONS, safeStringify(filtered));
    return true;
  },

  // 检查是否存在特定交互
  exists(postId: string, userId: string, type: string): boolean {
    return this.getAll().some(interaction => 
      interaction.postId === postId && 
      interaction.userId === userId && 
      interaction.type === type
    );
  },

  // 清空所有交互
  clear(): void {
    window.sessionStorage.removeItem(STORAGE_KEYS.USER_INTERACTIONS);
  },
};

// 通用存储工具
export const storageUtils = {
  // 获取数据
  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    const data = window.sessionStorage.getItem(key);
    return safeParse(data, fallback);
  },

  // 设置数据
  set(key: string, data: any): void {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(key, safeStringify(data));
  },

  // 删除数据
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(key);
  },

  // 清空所有数据
  clear(): void {
    if (typeof window === 'undefined') return;
    window.sessionStorage.clear();
  },
};

// 导出类型
export type { StoredComment, StoredInteraction };
