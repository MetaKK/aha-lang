// Supabase 自动生成的类型文件
// 运行 pnpm supabase:types 生成

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      feed_cards: {
        Row: {
          id: string
          type: string
          title: string
          content: Json
          metadata: Json
          author_id: string
          likes_count: number
          comments_count: number
          shares_count: number
          views_count: number
          visibility: string
          difficulty: number | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          title: string
          content: Json
          metadata?: Json
          author_id: string
          likes_count?: number
          comments_count?: number
          shares_count?: number
          views_count?: number
          visibility?: string
          difficulty?: number | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          title?: string
          content?: Json
          metadata?: Json
          author_id?: string
          likes_count?: number
          comments_count?: number
          shares_count?: number
          views_count?: number
          visibility?: string
          difficulty?: number | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

