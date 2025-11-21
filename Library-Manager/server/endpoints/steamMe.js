import fetch from 'node-fetch'

function steam2To64(steam2) {
    if (!steam2 || typeof steam2 !== 'string') return null
    const m = steam2.match(/^STEAM_[0-5]?:([01]):(\d+)$/i)
    if (!m) return null
    const Y = BigInt(Number(m[1]))
    const Z = BigInt(Number(m[2]))
    const base = 76561197960265728n
    return (base + Z * 2n + Y).toString()
}

let cachedOwnerSteamId = null

export async function steamMeHandler(req, res) {
    const qSteamid = req.query.steamid
    const qVanity = req.query.vanity
    if (qSteamid) {
        const s = String(qSteamid)
        const converted = s.startsWith('STEAM_') ? steam2To64(s) : s
        return res.json({ steamid: converted })
    }
    if (qVanity) {
        const KEY = process.env.STEAM_API_KEY
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
    if (!vanity)
        return res.status(400).json({
            error: 'STEAM_OWNER_STEAMID or STEAM_OWNER_VANITY not configured on server',
            hint: 'Add STEAM_OWNER_STEAMID=7656119... or STEAM_OWNER_VANITY=yourvanity to server/.env, then restart the server, or call this endpoint with ?steamid= or ?vanity= for ad-hoc testing',
        })

    const KEY = process.env.STEAM_API_KEY
    if (!KEY) return res.status(500).json({ error: 'STEAM_API_KEY not configured' })

    const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${KEY}&vanityurl=${encodeURIComponent(vanity)}`
    const r = await fetch(url)
    const json = await r.json()
    const sid = json?.response?.steamid
    if (!sid) return res.status(500).json({ error: 'Could not resolve vanity for owner' })
    cachedOwnerSteamId = sid
    return res.json({ steamid: sid })
}