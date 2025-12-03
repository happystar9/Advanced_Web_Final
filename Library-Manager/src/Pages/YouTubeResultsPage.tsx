import NavBar from '../components/NavBar'
import '../styles/SavedVideos.css'
import { useSearchParams } from 'react-router-dom'
import FullPageLoader from '../components/FullPageLoader'
import useYouTubeResults from '../hooks/useYouTubeResults'
import type { YouTubeItem } from '../hooks/useYouTubeResults'
import YouTubeGrid from '../components/YouTubeGrid'
import { Toaster } from 'react-hot-toast'

export default function YouTubeResultsPage() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''

  const res = useYouTubeResults(q, 25)
  const items = res.items as YouTubeItem[]
  const isLoading = res.isLoading
  const isError = res.isError
  const error = res.error
  const filtered = res.filtered
  const isFiltering = res.isFiltering
  const filterError = res.filterError


  if (isLoading) return <FullPageLoader message="Searching YouTube..." />
  if (isFiltering) return <FullPageLoader message="loading results" />

  if (filterError) return (
    <div>
      <NavBar />
      <main className="container mx-auto px-6 py-12 pt-20 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8 page-title">YouTube Results</h1>
        <p className="text-sm text-gray-400 mb-4">Query: {q}</p>
        <div className="text-red-500">Failed to rank results: {filterError.message}</div>
      </main>
    </div>
  )

  const aiItems = (Array.isArray(filtered) && filtered.length > 0)
    ? filtered.slice(0, 3).map((it) => {
      const ai = it as unknown as { id?: string; type?: string }
      const match = items.find((orig) => orig.videoId === ai.id || orig.playlistId === ai.id)
      return ({
        videoId: match?.videoId || (ai.type === 'video' ? ai.id : undefined),
        playlistId: match?.playlistId || (ai.type === 'playlist' ? ai.id : undefined),
        kind: match?.kind,
        title: it.title || match?.title,
        channelTitle: match?.channelTitle,
        description: it.description || match?.description,
        thumbnails: match?.thumbnails,
      } as YouTubeItem)
    })
    : []

  return (
    <div>
      <NavBar />
      <Toaster />
      <main className="container mx-auto px-6 py-12 pt-20 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8 page-title">YouTube Results</h1>
        <p className="text-sm text-gray-400 mb-4">Query: {q}</p>

        <YouTubeGrid items={aiItems} error={isError ? error : null} />
      </main>
    </div>
  )
}