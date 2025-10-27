"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, Loader2, Sparkles, Zap, Brain, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import "./ai-input-ultra.css";

interface AIInputUltraProps {
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

export function AIInputUltra({
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
}: AIInputUltraProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // 智能建议
  const suggestions = [
    "I think...",
    "That's interesting!",
    "I agree with you.",
    "Can you tell me more?",
    "I don't understand.",
    "That sounds great!"
  ];
  
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
    setCharCount(value.length);
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
      const maxHeight = 32 * 6; // 最大6行
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [value]);

  // 打字动画效果
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    if (!interimText) {
      onChange(newValue);
    }
    
    // 打字动画
    setIsTyping(true);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    setTypingTimeout(timeout);
  }, [onChange, interimText, typingTimeout]);

  // 智能焦点处理
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowSuggestions(true);
    setTimeout(() => {
      onInputFocus?.();
    }, 100);
  }, [onInputFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setTimeout(() => {
      setShowSuggestions(false);
      onInputBlur?.();
    }, 200);
  }, [onInputBlur]);

  // 智能键盘处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (!isLoading && value.trim()) {
        onSubmit();
      }
    }
    
    // ESC 关闭建议
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }, [onSubmit, isLoading, value, isComposing]);

  // 智能提交
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

  // 语音切换
  const handleVoiceToggle = useCallback(() => {
    if (isVoiceRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isVoiceRecording, startRecording, stopRecording]);

  // 建议点击
  const handleSuggestionClick = useCallback((suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  }, [onChange]);

  const displayText = value + (interimText ? ` ${interimText}` : '');
  const hasContent = value.trim() || interimText;
  const isActive = isFocused || isHovered || isTyping;

  if (!isClient) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      {/* 背景光效 */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      {/* 主容器 */}
      <div 
        ref={containerRef}
        className={cn(
          "ai-input-ultra",
          "relative overflow-hidden"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 内部光效 */}
        <div className={cn(
          "absolute inset-0 rounded-3xl transition-opacity duration-500",
          "bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-orange-500/5",
          isActive && "opacity-100",
          !isActive && "opacity-0"
        )} />
        
        {/* 顶部装饰条 */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1 rounded-t-3xl transition-all duration-500",
          "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
          isActive && "h-2 shadow-lg shadow-purple-500/50",
          !isActive && "h-1"
        )} />
        
        {/* 输入区域 */}
        <div className="relative p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex items-end gap-4">
              {/* 输入框 */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={displayText}
                  onChange={handleInputChange}
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
                    "text-lg leading-8 font-medium",
                    "placeholder:text-gray-400/80 dark:placeholder:text-gray-500/80",
                    "text-gray-900 dark:text-white",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-300",
                    isTyping && "text-purple-600 dark:text-purple-400"
                  )}
                />
                
                {/* 字符计数 */}
                {charCount > 0 && (
                  <div className={cn(
                    "absolute -bottom-6 right-0 text-xs font-medium transition-all duration-300",
                    charCount > 200 ? "text-red-500" : "text-gray-400 dark:text-gray-500"
                  )}>
                    {charCount}/500
                  </div>
                )}
              </div>

              {/* 按钮组 */}
              <div className="flex items-center gap-3">
                {/* 语音按钮 */}
                {isVoiceSupported && (
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    disabled={disabled || isLoading}
                    className={cn(
                      "ai-button-ultra",
                      "relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300",
                      "group overflow-hidden",
                      isVoiceRecording && "ai-voice-button",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {/* 按钮光效 */}
                    <div className={cn(
                      "absolute inset-0 rounded-2xl transition-opacity duration-300",
                      "bg-gradient-to-r from-purple-500/20 to-pink-500/20",
                      "group-hover:opacity-100",
                      !isHovered && "opacity-0"
                    )} />
                    
                    <Mic className={cn(
                      "w-5 h-5 relative z-10 transition-all duration-300",
                      isVoiceRecording && "animate-bounce"
                    )} />
                    
                    {/* 录音波纹效果 */}
                    {isVoiceRecording && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-red-400 animate-ping" />
                    )}
                  </button>
                )}

                {/* 发送按钮 */}
                <button
                  type="submit"
                  disabled={disabled || isLoading || !hasContent}
                  className={cn(
                    "ai-button-ultra",
                    "relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300",
                    "group overflow-hidden",
                    hasContent
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70"
                      : "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-400 dark:text-gray-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "hover:scale-105 active:scale-95"
                  )}
                >
                  {/* 按钮光效 */}
                  <div className={cn(
                    "absolute inset-0 rounded-2xl transition-opacity duration-300",
                    "bg-gradient-to-r from-purple-500/20 to-pink-500/20",
                    hasContent && "opacity-100",
                    !hasContent && "opacity-0"
                  )} />
                  
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  ) : (
                    <Send className={cn(
                      "w-5 h-5 relative z-10 transition-all duration-300",
                      hasContent && "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    )} />
                  )}
                  
                  {/* 发送动画效果 */}
                  {hasContent && !isLoading && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* 底部装饰 */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl transition-all duration-500",
          "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
          isActive && "h-2 shadow-lg shadow-purple-500/50",
          !isActive && "h-1"
        )} />
      </div>

      {/* 智能建议面板 */}
      {showSuggestions && !hasContent && (
        <div className="absolute -top-4 left-0 right-0 z-50">
          <div className="ai-suggestions p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Smart Suggestions</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="ai-suggestion-item text-left p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 临时识别文本 */}
      {interimText && (
        <div className="absolute -top-12 left-6 right-6 z-40">
          <div className="bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-xl rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">Listening: {interimText}</span>
            </div>
          </div>
        </div>
      )}

      {/* 状态指示器 */}
      {isTyping && (
        <div className="absolute -bottom-8 left-6 flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="ai-typing-indicator text-xs text-purple-500 font-medium">Typing...</span>
        </div>
      )}
    </div>
  );
}
