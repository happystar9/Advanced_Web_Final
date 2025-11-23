import fetch from 'node-fetch'

export async function steamPlayerHandler(req, res) {
  const { steamid } = req.params
  const KEY = process.env.STEAM_API_KEY
  if (!KEY) return res.status(500).json({ error: 'STEAM_API_KEY not configured' })
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${KEY}&steamids=${encodeURIComponent(
    steamid,
  )}`
  const r = await fetch(url)
  const json = await r.json()
  res.json(json)
}

export default steamPlayerHandler