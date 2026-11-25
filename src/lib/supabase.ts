import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL / Anon Key belum di-set di .env')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export type Profile = {
  id: string
  full_name: string
  birth_date: string
  whatsapp: string | null
  tiktok_url: string | null
  tiktok_username: string | null
  follower_count: number
  astronomy_knowledge: string | null
  join_reason: string | null
  screenshot_path: string | null
  rank: string
  is_admin: boolean
}

export type Hypothesis = {
  id: string
  author_id: string
  title: string
  content: string
  category: string
  likes_count: number
  debates_count: number
  arguments_count: number
  created_at: string
  author?: {
    full_name: string
    rank: string
    contribution_hours?: number
  }
}
