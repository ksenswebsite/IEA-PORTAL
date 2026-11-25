# Keamanan IEA Portal

## Yang TIDAK boleh dilakukan
- Jangan pernah taruh Service Role Key di frontend / Vite env
- Jangan expose RAPIDAPI_KEY atau scraper internal key di client
- Semua operasi sensitif (approve, ganti link grup, buka/tutup gerbang) harus lewat user yang is_admin = true + RLS

## Yang sudah diterapkan di schema
- Row Level Security (RLS) aktif di semua tabel penting
- User hanya bisa insert/update data miliknya sendiri
- Hanya admin yang bisa update registration_settings dan groups.whatsapp_link
- Member card code di-generate server-side (trigger)
- Screenshot disimpan di Supabase Storage (bucket private), akses pakai signed URL

## Storage
1. Buat bucket bernama `screenshots` (Public: OFF)
2. Policy contoh:
   - INSERT: auth.uid() = folder name (path = `{user_id}/{filename}`)
   - SELECT: hanya owner atau admin

## Admin Password
- Admin login pakai Supabase Auth biasa
- Ganti password lewat supabase.auth.updateUser({ password: '...' })
- Jangan hardcode password di kode

## Scraper / Follower API
- Jalankan scraper sebagai service terpisah (bukan di browser user)
- Frontend hanya memanggil endpoint yang kamu kontrol
- Jangan expose credentials scraper ke client
