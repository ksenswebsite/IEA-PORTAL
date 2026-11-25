import { useState, useEffect } from 'react'
// navigate unused
import {
  Lock, LogOut, Settings, Users, Link2, ToggleLeft, ToggleRight,
  Key, Save, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react'

type Group = {
  id: number
  community_id: number
  name: string
  min_followers: number
  whatsapp_link: string | null
  community_name?: string
}

type Membership = {
  id: string
  full_name: string
  community: string
  group: string
  follower_count: number
  whatsapp: string
  created_at: string
  member_card_code: string
}

// Mock data sementara (nanti diganti Supabase)
const MOCK_GROUPS: Group[] = [
  { id: 1, community_id: 1, name: 'IEA', min_followers: 2000, whatsapp_link: null, community_name: 'Komunitas 1' },
  { id: 2, community_id: 1, name: 'IEA 2', min_followers: 1000, whatsapp_link: null, community_name: 'Komunitas 1' },
  { id: 3, community_id: 1, name: 'IEA 3', min_followers: 50, whatsapp_link: null, community_name: 'Komunitas 1' },
  { id: 4, community_id: 2, name: 'IEA', min_followers: 2000, whatsapp_link: null, community_name: 'Komunitas 2' },
  { id: 5, community_id: 2, name: 'IEA 2', min_followers: 1000, whatsapp_link: null, community_name: 'Komunitas 2' },
  { id: 6, community_id: 2, name: 'IEA 3', min_followers: 50, whatsapp_link: null, community_name: 'Komunitas 2' },
]

export default function AdminPanel() {
  // const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Panel state
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'members' | 'settings'>('overview')
  const [gateOpen, setGateOpen] = useState(true)
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS)
  const [members] = useState<Membership[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Change password
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')

  useEffect(() => {
    // Cek session sederhana
    const session = localStorage.getItem('iea_admin_session')
    if (session === '1') setIsLoggedIn(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      // TODO: Panggil Supabase RPC verify_admin_login
      // Sementara hardcode default untuk development
      if (username === 'admin' && password === 'iea2026admin') {
        localStorage.setItem('iea_admin_session', '1')
        setIsLoggedIn(true)
      } else {
        setLoginError('Username atau password salah')
      }
    } catch {
      setLoginError('Gagal login')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('iea_admin_session')
    setIsLoggedIn(false)
    setUsername('')
    setPassword('')
  }

  const toggleGate = async () => {
    setSaving(true)
    // TODO: Update registration_settings di Supabase
    setGateOpen(!gateOpen)
    setMessage({ type: 'success', text: `Gerbang pendaftaran ${!gateOpen ? 'dibuka' : 'ditutup'}` })
    setSaving(false)
    setTimeout(() => setMessage(null), 2500)
  }

  const updateGroupLink = (id: number, link: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, whatsapp_link: link || null } : g))
    )
  }

  const saveGroupLinks = async () => {
    setSaving(true)
    // TODO: Update groups.whatsapp_link di Supabase
    await new Promise((r) => setTimeout(r, 800))
    setMessage({ type: 'success', text: 'Link grup berhasil disimpan' })
    setSaving(false)
    setTimeout(() => setMessage(null), 2500)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass.length < 6) {
      setMessage({ type: 'error', text: 'Password baru minimal 6 karakter' })
      return
    }
    if (newPass !== confirmPass) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok' })
      return
    }

    setSaving(true)
    // TODO: Panggil change_admin_password RPC
    if (oldPass !== 'iea2026admin') {
      setMessage({ type: 'error', text: 'Password lama salah' })
      setSaving(false)
      return
    }

    setMessage({ type: 'success', text: 'Password berhasil diganti (simulasi)' })
    setOldPass('')
    setNewPass('')
    setConfirmPass('')
    setSaving(false)
    setTimeout(() => setMessage(null), 2500)
  }

  // ========== LOGIN SCREEN ==========
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/15 flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-purple-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-gray-400 mt-1">IEA Portal</p>
          </div>

          <form onSubmit={handleLogin} className="bg-[#12121a] border border-white/5 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white outline-none focus:border-purple-500/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl font-semibold bg-purple-600 hover:bg-purple-500 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loginLoading ? <Loader2 size={18} className="animate-spin" /> : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-6">
            Default: admin / iea2026admin
          </p>
        </div>
      </div>
    )
  }

  // ========== ADMIN DASHBOARD ==========
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Settings size={16} className="text-purple-400" />
          </div>
          <h1 className="font-semibold">Admin Panel</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <LogOut size={16} /> Keluar
        </button>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/5 px-4">
        <div className="flex gap-1 max-w-3xl mx-auto overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Settings },
            { id: 'groups', label: 'Link Grup', icon: Link2 },
            { id: 'members', label: 'Anggota', icon: Users },
            { id: 'settings', label: 'Keamanan', icon: Key },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message toast */}
      {message && (
        <div className={`mx-4 mt-4 max-w-3xl mx-auto px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-[#12121a] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold mb-1">Gerbang Pendaftaran</h2>
                  <p className="text-sm text-gray-400">
                    Status: {gateOpen ? (
                      <span className="text-green-400">Terbuka</span>
                    ) : (
                      <span className="text-red-400">Tertutup</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={toggleGate}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
                >
                  {gateOpen ? (
                    <><ToggleRight size={22} className="text-green-400" /> Tutup</>
                  ) : (
                    <><ToggleLeft size={22} className="text-gray-400" /> Buka</>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#12121a] border border-white/5 rounded-2xl p-5">
                <p className="text-sm text-gray-400 mb-1">Total Anggota</p>
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
              <div className="bg-[#12121a] border border-white/5 rounded-2xl p-5">
                <p className="text-sm text-gray-400 mb-1">Grup Aktif</p>
                <p className="text-2xl font-bold">{groups.filter(g => g.whatsapp_link).length}/6</p>
              </div>
            </div>
          </div>
        )}

        {/* GROUPS / LINK WHATSAPP */}
        {activeTab === 'groups' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 mb-2">
              Atur link WhatsApp untuk setiap grup. Kosongkan jika belum siap.
            </p>

            {groups.map((g) => (
              <div key={g.id} className="bg-[#12121a] border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{g.community_name} — {g.name}</p>
                    <p className="text-xs text-gray-500">{g.min_followers}+ followers</p>
                  </div>
                </div>
                <input
                  type="url"
                  value={g.whatsapp_link || ''}
                  onChange={(e) => updateGroupLink(g.id, e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500/50"
                />
              </div>
            ))}

            <button
              onClick={saveGroupLinks}
              disabled={saving}
              className="w-full py-3 rounded-xl font-semibold bg-purple-600 hover:bg-purple-500 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={16} /> Simpan Semua Link</>}
            </button>
          </div>
        )}

        {/* MEMBERS */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            {members.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users size={40} className="mx-auto mb-3 opacity-40" />
                <p>Belum ada anggota terdaftar</p>
                <p className="text-sm mt-1">Data akan muncul setelah ada yang mendaftar</p>
              </div>
            ) : (
              members.map((m) => (
                <div key={m.id} className="bg-[#12121a] border border-white/5 rounded-2xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{m.full_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{m.community} · {m.group}</p>
                    </div>
                    <span className="text-xs text-gray-500">{m.member_card_code}</span>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-gray-500">
                    <span>{m.follower_count.toLocaleString()} followers</span>
                    <span>{m.whatsapp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SETTINGS / CHANGE PASSWORD */}
        {activeTab === 'settings' && (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <h2 className="font-semibold mb-2">Ganti Password Admin</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password Lama</label>
              <input
                type="password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password Baru</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl font-semibold bg-purple-600 hover:bg-purple-500 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : 'Ganti Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
