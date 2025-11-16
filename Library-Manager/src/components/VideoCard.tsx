import type { YouTubeItem } from '../hooks/useYouTubeResults'

type Props = {
  item: YouTubeItem
  onView?: (id: string) => void
}

export default function VideoCard({ item, onView }: Props) {
  return (
    <article className="bg-gray-800 text-white rounded-lg overflow-hidden shadow-lg flex flex-col hover:scale-[1.01] transition-transform duration-200">
      <div className="p-4">
        <h2 className="text-lg font-medium truncate">{item.title}</h2>
        <p className="text-xs text-gray-400 truncate">{item.channelTitle}</p>
      </div>
      <div className="bg-black flex items-center justify-center flex-1 min-h-[140px]">
        <a href={`https://www.youtube.com/watch?v=${item.videoId}`} target="_blank" rel="noreferrer" onClick={() => onView?.(item.videoId)}>
          <img src={`https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`} alt={item.title} className="w-full h-auto" />
        </a>
      </div>
      <div className="p-4 flex justify-end">
        <a className="text-sm text-yellow-400 hover:underline" href={`https://www.youtube.com/watch?v=${item.videoId}`} target="_blank" rel="noreferrer">View</a>
      </div>
    </article>
  )
}