// Supabase Edge Function: check-tiktok-followers
// Deploy: supabase functions deploy check-tiktok-followers
// 
// Cara kerja:
// 1. Frontend kirim { username: "xxx" }
// 2. Function ini hit RapidAPI / scraper
// 3. Return { followers: number, username: string, ... }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { username } = await req.json()

    if (!username || typeof username !== "string") {
      return new Response(
        JSON.stringify({ error: "username is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const clean = username.replace("@", "").trim().toLowerCase()

    // ============================================
    // OPTION 1: RapidAPI (Recommended)
    // Daftar di https://rapidapi.com dan cari "TikTok Scraper" / "TikTok API"
    // Contoh host yang sering dipakai: tiktok-scraper7.p.rapidapi.com / tiktok-api23.p.rapidapi.com
    // ============================================
    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY")
    const RAPIDAPI_HOST = Deno.env.get("RAPIDAPI_HOST") || "tiktok-scraper7.p.rapidapi.com"

    if (RAPIDAPI_KEY) {
      const url = `https://${RAPIDAPI_HOST}/user/info?unique_id=${encodeURIComponent(clean)}`
      
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": RAPIDAPI_HOST,
        },
      })

      if (!res.ok) {
        const text = await res.text()
        console.error("RapidAPI error:", text)
        return new Response(
          JSON.stringify({ error: "Failed to fetch from TikTok API", detail: text }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      const data = await res.json()

      // Sesuaikan path sesuai response API yang kamu pakai
      // Contoh umum:
      const followers =
        data?.data?.stats?.followerCount ??
        data?.userInfo?.stats?.followerCount ??
        data?.followerCount ??
        data?.followers ??
        null

      if (followers === null || followers === undefined) {
        return new Response(
          JSON.stringify({ error: "Could not parse follower count", raw: data }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      return new Response(
        JSON.stringify({
          username: clean,
          followers: Number(followers),
          source: "rapidapi",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // ============================================
    // OPTION 2: Fallback / Demo mode (no key)
    // ============================================
    // Untuk development tanpa API key
    const demoFollowers = Math.floor(Math.random() * 4500) + 30

    return new Response(
      JSON.stringify({
        username: clean,
        followers: demoFollowers,
        source: "demo",
        warning: "RAPIDAPI_KEY not set. Using demo data.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
