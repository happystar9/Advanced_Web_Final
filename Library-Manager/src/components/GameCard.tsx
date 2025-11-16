import type { OwnerGame as Game } from '../hooks/useOwnerGames'
import formatPlaytime from '../utils/formatPlaytime'

type Props = {
  game: Game
  className?: string
  onClick?: () => void
}

export default function GameCard({ game, className = '', onClick }: Props) {
  return (
    <article onClick={onClick} className={`bg-gray-800 text-white rounded p-3 hover:opacity-90 ${className}`}>
      <h3 className="font-medium truncate max-w-[18rem]">{game.name || `App ${game.appid}`}</h3>
      <p className="text-xs text-gray-400 mb-2">AppID: <span className="font-mono">{game.appid}</span></p>
      <p className="text-sm">Playtime forever: {formatPlaytime(game.playtime_forever)}</p>
    </article>
  )
}