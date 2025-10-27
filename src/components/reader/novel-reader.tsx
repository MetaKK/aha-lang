'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon as BookmarkOutline,
  BookOpenIcon,
  SparklesIcon,
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  BookmarkIcon as BookmarkSolid,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { NovelContent, NovelChapter } from '@/lib/api/novel-mock-data';

interface NovelReaderProps {
  novel: NovelContent;
  chapter: NovelChapter;
  onClose: () => void;
  onComplete: () => void;
}

// 阅读主题配置 - 优化视觉效果
const READING_THEMES = {
  light: {
    id: 'light',
    name: 'Light',
    background: 'bg-white',
    text: 'text-gray-900',
    secondary: 'text-gray-600',
    accent: 'text-primary',
    shadow: 'rgba(0, 0, 0, 0.05)',
    icon: SunIcon,
    // CSS变量
    cssVars: {
      '--bg': '255, 255, 255',
      '--text': '17, 24, 39',
      '--text-secondary': '75, 85, 99',
    }
  },
  sepia: {
    id: 'sepia',
    name: 'Sepia',
    background: 'bg-[#f4ecd8]',
    text: 'text-[#5c4a3c]',
    secondary: 'text-[#8b7355]',
    accent: 'text-[#9b6b3f]',
    shadow: 'rgba(92, 74, 60, 0.08)',
    icon: BookOpenIcon,
    cssVars: {
      '--bg': '244, 236, 216',
      '--text': '92, 74, 60',
      '--text-secondary': '139, 115, 85',
    }
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    background: 'bg-[#1a1a1a]',
    text: 'text-gray-100',
    secondary: 'text-gray-400',
    accent: 'text-primary',
    shadow: 'rgba(255, 255, 255, 0.05)',
    icon: MoonIcon,
    cssVars: {
      '--bg': '26, 26, 26',
      '--text': '243, 244, 246',
      '--text-secondary': '156, 163, 175',
    }
  },
  night: {
    id: 'night',
    name: 'Night',
    background: 'bg-black',
    text: 'text-gray-200',
    secondary: 'text-gray-500',
    accent: 'text-primary',
    shadow: 'rgba(255, 255, 255, 0.03)',
    icon: MoonIcon,
    cssVars: {
      '--bg': '0, 0, 0',
      '--text': '229, 231, 235',
      '--text-secondary': '107, 114, 128',
    }
  },
} as const;

type ThemeId = keyof typeof READING_THEMES;

