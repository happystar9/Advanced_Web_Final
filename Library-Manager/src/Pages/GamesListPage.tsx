import { useAuth } from 'react-oidc-context'
import NavBar from '../components/NavBar'
import useOwnerGames from '../hooks/useOwnerGames'
import type { OwnerGame as Game } from '../hooks/useOwnerGames'
import { Link } from 'react-router-dom'
import Filter from '../components/Filter'
import { useMemo, useState } from 'react'

function formatPlaytime(minutesInput?: number | null) {
  const mins = Number(minutesInput ?? 0)
  if (!Number.isFinite(mins) || mins <= 0) return '0m'
  const hours = Math.floor(mins / 60)
  const minutes = Math.floor(mins % 60)
  if (hours <= 0) return `${minutes}m`
  if (minutes <= 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export default function GamesListPage() {
  const auth = useAuth()
  const username = auth.user?.profile?.preferred_username || auth.user?.profile?.name || 'user'

  const { games, loading, error } = useOwnerGames(!!auth?.isAuthenticated)

  // UI filters / sorting
  const [sortMode, setSortMode] = useState<'alpha' | 'alpha-desc' | 'hours-desc' | 'hours-asc'>('hours-desc')
  const [hoursFilter, setHoursFilter] = useState<'all' | 'gt100' | 'gt10' | 'lt10'>('all')

  const displayedGames = useMemo(() => {
    let list = Array.isArray(games) ? [...games] : []

    // filter by hours
    list = list.filter((g: any) => {
      const mins = Number(g.playtime_forever ?? 0)
      if (hoursFilter === 'gt100') return mins >= 100 * 60
      if (hoursFilter === 'gt10') return mins >= 10 * 60
      if (hoursFilter === 'lt10') return mins < 10 * 60
      return true
    })

    // sort
    if (sortMode === 'alpha') list.sort((a: any, b: any) => String(a.name || '').localeCompare(String(b.name || '')))
    else if (sortMode === 'alpha-desc') list.sort((a: any, b: any) => String(b.name || '').localeCompare(String(a.name || '')))
    else if (sortMode === 'hours-desc') list.sort((a: any, b: any) => (Number(b.playtime_forever ?? 0) - Number(a.playtime_forever ?? 0)))
    else if (sortMode === 'hours-asc') list.sort((a: any, b: any) => (Number(a.playtime_forever ?? 0) - Number(b.playtime_forever ?? 0)))

    return list
  }, [games, sortMode, hoursFilter])

  return (
    <div>
      <NavBar />
      <main className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold mb-4">Games (Authorized)</h2>

        {auth?.isAuthenticated ? (
          <div>
            <p className="mb-2">Welcome, {username}.</p>
            <p className="mb-4">This page is protected and only visible to authenticated users.</p>

            <div className="mb-4">
              <p className="text-sm mb-1">Showing games for the Steam account.</p>
              {error && <p className="text-red-400 mt-2">{error}</p>}
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="col-span-full flex items-center justify-between mb-4">
                  <div className="flex gap-4">
                    <Filter
                      label="Sort"
                      variant="select"
                      options={[
                        { key: 'hours-desc', label: 'Hours (desc)' },
                        { key: 'hours-asc', label: 'Hours (asc)' },
                        { key: 'alpha', label: 'A → Z' },
                        { key: 'alpha-desc', label: 'Z → A' },
                      ]}
                      value={sortMode}
                      onChange={(k) => setSortMode(k as any)}
                    />

                    <Filter
                      label="Hours"
                      variant="buttons"
                      options={[
                        { key: 'all', label: 'All' },
                        { key: 'gt100', label: '>100h' },
                        { key: 'gt10', label: '>10h' },
                        { key: 'lt10', label: '<10h' },
                      ]}
                      value={hoursFilter}
                      onChange={(k) => setHoursFilter(k as any)}
                    />
                  </div>
                  <div className="text-sm text-gray-400">Showing {displayedGames.length} of {games.length} games</div>
                </div>

                {displayedGames.map((g: Game) => (
                  <Link key={g.appid} to={`/games/${g.appid}`}>
                    <article className="bg-gray-800 text-white rounded p-3 hover:opacity-90">
                      <h3 className="font-medium">{g.name || `App ${g.appid}`}</h3>
                      <p className="text-xs text-gray-400 mb-2">AppID: <span className="font-mono">{g.appid}</span></p>
                      <p className="text-sm">Playtime forever: {formatPlaytime(g.playtime_forever)}</p>
                    </article>
                  </Link>
                ))}
              {games.length === 0 && !loading && <p className="text-gray-400">No games loaded.</p>}
            </section>
          </div>
        ) : (
          <p>Loading authentication...</p>
        )}
      </main>
    </div>
  )
}