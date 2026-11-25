# IEA Portal v2

Upgrade dari xzam730.github.io/PORTAL-IEA  
Desain baru + fungsi diperbaiki + Supabase.

## Fitur yang sudah ada
- Gerbang masuk
- Pendaftaran (usia 12+, TikTok, screenshot, Member Card download)
- Klasifikasi grup: IEA (2000+) / IEA 2 (1000+) / IEA 3 (50+)
- Jurnal / IEA Network (layout feed lama)
- Admin Panel (buka/tutup gerbang, link WhatsApp, ganti password)
- Schema Supabase lengkap

## Cara Deploy ke Vercel

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "IEA Portal v2"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

### 2. Import di Vercel
- Buka vercel.com → Add New Project
- Import repo GitHub di atas
- Framework: Vite
- Root: biarkan default

### 3. Environment Variables (di Vercel → Settings → Environment Variables)
Tambahkan:

VITE_SUPABASE_URL = https://wtvlshazqtkykihqggao.supabase.co
VITE_SUPABASE_ANON_KEY = sb_publishable_BNETJ0aRyZ2NkyiCkl3nwQ_GyKQrNyF
VITE_NASA_API_KEY = D9Nw7nFB6rmLwBWJNnkhjDGFFCj8fH6bLmMw6FMP
VITE_RAPIDAPI_KEY = (isi nanti)
VITE_RAPIDAPI_HOST = tiktok-scraper7.p.rapidapi.com

Centang Production + Preview + Development → Save → Redeploy.

### 4. Supabase
1. Buka SQL Editor di project Supabase
2. Copy seluruh isi `supabase/schema.sql` → Run
3. Storage → New bucket → nama: `screenshots` → Public OFF

### Default Admin
Username: admin  
Password: iea2026admin  
**Ganti segera** setelah login.

## Local Development
```bash
npm install
npm run dev
```
