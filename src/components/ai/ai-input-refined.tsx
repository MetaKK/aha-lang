"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import "./ai-input-refined.css";

interface AIInputRefinedProps {
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

export function AIInputRefined({
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
}: AIInputRefinedProps) {
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
      {/* 主容器 - 精致紧凑设计 */}
      <div 
        className={cn(
          "relative overflow-hidden",
          "bg-white/95 dark:bg-gray-900/95",
          "backdrop-blur-xl",
          "border border-gray-200/50 dark:border-gray-700/50",
          "rounded-2xl",
          "shadow-lg shadow-black/5 dark:shadow-black/20",
          "transition-all duration-300 ease-out",
          isActive && "shadow-xl shadow-purple-500/10 dark:shadow-purple-500/5",
          isActive && "border-purple-300/60 dark:border-purple-600/60",
          isActive && "bg-white dark:bg-gray-900"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 顶部精致装饰线 */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-all duration-300",
          "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
          isActive && "h-1 shadow-sm shadow-purple-500/30",
          !isActive && "h-0.5"
        )} />
        
        {/* 输入区域 - 紧凑布局 */}
        <div className="relative px-4 py-3">
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
                    "placeholder:text-gray-400/80 dark:placeholder:text-gray-500/80",
                    "text-gray-900 dark:text-white",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-200"
                  )}
                />
              </div>

              {/* 按钮组 - 精致小巧 */}
              <div className="flex items-center gap-2">
                {/* 语音按钮 */}
                {isVoiceSupported && (
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    disabled={disabled || isLoading}
                    className={cn(
                      "relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200",
                      "group overflow-hidden",
                      isVoiceRecording
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md shadow-red-500/30"
                        : "bg-gray-100/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-purple-100/80 dark:hover:bg-purple-900/50",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "hover:scale-105 active:scale-95"
                    )}
                  >
                    <Mic className={cn(
                      "w-4 h-4 relative z-10 transition-all duration-200",
                      isVoiceRecording && "animate-pulse"
                    )} />
                    
                    {/* 录音指示器 */}
                    {isVoiceRecording && (
                      <div className="absolute inset-0 rounded-xl border border-red-400/50 animate-ping" />
                    )}
                  </button>
                )}

                {/* 发送按钮 */}
                <button
                  type="submit"
                  disabled={disabled || isLoading || !hasContent}
                  className={cn(
                    "relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200",
                    "group overflow-hidden",
                    hasContent
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30 hover:shadow-purple-500/40"
                      : "bg-gray-100/80 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "hover:scale-105 active:scale-95"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                  ) : (
                    <Send className={cn(
                      "w-4 h-4 relative z-10 transition-all duration-200",
                      hasContent && "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    )} />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* 底部精致装饰线 */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl transition-all duration-300",
          "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
          isActive && "h-1 shadow-sm shadow-purple-500/30",
          !isActive && "h-0.5"
        )} />
      </div>

      {/* 临时识别文本 - 精致提示 */}
      {interimText && (
        <div className="absolute -top-8 left-4 right-4 z-40">
          <div className="bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-xl rounded-lg p-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-medium">Listening: {interimText}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
