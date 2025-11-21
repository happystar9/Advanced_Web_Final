import fetch from 'node-fetch'

export async function steamSchemaHandler(req, res) {
  try {
    const { appid } = req.params
    const KEY = process.env.STEAM_API_KEY
    if (!KEY) return res.status(500).json({ error: 'STEAM_API_KEY not configured' })
    if (!appid) return res.status(400).json({ error: 'appid required' })

    const url = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${KEY}&appid=${encodeURIComponent(
      appid,
    )}`
    const r = await fetch(url)
    const json = await r.json()
    return res.json(json)
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}