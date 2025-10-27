"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";

interface AIInputMinimalProps {
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

export function AIInputMinimal({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  disabled = false,
  placeholder = "Type your message...",
  onVoiceResult,
  onVoiceError,
  className,
  onInputFocus,
  onInputBlur
}: AIInputMinimalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [interimText, setInterimText] = useState(""); // 临时识别文本
  
  // ⭐ 使用 ref 追踪最新的 value，避免闭包陷阱
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // 确保客户端渲染一致性
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 语音录制功能 - 支持实时反馈
  const { 
    isRecording: isVoiceRecording, 
    isSupported: isVoiceSupported, 
    startRecording, 
    stopRecording
  } = useVoiceRecorder({
    language: "en-US",
    onResult: (text) => {
      // ⭐ 使用 valueRef 获取最新的已确认文本，避免闭包陷阱和重复
      onChange(valueRef.current + text);
      // 清空临时文本
      setInterimText("");
      // 通知父组件（如果需要）
      onVoiceResult?.(text);
    },
    onInterimResult: (text) => {
      // 实时临时结果 - 仅用于显示，不修改实际 value
      setInterimText(text);
    },
    onError: (error) => {
      onVoiceError?.(error);
      setInterimText("");
    },
    preventDuplicates: true,
  });

  // 自动调整高度 - 支持多行自适应 (line-height: 24px)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 24 * 6; // 最大6行 (line-height: 24px)
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [value]);

  // 📱 移动端滚动处理
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // 键盘弹起时也滚动，确保输入框可见
    setTimeout(() => {
      onInputFocus?.();
    }, 300);
  }, [onInputFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // 延迟执行，等待键盘完全收起（iOS 需要更长延迟）
    setTimeout(() => {
      onInputBlur?.();
    }, 300);
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
    
    // ⭐ 如果有临时文本，先将其确认为最终文本
    if (interimText) {
      const fullText = value + interimText;
      onChange(fullText);
      setInterimText('');
      
      // 如果正在录音，先停止
      if (isVoiceRecording) {
        stopRecording();
      }
      
      // 提交完整文本
      if (!isLoading && fullText.trim() && !disabled) {
        onSubmit();
      }
    } else {
      // 如果正在录音，先停止
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

  // 显示输入文本：已确认文本 + 临时识别文本（实时反馈）
  const displayText = value + (interimText ? ` ${interimText}` : '');

  if (!isClient) {
    return null; // 避免服务端与客户端不一致
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className={cn(
        "relative flex items-end gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border transition-all",
        isFocused 
          ? "border-primary ring-2 ring-primary/20" 
          : "border-gray-200 dark:border-gray-700"
      )}>
        {/* 输入框 */}
        <textarea
          ref={textareaRef}
          value={displayText}
          onChange={(e) => {
            const newValue = e.target.value;
            // 只更新已确认部分，不影响临时文本
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
            "flex-1 bg-transparent border-none outline-none resize-none text-base leading-6",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "text-gray-900 dark:text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />

        {/* 语音按钮 */}
        {isVoiceSupported && (
          <button
            type="button"
            onClick={handleVoiceToggle}
            disabled={disabled || isLoading}
            className={cn(
              "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all",
              isVoiceRecording
                ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Mic className="w-5 h-5" />
          </button>
        )}

        {/* 发送按钮 */}
        <button
          type="submit"
          disabled={disabled || isLoading || (!value.trim() && !interimText)}
          className={cn(
            "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all",
            value.trim() || interimText
              ? "bg-gradient-to-r from-primary to-primary-600 text-white hover:from-primary-600 hover:to-primary-700"
              : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* 临时识别文本提示 */}
      {interimText && (
        <div className="absolute -top-8 left-4 text-xs text-gray-400 dark:text-gray-500 italic">
          Listening: {interimText}
        </div>
      )}
    </form>
  );
}

