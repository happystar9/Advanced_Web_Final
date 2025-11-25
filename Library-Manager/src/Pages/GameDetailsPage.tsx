import NavBar from '../components/NavBar'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Filter from '../components/Filter'
import storage from '../lib/storage'
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
  const [isSuggesting, setIsSuggesting] = useState(false)

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
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">{achievements.filter(a => a.__achieved).length} / {achievements.length}</div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded disabled:opacity-60"
              disabled={isSuggesting}
              onClick={async () => {
                setIsSuggesting(true)
                const locked = achievements.filter(a => !a.__achieved)
                if (!locked || locked.length === 0) {
                  setIsSuggesting(false)
                  return navigate('/todo')
                }

                const payload = locked.map((a) => ({
                  id: a.apiname ?? a.name ?? String(a.id ?? ''),
                  displayName: a.displayName ?? a.name ?? a.apiname ?? '',
                  description: a.description ?? '',
                  image: (a.displayIcon || a.icon || a.icon_url || a.icongray) ?? null
                }))

                const resp = await fetch('/api/achievements/suggest', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ game: gameName || '', achievements: payload })
                })

                if (!resp.ok) {
                  console.error('Suggest API failed', await resp.text())
                  setIsSuggesting(false)
                  return navigate('/todo')
                }

                const body = await resp.json()
                type SuggestResult = { id?: string; apiname?: string; name?: string; displayName?: string; description?: string; reason?: string; score?: number }
                const results: SuggestResult[] = Array.isArray(body?.results) ? body.results : []

                const raw = storage.getString('todoAchievements')
                type TodoItem = { id: string; name: string; game?: string; description?: string; reason?: string; image?: string | null }
                let existing: TodoItem[] = []
                existing = raw ? JSON.parse(raw) as TodoItem[] : []
                const existingIds = new Set(existing.map((e) => e.id))

                const byId = new Map(payload.map((p) => [String(p.id), p]))

                const toAdd: TodoItem[] = results.map((r) => {
                  const id = String(r.id || r.apiname || r.name || '')
                  const original = byId.get(id)
                  return {
                    id,
                    name: String(r.name || r.displayName || original?.displayName || ''),
                    game: gameName,
                    description: String(r.description ?? original?.description ?? ''),
                    reason: String(r.reason ?? ''),
                    image: original?.image ?? null,
                  }
                })
                for (const item of toAdd) if (!existingIds.has(item.id)) existing.push(item)
                storage.setString('todoAchievements', JSON.stringify(existing))
                setIsSuggesting(false)
                navigate('/todo')
              }}
            >
              {isSuggesting ? 'Loading suggestions...' : 'Suggest 4'}
            </button>
          </div>
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