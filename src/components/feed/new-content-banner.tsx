'use client'

import { ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NewContentBannerProps {
  count: number
  onRefresh: () => void
}

export function NewContentBanner({ count, onRefresh }: NewContentBannerProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-16 left-1/2 -translate-x-1/2 z-40"
      >
        <button
          type="button"
          onClick={onRefresh}
          className="px-4 py-2 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
        >
          <ArrowUp className="w-4 h-4" />
          <span>{count} 条新内容</span>
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

