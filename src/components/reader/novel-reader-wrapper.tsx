"use client";

import React from 'react';
import { NovelReader } from './novel-reader';
import { ConfigurableBackground } from '@/components/common/configurable-background';
import type { NovelContent, NovelChapter } from '@/lib/api/novel-mock-data';
import type { BackgroundConfig } from '@/config/backgrounds';

interface NovelReaderWrapperProps {
  readonly novel: NovelContent;
  readonly chapter: NovelChapter;
  readonly onClose: () => void;
  readonly onComplete: () => void;
  readonly backgroundConfig?: BackgroundConfig;
}

/**
 * NovelReader包装器组件
 * 支持可选的背景配置，如果提供了背景配置则使用ConfigurableBackground包装
 * 否则直接使用原始的NovelReader（保持Visitor Zoo的完整体验）
 */
export function NovelReaderWrapper({
  novel,
  chapter,
  onClose,
  onComplete,
  backgroundConfig,
}: NovelReaderWrapperProps) {
  // 如果有背景配置，使用ConfigurableBackground包装
  if (backgroundConfig) {
    return (
      <ConfigurableBackground
        config={backgroundConfig}
        className="fixed inset-0 z-50"
      >
        <div className="h-full">
          <NovelReader
            novel={novel}
            chapter={chapter}
            onClose={onClose}
            onComplete={onComplete}
          />
        </div>
      </ConfigurableBackground>
    );
  }

  // 默认直接使用NovelReader（保持原有体验）
  return (
    <NovelReader
      novel={novel}
      chapter={chapter}
      onClose={onClose}
      onComplete={onComplete}
    />
  );
}
