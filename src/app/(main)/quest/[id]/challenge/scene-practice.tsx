"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, SparklesIcon, TrophyIcon, Target, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AIInputWarm } from "@/components/ai/ai-input-warm";
import { SceneService } from "@/services/scene.service";
import { useSceneState } from "@/hooks/use-scene-state";
import { useTypewriter } from "@/hooks/use-typewriter";
import { 
  calculateFinalTurnScore, 
  calculateNewTotalScore, 
  calculateScoreChange,
  hasPassed 
} from "@/utils/score-calculator";
import { SCENE_CONFIG } from "@/config/scene";
import type { ScenePracticeProps, Message } from "@/types/scene";
import type { NovelContent } from "@/lib/api/novel-mock-data";

// 创建场景服务实例
const createSceneService = (apiKey?: string) => new SceneService({ apiKey });

export function ScenePractice({ novel, onComplete, onBack }: ScenePracticeProps) {
  const router = useRouter();
  const { state, actions, computed } = useSceneState();
  
  // Refs for DOM manipulation
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // 防止初始化重复触发的refs
  const hasInitializedRef = useRef(false);
  const initInFlightRef = useRef<Promise<void> | null>(null);
  
  // 创建场景服务实例
  const sceneService = useMemo(() => createSceneService(state.apiKey), [state.apiKey]);
  
  // 打字机效果
  const { typeText, isTyping, stopTyping } = useTypewriter(actions.setCurrentAIMessage);

  // 自动滚动
  const scrollToBottom = useCallback((immediate = false) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: immediate ? 'auto' : 'smooth'
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
  }, []);

  // 监听消息变化，自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [state.messages, state.currentAIMessage, scrollToBottom]);

  // 生成场景 - 基于小说内容
  const generateScene = useCallback(async (overrideApiKey?: string) => {
    // 去重：若已有初始化中的Promise，直接复用，避免重复发起
    if (initInFlightRef.current) {
      await initInFlightRef.current;
      return;
    }

    actions.setGeneratingScene(true);
    
    try {
      // 创建临时服务实例（如果提供了覆盖的API Key）
      const service = overrideApiKey ? createSceneService(overrideApiKey) : sceneService;
      
      // 生成场景
      const sceneData = await service.generateScene(novel);
      
      // 初始化对话
      const initialMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Welcome to today's scenario: **${sceneData.title}**\n\n${sceneData.context}\n\n**Your Goal**: ${sceneData.goal}\n\nLet's start! Remember, speak only in English. You have ${SCENE_CONFIG.MAX_TURNS} turns to reach ${SCENE_CONFIG.PASS_SCORE} points. Good luck! 🎯`,
        timestamp: new Date(),
      };
      
      // 使用AI生成动态开场白
      const aiGreeting = await service.generateDynamicGreeting(sceneData);

      actions.setScene(sceneData);
      actions.addMessage(initialMessage);
      actions.addMessage(aiGreeting);
      actions.setGeneratingScene(false);
      
    } catch (error) {
      console.error('[Scene Practice] Error generating scene:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate scene: ${errorMessage}\n\nPlease check:\n1. Your OpenAI API key is valid\n2. Your API key has sufficient credits\n3. Your network connection is stable`);
      actions.setGeneratingScene(false);
      onBack();
    }
  }, [novel, sceneService, actions, onBack]);

  // 初始化场景（严格模式和依赖变化下也只执行一次）
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const savedKey = sessionStorage.getItem('api_key_openai') || undefined;
    if (savedKey) actions.setApiKey(savedKey);

    const initPromise = generateScene(savedKey);
    initInFlightRef.current = Promise.resolve(initPromise).finally(() => {
      initInFlightRef.current = null;
    }) as Promise<void>;
  }, [generateScene, actions]);

  // 提交用户消息
  const handleSubmit = useCallback(async () => {
    if (!computed.canSubmit) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: state.input.trim(),
      timestamp: new Date(),
    };

    actions.addMessage(userMessage);
    actions.setInput("");
    actions.setSending(true);
    actions.setTyping(true);
    actions.setCurrentAIMessage("");

    try {
      const conversationHistory = state.messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const evaluation = await sceneService.evaluateResponse(
        userMessage.content,
        state.scene!,
        conversationHistory,
        [...state.turnScores],
        novel
      );

      // 实现打字机效果
      await typeText(evaluation.response);

      // 智能评分处理
      const finalTurnScore = calculateFinalTurnScore(evaluation.scores, evaluation.hasChinese);
      const newTotalScore = calculateNewTotalScore(state.totalScore, state.currentTurn, finalTurnScore);
      const scoreDiff = calculateScoreChange(newTotalScore, state.totalScore);
      
      actions.setScoreChange(scoreDiff);
      setTimeout(() => actions.setScoreChange(null), SCENE_CONFIG.SCORE_ANIMATION_DURATION);
      
      actions.setTotalScore(newTotalScore);
      actions.addTurnScore(finalTurnScore);

      // 更新用户消息添加评分
      actions.updateMessage(userMessage.id, {
        score: evaluation.scores,
        feedback: evaluation.feedback
      });

      // AI 回复
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: evaluation.response,
        timestamp: new Date(),
      };

      actions.addMessage(aiMessage);
      actions.setCurrentAIMessage("");
      
      // 更新轮次
      actions.incrementTurn();

      // 检查是否结束
      if (state.currentTurn + 1 >= SCENE_CONFIG.MAX_TURNS) {
        actions.setFinished(true);
        // 通知父组件
        setTimeout(() => {
          onComplete(newTotalScore, hasPassed(newTotalScore));
        }, 1000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      actions.setSending(false);
      actions.setTyping(false);
    }
  }, [state, actions, computed, sceneService, novel, typeText, onComplete]);

  // 加载场景中
  if (!state.scene || state.isGeneratingScene) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center animate-pulse">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Generating your scenario...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This may take a few seconds
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <MessageCircle className="w-4 h-4 text-amber-700 dark:text-amber-300" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                {state.currentTurn}/{SCENE_CONFIG.MAX_TURNS}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Dashboard */}
      <div className="flex-shrink-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-b border-gray-200/30 dark:border-gray-700/30 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* 总分和目标 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 relative">
                <TrophyIcon className={`w-6 h-6 ${state.totalScore >= SCENE_CONFIG.PASS_SCORE ? 'text-green-500' : 'text-amber-500'}`} />
                <span className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {state.totalScore}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">/ 100</span>
                
                {/* 分数变化动画 */}
                <AnimatePresence>
                  {state.scoreChange !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.5 }}
                      animate={{ 
                        opacity: [0, 1, 1, 0], 
                        y: [10, -20, -25, -30],
                        scale: [0.5, 1.2, 1, 0.8]
                      }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ 
                        duration: 2,
                        times: [0, 0.2, 0.8, 1],
                        ease: "easeOut"
                      }}
                      className={`absolute left-1/2 -translate-x-1/2 top-0 font-bold text-2xl pointer-events-none drop-shadow-lg ${
                        state.scoreChange > 0 
                          ? 'text-green-500' 
                          : state.scoreChange < 0 
                          ? 'text-red-500' 
                          : 'text-gray-500'
                      }`}
                    >
                      {state.scoreChange > 0 ? '+' : ''}{state.scoreChange}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Target className="w-4 h-4 text-blue-700 dark:text-blue-300" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Goal: {SCENE_CONFIG.PASS_SCORE}
              </span>
            </div>
          </div>

          {/* 进度条 */}
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                state.totalScore >= SCENE_CONFIG.PASS_SCORE
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              style={{ width: `${Math.min(state.totalScore, 100)}%` }}
            />
            <div
              className="absolute inset-y-0 w-0.5 bg-blue-500"
              style={{ left: `${SCENE_CONFIG.PASS_SCORE}%` }}
            />
          </div>

          {/* 最后一次评分详情 */}
          {state.messages.length > 1 && state.messages[state.messages.length - 2]?.score && (
            <div className="mt-3 flex gap-2">
              {Object.entries(state.messages[state.messages.length - 2].score || {}).map(([key, value]) => (
                <div key={key} className="flex-1 px-2 py-1.5 bg-white/80 dark:bg-gray-700/80 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                  <div className="text-xs text-gray-600 dark:text-gray-400 capitalize mb-0.5">{key}</div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white">{Math.round(value)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {state.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                      : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
                
                {/* 用户消息的评分反馈 */}
                {message.role === 'user' && message.feedback && (
                  <div className="mt-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                    {message.feedback}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* 正在输入 */}
          {state.isTyping && state.currentAIMessage && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="px-4 py-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white">
                  <div className="text-sm whitespace-pre-wrap">{state.currentAIMessage}</div>
                </div>
              </div>
            </div>
          )}

          {/* AI回复等待动效 */}
          {state.isSending && !state.currentAIMessage && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-100/80 to-amber-100/80 dark:from-orange-900/50 dark:to-amber-900/50 backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/50">
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!state.isFinished && (
        <div className="flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-4">
          <div className="w-full max-w-4xl mx-auto">
            <AIInputWarm
              value={state.input}
              onChange={actions.setInput}
              onSubmit={handleSubmit}
              isLoading={state.isSending}
              onVoiceError={(error) => console.error("Voice error:", error)}
              onInputFocus={scrollToBottom}
              onInputBlur={scrollToBottom}
              placeholder="Type your response in English..."
            />
          </div>
        </div>
      )}
    </div>
  );
}