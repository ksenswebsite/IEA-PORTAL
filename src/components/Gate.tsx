import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Gate() {
  const [agreed, setAgreed] = useState(false)
  const navigate = useNavigate()

  const handleEnter = () => {
    if (!agreed) return
    localStorage.setItem('iea_gate_passed', '1')
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-transparent to-orange-950/20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-[#12121a]/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-900/20">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-orange-500 p-[2px]">
              <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center">
                <span className="text-2xl font-bold tracking-wider text-white">IEA</span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs tracking-[0.2em] text-orange-400 font-medium mb-2">
            GERBANG MASUK KOMUNITAS
          </p>

          <h1 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3 leading-tight">
            INTERNATIONAL<br />EDUCATION ASTRONOMY
          </h1>

          <p className="text-center text-sm text-gray-400 mb-8 leading-relaxed">
            Akses pendaftaran anggota, informasi astronomi, telemetri antariksa, jurnal ilmiah, dan jejaring observatorium.
          </p>

          <div className="space-y-5 mb-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <span className="text-purple-400 text-lg">◎</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">01. NAVIGASI TERPUSAT</p>
                <p className="text-xs text-gray-400 mt-0.5">Pilih pendaftaran komunitas, pusat informasi, atau ruang riset dari menu utama.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <span className="text-purple-400 text-lg">🔭</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">02. DATA DAN OBSERVASI</p>
                <p className="text-xs text-gray-400 mt-0.5">Pantau posisi satelit ISS, baca jurnal ilmiah, dan bagikan pengamatan langit malam.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <span className="text-green-400 text-lg">🛡️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">03. ETIKA ILMIAH</p>
                <p className="text-xs text-gray-400 mt-0.5">Jaga diskusi tetap sopan, ilmiah berbasis data, dan saling menghormati antar anggota.</p>
              </div>
            </div>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-purple-500/40 transition-colors mb-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-purple-500"
            />
            <span className="text-sm text-gray-300 leading-snug">
              SAYA MEMAHAMI PANDUAN DAN SIAP MEMASUKI PORTAL IEA
            </span>
          </label>

          <button
            onClick={handleEnter}
            disabled={!agreed}
            className={`w-full py-3.5 rounded-xl font-semibold tracking-wide transition-all ${
              agreed
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-900/40 hover:from-purple-500 hover:to-violet-500'
                : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
            }`}
          >
            MASUK PORTAL
          </button>
        </div>
      </div>
    </div>
  )
}
