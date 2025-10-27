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
  EyeIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { NovelContent, NovelChapter } from '@/lib/api/novel-mock-data';

interface EnhancedNovelReaderProps {
  novel: NovelContent;
  chapter: NovelChapter;
  onClose: () => void;
  onComplete: () => void;
}

// 阅读主题配置 - 增强视觉效果
const READING_THEMES = {
  light: {
    id: 'light',
    name: 'Light',
    background: 'rgb(255, 255, 255)',
    text: 'rgb(17, 24, 39)',
    textSecondary: 'rgb(107, 114, 128)',
    accent: 'rgb(59, 130, 246)',
    icon: SunIcon,
  },
  sepia: {
    id: 'sepia',
    name: 'Sepia',
    background: 'rgb(244, 236, 216)',
    text: 'rgb(92, 74, 60)',
    textSecondary: 'rgb(139, 115, 85)',
    accent: 'rgb(155, 107, 63)',
    icon: BookOpenIcon,
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    background: 'rgb(26, 26, 26)',
    text: 'rgb(243, 244, 246)',
    textSecondary: 'rgb(156, 163, 175)',
    accent: 'rgb(96, 165, 250)',
    icon: MoonIcon,
  },
  night: {
    id: 'night',
    name: 'Night',
    background: 'rgb(0, 0, 0)',
    text: 'rgb(229, 231, 235)',
    textSecondary: 'rgb(107, 114, 128)',
    accent: 'rgb(96, 165, 250)',
    icon: MoonIcon,
  },
} as const;

type ThemeId = keyof typeof READING_THEMES;

// 字体系列
const FONT_FAMILIES = [
  { 
    id: 'serif', 
    name: 'Serif',
    font: 'Georgia, Cambria, "Times New Roman", Times, serif',
    description: 'Classic'
  },
  { 
    id: 'sans', 
    name: 'Sans',
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    description: 'Modern'
  },
  { 
    id: 'mono', 
    name: 'Mono',
    font: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", "Courier New", monospace',
    description: 'Technical'
  },
] as const;

// 字体大小
const FONT_SIZES = [
  { id: 'xs', name: 'XS', size: 16 },
  { id: 'sm', name: 'S', size: 18 },
  { id: 'md', name: 'M', size: 20 },
  { id: 'lg', name: 'L', size: 24 },
  { id: 'xl', name: 'XL', size: 28 },
] as const;

// 行距
const LINE_HEIGHTS = [
  { id: 'compact', name: 'Compact', value: 1.6 },
  { id: 'normal', name: 'Normal', value: 1.8 },
  { id: 'relaxed', name: 'Relaxed', value: 2.0 },
  { id: 'loose', name: 'Loose', value: 2.2 },
] as const;

// 页面宽度
const PAGE_WIDTHS = [
  { id: 'narrow', name: 'Narrow', value: 600 },
  { id: 'medium', name: 'Medium', value: 700 },
  { id: 'wide', name: 'Wide', value: 800 },
  { id: 'full', name: 'Full', value: 900 },
] as const;

