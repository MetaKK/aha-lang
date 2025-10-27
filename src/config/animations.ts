/**
 * 动画配置 - 基于业内最佳实践优化
 * 
 * 参考标准：
 * - Google Material Design: 150-300ms for micro-interactions
 * - Apple HIG: 200-500ms for transitions
 * - Microsoft Fluent: 100-200ms for quick feedback
 * - 用户体验研究: 100-300ms 为最佳感知速度
 */

export const ANIMATION_DURATION = {
  // 超快速反馈 - 按钮点击、hover效果
  INSTANT: 0.1,
  FAST: 0.15,
  
  // 标准交互 - 页面切换、模态框
  NORMAL: 0.2,
  MEDIUM: 0.25,
  
  // 复杂动画 - 页面加载、复杂过渡
  SLOW: 0.3,
  COMPLEX: 0.4,
} as const;

export const ANIMATION_DELAY = {
  // 无延迟
  NONE: 0,
  
  // 微延迟 - 避免动画冲突
  MICRO: 0.05,
  SMALL: 0.1,
  
  // 标准延迟 - 序列动画
  NORMAL: 0.15,
  MEDIUM: 0.2,
  
  // 长延迟 - 复杂序列
  LONG: 0.25,
} as const;

export const SPRING_CONFIG = {
  // 快速响应 - 按钮、卡片
  FAST: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
  },
  
  // 标准响应 - 模态框、页面
  NORMAL: {
    type: 'spring' as const,
    stiffness: 350,
    damping: 20,
  },
  
  // 平滑响应 - 复杂动画
  SMOOTH: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
} as const;

export const EASING = {
  // 标准缓动
  EASE_OUT: [0.4, 0, 0.2, 1],
  EASE_IN: [0.4, 0, 1, 1],
  EASE_IN_OUT: [0.4, 0, 0.2, 1],
  
  // 快速缓动
  FAST_OUT: [0.2, 0, 0.2, 1],
  FAST_IN: [0.2, 0, 1, 1],
  
  // 弹性缓动
  BOUNCE: [0.34, 1.56, 0.64, 1],
} as const;

/**
 * 预设动画配置
 */
export const PRESETS = {
  // 页面进入
  PAGE_ENTER: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: ANIMATION_DURATION.NORMAL, ease: EASING.EASE_OUT },
  },
  
  // 模态框进入
  MODAL_ENTER: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: SPRING_CONFIG.FAST,
  },
  
  // 按钮点击
  BUTTON_TAP: {
    whileTap: { scale: 0.95 },
    transition: { duration: ANIMATION_DURATION.INSTANT },
  },
  
  // 按钮悬停
  BUTTON_HOVER: {
    whileHover: { scale: 1.02 },
    transition: { duration: ANIMATION_DURATION.FAST },
  },
  
  // 加载指示器
  LOADING_SPINNER: {
    animate: { rotate: 360 },
    transition: { duration: 0.6, repeat: Infinity, ease: "linear" },
  },
  
  // 骨架屏
  SKELETON_PULSE: {
    animation: 'pulse-fast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  
  // 淡入动画
  FADE_IN: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: ANIMATION_DURATION.FAST },
  },
  
  // 滑入动画
  SLIDE_IN: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: ANIMATION_DURATION.NORMAL, ease: EASING.EASE_OUT },
  },
} as const;

/**
 * 序列动画延迟计算
 * @param baseDelay 基础延迟
 * @param index 当前索引
 * @param step 步长
 */
export const getSequenceDelay = (
  baseDelay: number = ANIMATION_DELAY.SMALL,
  index: number = 0,
  step: number = 0.03
): number => baseDelay + index * step;

/**
 * 根据设备性能调整动画
 */
export const getOptimizedDuration = (baseDuration: number): number => {
  // 检测设备性能
  const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  
  if (isLowEndDevice) {
    // 低端设备减少动画时间
    return baseDuration * 0.7;
  }
  
  return baseDuration;
};

/**
 * 动画性能优化配置
 */
export const PERFORMANCE_CONFIG = {
  // 启用硬件加速
  WILL_CHANGE: 'transform, opacity',
  
  // 优化渲染
  TRANSFORM_3D: 'translateZ(0)',
  
  // 减少重绘
  BACKFACE_VISIBILITY: 'hidden',
} as const;
