import type { YouTubeItem } from '../hooks/useYouTubeResults'
import toast from 'react-hot-toast'
import { getString, setString } from '../lib/storage'

type Props = {
  item: YouTubeItem
  onView?: (id: string) => void
}

export default function VideoCard({ item, onView }: Props) {
  const isPlaylist = !!item.playlistId || item.kind === 'youtube#playlist'
  const targetId = isPlaylist ? item.playlistId || '' : item.videoId || ''
  const thumbnails = item.thumbnails as
    | { default?: { url?: string } | null; medium?: { url?: string } | null; high?: { url?: string } | null }
    | undefined
  const thumbUrl = item.videoId
    ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`
    : (thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url || '')

  const saveItem = () => {
    try {
      console.log('VideoCard.saveItem', item.videoId || item.playlistId)
      const raw = getString('savedVideos')
      const list = raw ? (JSON.parse(raw) as YouTubeItem[]) : []
      const exists = list.some((s) => (s.videoId && s.videoId === item.videoId) || (s.playlistId && s.playlistId === item.playlistId))
      if (!exists) {
        list.push({
          videoId: item.videoId || '',
          playlistId: item.playlistId,
          title: item.title,
          channelTitle: item.channelTitle,
          description: item.description,
          thumbnails: item.thumbnails,
        })
        setString('savedVideos', JSON.stringify(list))
        toast.success('Added to Saved Videos')
        console.log('Saved to localStorage')
      } else {
        toast('Already saved')
      }
    } catch (err) {
      console.warn('Could not save video', err)
      toast.error('Failed to save')
    }
  }

  return (
    <article className="bg-gray-800 text-white rounded-lg overflow-hidden shadow-lg flex flex-col hover:scale-[1.01] transition-transform duration-200">
      <div className="p-4">
        <h2 className="text-lg font-medium truncate">{item.title}</h2>
        <p className="text-xs text-gray-400 truncate">{item.channelTitle}</p>
      </div>
      <div className="bg-black flex items-center justify-center flex-1 min-h-[140px]">
        <a
          href={isPlaylist ? `https://www.youtube.com/playlist?list=${targetId}` : `https://www.youtube.com/watch?v=${targetId}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => onView?.(targetId)}
        >
          <img src={thumbUrl} alt={item.title} className="w-full h-auto" />
        </a>
      </div>
      <div className="p-4 flex justify-end">
        <a
          className="text-sm text-yellow-400 hover:underline mr-4"
          href={isPlaylist ? `https://www.youtube.com/playlist?list=${targetId}` : `https://www.youtube.com/watch?v=${targetId}`}
          target="_blank"
          rel="noreferrer"
        >
          View
        </a>
        <a
          href="#"
          role="button"
          className="text-sm text-yellow-400 hover:underline"
          onClick={(e) => {
            e.preventDefault()
            saveItem()
          }}
        >
          Save
        </a>
      </div>
    </article>
  )
}