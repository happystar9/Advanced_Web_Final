import { useAuth } from 'react-oidc-context'
import NavBar from '../components/NavBar'
import useOwnerGames from '../hooks/useOwnerGames'
import type { OwnerGame as Game } from '../hooks/useOwnerGames'

export default function GamesListPage() {
  const auth = useAuth()
  const username = auth.user?.profile?.preferred_username || auth.user?.profile?.name || 'user'

  const { games, loading, error } = useOwnerGames(!!auth?.isAuthenticated)

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
              {games.map((g: Game) => (
                <article key={g.appid} className="bg-gray-800 text-white rounded p-3">
                  <h3 className="font-medium">{g.name || `App ${g.appid}`}</h3>
                  <p className="text-xs text-gray-400 mb-2">AppID: <span className="font-mono">{g.appid}</span></p>
                  <p className="text-sm">Playtime forever: {g.playtime_forever ?? 0} minutes</p>
                </article>
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