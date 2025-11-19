import NavBar from '../components/NavBar'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Filter from '../components/Filter'
import FullPageLoader from '../components/FullPageLoader'
import useGameDetails from '../hooks/useGameDetails'
import GameHeader from '../components/GameHeader'
import AchievementsGrid from '../components/AchievementsGrid'

export default function GameDetailsPage() {
  const { appid } = useParams()
  const navigate = useNavigate()

  const { schema, achievements, isLoading, isError } = useGameDetails(appid)

  const gameName = schema?.game?.gameName || schema?.game?.gameTitle || ''

  const [filterMode, setFilterMode] = useState<'all' | 'locked' | 'unlocked'>('all')

  if (isLoading) return <FullPageLoader message="Loading game details..." />

  return (
    <div>
      <NavBar />
      <main className="container mx-auto px-6 py-8 pt-20">
        <GameHeader title={gameName} unlocked={achievements.filter(a => a.__achieved).length} total={achievements.length} />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Filter
              label="Show:"
              variant="select"
              options={[{ key: 'all', label: 'All' }, { key: 'unlocked', label: 'Unlocked' }, { key: 'locked', label: 'Locked' }]}
              value={filterMode}
              onChange={(k) => setFilterMode(k as 'all' | 'locked' | 'unlocked')}
            />
          </div>
          <div className="text-sm text-gray-400">{achievements.filter(a => a.__achieved).length} / {achievements.length}</div>
        </div>

        {isError && <p className="text-red-400">Failed to load game details.</p>}

        <AchievementsGrid achievements={achievements} filterMode={filterMode} onAchievementClick={(a) => {
          const achName = (a.displayName || a.name || a.apiname || '').trim()
          const rawQuery = `${achName} ${gameName}`.trim()
          const q = encodeURIComponent(rawQuery)
          navigate(`/youtube?q=${q}`)
        }} />
      </main>
    </div>
  )
}