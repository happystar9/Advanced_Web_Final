import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import jwt from 'jsonwebtoken'

const app = express()
app.use(cors())

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
const JWT_SECRET = process.env.STEAM_JWT_SECRET || 'dev_steam_jwt_secret'

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
  const include_appinfo = req.query.include_appinfo ? 1 : 0
  const include_played_free_games = req.query.include_played_free_games ? 1 : 0
  try {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${KEY}&steamid=${encodeURIComponent(
      steamid,
    )}&include_appinfo=${include_appinfo}&include_played_free_games=${include_played_free_games}&format=json`
    const r = await fetch(url)
    const json = await r.json()
    const hiddenEnv = process.env.STEAM_HIDDEN_APPIDS
    if (hiddenEnv && json && json.response && Array.isArray(json.response.games)) {
        const hiddenSet = new Set(hiddenEnv.split(',').map((s) => s.trim()))
        json.response.games = json.response.games.filter((g) => {
          const id = String(g.appid ?? '')
          return !hiddenSet.has(id)
        })
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

// Get player achievements for an app. Provide ?steamid= or the server 
// will fall back to STEAM_OWNER_STEAMID / cached owner.
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

    // If Steam can't get profile or stats, show some debug info
    if (json && json.playerstats && json.playerstats.success === false) {
      console.warn('Steam GetPlayerAchievements returned failure:', json.playerstats)
      // Echo context to the caller
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

// --- Steam OpenID linking endpoints ---
// Redirect user to Steam OpenID login
app.get('/auth/steam/login', (req, res) => {
  // preserve optional origin so the return handler can postMessage to the right window
  const originParam = req.query.origin ? `?origin=${encodeURIComponent(String(req.query.origin))}` : ''
  const returnTo = req.query.returnTo || `${req.protocol}://${req.get('host')}/auth/steam/return${originParam}`
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': String(returnTo),
    'openid.realm': `${req.protocol}://${req.get('host')}`,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  })
  const redirectUrl = `https://steamcommunity.com/openid/login?${params.toString()}`
  return res.redirect(redirectUrl)
})

// Handle the return from Steam OpenID and verify the assertion
app.get('/auth/steam/return', async (req, res) => {
  try {
    // Build verification payload from the incoming query params
    const incoming = req.query || {}
    const verifyParams = new URLSearchParams()
    Object.entries(incoming).forEach(([k, v]) => {
      // only include openid.* params
      verifyParams.append(k, String(v))
    })
    verifyParams.set('openid.mode', 'check_authentication')

    const verifyRes = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyParams.toString(),
    })
    const verifyText = await verifyRes.text()
    const isValid = /is_valid\s*:\s*true/.test(verifyText)

    if (!isValid) {
      return res.status(400).send('<h1>Steam login failed</h1><p>Unable to verify OpenID response.</p>')
    }

    const claimed = String(req.query['openid.claimed_id'] || '')
    // claimed id typically ends with /profiles/<steamid> or /id/<vanity>
    const m = claimed.match(/\/(profiles|id)\/(.+)$/)
    let steamid = null
    if (m) {
      // If it's a numeric profile id, use it directly; if vanity, attempt resolve
      const tail = m[2]
      if (/^\d+$/.test(tail)) {
        steamid = tail
      } else {
        // resolve vanity
        if (!KEY) return res.status(500).send('<p>Server STEAM_API_KEY not configured for vanity resolution</p>')
        const rv = await fetch(
          `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${KEY}&vanityurl=${encodeURIComponent(
            tail,
          )}`,
        )
        const rvj = await rv.json()
        steamid = rvj?.response?.steamid || null
      }
    }

    if (!steamid) return res.status(400).send('<h1>Could not extract SteamID</h1>')

    // Return a tiny page that posts the steamid back to the opener window and closes
    const origin = req.query.origin || ''
    const safeOrigin = origin || `${req.protocol}://${req.get('host')}`
    const token = jwt.sign({ steamid: steamid }, JWT_SECRET, { expiresIn: '7d' })

    const html = `
      <!doctype html>
      <html>
        <head><meta charset="utf-8"><title>Steam Link</title></head>
        <body>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({ type: 'steam-linked', steamid: '${steamid}', steam_token: '${token}' }, '${safeOrigin}')
                window.close()
              } else {
                document.body.innerText = 'Steam ID: ${steamid}';
              }
            } catch (e) {
              document.body.innerText = 'Steam ID: ${steamid}';
            }
          </script>
        </body>
      </html>
    `
    res.setHeader('Content-Type', 'text/html')
    res.send(html)
  } catch (err) {
    console.error('Error in /auth/steam/return', err)
    res.status(500).send('<h1>Server error</h1>')
  }
})