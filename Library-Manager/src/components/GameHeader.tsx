import { useNavigate } from 'react-router-dom'

type Props = {
  title?: string
  unlocked: number
  total: number
}

export default function GameHeader({ title}: Props) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">{title || 'Game Achievements'}</h1>
      </div>
      <div>
        <button
          className="inline-flex items-center justify-center px-3 py-1 rounded text-m bg-gray-700 text-gray-200 hover:bg-gray-600"
          onClick={() => navigate('/games')}
        >
          Back to games
        </button>
      </div>
    </div>
  )
}