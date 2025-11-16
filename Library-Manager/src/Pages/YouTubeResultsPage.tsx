import NavBar from '../components/NavBar'
import '../styles/SavedVideos.css'
import { useSearchParams } from 'react-router-dom'
import FullPageLoader from '../components/FullPageLoader'
import useYouTubeResults from '../hooks/useYouTubeResults'
import type { YouTubeItem } from '../hooks/useYouTubeResults'
import YouTubeGrid from '../components/YouTubeGrid'

export default function YouTubeResultsPage() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''

  const res = useYouTubeResults(q, 10)
  const items = res.items as YouTubeItem[]
  const isLoading = res.isLoading
  const isError = res.isError
  const error = res.error

  if (isLoading) return <FullPageLoader message="Searching YouTube..." />

  return (
    <div>
      <NavBar />
      <main className="container mx-auto px-6 py-12 pt-20 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8 page-title">YouTube Results</h1>
        <p className="text-sm text-gray-400 mb-4">Query: {q}</p>

        <YouTubeGrid items={items} error={isError ? error : null} />
      </main>
    </div>
  )
}