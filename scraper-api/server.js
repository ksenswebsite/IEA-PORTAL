/**
 * IEA TikTok Followers Scraper API
 * Based on: https://github.com/XZEERH/KumpulanScraper/blob/main/scrape-ttstalk.js
 *
 * Usage:
 *   POST /check   { "username": "mrbeast" }
 *   GET  /check?username=mrbeast
 *
 * Response:
 *   { "ok": true, "username": "mrbeast", "followers": 123456, "name": "...", ... }
 */

import express from 'express'
import cors from 'cors'
import { chromium } from 'playwright-core'
import fs from 'fs'
import path from 'path'
import os from 'os'

const app = express()
const PORT = process.env.PORT || 3100

app.use(cors())
app.use(express.json())

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'

function findChromium() {
  const candidates = [
    process.env.TTSTALK_CHROME_PATH,
    process.env.CHROME_PATH,
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/snap/bin/chromium',
    path.join(os.homedir(), '.cache', 'ms-playwright', 'chromium-1248', 'chrome-linux', 'chrome'),
  ].filter(Boolean)

  for (const p of candidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return p
    } catch {}
  }
  try {
    return chromium.executablePath()
  } catch {}
  return null
}

function num(v) {
  if (v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function extractUserData(json) {
  const scope = json?.__DEFAULT_SCOPE__
  const detail = scope?.['webapp.user-detail']
  if (!detail) return null
  return detail.userInfo || null
}

async function scrapeTikTokUsername(username) {
  const clean = username.replace(/^@/, '').trim()
  if (!clean) throw new Error('Username kosong')

  const exe = findChromium()
  if (!exe) {
    throw new Error(
      'Chromium/Chrome tidak ditemukan. Install chromium atau set TTSTALK_CHROME_PATH / CHROME_PATH'
    )
  }

  const browser = await chromium.launch({
    executablePath: exe,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
    ],
  })

  try {
    const context = await browser.newContext({
      userAgent: UA,
      viewport: { width: 1280, height: 850 },
      locale: 'en-US',
      timezoneId: 'Asia/Jakarta',
    })

    // Block image/font biar lebih cepat
    await context.route('**/*', (route) => {
      const type = route.request().resourceType()
      if (type === 'image' || type === 'media' || type === 'font') return route.abort()
      return route.continue()
    })

    const page = await context.newPage()

    await page.goto(`https://www.tiktok.com/@${encodeURIComponent(clean)}`, {
      waitUntil: 'commit',
      timeout: 45000,
    })

    // Tunggu data rehydration muncul
    let userInfo = null
    const deadline = Date.now() + 35000

    while (Date.now() < deadline) {
      const data = await page
        .evaluate(() => {
          const el = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__')
          if (!el) return null
          try {
            return JSON.parse(el.textContent)
          } catch {
            return null
          }
        })
        .catch(() => null)

      if (data) {
        userInfo = extractUserData(data)
        if (userInfo) break
      }
      await new Promise((r) => setTimeout(r, 800))
    }

    await page.close()
    await context.close()

    if (!userInfo || !userInfo.user) {
      return { ok: false, error: 'Akun tidak ditemukan atau data gagal dimuat' }
    }

    const user = userInfo.user
    const stats = userInfo.stats || userInfo.statsV2 || {}

    return {
      ok: true,
      username: user.uniqueId || clean,
      name: user.nickname || null,
      followers: num(stats.followerCount),
      following: num(stats.followingCount),
      likes: num(stats.heartCount ?? stats.heart),
      videos: num(stats.videoCount),
      verified: !!user.verified,
      private: !!user.privateAccount,
      bio: user.signature || null,
      profile_url: `https://www.tiktok.com/@${user.uniqueId || clean}`,
      avatar: user.avatarLarger || user.avatarMedium || null,
    }
  } finally {
    await browser.close().catch(() => {})
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'IEA TikTok Followers Scraper',
    endpoints: {
      'POST /check': '{ "username": "xxx" }',
      'GET /check?username=xxx': 'query string',
    },
  })
})

app.get('/check', async (req, res) => {
  const username = req.query.username
  if (!username) {
    return res.status(400).json({ ok: false, error: 'username required' })
  }
  try {
    const result = await scrapeTikTokUsername(String(username))
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: err.message || 'Internal error' })
  }
})

app.post('/check', async (req, res) => {
  const username = req.body?.username
  if (!username) {
    return res.status(400).json({ ok: false, error: 'username required' })
  }
  try {
    const result = await scrapeTikTokUsername(String(username))
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: err.message || 'Internal error' })
  }
})

app.listen(PORT, () => {
  console.log(`IEA TikTok Scraper running on http://localhost:${PORT}`)
})
