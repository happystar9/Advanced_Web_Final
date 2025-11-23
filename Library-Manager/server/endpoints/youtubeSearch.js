import fetch from 'node-fetch'

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
  res.json({ items })
}

export default youtubeSearchHandler