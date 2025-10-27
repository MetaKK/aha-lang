"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, SparklesIcon, TrophyIcon, Target, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AIInputWarm } from "@/components/ai/ai-input-warm";
import { processSSEStream } from "@/lib/ai/sse-parser";
import { parseAIJson, safeParseAIJson } from '@/lib/utils/json-parser';
import type { NovelContent } from "@/lib/api/novel-mock-data";

// 评分维度
interface ScoreDimensions {
  communication: number;  // 交际效果 (30%)
  accuracy: number;      // 语言准确性 (25%)
  scenario: number;      // 场景掌握 (25%)
  fluency: number;       // 对话流畅度 (20%)
}

// 对话消息
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  score?: ScoreDimensions;
  feedback?: string;
}

// 场景信息
interface SceneInfo {
  title: string;
  description: string;
  context: string;
  goal: string;
  difficulty: "A2" | "B1";
}

const MAX_TURNS = 5;  // 5轮对话
const PASS_SCORE = 80;
const MIN_TURNS = 5; // 必须完成5轮才能结束

interface ScenePracticeProps {
  novel: NovelContent;
  onComplete: (score: number, passed: boolean) => void;
  onBack: () => void;
}

// 使用AI生成动态开场白
async function generateDynamicGreeting(scene: SceneInfo, apiKey?: string): Promise<Message> {
  const greetingPrompt = `Create a natural opening line for an English conversation scenario.

**SCENARIO:**
Title: ${scene.title}
Context: ${scene.context}
Goal: ${scene.goal}

**REQUIREMENTS:**
- Natural, conversational opening line
- Appropriate for A2-B1 level learners
- Under 20 words
- Invites student response
- Authentic to scenario context

**CRITICAL FORMAT REQUIREMENTS:**
- Return ONLY the opening line text
- No explanations, no instructions
- No quotes around the text
- No additional formatting
- Just the natural opening line

Generate opening line:`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'X-API-Key': apiKey }),
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: greetingPrompt }],
        model: 'gpt-4o-mini',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate greeting');
    }

    const reader = response.body?.getReader();
    let fullText = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        processSSEStream(
          value,
          (content: string) => {
            fullText += content;
          },
          () => {}
        );
      }
    }

    // 清理响应文本
    let cleanText = fullText.trim();
    cleanText = cleanText.replace(/^```\s*/g, '').replace(/\s*```$/g, '');
    cleanText = cleanText.replace(/^["']|["']$/g, ''); // 移除可能的引号

    return {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: cleanText,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Failed to generate dynamic greeting:', error);
    // 降级到简单的默认开场白
    return {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Hello! How can I help you today?",
      timestamp: new Date(),
    };
  }
}

export function ScenePractice({ novel, onComplete, onBack }: ScenePracticeProps) {
  const router = useRouter();
  const [scene, setScene] = useState<SceneInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentTurn, setCurrentTurn] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [scoreChange, setScoreChange] = useState<number | null>(null);
  const [turnScores, setTurnScores] = useState<number[]>([]);
  const [isGeneratingScene, setIsGeneratingScene] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentAIMessage, setCurrentAIMessage] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [apiKey, setApiKey] = useState<string | undefined>();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAIMessage, scrollToBottom]);

  // 生成场景 - 基于小说内容
  const generateScene = useCallback(async () => {
    if (isGeneratingScene) return;
    
    setIsGeneratingScene(true);
    try {
      // 基于小说内容生成场景 - 使用更严格的JSON格式要求
      const scenePrompt = `Return this exact JSON structure with your content:

{
  "title": "Space Honeymoon Adventure",
  "description": "Practice a conversation about visiting the Moon",
  "context": "Emma and you are on your honeymoon in space. You are discussing your exciting experiences visiting the Moon and flying far from Earth.",
  "goal": "Use simple sentences to describe your adventure and express feelings about space travel",
  "difficulty": "A2"
}

**INSTRUCTIONS:**
- Replace the example content with content related to: "${novel.title}" by ${novel.author}
- Synopsis: ${novel.excerpt}
- Keep the exact JSON structure
- Use A2-B1 level English
- Return ONLY the JSON object, nothing else

JSON:`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'X-API-Key': apiKey }),
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: scenePrompt }],
          model: 'gpt-4o-mini',
          stream: false  // JSON响应使用非流式API
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate scene');
      }

      // 非流式API直接返回完整文本
      const fullText = await response.text();

      // 使用智能JSON解析器
      const defaultScene = {
        title: "Coffee Shop Conversation",
        description: "Practice ordering at a coffee shop",
        context: "You are at a coffee shop. The barista is friendly and ready to help. You want to order a drink.",
        goal: "Successfully order a coffee drink using natural English expressions",
        difficulty: "A2" as "A2" | "B1"
      };

      const sceneData = safeParseAIJson(fullText, defaultScene);
      
      // 初始化对话
      const initialMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Welcome to today's scenario: **${sceneData.title}**\n\n${sceneData.context}\n\n**Your Goal**: ${sceneData.goal}\n\nLet's start! Remember, speak only in English. You have ${MAX_TURNS} turns to reach ${PASS_SCORE} points. Good luck! 🎯`,
        timestamp: new Date(),
      };
      
      // 使用AI生成动态开场白
      const aiGreeting = await generateDynamicGreeting(sceneData, apiKey);

      setScene(sceneData);
      setMessages([initialMessage, aiGreeting]);
      setCurrentTurn(0);
      setIsGeneratingScene(false);
      
    } catch (error) {
      console.error('[Scene Practice] Error generating scene:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate scene: ${errorMessage}\n\nPlease check:\n1. Your OpenAI API key is valid\n2. Your API key has sufficient credits\n3. Your network connection is stable`);
      setIsGeneratingScene(false);
      onBack();
    }
  }, [novel, apiKey, isGeneratingScene, onBack]);

  // 初始化场景
  useEffect(() => {
    // 从 sessionStorage 获取 API Key（如果有）
    const savedKey = sessionStorage.getItem('api_key_openai');
    if (savedKey) {
      setApiKey(savedKey);
    }
    
    if (!scene && !isGeneratingScene) {
      generateScene();
    }
  }, [scene, isGeneratingScene, generateScene]);

  // 提交用户消息
  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isSending || isFinished || !scene) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setIsTyping(true);
    setCurrentAIMessage("");

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const historicalScores = turnScores.filter((score: number) => score > 0);
      const averageHistoricalScore = historicalScores.length > 0 
        ? historicalScores.reduce((sum: number, score: number) => sum + score, 0) / historicalScores.length 
        : 50;

      const conversationContext = messages
        .filter(m => m.role === 'assistant' || m.role === 'user')
        .slice(-6)
        .map(m => `${m.role === 'assistant' ? 'AI' : 'Student'}: ${m.content}`)
        .join('\n');

      const evaluationPrompt = `Return this exact JSON structure with your content:

{
  "scores": {
    "communication": 85,
    "accuracy": 80,
    "scenario": 90,
    "fluency": 85
  },
  "feedback": "Great job! You used natural expressions.",
  "response": "That sounds interesting! Tell me more.",
  "hasChinese": false
}

**INSTRUCTIONS:**
- Replace the example content with evaluation for: "${userMessage.content}"
- Scenario: ${scene.title}
- Context: ${scene.context}
- Goal: ${scene.goal}
- Conversation: ${conversationContext}
- Keep the exact JSON structure
- Return ONLY the JSON object, nothing else

JSON:`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'X-API-Key': apiKey }),
        },
        body: JSON.stringify({
          messages: [
            ...conversationHistory,
            { role: 'user', content: userMessage.content },
            { role: 'system', content: evaluationPrompt }
          ],
          model: 'gpt-4o-mini',
          stream: false  // JSON响应使用非流式API
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      // 非流式API直接返回完整文本
      const fullText = await response.text();

      // 使用智能JSON解析器
      const defaultEvaluation = {
        scores: {
          communication: 80,
          accuracy: 75,
          scenario: 85,
          fluency: 80
        },
        feedback: "Good effort! Keep practicing.",
        response: "I see. Let's continue.",
        hasChinese: false
      };

      const evaluation = safeParseAIJson(fullText, defaultEvaluation);

      // 实现打字机效果
      const responseText = evaluation.response || "I see. Let's continue.";
      await new Promise<void>((resolve) => {
        let charIndex = 0;
        const typingSpeed = 30;
        
        const typeNextChar = () => {
          if (charIndex < responseText.length) {
            setCurrentAIMessage(responseText.slice(0, charIndex + 1));
            charIndex++;
            setTimeout(typeNextChar, typingSpeed);
          } else {
            resolve();
          }
        };
        
        typeNextChar();
      });

      // 智能评分处理
      const scores: ScoreDimensions = evaluation.scores;
      let turnScore = (scores.communication + scores.accuracy + scores.scenario + scores.fluency) / 4;
      
      let finalTurnScore = turnScore;
      if (evaluation.hasChinese) {
        finalTurnScore = Math.max(0, turnScore - 15);
      }

      // 更新总分
      const newTotalScore = Math.round(((totalScore * currentTurn) + finalTurnScore) / (currentTurn + 1));
      const scoreDiff = newTotalScore - totalScore;
      
      setScoreChange(scoreDiff);
      setTimeout(() => setScoreChange(null), 2000);
      
      setTotalScore(newTotalScore);
      setTurnScores(prev => [...prev, finalTurnScore]);

      // 更新用户消息添加评分
      setMessages(prev => prev.map(m => 
        m.id === userMessage.id 
          ? { ...m, score: scores, feedback: evaluation.feedback }
          : m
      ));

      // AI 回复
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setCurrentAIMessage("");
      
      // 更新轮次
      const nextTurn = currentTurn + 1;
      setCurrentTurn(nextTurn);

      // 检查是否结束
      if (nextTurn >= MAX_TURNS) {
        setIsFinished(true);
        // 通知父组件
        setTimeout(() => {
          onComplete(newTotalScore, newTotalScore >= PASS_SCORE);
        }, 1000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  }, [input, isSending, isFinished, scene, messages, currentTurn, totalScore, apiKey, turnScores, onComplete]);

  // 加载场景中
  if (!scene || isGeneratingScene) {
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
                {currentTurn}/{MAX_TURNS}
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
                <TrophyIcon className={`w-6 h-6 ${totalScore >= PASS_SCORE ? 'text-green-500' : 'text-amber-500'}`} />
                <span className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {totalScore}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">/ 100</span>
                
                {/* 分数变化动画 */}
                <AnimatePresence>
                  {scoreChange !== null && (
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
                        scoreChange > 0 
                          ? 'text-green-500' 
                          : scoreChange < 0 
                          ? 'text-red-500' 
                          : 'text-gray-500'
                      }`}
                    >
                      {scoreChange > 0 ? '+' : ''}{scoreChange}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Target className="w-4 h-4 text-blue-700 dark:text-blue-300" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Goal: {PASS_SCORE}
              </span>
            </div>
          </div>

          {/* 进度条 */}
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                totalScore >= PASS_SCORE
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              style={{ width: `${Math.min(totalScore, 100)}%` }}
            />
            <div
              className="absolute inset-y-0 w-0.5 bg-blue-500"
              style={{ left: `${PASS_SCORE}%` }}
            />
          </div>

          {/* 最后一次评分详情 */}
          {messages.length > 1 && messages[messages.length - 2]?.score && (
            <div className="mt-3 flex gap-2">
              {Object.entries(messages[messages.length - 2].score || {}).map(([key, value]) => (
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
          {messages.map((message) => (
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
          {isTyping && currentAIMessage && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="px-4 py-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white">
                  <div className="text-sm whitespace-pre-wrap">{currentAIMessage}</div>
                </div>
              </div>
            </div>
          )}

          {/* AI回复等待动效 */}
          {isSending && !currentAIMessage && (
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

          {/* 结束状态 - 在场景练习中不显示，由父组件处理 */}
        </div>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isFinished && (
        <div className="flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-4">
          <div className="w-full max-w-4xl mx-auto">
            <AIInputWarm
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              isLoading={isSending}
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

