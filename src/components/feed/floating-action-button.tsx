'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface FloatingActionButtonProps {
  onClick?: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      onClick?.();
    }
  };

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
      {/* Main FAB Button */}
      <motion.button
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative flex items-center justify-center w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
        aria-label="Create new post"
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
            ease: "easeInOut"
          }}
        />
        
        {/* Icon */}
        <motion.div
          className="relative z-10"
          animate={{
            rotate: isHovered ? 90 : 0
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
                transition={{ duration: 0.2 }}
              >
                <XMarkIcon className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <PlusIcon className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Ripple effect on click */}
        <motion.div
          className="absolute inset-0 bg-white rounded-full"
          initial={{ scale: 0, opacity: 0.3 }}
          animate={{ scale: 0, opacity: 0 }}
          whileTap={{
            scale: [0, 1.2],
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: 0.3
          }}
        />
      </motion.button>
      
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? 'Close' : 'Create new post'}
            {/* Arrow */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
