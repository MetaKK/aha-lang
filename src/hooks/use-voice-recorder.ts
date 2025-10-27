"use client";

import { useState, useRef, useCallback } from "react";

interface UseVoiceRecorderOptions {
  /** 最终确认的文本回调（用户停顿后确认的结果） */
  onResult?: (text: string, isFinal: boolean) => void;
  /** 实时临时结果回调（正在识别中的文本，用于实时显示） */
  onInterimResult?: (text: string) => void;
  onError?: (error: string) => void;
  language?: string;
  /** 是否自动去重（防止重复添加相同文本） */
  preventDuplicates?: boolean;
}

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  error: string | null;
}

/**
 * 语音转文字 Hook - 参考语音产品最佳实践
 * 
 * 工作流程：
 * 1. 实时显示临时识别结果（灰色/斜体）- onInterimResult
 * 2. 用户停顿后，临时结果变为最终确认结果 - onResult(text, true)
 * 3. 继续识别新的临时结果，追加到已确认的文本后
 * 
 * 这种方式提供最佳的实时反馈体验
 */
export function useVoiceRecorder({
  onResult,
  onInterimResult,
  onError,
  language = "en-US",
  preventDuplicates = true,
}: UseVoiceRecorderOptions = {}): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<unknown>(null);
  const lastFinalResultRef = useRef<string>("");
  const accumulatedFinalTextRef = useRef<string>("");

  const isSupported = typeof window !== "undefined" && 
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      const errorMsg = "Speech recognition is not supported in this browser";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setError(null);
    setIsRecording(true);
    lastFinalResultRef.current = "";
    accumulatedFinalTextRef.current = "";

    try {
      // 使用 Web Speech API 进行实时语音识别
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true; // 启用临时结果，实现实时反馈
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log("🎤 Speech recognition started");
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        // ⭐ 只处理新的识别结果（从 resultIndex 开始），避免重复处理历史结果
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            // 最终确认的结果
            finalTranscript += transcript;
          } else {
            // 临时结果（正在识别中）
            interimTranscript += transcript;
          }
        }

        // 处理临时结果 - 实时显示
        if (interimTranscript) {
          console.log("💬 Interim recognition:", interimTranscript);
          onInterimResult?.(interimTranscript);
        }

        // 处理最终结果 - 确认并追加
        if (finalTranscript) {
          // 防重复逻辑
          if (preventDuplicates && finalTranscript === lastFinalResultRef.current) {
            console.log("⏭️ Skip duplicate result:", finalTranscript);
            return;
          }
          
          lastFinalResultRef.current = finalTranscript;
          accumulatedFinalTextRef.current += finalTranscript;
          
          console.log("✅ Final confirmation:", finalTranscript);
          console.log("📝 Accumulated text:", accumulatedFinalTextRef.current);
          
          // 回调最终结果
          onResult?.(finalTranscript, true);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("❌ Speech recognition error:", event.error);
        const errorMsg = `Speech recognition error: ${event.error}`;
        setError(errorMsg);
        onError?.(errorMsg);
        setIsRecording(false);
      };

      recognition.onend = () => {
        console.log("🛑 Speech recognition ended");
        setIsRecording(false);
        lastFinalResultRef.current = "";
        accumulatedFinalTextRef.current = "";
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      const errorMsg = "Failed to start speech recognition";
      setError(errorMsg);
      onError?.(errorMsg);
      setIsRecording(false);
    }
  }, [isSupported, language, onResult, onInterimResult, onError, preventDuplicates]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      (recognitionRef.current as any).stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    lastFinalResultRef.current = "";
    accumulatedFinalTextRef.current = "";
  }, []);

  return {
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
    error,
  };
}

// 语音播放功能
export function useVoicePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playText = useCallback(async (text: string, language = "en-US") => {
    if (!("speechSynthesis" in window)) {
      const errorMsg = "Speech synthesis is not supported in this browser";
      setError(errorMsg);
      return;
    }

    setError(null);
    setIsPlaying(true);

    try {
      // 停止当前播放
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (event: any) => {
        console.error("Speech synthesis error:", event.error);
        setError(`Speech synthesis error: ${event.error}`);
        setIsPlaying(false);
      };

      speechSynthesis.speak(utterance);
    } catch {
      const errorMsg = "Failed to play speech";
      setError(errorMsg);
      setIsPlaying(false);
    }
  }, []);

  const stopPlaying = useCallback(() => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  return {
    isPlaying,
    error,
    playText,
    stopPlaying,
  };
}

