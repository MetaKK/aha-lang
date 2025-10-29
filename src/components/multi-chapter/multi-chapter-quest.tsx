"use client";

import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMultiChapterQuest } from "@/hooks/use-multi-chapter-quest";
import { ChapterReading } from "./chapter-reading";
import { ChapterTransition } from "./chapter-transition";
import { FinalSettlement } from "./final-settlement";
import { ScenePractice } from "@/components/quest/scene-practice";
import type { MultiChapterQuestProps } from "@/types/multi-chapter";

export function MultiChapterQuest({ quest, onComplete, onBack }: MultiChapterQuestProps) {
  const { state, actions, computed } = useMultiChapterQuest(quest);

  // 处理章节阅读完成
  const handleChapterReadingComplete = useCallback(() => {
    actions.setCurrentStep('scene-practice');
  }, [actions]);

  // 处理场景练习完成
  const handleScenePracticeComplete = useCallback((score: number, passed: boolean) => {
    actions.completeChapter(state.currentChapterIndex, score);
    actions.setCurrentStep('scoring');
  }, [actions, state.currentChapterIndex]);

  // 处理章节过渡
  const handleChapterTransition = useCallback(() => {
    if (computed.isLastChapter) {
      // 最后一章，进入最终结算
      const finalScore = state.questProgress.totalScore;
      const averageScore = state.questProgress.averageScore;
      const passed = averageScore >= 80;
      
      actions.completeQuest(finalScore, averageScore);
      actions.setCurrentStep('final-settlement');
    } else {
      // 进入下一章
      actions.setCurrentChapter(state.currentChapterIndex + 1);
      actions.setCurrentStep('reading');
    }
  }, [actions, state.currentChapterIndex, computed.isLastChapter, state.questProgress]);

  // 处理返回
  const handleBack = useCallback(() => {
    if (state.currentStep === 'reading') {
      onBack();
    } else if (state.currentStep === 'scene-practice') {
      actions.setCurrentStep('reading');
    } else if (state.currentStep === 'scoring') {
      actions.setCurrentStep('scene-practice');
    } else if (state.currentStep === 'final-settlement') {
      actions.setCurrentStep('scoring');
    }
  }, [actions, state.currentStep, onBack]);

  // 处理分享
  const handleShare = useCallback(() => {
    // TODO: 实现分享功能
    console.log('Share quest completion');
  }, []);

  // 处理返回Feed
  const handleBackToFeed = useCallback(() => {
    onComplete(state.questProgress.totalScore, state.questProgress.averageScore >= 80);
  }, [onComplete, state.questProgress]);

  // 渲染当前步骤
  const renderCurrentStep = () => {
    if (!computed.currentChapter) {
      return null;
    }

    switch (state.currentStep) {
      case 'reading':
        return (
          <ChapterReading
            chapter={computed.currentChapter}
            onComplete={handleChapterReadingComplete}
            onBack={handleBack}
          />
        );

      case 'scene-practice':
        return (
          <ScenePractice
            novel={quest.novel}
            onComplete={handleScenePracticeComplete}
            onBack={handleBack}
          />
        );

      case 'scoring':
        return (
          <ChapterTransition
            currentChapter={computed.currentChapter}
            nextChapter={computed.nextChapter}
            score={state.questProgress.chaptersProgress[state.currentChapterIndex]?.score || 0}
            onContinue={handleChapterTransition}
            onBack={handleBack}
          />
        );

      case 'final-settlement':
        return (
          <FinalSettlement
            quest={quest}
            finalScore={state.questProgress.totalScore}
            averageScore={state.questProgress.averageScore}
            passed={state.questProgress.averageScore >= 80}
            onShare={handleShare}
            onBackToFeed={handleBackToFeed}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {renderCurrentStep()}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
