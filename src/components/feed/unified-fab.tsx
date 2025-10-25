/**
 * 统一的浮动操作按钮 (Unified FAB)
 * 
 * 设计理念：
 * - 只有两个核心入口：新增帖子 (Post) 和 新增挑战 (Challenge)
 * - 简洁优雅的交互设计
 * - 参考 X (Twitter) 和 Notion 的最佳实践
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  XMarkIcon, 
  PencilSquareIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface UnifiedFABProps {
  onCreatePost: () => void;
  onCreateChallenge: () => void;
}

export function UnifiedFAB({ onCreatePost, onCreateChallenge }: UnifiedFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 两个核心操作
  const actions = [
    {
      id: 'post',
      icon: PencilSquareIcon,
      label: 'New Post',
      color: 'bg-blue-500',
      onClick: () => {
        onCreatePost();
        setIsExpanded(false);
      }
    },
    {
      id: 'challenge',
      icon: AcademicCapIcon,
      label: 'New Challenge',
      color: 'bg-purple-500',
      onClick: () => {
        onCreateChallenge();
        setIsExpanded(false);
      }
    }
  ];

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.5
      }}
    >
      {/* Action Buttons */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-16 right-0 flex flex-col-reverse space-y-reverse space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  transition: { delay: index * 0.05 }
                }}
                exit={{ 
                  opacity: 0, 
                  x: 20, 
                  scale: 0.8,
                  transition: { delay: (actions.length - index - 1) * 0.05 }
                }}
                className="flex items-center space-x-3"
              >
                {/* Action Button */}
                <motion.button
                  onClick={action.onClick}
                  className={`${action.color} w-12 h-12 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-white transition-all duration-200`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <action.icon className="w-5 h-5" />
                </motion.button>
                
                {/* Label */}
                <motion.div
                  className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: 0.1 }}
                >
                  {action.label}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
        aria-label={isExpanded ? 'Close menu' : 'Create new content'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isExpanded ? 45 : 0,
          backgroundColor: isExpanded ? '#ef4444' : '#3b82f6'
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20
        }}
      >
        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 bg-blue-500 rounded-full opacity-0 group-hover:opacity-20"
          animate={{
            scale: isHovered ? [1, 1.2, 1] : 1,
            opacity: isHovered ? [0, 0.3, 0] : 0
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
            repeat: isHovered ? Infinity : 0
          }}
        />
        
        {/* Icon */}
        <motion.div
          className="relative z-10"
          animate={{
            rotate: isHovered && !isExpanded ? 90 : 0
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
              >
                <XMarkIcon className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.15 }}
              >
                <PlusIcon className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Ripple effect on click */}
        <motion.div
          className="absolute inset-0 bg-white rounded-full pointer-events-none"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{
            scale: [0, 1.5],
            opacity: [0.3, 0]
          }}
          transition={{
            duration: 0.4
          }}
        />
      </motion.button>
      
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && !isExpanded && (
          <motion.div
            className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap pointer-events-none"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            Create new content
            {/* Arrow */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

