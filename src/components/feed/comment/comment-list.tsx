'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { CommentItem } from './comment-item';
import type { Comment } from '@/types/feed';
import { ANIMATION_DURATION, ANIMATION_DELAY, getSequenceDelay } from '@/config/animations';

interface CommentListProps {
  comments: Comment[];
  onReply?: (commentId: string, content: string) => void;
  onLike?: (commentId: string, isLiked: boolean) => void;
  isReplying?: boolean;
  maxDepth?: number;
}

/**
 * 评论列表组件
 * 
 * 特性：
 * 1. 显示嵌套评论列表
 * 2. 支持序列动画
 * 3. 空状态处理
 * 4. 性能优化（虚拟化可选）
 */
export const CommentList = memo<CommentListProps>(({
  comments,
  onReply,
  onLike,
  isReplying = false,
  maxDepth = 3,
}) => {
  if (!comments || comments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: ANIMATION_DURATION.NORMAL }}
        className="flex flex-col items-center justify-center py-16 text-gray-400"
      >
        <svg
          className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-[15px]">还没有评论</p>
        <p className="text-[13px] mt-2 opacity-60">成为第一个评论的人</p>
      </motion.div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {comments.map((comment, index) => (
        <motion.div
          key={comment.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: ANIMATION_DURATION.NORMAL,
            delay: getSequenceDelay(ANIMATION_DELAY.SMALL, index, 0.03),
          }}
        >
          <CommentItem
            comment={comment}
            depth={0}
            maxDepth={maxDepth}
            onReply={onReply}
            onLike={onLike}
            isReplying={isReplying}
          />
        </motion.div>
      ))}
    </div>
  );
});

CommentList.displayName = 'CommentList';

