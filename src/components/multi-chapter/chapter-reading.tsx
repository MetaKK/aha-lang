"use client";

import React from "react";
import { NovelReaderAdapter } from "./novel-reader-adapter";
import type { ChapterReadingProps } from "@/types/multi-chapter";

export function ChapterReading({ chapter, onComplete, onBack }: ChapterReadingProps) {
  return (
    <NovelReaderAdapter
      chapter={chapter}
      onComplete={onComplete}
      onBack={onBack}
    />
  );
}
