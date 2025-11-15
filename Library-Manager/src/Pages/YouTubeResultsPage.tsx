import NavBar from '../components/NavBar'
import '../styles/SavedVideos.css'
import { useEffect, useState } from 'react'
import { searchYouTube } from '../hooks/useYouTube'
import { useSearchParams } from 'react-router-dom'

type YouTubeItem = {
  videoId: string
  title?: string
  channelTitle?: string
  description?: string
}

export default function YouTubeResultsPage() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const [videos, setVideos] = useState<YouTubeItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setError(null)
      setLoading(true)
      try {
        console.debug('YouTubeResultsPage: searching for', q)
        const items = await searchYouTube(q, 10)
        if (!mounted) return
        setVideos(items.map((it) => ({ videoId: it.videoId, title: it.title, channelTitle: it.channelTitle, description: it.description })))
      } catch (e: unknown) {
        if (!mounted) return
        const msg = e instanceof Error ? e.message : String(e)
        console.warn('YouTube search failed', q, msg)
        setError(msg)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (q && q.length > 0) load()
    return () => { mounted = false }
  }, [q])

  return (
    <div>
      <NavBar />
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8 page-title">YouTube Results</h1>
        <p className="text-sm text-gray-400 mb-4">Query: {q}</p>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {loading && <div className="text-gray-400">Loading videos...</div>}
          {error && <div className="text-red-400">{error}</div>}
          {!loading && !error && videos.length === 0 && (
            <div className="text-gray-400">No results found for this query.</div>
          )}
          {videos.map((v) => (
            <article key={v.videoId} className="bg-gray-800 text-white rounded-lg overflow-hidden shadow-lg flex flex-col hover:scale-[1.01] transition-transform duration-200">
              <div className="p-4">
                <h2 className="text-lg font-medium">{v.title}</h2>
                <p className="text-xs text-gray-400">{v.channelTitle}</p>
              </div>
              <div className="bg-black flex items-center justify-center flex-1 min-h-[180px]">
                <a href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noreferrer">
                  <img src={`https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`} alt={v.title} className="w-full h-auto" />
                </a>
              </div>
              <div className="p-4 flex justify-end">
                <a className="text-sm text-yellow-400 hover:underline" href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noreferrer">View</a>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
