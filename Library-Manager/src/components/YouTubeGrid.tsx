import VideoCard from './VideoCard'
import type { YouTubeItem } from '../hooks/useYouTubeResults'

type Props = {
  items: YouTubeItem[]
  error?: Error | null
  onItemClick?: (id: string) => void
}

export default function YouTubeGrid({ items, error, onItemClick }: Props) {
  if (error) return <div className="text-red-400">{error.message}</div>
  if (!items || items.length === 0) return <div className="text-gray-400">No results found.</div>

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {items.map((it) => (
        <VideoCard key={it.videoId} item={it} onView={onItemClick} />
      ))}
    </section>
  )
}