export function EnhancedNovelReader({ novel, chapter, onClose, onComplete }: EnhancedNovelReaderProps) {
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

  const paragraphs = chapter.content.split('\n\n').filter(p => p.trim());

  // 计算文字样式
  const textStyle: React.CSSProperties = {
    fontFamily: currentFontFamily.font,
    fontSize: `${currentFont.size}px`,
    lineHeight: currentLineHeight.value,
    letterSpacing: '0.02em',
    wordSpacing: '0.05em',
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
    textAlign: 'justify',
    textJustify: 'inter-word',
    hyphens: 'auto',
    color: currentTheme.text,
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: currentTheme.background }}
    >
      {/* 顶部进度条 */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 z-50"
          >
            <motion.div
              className="h-full"
              style={{ 
                scaleX: scrollYProgress, 
                transformOrigin: 'left',
                backgroundColor: currentTheme.accent
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 顶部工具栏 */}
      <AnimatePresence>
        {showUI && !focusMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 right-0 z-40"
            style={{
              background: `linear-gradient(to bottom, ${currentTheme.background} 0%, transparent 100%)`,
            }}
          >
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
              <button
                onClick={onClose}
                className="p-2.5 rounded-full transition-all hover:scale-110 active:scale-95"
                style={{ 
                  backgroundColor: `${currentTheme.text}10`,
                  color: currentTheme.text
                }}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className="p-2.5 rounded-full transition-all hover:scale-110 active:scale-95"
                  style={{ 
                    backgroundColor: focusMode ? currentTheme.accent : `${currentTheme.text}10`,
                    color: focusMode ? 'white' : currentTheme.text
                  }}
                >
                  <EyeIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="p-2.5 rounded-full transition-all hover:scale-110 active:scale-95"
                  style={{ 
                    backgroundColor: `${currentTheme.text}10`,
                    color: isBookmarked ? currentTheme.accent : currentTheme.text
                  }}
                >
                  {isBookmarked ? (
                    <BookmarkSolid className="w-5 h-5" />
                  ) : (
                    <BookmarkOutline className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2.5 rounded-full transition-all hover:scale-110 active:scale-95"
                  style={{ 
                    backgroundColor: showSettings ? currentTheme.accent : `${currentTheme.text}10`,
                    color: showSettings ? 'white' : currentTheme.text
                  }}
                >
                  <AdjustmentsHorizontalIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 增强设置面板 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg mx-4"
          >
            <div 
              className="rounded-3xl shadow-2xl border backdrop-blur-2xl overflow-hidden"
              style={{
                backgroundColor: `${currentTheme.background}f5`,
                borderColor: `${currentTheme.text}20`,
              }}
            >
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* 主题选择 */}
                <div>
                  <h3 className="text-sm font-bold mb-3 tracking-wide uppercase" style={{ color: currentTheme.textSecondary }}>
                    Theme
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.values(READING_THEMES).map((t) => {
                      const Icon = t.icon;
                      return (
                        <motion.button
                          key={t.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTheme(t.id)}
                          className="p-3 rounded-2xl transition-all flex flex-col items-center gap-2 border-2"
                          style={{
                            borderColor: theme === t.id ? currentTheme.accent : 'transparent',
                            backgroundColor: theme === t.id ? `${currentTheme.accent}15` : `${currentTheme.text}05`,
                            color: currentTheme.text
                          }}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-semibold">{t.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* 字体系列 */}
                <div>
                  <h3 className="text-sm font-bold mb-3 tracking-wide uppercase" style={{ color: currentTheme.textSecondary }}>
                    Font Family
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {FONT_FAMILIES.map((font, index) => (
                      <motion.button
                        key={font.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFontFamily(index)}
                        className="p-3 rounded-2xl transition-all flex flex-col items-center gap-1 border-2"
                        style={{
                          fontFamily: font.font,
                          borderColor: fontFamily === index ? currentTheme.accent : 'transparent',
                          backgroundColor: fontFamily === index ? `${currentTheme.accent}15` : `${currentTheme.text}05`,
                          color: currentTheme.text
                        }}
                      >
                        <span className="text-sm font-semibold">Aa</span>
                        <span className="text-xs opacity-70">{font.description}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 字体大小 */}
                <div>
                  <h3 className="text-sm font-bold mb-3 tracking-wide uppercase" style={{ color: currentTheme.textSecondary }}>
                    Font Size
                  </h3>
                  <div className="flex gap-2">
                    {FONT_SIZES.map((font, index) => (
                      <motion.button
                        key={font.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFontSize(index)}
                        className="flex-1 py-3 rounded-2xl transition-all font-bold border-2"
                        style={{
                          fontSize: `${12 + index * 2}px`,
                          borderColor: fontSize === index ? currentTheme.accent : 'transparent',
                          backgroundColor: fontSize === index ? `${currentTheme.accent}15` : `${currentTheme.text}05`,
                          color: currentTheme.text
                        }}
                      >
                        {font.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 行距 */}
                <div>
                  <h3 className="text-sm font-bold mb-3 tracking-wide uppercase" style={{ color: currentTheme.textSecondary }}>
                    Line Height
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {LINE_HEIGHTS.map((lh, index) => (
                      <motion.button
                        key={lh.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setLineHeight(index)}
                        className="py-3 rounded-2xl transition-all font-semibold text-sm border-2"
                        style={{
                          borderColor: lineHeight === index ? currentTheme.accent : 'transparent',
                          backgroundColor: lineHeight === index ? `${currentTheme.accent}15` : `${currentTheme.text}05`,
                          color: currentTheme.text
                        }}
                      >
                        {lh.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 页面宽度 */}
                <div>
                  <h3 className="text-sm font-bold mb-3 tracking-wide uppercase" style={{ color: currentTheme.textSecondary }}>
                    Page Width
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {PAGE_WIDTHS.map((pw, index) => (
                      <motion.button
                        key={pw.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPageWidth(index)}
                        className="py-3 rounded-2xl transition-all font-semibold text-sm border-2"
                        style={{
                          borderColor: pageWidth === index ? currentTheme.accent : 'transparent',
                          backgroundColor: pageWidth === index ? `${currentTheme.accent}15` : `${currentTheme.text}05`,
                          color: currentTheme.text
                        }}
                      >
                        {pw.name}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 阅读信息 */}
                <div 
                  className="rounded-2xl p-4"
                  style={{ backgroundColor: `${currentTheme.text}05` }}
                >
                  <div className="flex items-center justify-between text-sm" style={{ color: currentTheme.textSecondary }}>
                    <span>Word Count</span>
                    <span className="font-bold" style={{ color: currentTheme.text }}>
                      {chapter.wordCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2" style={{ color: currentTheme.textSecondary }}>
                    <span>Reading Time</span>
                    <span className="font-bold" style={{ color: currentTheme.text }}>
                      {chapter.estimatedReadTime} min
                    </span>
                  </div>
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
        className="h-full overflow-y-auto"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div 
          className="mx-auto px-6 md:px-12 py-24 md:py-32"
          style={{ maxWidth: `${currentPageWidth.value}px` }}
        >
          {/* 章节标题 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-16"
          >
            <div 
              className="text-sm font-bold mb-3 tracking-widest uppercase"
              style={{ color: currentTheme.textSecondary }}
            >
              Chapter {chapter.number}
            </div>
            <h1 
              className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
              style={{ 
                color: currentTheme.text,
                fontFamily: currentFontFamily.font,
              }}
            >
              {chapter.title}
            </h1>
            <div 
              className="text-lg font-medium"
              style={{ color: currentTheme.textSecondary }}
            >
              {novel.author}
            </div>
          </motion.div>

          {/* 正文 - 增强排版 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="space-y-8"
          >
            {paragraphs.map((paragraph, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.1 * Math.min(index, 10),
                  ease: 'easeOut'
                }}
                style={{
                  ...textStyle,
                  // 首段特殊样式
                  ...(index === 0 && {
                    fontSize: `${currentFont.size * 1.1}px`,
                    lineHeight: currentLineHeight.value * 1.05,
                  })
                }}
                className={cn(
                  'transition-all duration-300',
                  // 首字母下沉（仅第一段）
                  index === 0 && 'first-letter:text-7xl first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:leading-none first-letter:mt-1'
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
                initial={{ opacity: 0, scale: 0.9, y: 60 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 60 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  delay: 0.2,
                }}
                className="mt-20 mb-12"
              >
                <div 
                  className="relative overflow-hidden rounded-3xl shadow-2xl border-2"
                  style={{
                    borderColor: currentTheme.accent,
                    background: `linear-gradient(135deg, ${currentTheme.accent}15 0%, ${currentTheme.accent}25 100%)`,
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="relative p-10 text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: 'spring',
                        stiffness: 400,
                        damping: 20,
                        delay: 0.4,
                      }}
                      className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-full"
                      style={{ backgroundColor: currentTheme.accent }}
                    >
                      <SparklesIcon className="w-10 h-10 text-white" />
                    </motion.div>

                    <h2 
                      className="text-4xl md:text-5xl font-bold mb-4"
                      style={{ 
                        color: currentTheme.text,
                        fontFamily: currentFontFamily.font,
                      }}
                    >
                      Chapter Complete! 🎉
                    </h2>

                    <p 
                      className="text-lg mb-8"
                      style={{ color: currentTheme.textSecondary }}
                    >
                      Ready to test your understanding?
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onComplete}
                      className="w-full py-5 px-8 rounded-2xl font-bold text-white text-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center gap-3"
                      style={{ backgroundColor: currentTheme.accent }}
                    >
                      <SparklesIcon className="w-6 h-6" />
                      <span>Start Challenge</span>
                      <ArrowLeftIcon className="w-6 h-6 rotate-180" />
                    </motion.button>

                    <div className="mt-8 pt-8" style={{ borderTop: `1px solid ${currentTheme.text}20` }}>
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <div 
                            className="text-3xl font-bold"
                            style={{ color: currentTheme.text }}
                          >
                            {chapter.wordCount}
                          </div>
                          <div 
                            className="text-sm font-medium mt-1"
                            style={{ color: currentTheme.textSecondary }}
                          >
                            Words Read
                          </div>
                        </div>
                        <div>
                          <div 
                            className="text-3xl font-bold"
                            style={{ color: currentTheme.text }}
                          >
                            {chapter.estimatedReadTime}
                          </div>
                          <div 
                            className="text-sm font-medium mt-1"
                            style={{ color: currentTheme.textSecondary }}
                          >
                            Minutes
                          </div>
                        </div>
                        <div>
                          <div 
                            className="text-3xl font-bold"
                            style={{ color: currentTheme.text }}
                          >
                            +{novel.difficulty * 10}
                          </div>
                          <div 
                            className="text-sm font-medium mt-1"
                            style={{ color: currentTheme.textSecondary }}
                          >
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

