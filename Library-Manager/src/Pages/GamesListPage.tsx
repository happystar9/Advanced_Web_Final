import { useAuth } from 'react-oidc-context'
import NavBar from '../components/NavBar'
import useOwnerGames from '../hooks/useOwnerGames'
import type { OwnerGame as Game } from '../hooks/useOwnerGames'
import { Link } from 'react-router-dom'
import FiltersBar from '../components/FiltersBar'
import GameCard from '../components/GameCard'
import useFilteredGames from '../hooks/useFilteredGames'
import type { SortMode, HoursFilter } from '../hooks/useFilteredGames'
import { useState } from 'react'
import FullPageLoader from '../components/FullPageLoader'

export default function GamesListPage() {
  const auth = useAuth()

  // Treat either OIDC auth or a stored steam_token as an authenticated state
  let hasSteamToken = false
  try {
    hasSteamToken = !!localStorage.getItem('steam_token')
  } catch {
    hasSteamToken = false
  }

  const isAuthenticatedOrSteam = !!auth?.isAuthenticated || hasSteamToken

  const { games, loading, error } = useOwnerGames(isAuthenticatedOrSteam)

  // UI filters / sorting
  const [sortMode, setSortMode] = useState<SortMode>('hours-desc')
  const [hoursFilter, setHoursFilter] = useState<HoursFilter>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const displayedGames = useFilteredGames(games, sortMode, hoursFilter, searchTerm)

  if (loading) return <FullPageLoader message="Loading games..." />

  return (
    <div>
      <NavBar />
      <main className="container mx-auto px-6 py-8 pt-20">

        {isAuthenticatedOrSteam ? (
          <div>
            <h1 className="page-title mb-4">Steam Games</h1>

            <div className="mb-4">
              {error && <p className="text-red-400 mt-2">{error}</p>}
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FiltersBar
                sortMode={sortMode}
                onSortChange={(m) => setSortMode(m)}
                hoursFilter={hoursFilter}
                onHoursChange={(h) => setHoursFilter(h)}
                search={searchTerm}
                onSearch={(s) => setSearchTerm(s)}
                count={{ shown: displayedGames.length, total: games.length }}
              />

                {displayedGames.map((g: Game) => (
                  <Link key={g.appid} to={`/games/${g.appid}`} className="block">
                    <GameCard game={g} />
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