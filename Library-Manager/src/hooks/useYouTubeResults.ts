import { useQuery } from '@tanstack/react-query'
import { searchYouTube } from './useYouTube'
import { apiFetch } from '../lib/api'

const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_STEAM_PROXY_URL?: string } }).env?.VITE_STEAM_PROXY_URL) || ''

export type YouTubeItem = {
  videoId?: string
  playlistId?: string
  kind?: string
  title?: string
  channelTitle?: string
  description?: string
  thumbnails?: Record<string, unknown>
}

export default function useYouTubeResults(query: string, maxResults = 10) {
  const q = query || ''
  const key = ['youtube', q, maxResults]

  const result = useQuery({
    queryKey: key,
    queryFn: async () => {
        if (!q || q.length === 0) return [] as YouTubeItem[]
        const items = await searchYouTube(q, maxResults)
        type RawYouTubeApiItem = {
          kind?: string
          videoId?: string
          playlistId?: string
          id?: { videoId?: string; playlistId?: string } | string
          title?: string
          snippet?: { title?: string; channelTitle?: string; description?: string; thumbnails?: Record<string, unknown> }
          channelTitle?: string
          description?: string
          name?: string
          thumbnails?: Record<string, unknown>
        }

        return (items || []).map((it: RawYouTubeApiItem) => ({
          kind: it.kind || undefined,
          videoId: it.videoId || (typeof it.id === 'object' ? it.id?.videoId : (typeof it.id === 'string' ? it.id : undefined)),
          playlistId: it.playlistId || (typeof it.id === 'object' ? (it.id as { playlistId?: string }).playlistId : undefined),
          title: it.title || it.snippet?.title || it.name,
          channelTitle: it.channelTitle || it.snippet?.channelTitle,
          description: it.description || it.snippet?.description,
          thumbnails: it.thumbnails || it.snippet?.thumbnails,
        })) as YouTubeItem[]
    },
    enabled: !!q,
    staleTime: 1000 * 60 * 5,
  })

  const filterQuery = useQuery({
    queryKey: ['youtube-filter', q, maxResults],
    queryFn: async () => {
      const base = API_BASE || ''
      const url = `${base}/api/youtube/filter`
      const body = { query: q, videos: result.data || [] }
      type AIResult = { id: string; type?: 'video' | 'playlist'; title?: string; description?: string; score?: number; reason?: string }
      const json = await apiFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) as { results?: AIResult[] }
      return json?.results ?? []
    },
    enabled: !!q && Array.isArray(result.data) && (result.data as unknown[]).length > 0,
    staleTime: 1000 * 60 * 5,
  })

  return {
    items: result.data || [] as YouTubeItem[],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error as Error | null,
    refetch: result.refetch,
    filtered: filterQuery.data || [] as Array<{ id: string; type?: string; title?: string; description?: string; score?: number; reason?: string }>,
    isFiltering: filterQuery.isLoading,
    filterError: filterQuery.isError ? (filterQuery.error as Error | null) : null,
  }
}