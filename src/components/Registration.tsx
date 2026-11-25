import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Loader2, CheckCircle2, ExternalLink, Download } from 'lucide-react'
import { toPng } from 'html-to-image'

type Community = {
  id: number
  name: string
  slug: string
  description: string
}

type Group = {
  id: number
  name: string
  min_followers: number
  description: string
  whatsapp_link: string | null
}

const COMMUNITIES: Community[] = [
  { id: 1, name: 'Komunitas 1', slug: 'komunitas-1', description: 'Pendaftaran utama anggota baru IEA' },
  { id: 2, name: 'Komunitas 2', slug: 'komunitas-2', description: 'Kolaborasi lanjutan & proyek bersama' },
]

const GROUPS: Record<number, Group[]> = {
  1: [
    { id: 1, name: 'IEA', min_followers: 2000, description: '2000+ followers', whatsapp_link: null },
    { id: 2, name: 'IEA 2', min_followers: 1000, description: '1000+ followers', whatsapp_link: null },
    { id: 3, name: 'IEA 3', min_followers: 50, description: '50+ followers', whatsapp_link: null },
  ],
  2: [
    { id: 4, name: 'IEA', min_followers: 2000, description: '2000+ followers', whatsapp_link: null },
    { id: 5, name: 'IEA 2', min_followers: 1000, description: '1000+ followers', whatsapp_link: null },
    { id: 6, name: 'IEA 3', min_followers: 50, description: '50+ followers', whatsapp_link: null },
  ],
}

function calcAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export default function Registration() {
  const navigate = useNavigate()
  const cardRef = useRef<HTMLDivElement>(null)

  const [step, setStep] = useState<'select' | 'form' | 'result'>('select')
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)

  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [astronomyKnowledge, setAstronomyKnowledge] = useState('')
  const [joinReason, setJoinReason] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [followerCount, setFollowerCount] = useState<number | null>(null)
  const [matchedGroup, setMatchedGroup] = useState<Group | null>(null)
  const [memberCardCode, setMemberCardCode] = useState('')

  const handleSelectCommunity = (c: Community) => {
    setSelectedCommunity(c)
    setStep('form')
    setError('')
  }

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 5MB')
      return
    }
    setScreenshot(file)
    setScreenshotPreview(URL.createObjectURL(file))
    setError('')
  }

  const checkTikTokFollowers = async (urlOrUsername: string): Promise<number> => {
    let username = urlOrUsername.trim()
    const match = username.match(/tiktok\.com\/@([^/?]+)/i)
    if (match) username = match[1]
    username = username.replace('@', '').trim()

    const rapidKey = import.meta.env.VITE_RAPIDAPI_KEY
    const rapidHost = import.meta.env.VITE_RAPIDAPI_HOST || 'tiktok-scraper7.p.rapidapi.com'

    if (!rapidKey) {
      console.warn('VITE_RAPIDAPI_KEY belum di-set. Menggunakan demo data.')
      await new Promise((r) => setTimeout(r, 1000))
      return Math.floor(Math.random() * 3500) + 40
    }

    const res = await fetch(
      `https://${rapidHost}/user/info?unique_id=${encodeURIComponent(username)}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidKey,
          'X-RapidAPI-Host': rapidHost,
        },
      }
    )

    if (!res.ok) throw new Error('Gagal mengambil data TikTok. Cek username / API key.')

    const data = await res.json()
    const followers =
      data?.data?.stats?.followerCount ??
      data?.userInfo?.stats?.followerCount ??
      data?.followerCount ??
      data?.followers

    if (typeof followers !== 'number') throw new Error('Format data follower tidak dikenali')
    return followers
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedCommunity) return
    if (fullName.trim().length < 3 || fullName.trim().length > 20) {
      setError('Nama harus 3–20 karakter')
      return
    }
    if (!birthDate) {
      setError('Tanggal lahir wajib diisi')
      return
    }
    if (calcAge(birthDate) < 12) {
      setError('Usia minimal 12 tahun')
      return
    }
    if (!tiktokUrl.trim()) {
      setError('Link profil TikTok wajib diisi')
      return
    }
    if (!screenshot) {
      setError('Screenshot profil TikTok wajib diupload')
      return
    }
    if (!whatsapp.trim()) {
      setError('Nomor WhatsApp wajib diisi')
      return
    }
    if (!astronomyKnowledge.trim()) {
      setError('Pengetahuan astronomi wajib diisi')
      return
    }
    if (!joinReason.trim()) {
      setError('Alasan bergabung wajib diisi')
      return
    }

    setLoading(true)
    try {
      const count = await checkTikTokFollowers(tiktokUrl)
      setFollowerCount(count)

      const groups = GROUPS[selectedCommunity.id] || []
      const sorted = [...groups].sort((a, b) => b.min_followers - a.min_followers)
      const matched = sorted.find((g) => count >= g.min_followers) || null
      setMatchedGroup(matched)

      const code = 'IEA-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      setMemberCardCode(code)

      // TODO: Upload ke Supabase Storage + insert DB
      setStep('result')
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses pendaftaran')
    } finally {
      setLoading(false)
    }
  }

  const downloadMemberCard = async () => {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = `IEA-MemberCard-${memberCardCode}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error(err)
      setError('Gagal mengunduh Member Card')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => {
            if (step === 'form') setStep('select')
            else if (step === 'result') setStep('form')
            else navigate('/home')
          }}
          className="p-2 rounded-lg hover:bg-white/5 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-semibold tracking-wide">Pendaftaran Komunitas</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {step === 'select' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mb-2">
              Pilih komunitas. Setiap komunitas memiliki 3 grup berdasarkan followers TikTok.
            </p>
            {COMMUNITIES.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectCommunity(c)}
                className="w-full text-left p-5 rounded-2xl bg-[#12121a] border border-white/5 hover:border-purple-500/40 transition"
              >
                <h3 className="font-semibold text-white mb-1">{c.name}</h3>
                <p className="text-sm text-gray-400">{c.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300">IEA (2000+)</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-300">IEA 2 (1000+)</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-300">IEA 3 (50+)</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 'form' && selectedCommunity && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">
              Mendaftar ke: <span className="font-semibold text-white">{selectedCommunity.name}</span>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Nama Lengkap (3–20 karakter)</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={20}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50" required />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Tanggal Lahir (minimal usia 12 tahun)</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50" required />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Link Profil TikTok</label>
              <input type="url" value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://www.tiktok.com/@username"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50" required />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Screenshot Profil TikTok</label>
              <label className="flex flex-col items-center justify-center w-full h-36 rounded-xl border border-dashed border-white/15 bg-white/5 cursor-pointer hover:border-purple-500/40 transition">
                {screenshotPreview ? (
                  <img src={screenshotPreview} alt="Preview" className="h-full object-contain rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Upload size={24} />
                    <span className="text-sm">Klik untuk upload (max 5MB)</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleScreenshot} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Nomor WhatsApp</label>
              <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="08xxxxxxxxxx"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50" required />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Pengetahuan Astronomi</label>
              <textarea value={astronomyKnowledge} onChange={(e) => setAstronomyKnowledge(e.target.value)} rows={3}
                placeholder="Ceritakan singkat pengetahuanmu tentang astronomi..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50 resize-none" required />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Alasan Bergabung</label>
              <textarea value={joinReason} onChange={(e) => setJoinReason(e.target.value)} rows={3}
                placeholder="Kenapa kamu ingin bergabung dengan IEA?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50 resize-none" required />
            </div>

            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-900/30 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Mengecek followers & memproses...</> : 'Daftar Sekarang'}
            </button>
          </form>
        )}

        {step === 'result' && selectedCommunity && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={32} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold">Pendaftaran Berhasil</h2>
              <p className="text-sm text-gray-400 mt-1">Berikut Member Card dan grup yang sesuai</p>
            </div>

            <div ref={cardRef} className="bg-gradient-to-br from-[#1a1a2e] to-[#12121a] border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs tracking-widest text-purple-400 font-medium">IEA MEMBER CARD</span>
                  <span className="text-xs text-gray-500">{memberCardCode}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{fullName}</h3>
                <p className="text-sm text-gray-400 mb-4">{selectedCommunity.name}</p>
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Grup</p>
                    <p className="font-semibold text-purple-300">{matchedGroup?.name || 'Belum memenuhi'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Followers</p>
                    <p className="font-semibold">{followerCount?.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={downloadMemberCard}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition text-sm">
              <Download size={16} /> Download Member Card
            </button>

            {matchedGroup?.whatsapp_link ? (
              <a href={matchedGroup.whatsapp_link} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 transition font-medium">
                <ExternalLink size={16} /> Gabung Grup WhatsApp ({matchedGroup.name})
              </a>
            ) : (
              <p className="text-sm text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-center">
                Link grup belum diatur admin. Tim IEA akan menghubungi via WhatsApp.
              </p>
            )}

            <button onClick={() => navigate('/home')}
              className="w-full py-3 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition">
              Kembali ke Beranda
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
