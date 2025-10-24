'use client'

import { Home, Search, Bell, User } from 'lucide-react'

export function FeedHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          LinguaFlow
        </h1>

        <nav className="flex items-center gap-4">
          <button
            type="button"
            className="p-2 hover:bg-secondary rounded-full transition-colors"
            aria-label="搜索"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-2 hover:bg-secondary rounded-full transition-colors"
            aria-label="通知"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-2 hover:bg-secondary rounded-full transition-colors"
            aria-label="个人中心"
          >
            <User className="w-5 h-5" />
          </button>
        </nav>
      </div>
    </header>
  )
}

