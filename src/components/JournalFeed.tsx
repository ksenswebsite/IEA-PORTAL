import { useState, useEffect } from 'react'
import { Heart, MessageCircle, CornerUpLeft, Send, Plus, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

type Post = {
  id: string
  author: string
  rank: string
  hours: number
  title: string
  content: string
  likes: number
  debates: number
  arguments: number
  created_at?: string
}

export default function JournalFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showCompose, setShowCompose] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('hypotheses')
        .select(`
          id, title, content, likes_count, debates_count, arguments_count, created_at,
          author:profiles ( full_name, rank, contribution_hours )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(30)

      if (error) {
        console.warn('Supabase hypotheses error (mungkin tabel belum ada):', error.message)
        // Fallback mock biar UI tetap kelihatan
        setPosts([
          {
            id: '1',
            author: 'ZELVEN AL FARIZ',
            rank: 'Novice Researcher',
            hours: 100,
            title: 'Hipotesis Baru',
            content: '',
            likes: 0,
            debates: 0,
            arguments: 0,
          },
          {
            id: '2',
            author: 'Rangzz',
            rank: 'Novice Researcher',
            hours: 173,
            title: 'Hipotesis Baru',
            content: 'halo semua',
            likes: 0,
            debates: 0,
            arguments: 0,
          },
        ])
      } else if (data) {
        setPosts(
          data.map((row: any) => ({
            id: row.id,
            author: row.author?.full_name || 'Anonim',
            rank: row.author?.rank || 'Novice Researcher',
            hours: row.author?.contribution_hours || 0,
            title: row.title,
            content: row.content,
            likes: row.likes_count || 0,
            debates: row.debates_count || 0,
            arguments: row.arguments_count || 0,
            created_at: row.created_at,
          }))
        )
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!newTitle.trim() || !newContent.trim()) return
    setSubmitting(true)
    try {
      // Sementara local only (butuh auth user real untuk insert)
      const temp: Post = {
        id: crypto.randomUUID(),
        author: 'Kamu',
        rank: 'Novice Researcher',
        hours: 0,
        title: newTitle.trim(),
        content: newContent.trim(),
        likes: 0,
        debates: 0,
        arguments: 0,
      }
      setPosts((prev) => [temp, ...prev])
      setNewTitle('')
      setNewContent('')
      setShowCompose(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-28">
      {/* Header - mirip IEA NETWORK lama */}
      <header className="sticky top-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-wide text-blue-400">IEA NETWORK</h1>
        <div className="flex gap-2 text-gray-400 text-sm">
          <button onClick={loadPosts} className="p-1.5 hover:text-white transition" title="Refresh">
            ↻
          </button>
        </div>
      </header>

      {/* Feed */}
      <div className="max-w-lg mx-auto px-3 pt-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-purple-400" size={28} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>Belum ada hipotesis.</p>
            <p className="text-sm mt-1">Jadilah yang pertama menulis.</p>
          </div>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="bg-[#12121a] border border-white/5 rounded-2xl p-4 shadow-lg shadow-black/20"
            >
              {/* Author row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <span className="text-lg">👤</span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm tracking-wide truncate">{post.author}</p>
                  <p className="text-xs text-gray-400">
                    {post.rank} • {post.hours}hr
                  </p>
                </div>
              </div>

              {/* Title bar - style lama */}
              <div className="bg-blue-900/35 border-l-2 border-blue-400 rounded-r-lg px-3 py-2 mb-2">
                <p className="text-sm text-blue-100 font-medium">"{post.title}"</p>
              </div>

              {/* Content */}
              {post.content && (
                <p className="text-sm text-gray-300 mb-3 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              )}

              {/* Stats */}
              <div className="flex gap-4 text-xs text-gray-500 mb-3">
                <span>{post.likes} Apresiasi</span>
                <span>{post.arguments} Argumen</span>
              </div>

              {/* Actions - Like / Debat / Bantah */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition">
                  <Heart size={15} /> Like
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition">
                  <MessageCircle size={15} /> Debat
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition">
                  <CornerUpLeft size={15} /> Bantah
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Compose overlay */}
      {showCompose && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12121a] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold">Tulis Hipotesis</h3>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Judul hipotesis..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Uraikan hipotesis atau gagasanmu..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCompose(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !newTitle.trim() || !newContent.trim()}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Kirim'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar - mirip lama */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d14]/95 backdrop-blur-lg border-t border-white/5">
        <div className="max-w-lg mx-auto px-3 py-2.5 flex items-center gap-2">
          <button
            onClick={() => setShowCompose(true)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={() => setShowCompose(true)}
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-left text-gray-500"
          >
            Tulis Hipotesis...
          </button>
          <button
            onClick={() => setShowCompose(true)}
            className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-400 transition"
          >
            <Send size={16} />
          </button>
        </div>

        <nav className="flex justify-around py-2 border-t border-white/5 text-xs">
          <button className="flex flex-col items-center gap-0.5 text-blue-400">
            <span className="text-base">🏠</span> HOME
          </button>
          <button className="flex flex-col items-center gap-0.5 text-gray-500">
            <span className="text-base">🔥</span> TREND
          </button>
          <button className="flex flex-col items-center gap-0.5 text-gray-500">
            <span className="text-base">🔔</span> NOTIF
          </button>
          <button className="flex flex-col items-center gap-0.5 text-gray-500">
            <span className="text-base">👤</span> AKUN
          </button>
        </nav>
      </div>
    </div>
  )
}
