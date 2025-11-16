import NavBar from '../components/NavBar'
import '../styles/SavedVideos.css'
import { useEffect, useState } from 'react'
import { searchYouTube } from '../hooks/useYouTube'
import FullPageLoader from '../components/FullPageLoader'

type YouTubeItem = {
    videoId: string
    title?: string
    channelTitle?: string
    description?: string
}

export default function SavedVideos() {
    const [videos, setVideos] = useState<YouTubeItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        async function load() {
            setError(null)
            setLoading(true)
            try {
                // Query specifically for the achievement name and game
                const q = 'Elden Ring Nightreign "The Duchess Joins the Fray"'
                const items = await searchYouTube(q, 10)
                if (!mounted) return
                setVideos(items.map((it) => ({ videoId: it.videoId, title: it.title, channelTitle: it.channelTitle, description: it.description })))
            } catch (e: unknown) {
                if (!mounted) return
                setError(e instanceof Error ? e.message : String(e))
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])
    if (loading) return <FullPageLoader message="Loading saved videos..." />

    return (
        <div>
            <NavBar />
            <main className="container mx-auto px-6 py-12 pt-20 max-w-6xl">
                <h1 className="text-3xl md:text-4xl font-semibold mb-8 page-title">Saved Videos</h1>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {error && <div className="text-red-400">{error}</div>}
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