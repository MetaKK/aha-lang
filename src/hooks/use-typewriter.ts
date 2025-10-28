/**
 * 打字机效果Hook
 * 提供流畅的打字机动画效果，符合用户体验最佳实践
 */

import { useCallback, useRef } from 'react';
import { SCENE_CONFIG } from '@/config/scene';

export interface UseTypewriterOptions {
  speed?: number;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

export interface UseTypewriterReturn {
  typeText: (text: string) => Promise<void>;
  isTyping: boolean;
  stopTyping: () => void;
}

export function useTypewriter(
  setText: (text: string) => void,
  options: UseTypewriterOptions = {}
): UseTypewriterReturn {
  const {
    speed = SCENE_CONFIG.TYPING_SPEED,
    onComplete,
    onProgress,
  } = options;

  const isTypingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const typeText = useCallback(async (text: string): Promise<void> => {
    if (isTypingRef.current) {
      return; // 如果正在打字，忽略新的请求
    }

    isTypingRef.current = true;
    setText('');

    return new Promise<void>((resolve) => {
      let charIndex = 0;
      const totalChars = text.length;

      const typeNextChar = () => {
        if (!isTypingRef.current || charIndex >= totalChars) {
          isTypingRef.current = false;
          onComplete?.();
          resolve();
          return;
        }

        const currentText = text.slice(0, charIndex + 1);
        setText(currentText);
        
        // 计算进度
        const progress = ((charIndex + 1) / totalChars) * 100;
        onProgress?.(progress);

        charIndex++;
        timeoutRef.current = setTimeout(typeNextChar, speed);
      };

      typeNextChar();
    });
  }, [setText, speed, onComplete, onProgress]);

  const stopTyping = useCallback(() => {
    isTypingRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    typeText,
    get isTyping() {
      return isTypingRef.current;
    },
    stopTyping,
  };
}
