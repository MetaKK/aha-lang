"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import "./ai-input-warm.css";

interface AIInputWarmProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onVoiceResult?: (text: string) => void;
  onVoiceError?: (error: string) => void;
  className?: string;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
}

export function AIInputWarm({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  disabled = false,
  placeholder = "Type your response in English...",
  onVoiceResult,
  onVoiceError,
  className,
  onInputFocus,
  onInputBlur
}: AIInputWarmProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 语音录制功能
  const { 
    isRecording: isVoiceRecording, 
    isSupported: isVoiceSupported, 
    startRecording, 
    stopRecording
  } = useVoiceRecorder({
    language: "en-US",
    onResult: (text) => {
      onChange(valueRef.current + text);
      setInterimText("");
      onVoiceResult?.(text);
    },
    onInterimResult: (text) => {
      setInterimText(text);
    },
    onError: (error) => {
      onVoiceError?.(error);
      setInterimText("");
    },
    preventDuplicates: true,
  });

  // 智能高度调整
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 24 * 4; // 最大4行
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [value]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setTimeout(() => {
      onInputFocus?.();
    }, 100);
  }, [onInputFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setTimeout(() => {
      onInputBlur?.();
    }, 200);
  }, [onInputBlur]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (!isLoading && value.trim()) {
        onSubmit();
      }
    }
  }, [onSubmit, isLoading, value, isComposing]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (interimText) {
      const fullText = value + interimText;
      onChange(fullText);
      setInterimText('');
      
      if (isVoiceRecording) {
        stopRecording();
      }
      
      if (!isLoading && fullText.trim() && !disabled) {
        onSubmit();
      }
    } else {
      if (isVoiceRecording) {
        stopRecording();
      }
      
      if (!isLoading && value.trim() && !disabled) {
        onSubmit();
      }
    }
  }, [onSubmit, isLoading, value, interimText, disabled, isVoiceRecording, stopRecording, onChange]);

  const handleVoiceToggle = useCallback(() => {
    if (isVoiceRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isVoiceRecording, startRecording, stopRecording]);

  const displayText = value + (interimText ? ` ${interimText}` : '');
  const hasContent = value.trim() || interimText;
  const isActive = isFocused || isHovered;

  if (!isClient) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      {/* Apple风格主容器 - 温暖科技感 */}
      <div 
        className={cn(
          "relative overflow-hidden",
          // Apple风格的温暖背景
          "bg-white/70 dark:bg-gray-900/70",
          "backdrop-blur-2xl",
          // 简化边框 - 移除复杂边框效果
          "rounded-3xl",
          // Apple风格的柔和阴影
          "shadow-lg shadow-orange-500/10 dark:shadow-orange-500/5",
          "transition-all duration-500 ease-out",
          // 激活状态 - 温暖的光效
          isActive && "shadow-xl shadow-orange-400/20 dark:shadow-orange-400/10",
          isActive && "bg-white/80 dark:bg-gray-900/80"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 顶部装饰条 - 移除 */}
        
        {/* 输入区域 */}
        <div className="relative px-5 py-4">
          <form onSubmit={handleSubmit}>
            <div className="flex items-end gap-3">
              {/* 输入框 */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={displayText}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (!interimText) {
                      onChange(newValue);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder={placeholder}
                  disabled={disabled || isLoading}
                  rows={1}
                  className={cn(
                    "w-full bg-transparent border-none outline-none resize-none",
                    "text-base leading-6 font-medium",
                    // Apple风格的温暖文字颜色
                    "placeholder:text-orange-400/60 dark:placeholder:text-orange-500/60",
                    "text-gray-800 dark:text-orange-100",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-300"
                  )}
                />
              </div>

              {/* 按钮组 - Apple风格 */}
              <div className="flex items-center gap-2">
                {/* 语音按钮 - 温暖橙色 */}
                {isVoiceSupported && (
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    disabled={disabled || isLoading}
                    className={cn(
                      "relative w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300",
                      "group overflow-hidden",
                      isVoiceRecording
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/40"
                        : "bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50 text-orange-600 dark:text-orange-400 hover:from-orange-200 hover:to-amber-200 dark:hover:from-orange-800/60 dark:hover:to-amber-800/60",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "hover:scale-105 active:scale-95"
                    )}
                  >
                    <Mic className={cn(
                      "w-4 h-4 relative z-10 transition-all duration-300",
                      isVoiceRecording && "animate-pulse"
                    )} />
                    
                    {/* 录音指示器 - 温暖光效 */}
                    {isVoiceRecording && (
                      <div className="absolute inset-0 rounded-2xl border border-orange-400/60 animate-ping" />
                    )}
                  </button>
                )}

                {/* 发送按钮 - Apple风格 */}
                <button
                  type="submit"
                  disabled={disabled || isLoading || !hasContent}
                  className={cn(
                    "relative w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300",
                    "group overflow-hidden",
                    hasContent
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/40 hover:shadow-orange-500/50"
                      : "bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50 text-orange-400 dark:text-orange-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "hover:scale-105 active:scale-95"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                  ) : (
                    <Send className={cn(
                      "w-4 h-4 relative z-10 transition-all duration-300",
                      hasContent && "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    )} />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* 底部装饰条 - 移除 */}
      </div>

      {/* 临时识别文本 - 温暖提示 */}
      {interimText && (
        <div className="absolute -top-8 left-4 right-4 z-40">
          <div className="bg-gradient-to-r from-orange-500/90 to-amber-500/90 backdrop-blur-xl rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">Listening: {interimText}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
