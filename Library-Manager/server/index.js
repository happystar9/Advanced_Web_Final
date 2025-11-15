import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'

const app = express()
app.use(cors())

// Simple request logger to help diagnose routing / 404 issues
app.use((req, res, next) => {
  try {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`)
  } catch (e) {
    // ignore logging errors
  }
  next()
})

// Load .env from the server directory (so running from repo root still works)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })

// Helper: convert legacy SteamID (STEAM_X:Y:Z) to Steam64 (as string).
function steam2To64(steam2) {
  if (!steam2 || typeof steam2 !== 'string') return null
  const m = steam2.match(/^STEAM_[0-5]?:([01]):(\d+)$/i)
  if (!m) return null
  const Y = BigInt(Number(m[1]))
  const Z = BigInt(Number(m[2]))
  const base = 76561197960265728n
  return (base + Z * 2n + Y).toString()
}

const PORT = process.env.PORT || 3001
const KEY = process.env.STEAM_API_KEY

if (!KEY) {
  console.warn('Warning: STEAM_API_KEY is not set. Requests will fail until you set it.')
} else {
  console.log('STEAM_API_KEY loaded from environment')
}

app.get('/api/steam/player/:steamid', async (req, res) => {
  const { steamid } = req.params
  if (!KEY) return res.status(500).json({ error: 'STEAM_API_KEY not configured' })
  try {
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${KEY}&steamids=${encodeURIComponent(
      steamid,
    )}`
    const r = await fetch(url)
    const json = await r.json()
    res.json(json)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.get('/api/steam/resolve/:vanity', async (req, res) => {
  const { vanity } = req.params
  if (!KEY) return res.status(500).json({ error: 'STEAM_API_KEY not configured' })
  try {
    const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${KEY}&vanityurl=${encodeURIComponent(
      vanity,
    )}`
    const r = await fetch(url)
    const json = await r.json()
    res.json(json)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// Proxy GetOwnedGames
app.get('/api/steam/owned/:steamid', async (req, res) => {
  const { steamid } = req.params
  if (!KEY) return res.status(500).json({ error: 'STEAM_API_KEY not configured' })
  // support optional query params include_appinfo and include_played_free_games (0/1)
  const include_appinfo = req.query.include_appinfo ? 1 : 0
  const include_played_free_games = req.query.include_played_free_games ? 1 : 0
  try {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${KEY}&steamid=${encodeURIComponent(
      steamid,
    )}&include_appinfo=${include_appinfo}&include_played_free_games=${include_played_free_games}&format=json`
    const r = await fetch(url)
    const json = await r.json()
    // Optionally filter out hidden appids listed in STEAM_HIDDEN_APPIDS env (comma-separated)
    // Example: STEAM_HIDDEN_APPIDS=570,440
    const hiddenEnv = process.env.STEAM_HIDDEN_APPIDS
    if (hiddenEnv && json && json.response && Array.isArray(json.response.games)) {
      try {
        const hiddenSet = new Set(hiddenEnv.split(',').map((s) => s.trim()))
        json.response.games = json.response.games.filter((g) => {
          const id = String(g.appid ?? '')
          return !hiddenSet.has(id)
        })
      } catch (e) {
        // ignore parse errors, return original list
      }
    }
    res.json(json)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// Get game schema (achievements + stats metadata)
app.get('/api/steam/schema/:appid', async (req, res) => {
  const { appid } = req.params
  if (!KEY) return res.status(500).json({ error: 'STEAM_API_KEY not configured' })
  if (!appid) return res.status(400).json({ error: 'appid required' })
  try {
    const url = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${KEY}&appid=${encodeURIComponent(
      appid,
    )}`
    const r = await fetch(url)
    const json = await r.json()
    res.json(json)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// Get player achievements for an app. Provide ?steamid= or the server will fall back to STEAM_OWNER_STEAMID / cached owner.
app.get('/api/steam/playerachievements/:appid', async (req, res) => {
  try {
    const { appid } = req.params
    if (!appid) return res.status(400).json({ error: 'appid required' })
    const qSteamid = req.query.steamid
    const steamid = qSteamid || process.env.STEAM_OWNER_STEAMID || cachedOwnerSteamId
    if (!steamid) return res.status(400).json({ error: 'steamid query or STEAM_OWNER_STEAMID required' })
    if (!KEY) return res.status(500).json({ error: 'STEAM_API_KEY not configured' })

    const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${KEY}&appid=${encodeURIComponent(
      appid,
    )}&steamid=${encodeURIComponent(String(steamid))}`
    const r = await fetch(url)
    const json = await r.json()

    // If Steam indicates the profile or stats are not available, include helpful debug info
    if (json && json.playerstats && json.playerstats.success === false) {
      console.warn('Steam GetPlayerAchievements returned failure:', json.playerstats)
      // Echo helpful context to the caller to aid debugging
      return res.status(200).json({
        playerstats: json.playerstats,
        debug: {
          requestedSteamId: String(steamid),
          requestedAppId: String(appid),
          steamApiUrl: url,
        },
      })
    }

    res.json(json)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

let cachedOwnerSteamId = null
app.get('/api/steam/me', async (req, res) => {
  try {
    // Allow ad-hoc testing via query params (useful in dev):
    // /api/steam/me?steamid=7656119... or /api/steam/me?vanity=someName
    const qSteamid = req.query.steamid
    const qVanity = req.query.vanity
    if (qSteamid) {
      const s = String(qSteamid)
      const converted = s.startsWith('STEAM_') ? steam2To64(s) : s
      return res.json({ steamid: converted })
    }
    if (qVanity) {
      if (!KEY) return res.status(500).json({ error: 'STEAM_API_KEY not configured' })
      const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${KEY}&vanityurl=${encodeURIComponent(
        String(qVanity),
      )}`
      const r = await fetch(url)
      const json = await r.json()
      const sid = json?.response?.steamid
      if (!sid) return res.status(500).json({ error: 'Could not resolve provided vanity' })
      return res.json({ steamid: sid })
    }

    if (process.env.STEAM_OWNER_STEAMID) {
      const envSid = String(process.env.STEAM_OWNER_STEAMID)
      const converted = envSid.startsWith('STEAM_') ? steam2To64(envSid) : envSid
      return res.json({ steamid: converted })
    }
    if (cachedOwnerSteamId) return res.json({ steamid: cachedOwnerSteamId })

    const vanity = process.env.STEAM_OWNER_VANITY
    if (!vanity) return res.status(400).json({
      error: 'STEAM_OWNER_STEAMID or STEAM_OWNER_VANITY not configured on server',
      hint: 'Add STEAM_OWNER_STEAMID=7656119... or STEAM_OWNER_VANITY=yourvanity to server/.env, then restart the server, or call this endpoint with ?steamid= or ?vanity= for ad-hoc testing',
    })

    if (!KEY) return res.status(500).json({ error: 'STEAM_API_KEY not configured' })

    const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${KEY}&vanityurl=${encodeURIComponent(vanity)}`
    const r = await fetch(url)
    const json = await r.json()
    const sid = json?.response?.steamid
    if (!sid) return res.status(500).json({ error: 'Could not resolve vanity for owner' })
    cachedOwnerSteamId = sid
    return res.json({ steamid: sid })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
})

// Simple health endpoint for quick checks
app.get('/', (req, res) => res.json({ status: 'ok', msg: 'steam-proxy running' }))

app.listen(PORT, () => {
  console.log(`Steam proxy listening on http://localhost:${PORT}`)
})

// YouTube search proxy: server-side request using YT_API_KEY so client never sees the key
app.get('/api/youtube/search', async (req, res) => {
  try {
    const q = String(req.query.q || '')
    const max = Number(req.query.maxResults || req.query.max || 10) || 10
    const key = process.env.YT_API_KEY
    if (!key) return res.status(500).json({ error: 'YT_API_KEY not configured on server' })
    // Exclude Shorts by requesting medium-duration videos (4-20 minutes)
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=medium&maxResults=${encodeURIComponent(
      String(max),
    )}&q=${encodeURIComponent(q)}&key=${encodeURIComponent(key)}`
    const r = await fetch(url)
    const json = await r.json()
    // Normalize items to a compact array
    const items = (json.items || []).map((it) => ({
      videoId: it.id?.videoId,
      title: it.snippet?.title,
      channelTitle: it.snippet?.channelTitle,
      description: it.snippet?.description,
      thumbnails: it.snippet?.thumbnails,
    }))
    res.json({ items })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})