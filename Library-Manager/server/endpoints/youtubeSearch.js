import fetch from 'node-fetch'

function parseISODuration(iso) {
  if (!iso || typeof iso !== 'string') return null
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return null
  const h = parseInt(m[1] || '0', 10)
  const min = parseInt(m[2] || '0', 10)
  const s = parseInt(m[3] || '0', 10)
  return h * 3600 + min * 60 + s
}

export async function youtubeSearchHandler(req, res) {
  const q = String(req.query.q || '')
  const max = Number(req.query.maxResults || req.query.max || 10) || 10
  const key = process.env.YT_API_KEY
  if (!key) return res.status(500).json({ error: 'YT_API_KEY not configured on server' })
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&order=relevance&maxResults=${encodeURIComponent(
    String(max),
  )}&q=${encodeURIComponent(q)}&key=${encodeURIComponent(key)}`
  const r = await fetch(url)
  const json = await r.json()
  const items = (json.items || []).map((it) => ({
    kind: it.id?.kind,
    videoId: it.id?.videoId,
    playlistId: it.id?.playlistId,
    title: it.snippet?.title,
    channelTitle: it.snippet?.channelTitle,
    description: it.snippet?.description,
    thumbnails: it.snippet?.thumbnails,
  }))

  const videoIds = items.filter((i) => i.videoId).map((i) => i.videoId)
  if (videoIds.length > 0) {
    const vidsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${encodeURIComponent(
      videoIds.join(','),
    )}&key=${encodeURIComponent(key)}`
    const vr = await fetch(vidsUrl)
    const vjson = await vr.json()
    const durationMap = new Map()
      ; (vjson.items || []).forEach((vi) => {
        const id = vi.id
        const dur = parseISODuration(vi.contentDetails?.duration)
        if (id) durationMap.set(String(id), dur)
      })
    items.forEach((it) => {
      if (it.videoId && durationMap.has(String(it.videoId))) {
        it.durationSeconds = durationMap.get(String(it.videoId))
      }
    })
  }

  res.json({ items })
}

export default youtubeSearchHandler