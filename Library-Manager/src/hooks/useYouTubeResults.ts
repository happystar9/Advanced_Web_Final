import { useQuery } from '@tanstack/react-query'
import { searchYouTube } from './useYouTube'

export type YouTubeItem = {
  videoId: string
  title?: string
  channelTitle?: string
  description?: string
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
          videoId?: string
          id?: { videoId?: string } | string
          title?: string
          snippet?: { title?: string; channelTitle?: string; description?: string }
          channelTitle?: string
          description?: string
          name?: string
        }

        return (items || []).map((it: RawYouTubeApiItem) => ({
          videoId: it.videoId || (typeof it.id === 'object' ? it.id?.videoId : it.id as string | undefined),
          title: it.title || it.snippet?.title || it.name,
          channelTitle: it.channelTitle || it.snippet?.channelTitle,
          description: it.description || it.snippet?.description,
        })) as YouTubeItem[]
    },
    enabled: !!q,
    staleTime: 1000 * 60 * 5,
  })

  return {
    items: result.data || [] as YouTubeItem[],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error as Error | null,
    refetch: result.refetch,
  }
}