/*
 * @Author: meta-kk 11097094+teacher-kk@user.noreply.gitee.com
 * @Date: 2025-10-25 10:26:11
 * @LastEditors: meta-kk 11097094+teacher-kk@user.noreply.gitee.com
 * @LastEditTime: 2025-10-25 11:28:17
 * @FilePath: /aha-lang/src/components/feed/unified-create-modal.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * @Author: meta-kk 11097094+teacher-kk@user.noreply.gitee.com
 * @Date: 2025-10-25 10:26:11
 * @LastEditors: meta-kk 11097094+teacher-kk@user.noreply.gitee.com
 * @LastEditTime: 2025-10-25 10:54:17
 * @FilePath: /aha-lang/src/components/feed/unified-create-modal.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * 统一的内容创建模态框
 * 
 * 设计理念：
 * - 根据类别（帖子/挑战）动态调整UI
 * - 智能表单，根据输入内容自动识别类型
 * - 支持富文本、媒体上传、标签等
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PhotoIcon, 
  VideoCameraIcon, 
  MusicalNoteIcon,
  FaceSmileIcon,
  HashtagIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useState, useCallback, useEffect } from 'react';
import type { ContentCategory, MediaAttachment } from '@/types/content';

interface UnifiedCreateModalProps {
  isOpen: boolean;
  category: ContentCategory;
  onClose: () => void;
  onSubmit: (data: {
    text: string;
    media?: MediaAttachment[];
    metadata?: Record<string, any>;
  }) => Promise<void>;
}

export function UnifiedCreateModal({ 
  isOpen, 
  category, 
  onClose, 
  onSubmit 
}: UnifiedCreateModalProps) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // 挑战特有字段
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [estimatedTime, setEstimatedTime] = useState('');

  // 重置表单
  const resetForm = useCallback(() => {
    setContent('');
    setMedia([]);
    setTags([]);
    setDifficulty(3);
    setEstimatedTime('');
    setShowAdvanced(false);
  }, []);

  // 关闭时重置
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // 提交处理
  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const metadata: Record<string, any> = {};
      
      // 添加标签
      if (tags.length > 0) {
        metadata.tags = tags;
      }
      
      // 挑战特有元数据
      if (category === 'quest') {
        metadata.difficulty = difficulty;
        if (estimatedTime) {
          metadata.estimatedTime = estimatedTime;
        }
      }
      
      await onSubmit({
        text: content,
        media: media.length > 0 ? media : undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      });
      
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to create content:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 快捷键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // 添加标签
  const handleAddTag = (tag: string) => {
    const cleanTag = tag.trim().replace(/^#/, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
  };

  // 移除标签
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // UI配置
  const config = {
    post: {
      title: '新增帖子',
      placeholder: '分享你的想法...',
      submitText: '发布',
      maxLength: 280,
      showDifficulty: false,
      showEstimatedTime: false,
    },
    quest: {
      title: '新增Quest',
      placeholder: '描述这个学习Quest...',
      submitText: '创建Quest',
      maxLength: 500,
      showDifficulty: true,
      showEstimatedTime: true,
    }
  }[category];

  const charCount = content.length;
  const isOverLimit = charCount > config.maxLength;
  const canSubmit = content.trim() && !isOverLimit && !isSubmitting;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                {/* User Avatar - 移到左上角 */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">U</span>
                </div>
                
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {config.title}
                </h2>
                
                {/* Close button - 移到右上角 */}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="关闭"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* 增大的输入区域 */}
                <div className="w-full">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={config.placeholder}
                    className="w-full min-h-[200px] resize-none text-lg placeholder-gray-500 dark:placeholder-gray-400 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map(tag => (
                      <motion.span
                        key={tag}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm"
                      >
                        <HashtagIcon className="w-3 h-3" />
                        <span>{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                )}

                {/* Advanced Options */}
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 ml-13 space-y-4 overflow-hidden"
                    >
                      {/* Difficulty (Quest only) */}
                      {config.showDifficulty && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            难度等级
                          </label>
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <button
                                key={level}
                                onClick={() => setDifficulty(level as any)}
                                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                                  difficulty === level
                                    ? 'bg-blue-500 text-white scale-110'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Estimated Time (Quest only) */}
                      {config.showEstimatedTime && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            预计时长
                          </label>
                          <input
                            type="text"
                            value={estimatedTime}
                            onChange={(e) => setEstimatedTime(e.target.value)}
                            placeholder="例如: 30分钟"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {/* Character count */}
                <div className="flex justify-end mb-3">
                  <span className={`text-sm font-medium ${
                    isOverLimit ? 'text-red-500' : 
                    charCount > config.maxLength * 0.9 ? 'text-yellow-500' : 
                    'text-gray-500'
                  }`}>
                    {charCount}/{config.maxLength}
                  </span>
                </div>

                {/* Media Options & Submit */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button 
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      aria-label="添加图片"
                    >
                      <PhotoIcon className="w-5 h-5 text-blue-500" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      aria-label="添加视频"
                    >
                      <VideoCameraIcon className="w-5 h-5 text-green-500" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      aria-label="添加音频"
                    >
                      <MusicalNoteIcon className="w-5 h-5 text-purple-500" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      aria-label="添加表情"
                    >
                      <FaceSmileIcon className="w-5 h-5 text-yellow-500" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      aria-label="添加标签"
                    >
                      <HashtagIcon className="w-5 h-5 text-pink-500" />
                    </button>
                  </div>
                  
                  {/* Submit Button */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className={`px-6 py-2 font-semibold rounded-full transition-all ${
                      canSubmit
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                    whileHover={canSubmit ? { scale: 1.02 } : {}}
                    whileTap={canSubmit ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? '发布中...' : config.submitText}
                  </motion.button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

