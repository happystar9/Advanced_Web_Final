import fetch from 'node-fetch'

export async function steamResolveHandler(req, res) {
  const { vanity } = req.params
  const KEY = process.env.STEAM_API_KEY
  if (!KEY) return res.status(500).json({ error: 'STEAM_API_KEY not configured' })
  if (!vanity) return res.status(400).json({ error: 'vanity required' })

  const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${KEY}&vanityurl=${encodeURIComponent(
    vanity,
  )}`
  const r = await fetch(url)
  const json = await r.json()
  return res.json(json)
}