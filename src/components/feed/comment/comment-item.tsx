'use client';

import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import type { Comment } from '@/types/feed';
import { cn } from '@/lib/utils';
import { ANIMATION_DURATION, ANIMATION_DELAY } from '@/config/animations';

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  maxDepth?: number;
  onReply?: (commentId: string, content: string) => void;
  onLike?: (commentId: string, isLiked: boolean) => void;
  isReplying?: boolean;
}

/**
 * 评论项组件 - 支持嵌套显示
 * 
 * 特性：
 * 1. 嵌套评论显示（最多3层）
 * 2. 回复功能
 * 3. 点赞功能
 * 4. 优雅的动画效果
 * 5. 响应式设计
 */
export const CommentItem = memo<CommentItemProps>(({
  comment,
  depth = 0,
  maxDepth = 3,
  onReply,
  onLike,
  isReplying = false,
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const handleReply = useCallback(() => {
    if (replyText.trim() && onReply && !isReplying) {
      onReply(comment.id, replyText.trim());
      // 立即清空本地状态，防止重复提交
      setReplyText('');
      setShowReplyInput(false);
    }
  }, [comment.id, replyText, onReply, isReplying]);

  const handleLike = useCallback(() => {
    // 阻止对乐观更新的临时评论进行点赞
    if (comment.id.startsWith('optimistic-')) {
      return;
    }
    if (onLike) {
      onLike(comment.id, comment.viewer?.liked || false);
    }
  }, [comment.id, comment.viewer?.liked, onLike]);

  const toggleReplies = useCallback(() => {
    setShowReplies(prev => !prev);
  }, []);

  // 计算缩进
  const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 12)}` : '';
  const hasReplies = comment.replies && comment.replies.length > 0;
  const canReply = depth < maxDepth;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION_DURATION.NORMAL }}
      className={cn(
        "py-3",
        depth > 0 && "border-l-2 border-gray-200 dark:border-gray-700 pl-4"
      )}
    >
      {/* 评论内容 */}
      <div className="flex gap-3">
        {/* 头像 */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                {comment.author.displayName[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* 评论主体 */}
        <div className="flex-1 min-w-0">
          {/* 作者信息 */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-[14px] text-gray-900 dark:text-white">
              {comment.author.displayName}
            </span>
            <span className="text-[13px] text-gray-500 dark:text-gray-400">
              @{comment.author.handle}
            </span>
            <span className="text-[13px] text-gray-400">·</span>
            <time className="text-[13px] text-gray-500 dark:text-gray-400">
              {formatTimeAgo(comment.createdAt)}
            </time>
          </div>

          {/* 评论内容 */}
          <p className="text-[15px] leading-[22px] text-gray-900 dark:text-white mb-2 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* 操作按钮 */}
          <div className="flex items-center gap-4">
            {/* 回复按钮 */}
            {canReply && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="text-[13px] text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                回复
              </button>
            )}

            {/* 点赞按钮 */}
            <button
              onClick={handleLike}
              disabled={comment.id.startsWith('optimistic-')}
              className={cn(
                "flex items-center gap-1 text-[13px] transition-colors",
                comment.id.startsWith('optimistic-')
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
                  : comment.viewer?.liked
                  ? "text-red-500"
                  : "text-gray-500 hover:text-red-500"
              )}
            >
              {comment.viewer?.liked ? (
                <HeartSolid className="w-4 h-4" />
              ) : (
                <HeartOutline className="w-4 h-4" />
              )}
              {comment.stats?.likes && comment.stats.likes > 0 && (
                <span>{comment.stats.likes}</span>
              )}
            </button>

            {/* 显示/隐藏回复 */}
            {hasReplies && (
              <button
                onClick={toggleReplies}
                className="text-[13px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-medium"
              >
                {showReplies ? '隐藏' : '查看'} {comment.replyCount} 条回复
              </button>
            )}
          </div>

          {/* 回复输入框 */}
          <AnimatePresence>
            {showReplyInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: ANIMATION_DURATION.FAST }}
                className="mt-3"
              >
                <div className="flex gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`回复 @${comment.author.handle}`}
                    className="flex-1 px-3 py-2 text-[14px] text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none resize-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200 ease-in-out"
                    rows={2}
                    maxLength={280}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleReply();
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[12px] text-gray-500">
                    {replyText.length}/280
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowReplyInput(false);
                        setReplyText('');
                      }}
                      className="px-3 py-1 text-[13px] text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim() || isReplying}
                      className={cn(
                        "px-3 py-1 rounded-full text-[13px] font-semibold transition-all",
                        replyText.trim() && !isReplying
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      {isReplying ? '发送中...' : '回复'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 嵌套回复 */}
      <AnimatePresence>
        {showReplies && hasReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: ANIMATION_DURATION.NORMAL }}
            className="mt-2"
          >
            {comment.replies!.map((reply, index) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                maxDepth={maxDepth}
                onReply={onReply}
                onLike={onLike}
                isReplying={isReplying}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

CommentItem.displayName = 'CommentItem';

/**
 * 格式化时间为相对时间
 */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return '刚刚';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}天前`;
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

