/*
 * @Author: meta-kk 11097094+teacher-kk@user.noreply.gitee.com
 * @Date: 2025-10-27 19:06:39
 * @LastEditors: meta-kk 11097094+teacher-kk@user.noreply.gitee.com
 * @LastEditTime: 2025-10-28 00:22:20
 * @FilePath: /aha-lang/src/components/reader/novel-reader.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
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
  HeartIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import type { NovelContent, NovelChapter } from '@/lib/api/novel-mock-data';

interface NovelReaderProps {
  readonly novel: NovelContent;
  readonly chapter: NovelChapter;
  readonly onClose: () => void;
  readonly onComplete: () => void;
}

// 主题类型定义
interface ThemeColors {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly surface: string;
  readonly text: string;
}

interface ReadingTheme {
  readonly id: string;
  readonly name: string;
  readonly background: string;
  readonly text: string;
  readonly secondary: string;
  readonly accent: string;
  readonly firstLetter: string;
  readonly glow: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly colors: ThemeColors;
}

// 阅读主题配置 - 与练习页统一的暖色/深色科技感
const READING_THEMES: Record<string, ReadingTheme> = {
  light: {
    id: 'light',
    name: 'Light',
    // 与 practice 场景统一：暖色渐变
    background: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
    text: 'text-gray-900',
    secondary: 'text-gray-600',
    // 与 practice 场景统一：琥珀橙渐变强调色
    accent: 'from-amber-500 to-orange-500',
    firstLetter: 'from-amber-500 via-orange-500 to-yellow-500',
    glow: 'shadow-amber-400/30',
    icon: SunIcon,
    // 设计系统色号
    colors: {
      primary: '#f59e0b',    // amber-500
      secondary: '#f97316',  // orange-500
      accent: '#fbbf24',     // amber-400
      surface: '#fffbeb',    // amber-50
      text: '#1f2937',       // gray-800
    }
  },
  sepia: {
    id: 'sepia',
    name: 'Sepia',
    // 温暖复古科技感
    background: 'bg-gradient-to-br from-[#FFF8E1] via-[#FFECB3] to-[#FFE0B2]',
    text: 'text-[#4E342E]',
    secondary: 'text-[#6D4C41]',
    accent: 'from-[#FF8A65] to-[#FFB74D]',
    firstLetter: 'from-[#F4511E] via-[#FB8C00] to-[#FFA726]',
    glow: 'shadow-orange-400/30',
    icon: BookOpenIcon,
    colors: {
      primary: '#FF8A65',
      secondary: '#FFB74D',
      accent: '#8D6E63',
      surface: '#FFF8E1',
      text: '#4E342E',
    }
  },
  night: {
    id: 'night',
    name: 'Night',
    // 与 practice 场景统一：深色石板渐变
    background: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
    text: 'text-gray-200',
    secondary: 'text-gray-500',
    accent: 'from-amber-500 to-orange-500',
    firstLetter: 'from-amber-400 via-orange-500 to-yellow-400',
    glow: 'shadow-amber-500/30',
    icon: MoonIcon,
    colors: {
      primary: '#f59e0b',    // amber-500
      secondary: '#f97316',  // orange-500
      accent: '#fbbf24',     // amber-400
      surface: '#111827',    // gray-900
      text: '#e5e7eb',       // gray-200
    }
  },
} as const;

type ThemeId = keyof typeof READING_THEMES;

// 字体配置类型定义
interface FontSize {
  readonly id: string;
  readonly name: string;
  readonly size: string;
  readonly lineHeight: string;
}

// 字体配置 - 精致4档选择
const FONT_SIZES: readonly FontSize[] = [
  { id: 'xs', name: 'Tiny', size: 'text-base', lineHeight: 'leading-relaxed' },
  { id: 'sm', name: 'Small', size: 'text-lg', lineHeight: 'leading-relaxed' },
  { id: 'md', name: 'Medium', size: 'text-xl', lineHeight: 'leading-loose' },
  { id: 'lg', name: 'Large', size: 'text-2xl', lineHeight: 'leading-loose' },
] as const;

function NovelReader({ novel, chapter, onClose, onComplete }: NovelReaderProps) {
  // 常量定义
  const DEFAULT_FONT_SIZE_INDEX = 2; // Medium
  const UI_HIDE_DELAY = 3000; // 3秒
  const COMPLETION_THRESHOLD = 0.95; // 95%滚动触发完成

  // 状态管理
  const [theme, setTheme] = useState<ThemeId>('light');
  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE_INDEX);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showUI, setShowUI] = useState<boolean>(true);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [showCompleteCard, setShowCompleteCard] = useState<boolean>(false);
  const [hasReachedEnd, setHasReachedEnd] = useState<boolean>(false);
  const [likedParagraphs, setLikedParagraphs] = useState<Set<number>>(new Set());
  
  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  const uiTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { scrollYProgress } = useScroll({ container: contentRef });
  
  // 阅读进度 - 使用弹性动画
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const progressPercentage = useTransform(smoothProgress, [0, 1], [0, 100]);
  
  const currentTheme = READING_THEMES[theme];
  const currentFont = FONT_SIZES[fontSize];

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
    }, UI_HIDE_DELAY);
  }, [showSettings]);

  // 检测滚动到底部
  const handleScroll = useCallback(() => {
    if (!contentRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // 滚动到阈值时显示完成卡片
    if (scrollPercentage >= COMPLETION_THRESHOLD && !hasReachedEnd) {
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

  // 段落点赞
  const handleLikeParagraph = (index: number) => {
    setLikedParagraphs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Disney风格的动画变体
  const paragraphVariants: AnimationVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      scale: 0.95,
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 25,
        delay: i * 0.05,
        duration: 0.5,
      }
    })
  };

  return (
    <div className={cn(
      'fixed inset-0 z-50 overflow-hidden',
      'transition-colors duration-300',
      currentTheme.background
    )}>
      {/* 顶部进度条 - Disney魔法渐变 */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-gray-200/20 dark:bg-gray-800/20 z-50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: showUI ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={cn(
            'h-full bg-gradient-to-r relative',
            currentTheme.accent
          )}
          style={{ 
            scaleX: smoothProgress, 
            transformOrigin: 'left',
          }}
        >
          {/* 闪光效果 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'linear',
              repeatDelay: 3,
            }}
          />
        </motion.div>
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
              theme === 'night'
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
              'absolute top-16 left-3/5 -translate-x-1/2 z-50',
              'backdrop-blur-2xl rounded-2xl shadow-2xl',
              'border w-60',
              theme === 'night'
                ? 'bg-gray-900/95 border-gray-700'
                : 'bg-white/95 border-gray-200'
            )}
          >
            <div className="p-5 space-y-5">
              {/* 主题选择 - Apple风格图标卡片 */}
              <div>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(READING_THEMES).map((t) => {
                    const Icon = t.icon;
                    const isSelected = theme === t.id;
                    return (
                      <motion.button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          'relative p-4 rounded-xl transition-all',
                          'flex flex-col items-center gap-2',
                          'overflow-hidden',
                          isSelected
                            ? 'border-primary shadow-lg'
                            : 'border-gray-200 dark:border-gray-700',
                          currentTheme.text
                        )}
                        title={t.name}
                      >
                        {/* 选中状态背景 */}
                        {isSelected && (
                          <div
                            className="absolute inset-0 opacity-10"
                            style={{
                              background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})`,
                            }}
                          />
                        )}
                        <Icon className={cn(
                          'w-7 h-7 relative z-10',
                          isSelected && 'text-primary'
                        )} />
                        {/* 选中指示器 */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: t.id === 'sepia' 
                                ? '#FFC107' // Sepia主题用亮黄色
                                : t.colors.accent,
                            }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* 字体大小 - Apple风格图标按钮组 */}
              <div>
                <div className="flex items-center gap-2">
                  {FONT_SIZES.map((font, index) => {
                    const isSelected = fontSize === index;
                    const fontSizeIcon = index === 0 ? 'A' : index === 1 ? 'Aa' : index === 2 ? 'AaA' : 'AaAa';
                    return (
                      <motion.button
                        key={font.id}
                        onClick={() => setFontSize(index)}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          'relative flex-1 py-3 rounded-xl transition-all',
                          'text-sm font-medium overflow-hidden',
                          'flex items-center justify-center',
                          isSelected
                            ? 'border-primary shadow-lg'
                            : 'border-gray-200 dark:border-gray-700'
                        )}
                        title={font.name}
                      >
                        {/* 选中状态背景 */}
                        {isSelected && (
                          <motion.div
                            className="absolute inset-0 opacity-10"
                            layoutId="activeSize"
                            transition={{
                              type: 'spring',
                              stiffness: 300,
                              damping: 30,
                            }}
                            style={{
                              background: theme === 'night' 
                                ? 'linear-gradient(90deg, #58A6FF, #BC8CFF)' // Night主题用蓝色渐变
                                : theme === 'sepia'
                                ? 'linear-gradient(90deg, #FF8A65, #FFB74D)' // Sepia主题保持温暖黄色
                                : 'linear-gradient(90deg, #1E88E5, #5E35B1)' // Light主题用深蓝紫渐变
                            }}
                          />
                        )}
                        <span className={cn(
                          'relative z-10 font-mono text-sm',
                          isSelected ? 'text-primary font-bold' : currentTheme.text
                        )}>
                          {fontSizeIcon}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* 阅读信息 - Apple风格图标信息 */}
              <div className={cn('text-sm', currentTheme.secondary)}>
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">{chapter.wordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">{chapter.estimatedReadTime}m</span>
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
        className={cn(
          'h-full overflow-y-auto',
          'scrollbar-thin scrollbar-track-transparent',
          theme === 'night'
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

          {/* 正文 - Disney魔法段落 */}
          <div className="space-y-8 md:space-y-10">
            {paragraphs.map((paragraph, index) => (
              <ParagraphWithMagic
                key={index}
                paragraph={paragraph}
                index={index}
                currentFont={currentFont}
                currentTheme={currentTheme}
                isLiked={likedParagraphs.has(index)}
                onLike={() => handleLikeParagraph(index)}
                variants={paragraphVariants}
              />
            ))}
          </div>

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
                  'shadow-2xl',
                  theme === 'night'
                    ? 'bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-primary/30'
                    : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-primary/20'
                )}>
                  {/* Disney魔法背景光效 */}
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                      className={cn(
                        'absolute inset-0 bg-gradient-to-r opacity-30',
                        currentTheme.accent
                      )}
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      style={{
                        backgroundSize: '200% 200%',
                      }}
                    />
                    
                  </div>
                  
                  <div className="relative p-8 text-center">
                    {/* 图标 - Disney弹跳动画 */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ 
                        scale: 1, 
                        rotate: 0,
                      }}
                      transition={{ 
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                        delay: 0.2,
                      }}
                      className="relative inline-flex items-center justify-center w-20 h-20 mb-6"
                    >
                      {/* 光晕 */}
                      <motion.div
                        className={cn(
                          'absolute inset-0 rounded-full bg-gradient-to-r blur-xl',
                          currentTheme.accent
                        )}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                      <motion.div
                        className={cn(
                          'relative rounded-full bg-gradient-to-br p-4 shadow-xl',
                          currentTheme.accent,
                          currentTheme.glow
                        )}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <SparklesIcon className="w-12 h-12 text-white" />
                      </motion.div>
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

                    {/* 按钮 - Disney魔法按钮 */}
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onComplete}
                      className="relative w-full group"
                    >
                      {/* 按钮光晕 */}
                      <motion.div
                        className={cn(
                          'absolute -inset-1 rounded-2xl bg-gradient-to-r blur-lg opacity-75',
                          currentTheme.accent
                        )}
                        animate={{
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                      <div
                        className={cn(
                          'relative w-full py-4 px-6 rounded-2xl',
                          'bg-gradient-to-r',
                          currentTheme.accent,
                          'text-white font-bold text-lg',
                          'shadow-xl',
                          'flex items-center justify-center gap-3',
                          'overflow-hidden'
                        )}
                      >
                        {/* 按钮闪光动画 */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: 'linear',
                          }}
                        />
                        <motion.div
                          animate={{
                            rotate: [0, 360],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        >
                          <SparklesIcon className="w-6 h-6 relative z-10" />
                        </motion.div>
                        <span className="relative z-10">Start Challenge</span>
                        <motion.div
                          animate={{
                            x: [0, 5, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          <ArrowLeftIcon className="w-6 h-6 rotate-180 relative z-10" />
                        </motion.div>
                      </div>
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

// 动画变体类型定义
interface AnimationVariants {
  readonly hidden: {
    readonly opacity: number;
    readonly y: number;
    readonly scale: number;
  };
  readonly visible: (i: number) => {
    readonly opacity: number;
    readonly y: number;
    readonly scale: number;
    readonly transition: {
      readonly type: string;
      readonly stiffness: number;
      readonly damping: number;
      readonly delay: number;
      readonly duration: number;
    };
  };
  readonly [key: string]: any; // 兼容Framer Motion的Variants类型
}

// 魔法段落组件 - Disney × Apple 设计
interface ParagraphWithMagicProps {
  readonly paragraph: string;
  readonly index: number;
  readonly currentFont: FontSize;
  readonly currentTheme: ReadingTheme;
  readonly isLiked: boolean;
  readonly onLike: () => void;
  readonly variants: AnimationVariants;
}

function ParagraphWithMagic({ 
  paragraph, 
  index, 
  currentFont, 
  currentTheme, 
  isLiked, 
  onLike,
  variants 
}: ParagraphWithMagicProps) {
  // 常量定义
  const FIRST_LETTER_SIZE = 'text-6xl';
  const OTHER_LETTER_SIZE = 'text-2xl';
  const BLUR_INTENSITY = 'blur-md';
  const OPACITY_LEVEL = 'opacity-20';
  
  // Refs
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // 提取首字母
  const firstLetter = paragraph.charAt(0);
  const restOfParagraph = paragraph.slice(1);

  return (
    <motion.div
      ref={ref}
      custom={index}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className="relative"
    >
      {/* 段落内容 */}
      <div className="relative">
        {index === 0 ? (
          // 第一段：科技感首字下沉
          <div className="flex items-start gap-3">
            {/* 首字母容器 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.2,
              }}
              className="relative flex-shrink-0"
            >
              {/* 首字母光晕 */}
              <div
                className={cn(
                  'absolute -inset-2 rounded-lg',
                  BLUR_INTENSITY,
                  OPACITY_LEVEL,
                  'bg-gradient-to-br',
                  currentTheme.firstLetter
                )}
              />
              
              {/* 首字母文字 */}
              <div
                className={cn(
                  'relative font-black leading-none',
                  FIRST_LETTER_SIZE,
                  'bg-gradient-to-br bg-clip-text text-transparent',
                  'select-none'
                )}
                style={{
                  fontFamily: 'ui-serif, Georgia, serif',
                  backgroundImage: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
                }}
              >
                {firstLetter}
              </div>
            </motion.div>
            
            {/* 段落其余内容 */}
            <p
              className={cn(
                'font-serif leading-relaxed flex-1 pt-1',
                currentFont.size,
                currentTheme.text,
              )}
            >
              {restOfParagraph}
            </p>
          </div>
        ) : (
          // 其他段落：简洁科技首字母
          <p
            className={cn(
              'font-serif leading-relaxed',
              currentFont.size,
              currentTheme.text,
            )}
          >
            <span
              className={cn(
                'font-bold mr-1 inline-block bg-gradient-to-br bg-clip-text text-transparent',
                OTHER_LETTER_SIZE
              )}
              style={{
                backgroundImage: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {firstLetter}
            </span>
            {restOfParagraph}
          </p>
        )}


        {/* 段落装饰线 - 科技感设计 */}
        {index === 0 && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: isInView ? 1 : 0, opacity: isInView ? 1 : 0 }}
            transition={{
              delay: 0.6,
              duration: 0.8,
              type: 'spring',
              stiffness: 120,
            }}
            className="mt-6 flex items-center gap-2"
          >
            <div
              className={cn('h-0.5 w-24 rounded-full', currentTheme.glow)}
              style={{
                background: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
              }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: currentTheme.id === 'sepia' 
                  ? '#FFC107' // Sepia主题用亮黄色
                  : currentTheme.colors.accent,
                boxShadow: currentTheme.id === 'sepia'
                  ? '0 0 8px #FFC107' // Sepia主题用亮黄色阴影
                  : `0 0 8px ${currentTheme.colors.accent}`,
              }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export { NovelReader };
