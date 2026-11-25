import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Gate from './components/Gate'
import JournalFeed from './components/JournalFeed'
import Registration from './components/Registration'
import AdminPanel from './components/AdminPanel'
import PusatData from './components/PusatData'

function HomePlaceholder() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-purple-600 to-orange-500 flex items-center justify-center text-xs font-bold">
            IEA
          </div>
          <span className="font-semibold tracking-wide">IEA PORTAL</span>
        </div>
        <a
          href="/admin"
          className="px-3 py-1.5 rounded-lg border border-purple-500/40 text-purple-400 text-sm hover:bg-purple-500/10 transition"
        >
          ADMIN
        </a>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <p className="text-xs tracking-widest text-gray-500 mb-1">DIREKTORI MODUL</p>
        <h1 className="text-2xl font-bold mb-6 leading-tight">
          AKSES LAYANAN<br />KOMUNITAS
        </h1>

        <div className="space-y-3">
          <a href="/pendaftaran" className="block p-4 rounded-2xl bg-[#12121a] border border-white/5 hover:border-purple-500/40 transition">
            <p className="text-xs text-green-400 mb-1">DIVISI 1 · DIBUKA</p>
            <p className="font-semibold">Pendaftaran Komunitas 1</p>
            <p className="text-xs text-gray-400 mt-1">Gerbang registrasi anggota utama + kartu anggota digital</p>
          </a>

          <a href="/pendaftaran" className="block p-4 rounded-2xl bg-[#12121a] border border-white/5 hover:border-purple-500/40 transition">
            <p className="text-xs text-green-400 mb-1">DIVISI 2 · DIBUKA</p>
            <p className="font-semibold">Pendaftaran Komunitas 2</p>
            <p className="text-xs text-gray-400 mt-1">Registrasi kolaborasi lanjutan untuk tim proyek & riset</p>
          </a>

          <a href="/jurnal" className="block p-4 rounded-2xl bg-[#12121a] border border-white/5 hover:border-purple-500/40 transition">
            <p className="text-xs text-purple-400 mb-1">ILMIAH</p>
            <p className="font-semibold">Jurnal / IEA Network</p>
            <p className="text-xs text-gray-400 mt-1">Feed hipotesis, debat, dan diskusi ilmiah</p>
          </a>

          <a href="/pusat-data" className="block p-4 rounded-2xl bg-[#12121a] border border-white/5 hover:border-cyan-500/40 transition">
            <p className="text-xs text-cyan-400 mb-1">LIVE DATA</p>
            <p className="font-semibold">Pusat Data</p>
            <p className="text-xs text-gray-400 mt-1">Posisi ISS real-time & NASA Astronomy Picture of the Day</p>
          </a>

          <a href="/admin" className="block p-4 rounded-2xl bg-[#12121a] border border-white/5 hover:border-white/20 transition">
            <p className="text-xs text-gray-500 mb-1">SISTEM</p>
            <p className="font-semibold">Admin Panel</p>
            <p className="text-xs text-gray-400 mt-1">Kelola gerbang, link grup, anggota, password</p>
          </a>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const gatePassed = typeof window !== 'undefined' && localStorage.getItem('iea_gate_passed') === '1'

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={gatePassed ? <Navigate to="/home" replace /> : <Gate />} />
        <Route path="/home" element={<HomePlaceholder />} />
        <Route path="/pendaftaran" element={<Registration />} />
        <Route path="/jurnal" element={<JournalFeed />} />
        <Route path="/pusat-data" element={<PusatData />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
