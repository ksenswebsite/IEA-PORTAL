# TikTok Followers Checker

## Cara Setup

### Opsi 1: Supabase Edge Function (Recommended)

1. Deploy function:
```bash
supabase functions deploy check-tiktok-followers
```

2. Set secret di Supabase:
```bash
supabase secrets set RAPIDAPI_KEY=your_rapidapi_key
supabase secrets set RAPIDAPI_HOST=tiktok-scraper7.p.rapidapi.com
```

3. Frontend otomatis memanggil:
`POST /functions/v1/check-tiktok-followers` dengan body `{ "username": "xxx" }`

### Opsi 2: Direct RapidAPI dari frontend (hanya testing)

Tambahkan di `.env`:
```
VITE_RAPIDAPI_KEY=xxx
VITE_RAPIDAPI_HOST=tiktok-scraper7.p.rapidapi.com
```

### Provider RapidAPI yang bisa dipakai

- `tiktok-scraper7.p.rapidapi.com`
- `tiktok-api23.p.rapidapi.com`
- Cari "TikTok" di RapidAPI dan pilih yang support user info / follower count

Sesuaikan parsing response di `index.ts` kalau struktur JSON berbeda.
