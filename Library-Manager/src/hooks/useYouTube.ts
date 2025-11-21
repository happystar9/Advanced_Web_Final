import { apiFetch } from '../lib/api'

type YouTubeItem = {
  videoId: string
  title?: string
  channelTitle?: string
  description?: string
  thumbnails?: Record<string, unknown>
}

const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_STEAM_PROXY_URL?: string } }).env?.VITE_STEAM_PROXY_URL) || ''

export async function searchYouTube(query: string, maxResults = 10): Promise<YouTubeItem[]> {
  const base = API_BASE || ''
  const params = new URLSearchParams()
  params.set('q', query)
  params.set('maxResults', String(maxResults))
  const url = `${base}/api/youtube/search?${params.toString()}`
  const json = await apiFetch(url) as { items?: YouTubeItem[] } | undefined
  return json?.items ?? []
}

export default { searchYouTube }