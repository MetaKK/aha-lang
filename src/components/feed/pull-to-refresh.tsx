'use client'

import { useState, type ReactNode } from 'react'
import { useGesture } from '@use-gesture/react'
import { motion } from 'framer-motion'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => void
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  const bind = useGesture({
    onDrag: ({ down, movement: [, my] }) => {
      if (my > 0 && window.scrollY === 0) {
        setPulling(down)
        setPullDistance(Math.min(my, 100))

        if (!down && my > 80) {
          onRefresh()
        }
      }
    },
  })

  return (
    <div {...bind()} className="touch-none">
      {pulling && (
        <motion.div
          className="flex justify-center py-4"
          animate={{ opacity: pullDistance / 100 }}
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
      {children}
    </div>
  )
}