// 字体系列配置
const FONT_FAMILIES = [
  { 
    id: 'serif', 
    name: 'Serif',
    class: 'font-serif',
    description: 'Classic & Elegant',
    cssFont: 'Georgia, Cambria, "Times New Roman", Times, serif'
  },
  { 
    id: 'sans', 
    name: 'Sans',
    class: 'font-sans',
    description: 'Modern & Clean',
    cssFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  { 
    id: 'mono', 
    name: 'Mono',
    class: 'font-mono',
    description: 'Technical & Precise',
    cssFont: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace'
  },
] as const;

// 字体大小配置 - 增强版
const FONT_SIZES = [
  { 
    id: 'xs', 
    name: 'XS', 
    size: 'text-base',
    lineHeight: '1.8',
    letterSpacing: '0.01em',
    fontSize: '16px'
  },
  { 
    id: 'sm', 
    name: 'S',
    size: 'text-lg',
    lineHeight: '1.85',
    letterSpacing: '0.015em',
    fontSize: '18px'
  },
  { 
    id: 'md', 
    name: 'M',
    size: 'text-xl',
    lineHeight: '1.9',
    letterSpacing: '0.02em',
    fontSize: '20px'
  },
  { 
    id: 'lg', 
    name: 'L',
    size: 'text-2xl',
    lineHeight: '1.95',
    letterSpacing: '0.02em',
    fontSize: '24px'
  },
  { 
    id: 'xl', 
    name: 'XL',
    size: 'text-3xl',
    lineHeight: '2.0',
    letterSpacing: '0.025em',
    fontSize: '28px'
  },
] as const;

// 行距配置
const LINE_HEIGHTS = [
  { id: 'compact', name: 'Compact', value: 1.6 },
  { id: 'normal', name: 'Normal', value: 1.8 },
  { id: 'relaxed', name: 'Relaxed', value: 2.0 },
  { id: 'loose', name: 'Loose', value: 2.2 },
] as const;

// 页面宽度配置
const PAGE_WIDTHS = [
  { id: 'narrow', name: 'Narrow', value: 'max-w-xl', px: 600 },
  { id: 'medium', name: 'Medium', value: 'max-w-2xl', px: 700 },
  { id: 'wide', name: 'Wide', value: 'max-w-3xl', px: 800 },
  { id: 'full', name: 'Full', value: 'max-w-4xl', px: 900 },
] as const;

export function NovelReader({ novel, chapter, onClose, onComplete }: NovelReaderProps) {
  const [theme, setTheme] = useState<ThemeId>('light');
  const [fontSize, setFontSize] = useState(2); // md
  const [fontFamily, setFontFamily] = useState(0); // serif
  const [lineHeight, setLineHeight] = useState(1); // normal
  const [pageWidth, setPageWidth] = useState(1); // medium
  const [showSettings, setShowSettings] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCompleteCard, setShowCompleteCard] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const uiTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { scrollYProgress } = useScroll({ container: contentRef });
  
  // 阅读进度
  const progressPercentage = useTransform(scrollYProgress, [0, 1], [0, 100]);
  
  const currentTheme = READING_THEMES[theme];
  const currentFont = FONT_SIZES[fontSize];
  const currentFontFamily = FONT_FAMILIES[fontFamily];
  const currentLineHeight = LINE_HEIGHTS[lineHeight];
  const currentPageWidth = PAGE_WIDTHS[pageWidth];

  // 自动隐藏UI
  const resetUITimeout = useCallback(() => {
    if (uiTimeoutRef.current) {
      clearTimeout(uiTimeoutRef.current);
    }
    setShowUI(true);
    uiTimeoutRef.current = setTimeout(() => {
      if (!showSettings) {
        setShowUI(false);
      }
    }, 3000);
  }, [showSettings]);

  // 检测滚动到底部
  const handleScroll = useCallback(() => {
    if (!contentRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // 滚动到95%时显示完成卡片
    if (scrollPercentage >= 0.95 && !hasReachedEnd) {
      setHasReachedEnd(true);
      setShowCompleteCard(true);
    }
    
    resetUITimeout();
  }, [hasReachedEnd, resetUITimeout]);

  useEffect(() => {
    resetUITimeout();
    return () => {
      if (uiTimeoutRef.current) {
        clearTimeout(uiTimeoutRef.current);
      }
    };
  }, [resetUITimeout]);

  // 点击内容区域切换UI显示
  const handleContentClick = () => {
    if (showSettings) {
      setShowSettings(false);
    } else {
      setShowUI(prev => !prev);
      if (!showUI) {
        resetUITimeout();
      }
    }
  };

  // 将内容分段
  const paragraphs = chapter.content.split('\n\n').filter(p => p.trim());

  return (
    <div className={cn(
      'fixed inset-0 z-50 overflow-hidden',
      'transition-colors duration-300',
      currentTheme.background
    )}>
      {/* 顶部进度条 */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-primary/20 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: showUI ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="h-full bg-primary"
          style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
        />
      </motion.div>

      {/* 顶部工具栏 */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'absolute top-0 left-0 right-0 z-40',
              'backdrop-blur-xl bg-gradient-to-b',
              theme === 'dark' || theme === 'night'
                ? 'from-black/80 to-transparent'
                : 'from-white/80 to-transparent'
            )}
          >
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <button
                onClick={onClose}
                className={cn(
                  'p-2 rounded-full transition-all',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  currentTheme.text
                )}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={cn(
                    'p-2 rounded-full transition-all',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    currentTheme.text
                  )}
                >
                  {isBookmarked ? (
                    <BookmarkSolid className="w-6 h-6 text-primary" />
                  ) : (
                    <BookmarkOutline className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    'p-2 rounded-full transition-all',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    currentTheme.text,
                    showSettings && 'bg-gray-100 dark:bg-gray-800'
                  )}
                >
                  <AdjustmentsHorizontalIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 设置面板 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'absolute top-16 left-1/2 -translate-x-1/2 z-50',
              'w-full max-w-md mx-4',
              'backdrop-blur-2xl rounded-2xl shadow-2xl',
              'border',
              theme === 'dark' || theme === 'night'
                ? 'bg-gray-900/95 border-gray-700'
                : 'bg-white/95 border-gray-200'
            )}
          >
            <div className="p-6 space-y-6">
              {/* 主题选择 */}
              <div>
                <h3 className={cn('text-sm font-semibold mb-3', currentTheme.text)}>
                  Theme
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(READING_THEMES).map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={cn(
                          'p-3 rounded-xl transition-all',
                          'flex flex-col items-center gap-2',
                          'border-2',
                          theme === t.id
                            ? 'border-primary bg-primary/10'
                            : 'border-transparent hover:border-gray-300',
                          currentTheme.text
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 字体大小 */}
              <div>
                <h3 className={cn('text-sm font-semibold mb-3', currentTheme.text)}>
                  Font Size
                </h3>
                <div className="flex items-center gap-2">
                  {FONT_SIZES.map((font, index) => (
                    <button
                      key={font.id}
                      onClick={() => setFontSize(index)}
                      className={cn(
                        'flex-1 py-3 rounded-xl transition-all',
                        'text-sm font-medium',
                        'border-2',
                        fontSize === index
                          ? 'border-primary bg-primary/10 text-primary'
                          : cn('border-transparent hover:border-gray-300', currentTheme.text)
                      )}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 阅读信息 */}
              <div className={cn('text-xs', currentTheme.secondary)}>
                <div className="flex items-center justify-between mb-1">
                  <span>Word Count</span>
                  <span className="font-medium">{chapter.wordCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Est. Reading Time</span>
                  <span className="font-medium">{chapter.estimatedReadTime} min</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 阅读内容 */}
      <div
        ref={contentRef}
        onClick={handleContentClick}
        onScroll={handleScroll}
        className={cn(
          'h-full overflow-y-auto',
          'scrollbar-thin scrollbar-track-transparent',
          theme === 'dark' || theme === 'night'
            ? 'scrollbar-thumb-gray-700'
            : 'scrollbar-thumb-gray-300'
        )}
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-24 md:py-32">
          {/* 章节标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className={cn('text-sm font-medium mb-2', currentTheme.secondary)}>
              Chapter {chapter.number}
            </div>
            <h1 className={cn(
              'text-4xl md:text-5xl font-bold mb-4',
              currentTheme.text
            )}>
              {chapter.title}
            </h1>
            <div className={cn('text-sm', currentTheme.secondary)}>
              {novel.author}
            </div>
          </motion.div>

          {/* 正文 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {paragraphs.map((paragraph, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className={cn(
                  'font-serif',
                  currentFont.size,
                  currentFont.lineHeight,
                  currentTheme.text,
                  'first-letter:text-5xl first-letter:font-bold first-letter:mr-1 first-letter:float-left',
                  'indent-0 first-of-type:first-letter:text-primary'
                )}
              >
                {paragraph}
              </motion.p>
            ))}
          </motion.div>

          {/* 完成阅读卡片 */}
          <AnimatePresence>
            {showCompleteCard && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
                className="mt-16 mb-12"
              >
                <div className={cn(
                  'relative overflow-hidden rounded-3xl',
                  'backdrop-blur-xl',
                  'border-2 border-primary/20',
                  'shadow-2xl',
                  theme === 'dark' || theme === 'night'
                    ? 'bg-gradient-to-br from-primary/10 to-purple-600/10'
                    : 'bg-gradient-to-br from-primary/5 to-purple-600/5'
                )}>
                  {/* 背景光效 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 animate-pulse" />
                  
                  <div className="relative p-8 text-center">
                    {/* 图标 */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: 'spring',
                        stiffness: 400,
                        damping: 20,
                        delay: 0.2,
                      }}
                      className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-primary to-purple-600"
                    >
                      <SparklesIcon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* 标题 */}
                    <h2 className={cn(
                      'text-2xl md:text-3xl font-bold mb-3',
                      currentTheme.text
                    )}>
                      Chapter Complete! 🎉
                    </h2>

                    {/* 描述 */}
                    <p className={cn('text-base mb-6', currentTheme.secondary)}>
                      Ready to test your understanding?
                    </p>

                    {/* 按钮 */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onComplete}
                      className={cn(
                        'w-full py-4 px-6 rounded-2xl',
                        'bg-gradient-to-r from-primary to-purple-600',
                        'text-white font-semibold text-lg',
                        'shadow-lg hover:shadow-xl',
                        'transition-shadow duration-300',
                        'flex items-center justify-center gap-3'
                      )}
                    >
                      <SparklesIcon className="w-5 h-5" />
                      <span>Start Challenge</span>
                      <ArrowLeftIcon className="w-5 h-5 rotate-180" />
                    </motion.button>

                    {/* 统计信息 */}
                    <div className="mt-6 pt-6 border-t border-gray-200/20">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className={cn('text-2xl font-bold', currentTheme.text)}>
                            {chapter.wordCount}
                          </div>
                          <div className={cn('text-xs', currentTheme.secondary)}>
                            Words Read
                          </div>
                        </div>
                        <div>
                          <div className={cn('text-2xl font-bold', currentTheme.text)}>
                            {chapter.estimatedReadTime}
                          </div>
                          <div className={cn('text-xs', currentTheme.secondary)}>
                            Minutes
                          </div>
                        </div>
                        <div>
                          <div className={cn('text-2xl font-bold', currentTheme.text)}>
                            +{novel.difficulty * 10}
                          </div>
                          <div className={cn('text-xs', currentTheme.secondary)}>
                            XP Earned
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 底部空白 */}
          <div className="h-32" />
        </div>
      </div>
    </div>
  );
}

