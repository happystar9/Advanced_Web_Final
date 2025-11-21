import fetch from 'node-fetch'

export async function steamPlayerAchievementsHandler(req, res) {
    const { appid } = req.params
    if (!appid) return res.status(400).json({ error: 'appid required' })
    const qSteamid = req.query.steamid
    const steamid = qSteamid || process.env.STEAM_OWNER_STEAMID
    if (!steamid) return res.status(400).json({ error: 'steamid query or STEAM_OWNER_STEAMID required' })
    const KEY = process.env.STEAM_API_KEY
    if (!KEY) return res.status(500).json({ error: 'STEAM_API_KEY not configured' })

    const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${KEY}&appid=${encodeURIComponent(
        appid,
    )}&steamid=${encodeURIComponent(String(steamid))}`
    const r = await fetch(url)
    const json = await r.json()

    if (json && json.playerstats && json.playerstats.success === false) {
        console.warn('Steam GetPlayerAchievements returned failure:', json.playerstats)
        return res.status(200).json({
            playerstats: json.playerstats,
            debug: {
                requestedSteamId: String(steamid),
                requestedAppId: String(appid),
                steamApiUrl: url,
            },
        })
    }
    return res.json(json)
}