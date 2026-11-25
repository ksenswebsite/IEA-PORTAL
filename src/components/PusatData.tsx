import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Satellite, Image as ImageIcon, RefreshCw, Loader2,
  ExternalLink, MapPin, Cloud, Search
} from 'lucide-react'

type IssData = {
  latitude: number
  longitude: number
  timestamp: number
}

type ApodData = {
  title: string
  explanation: string
  url: string
  hdurl?: string
  media_type: string
  date: string
  copyright?: string
}

type WeatherData = {
  location: string
  temperature: number
  weathercode: number
  windspeed: number
  humidity?: number
  time: string
}

// WMO Weather interpretation codes (Open-Meteo)
function weatherLabel(code: number): string {
  if (code === 0) return 'Cerah'
  if (code <= 3) return 'Berawan sebagian'
  if (code <= 48) return 'Berkabut'
  if (code <= 57) return 'Gerimis'
  if (code <= 67) return 'Hujan'
  if (code <= 77) return 'Salju'
  if (code <= 82) return 'Hujan deras'
  if (code <= 86) return 'Salju deras'
  if (code <= 99) return 'Badai petir'
  return 'Tidak diketahui'
}

export default function PusatData() {
  const navigate = useNavigate()
  const [iss, setIss] = useState<IssData | null>(null)
  const [apod, setApod] = useState<ApodData | null>(null)
  const [issLoading, setIssLoading] = useState(true)
  const [apodLoading, setApodLoading] = useState(true)
  const [issError, setIssError] = useState('')
  const [apodError, setApodError] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Weather
  const [cityQuery, setCityQuery] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')

  const fetchIss = async () => {
    setIssLoading(true)
    setIssError('')
    try {
      const res = await fetch('https://api.open-notify.org/iss-now.json')
      if (!res.ok) throw new Error('Gagal mengambil data ISS')
      const data = await res.json()
      if (data.message === 'success' && data.iss_position) {
        setIss({
          latitude: parseFloat(data.iss_position.latitude),
          longitude: parseFloat(data.iss_position.longitude),
          timestamp: data.timestamp,
        })
        setLastUpdate(new Date())
      } else {
        throw new Error('Format data ISS tidak valid')
      }
    } catch (e: any) {
      setIssError(e.message || 'Gagal memuat posisi ISS')
    } finally {
      setIssLoading(false)
    }
  }

  const fetchApod = async () => {
    setApodLoading(true)
    setApodError('')
    try {
      const key = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'
      const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${key}`)
      if (!res.ok) throw new Error('Gagal mengambil data NASA APOD')
      const data = await res.json()
      if (data.error) throw new Error(data.error.message || 'Error dari NASA API')
      setApod(data)
    } catch (e: any) {
      setApodError(e.message || 'Gagal memuat Astronomy Picture of the Day')
    } finally {
      setApodLoading(false)
    }
  }

  const fetchWeather = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const q = cityQuery.trim()
    if (!q) {
      setWeatherError('Masukkan nama daerah / kota')
      return
    }

    setWeatherLoading(true)
    setWeatherError('')
    setWeather(null)

    try {
      // 1. Geocoding (Open-Meteo)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=id&format=json`
      )
      if (!geoRes.ok) throw new Error('Gagal mencari lokasi')
      const geoData = await geoRes.json()

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('Daerah tidak ditemukan. Coba nama kota lain.')
      }

      const place = geoData.results[0]
      const lat = place.latitude
      const lon = place.longitude
      const label = [place.name, place.admin1, place.country].filter(Boolean).join(', ')

      // 2. Current weather
      const wRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
      )
      if (!wRes.ok) throw new Error('Gagal mengambil data cuaca')
      const wData = await wRes.json()
      const cur = wData.current

      setWeather({
        location: label,
        temperature: cur.temperature_2m,
        weathercode: cur.weather_code,
        windspeed: cur.wind_speed_10m,
        humidity: cur.relative_humidity_2m,
        time: cur.time,
      })
    } catch (err: any) {
      setWeatherError(err.message || 'Gagal memuat cuaca')
    } finally {
      setWeatherLoading(false)
    }
  }

  useEffect(() => {
    fetchIss()
    fetchApod()
    const interval = setInterval(fetchIss, 10000)
    return () => clearInterval(interval)
  }, [])

  const mapUrl = iss
    ? `https://www.google.com/maps?q=${iss.latitude},${iss.longitude}&z=3`
    : null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-10">
      <header className="sticky top-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/home')} className="p-2 rounded-lg hover:bg-white/5 transition">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-semibold tracking-wide">Pusat Data</h1>
          <p className="text-xs text-gray-500">ISS · NASA APOD · Cuaca</p>
        </div>
        <button
          onClick={() => { fetchIss(); fetchApod() }}
          className="ml-auto p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* ===== ISS ===== */}
        <section className="bg-[#12121a] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
              <Satellite size={20} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="font-semibold">Posisi ISS Real-time</h2>
              <p className="text-xs text-gray-500">Open Notify API</p>
            </div>
          </div>
          <div className="p-5">
            {issLoading && !iss ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-cyan-400" size={28} /></div>
            ) : issError && !iss ? (
              <p className="text-sm text-red-400 text-center py-6">{issError}</p>
            ) : iss ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Latitude</p>
                    <p className="font-mono text-lg text-cyan-300">{iss.latitude.toFixed(4)}°</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Longitude</p>
                    <p className="font-mono text-lg text-cyan-300">{iss.longitude.toFixed(4)}°</p>
                  </div>
                </div>
                {lastUpdate && (
                  <p className="text-xs text-gray-500 text-center">
                    Update terakhir: {lastUpdate.toLocaleTimeString('id-ID')}
                  </p>
                )}
                {mapUrl && (
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 text-sm hover:bg-cyan-600/30 transition">
                    <MapPin size={16} /> Lihat di Peta <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ) : null}
          </div>
        </section>

        {/* ===== CUACA ===== */}
        <section className="bg-[#12121a] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
              <Cloud size={20} className="text-sky-400" />
            </div>
            <div>
              <h2 className="font-semibold">Cek Cuaca</h2>
              <p className="text-xs text-gray-500">Open-Meteo · cari nama daerah</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <form onSubmit={fetchWeather} className="flex gap-2">
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="Contoh: Jakarta, Bandung, Surabaya..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-sky-500/50"
              />
              <button
                type="submit"
                disabled={weatherLoading}
                className="px-4 rounded-xl bg-sky-600 hover:bg-sky-500 transition disabled:opacity-50 flex items-center gap-1.5 text-sm font-medium"
              >
                {weatherLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Cari
              </button>
            </form>

            {weatherError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{weatherError}</p>
            )}

            {weather && (
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <p className="text-sm text-gray-400">{weather.location}</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-sky-300">{Math.round(weather.temperature)}°</span>
                  <span className="text-sm text-gray-400 pb-1">C · {weatherLabel(weather.weathercode)}</span>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Angin {weather.windspeed} km/h</span>
                  {weather.humidity != null && <span>Kelembaban {weather.humidity}%</span>}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===== NASA APOD ===== */}
        <section className="bg-[#12121a] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <ImageIcon size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold">NASA APOD</h2>
              <p className="text-xs text-gray-500">Astronomy Picture of the Day</p>
            </div>
          </div>
          <div className="p-5">
            {apodLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-purple-400" size={28} /></div>
            ) : apodError ? (
              <p className="text-sm text-red-400 text-center py-6">{apodError}</p>
            ) : apod ? (
              <div className="space-y-4">
                {apod.media_type === 'image' ? (
                  <a href={apod.hdurl || apod.url} target="_blank" rel="noopener noreferrer">
                    <img src={apod.url} alt={apod.title} className="w-full rounded-xl object-cover max-h-72" />
                  </a>
                ) : apod.media_type === 'video' ? (
                  <div className="aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe src={apod.url} title={apod.title} className="w-full h-full" allowFullScreen />
                  </div>
                ) : null}
                <div>
                  <h3 className="font-semibold text-white leading-snug">{apod.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {apod.date}{apod.copyright && ` · © ${apod.copyright}`}
                  </p>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-6">{apod.explanation}</p>
                {(apod.hdurl || apod.url) && (
                  <a href={apod.hdurl || apod.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm hover:bg-purple-600/30 transition">
                    Buka resolusi tinggi <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ) : null}
          </div>
        </section>

        <p className="text-center text-xs text-gray-600">
          ISS: Open Notify · Cuaca: Open-Meteo · APOD: NASA
        </p>
      </div>
    </div>
  )
}
