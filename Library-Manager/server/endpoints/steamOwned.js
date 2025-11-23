import fetch from 'node-fetch'

export async function steamOwnedHandler(req, res) {
  const { steamid } = req.params
  const KEY = process.env.STEAM_API_KEY
  if (!KEY) return res.status(500).json({ error: 'STEAM_API_KEY not configured' })
  const include_appinfo = req.query.include_appinfo ? 1 : 0
  const include_played_free_games = req.query.include_played_free_games ? 1 : 0
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
}

export default steamOwnedHandler