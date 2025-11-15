type YouTubeItem = {
  videoId: string
  title?: string
  channelTitle?: string
  description?: string
  thumbnails?: Record<string, unknown>
}

const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as unknown as any).env?.VITE_STEAM_PROXY_URL) || ''

export async function searchYouTube(query: string, maxResults = 10): Promise<YouTubeItem[]> {
  const base = API_BASE || ''
  const params = new URLSearchParams()
  params.set('q', query)
  params.set('maxResults', String(maxResults))
  const url = `${base}/api/youtube/search?${params.toString()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`YouTube proxy error: ${res.status}`)
  const json = await res.json()
  return (json.items || []) as YouTubeItem[]
}

export default { searchYouTube }
