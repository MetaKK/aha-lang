"use client";

import React from "react";
import { NovelReaderWrapper } from "@/components/reader/novel-reader-wrapper";
import { getBackgroundConfig } from "@/config/backgrounds";
import type { ChapterReadingProps } from "@/types/multi-chapter";
import type { NovelContent, NovelChapter } from "@/lib/api/novel-mock-data";

export function NovelReaderAdapter({ chapter, onComplete, onBack }: ChapterReadingProps) {
  // 将多章节Quest的章节转换为NovelChapter格式
  const novelChapter: NovelChapter = {
    id: chapter.id,
    number: chapter.order,
    title: chapter.title,
    content: chapter.content,
    wordCount: chapter.content.split(/\s+/).length,
    estimatedReadTime: Math.ceil(chapter.content.length / 1000),
  };

  // 将多章节Quest的章节数据转换为NovelReader需要的格式
  const novel: NovelContent = {
    id: 'harry-potter-multi-chapter',
    title: 'Harry Potter Multi-Chapter Quest',
    author: 'J.K. Rowling',
    excerpt: 'An immersive multi-chapter quest through the magical world of Harry Potter',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop&q=80',
    difficulty: 3, // 默认难度
    tags: ['fantasy', 'magic', 'adventure'],
    language: 'English',
    estimatedTime: `${Math.ceil(chapter.content.length / 1000)} min`,
    chapters: [novelChapter], // 使用转换后的章节
  };

  // 获取背景配置
  const backgroundConfig = getBackgroundConfig('hp-a2').reading;

  return (
    <NovelReaderWrapper
      novel={novel}
      chapter={novelChapter}
      onClose={onBack}
      onComplete={onComplete}
      backgroundConfig={backgroundConfig}
    />
  );
}
