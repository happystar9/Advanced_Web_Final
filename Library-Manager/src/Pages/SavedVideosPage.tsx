import NavBar from '../components/NavBar'
import '../styles/SavedVideos.css'
import { useEffect, useState } from 'react'
import { getString, setString } from '../lib/storage'
import toast, { Toaster } from 'react-hot-toast'
import FullPageLoader from '../components/FullPageLoader'

type YouTubeItem = {
    videoId: string
    playlistId?: string
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
        function load() {
            setError(null)
            setLoading(true)
            try {
                const raw = getString('savedVideos')
                const list = raw ? JSON.parse(raw) as YouTubeItem[] : []
                if (!mounted) return
                setVideos(list)
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
            <Toaster />
            <main className="container mx-auto px-6 py-12 pt-20 max-w-6xl">
                <h1 className="text-3xl md:text-4xl font-semibold mb-8 page-title">Saved Videos</h1>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {error && <div className="text-red-400">{error}</div>}
                    {videos.map((v) => (
                        <article key={v.videoId || v.title} className="bg-gray-800 text-white rounded-lg overflow-hidden shadow-lg flex flex-col hover:scale-[1.01] transition-transform duration-200">
                            <div className="p-4">
                                <h2 className="text-lg font-medium">{v.title}</h2>
                                <p className="text-xs text-gray-400">{v.channelTitle}</p>
                            </div>
                            <div className="bg-black flex items-center justify-center flex-1 min-h-[180px]">
                                {v.videoId ? (
                                    <a href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noreferrer">
                                        <img src={`https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`} alt={v.title} className="w-full h-auto" />
                                    </a>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No thumbnail available</div>
                                )}
                            </div>
                            <div className="p-4 flex justify-end">
                                <a className="text-sm text-yellow-400 hover:underline mr-4" href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noreferrer">View</a>
                                <a
                                    href="#"
                                    className="text-sm text-red-400 hover:underline"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        try {
                                            const raw = getString('savedVideos')
                                            const list = raw ? (JSON.parse(raw) as YouTubeItem[]) : []
                                            const filtered = list.filter((it) => {
                                                const vid = it.videoId || ''
                                                const pid = it.playlistId || ''
                                                const curVid = v.videoId || ''
                                                const curPid = v.playlistId || ''
                                                return !(vid && vid === curVid) && !(pid && pid === curPid)
                                            })
                                            setString('savedVideos', JSON.stringify(filtered))
                                            setVideos(filtered)
                                            toast.success('Removed from Saved Videos')
                                        } catch (err) {
                                            console.warn('Could not remove saved video', err)
                                            toast.error('Failed to remove')
                                        }
                                    }}
                                >
                                    Remove
                                </a>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    )
}