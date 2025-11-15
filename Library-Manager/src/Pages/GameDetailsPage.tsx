import { useAuth } from 'react-oidc-context'
import NavBar from '../components/NavBar'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchGameSchema, fetchPlayerAchievements, fetchOwnerSteamId } from '../hooks/useSteam'
import { useEffect, useState, useMemo } from 'react'
import Filter from '../components/Filter'

export default function GameDetailsPage() {
  const auth = useAuth()
  const { appid } = useParams()
  const [ownerSteamId, setOwnerSteamId] = useState<string | undefined>(undefined)

  useEffect(() => {
    let mounted = true
    if (auth?.isAuthenticated) {
      fetchOwnerSteamId()
        .then((id) => mounted && setOwnerSteamId(id))
        .catch(() => {})
    }
    return () => {
      mounted = false
    }
  }, [auth?.isAuthenticated])

  const schemaQuery = useQuery({
    queryKey: ['schema', appid],
    queryFn: () => fetchGameSchema(appid || ''),
    enabled: !!appid,
  })

  const playerQuery = useQuery({
    queryKey: ['playerAchievements', appid, ownerSteamId],
    queryFn: () => fetchPlayerAchievements(appid || '', ownerSteamId),
    enabled: !!appid && !!ownerSteamId,
  })

  const schema = schemaQuery.data as unknown
  const player = playerQuery.data as unknown

  const rawAchievements: unknown[] = (schema?.game?.availableGameStats?.achievements as any) || []

  // helper to determine if a schema achievement is present in the player's achievements
  function findPlayerAchievementFor(schemaAch: any, playerAchievements: any[] | undefined) {
    if (!playerAchievements || !Array.isArray(playerAchievements)) return undefined
    const candidates = playerAchievements
    const schemaKeys = new Set<string>()
    if (schemaAch.apiname) schemaKeys.add(String(schemaAch.apiname))
    if (schemaAch.name) schemaKeys.add(String(schemaAch.name))
    if (schemaAch.displayName) schemaKeys.add(String(schemaAch.displayName))
    // include lowercase variants
    for (const k of Array.from(schemaKeys)) schemaKeys.add(k.toLowerCase())

    for (const pa of candidates) {
      const paNames = [pa.apiname, pa.name]
      for (const n of paNames) {
        if (!n) continue
        if (schemaKeys.has(String(n)) || schemaKeys.has(String(n).toLowerCase())) return pa
      }
    }
    return undefined
  }

  // enrich achievements with computed 'achieved' boolean using robust matching
  const achievements = useMemo(() => {
    const playerAchievements = player?.playerstats?.achievements
    return rawAchievements.map((ach) => {
      const key = ach.name || ach.apiname || ach.displayName || JSON.stringify(ach)
      const playerAch = findPlayerAchievementFor(ach, playerAchievements)
      const achieved = !!(playerAch ? (playerAch.achieved === 1 || playerAch.unlocktime) : false)
      return { ...ach, __key: key, __achieved: achieved }
    })
  }, [rawAchievements, player?.playerstats?.achievements])

  const navigate = useNavigate()
  const gameName = schema?.game?.gameName || schema?.game?.gameTitle || ''

  const [filterMode, setFilterMode] = useState<'all' | 'locked' | 'unlocked'>('all')
  const filteredAchievements = useMemo(() => {
    if (filterMode === 'all') return achievements
    return achievements.filter((a) => (filterMode === 'unlocked' ? a.__achieved : !a.__achieved))
  }, [achievements, filterMode])

  return (
    <div>
      <NavBar />
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Game Achievements</h1>
          <Link to="/games" className="text-sm text-blue-400">Back to games</Link>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Filter
              label="Show"
              variant="buttons"
              options={[{ key: 'all', label: 'All' }, { key: 'unlocked', label: 'Unlocked' }, { key: 'locked', label: 'Locked' }]}
              value={filterMode}
              onChange={(k) => setFilterMode(k as any)}
            />
          </div>
          <div className="text-sm text-gray-400">{achievements.filter(a => a.__achieved).length} / {achievements.length}</div>
        </div>

        {schemaQuery.isLoading && <p>Loading game schema...</p>}
        {schemaQuery.isError && <p className="text-red-400">Failed to load game schema.</p>}

        {filteredAchievements.length === 0 && !schemaQuery.isLoading && (
          <p className="text-gray-400">No achievements found for this app.</p>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredAchievements.map((ach) => {
            const key = ach.__key
            const achieved = ach.__achieved
            const icon = ach.icon || ach.displayIcon || ach.icon_url || ach.icongray
            return (
              <article
                key={key}
                className={`bg-gray-800 text-white rounded p-3 cursor-pointer hover:opacity-90 ${achieved ? 'ring-2 ring-green-400' : ''}`}
                onClick={() => {
                  const achName = (ach.displayName || ach.name || ach.apiname || '').trim()
                  // Simple query: game name with achievement name
                  const rawQuery = `${gameName} ${achName}`.trim()
                  const q = encodeURIComponent(rawQuery)
                  navigate(`/youtube?q=${q}`)
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') {
                  const achName = (ach.displayName || ach.name || ach.apiname || '').trim()
                  const rawQuery = `${gameName} ${achName}`.trim()
                  const q = encodeURIComponent(rawQuery)
                  navigate(`/youtube?q=${q}`)
                } }}
              >
                <div className="flex items-center gap-3">
                  {icon ? (
                    <img src={icon} alt={ach.displayName || ach.name} className="w-16 h-16 object-contain" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-700 flex items-center justify-center">?
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{ach.displayName || ach.name}</h3>
                    <p className="text-xs text-gray-400">{ach.description || ''}</p>
                    <p className="text-sm mt-1">{achieved ? 'Unlocked' : 'Locked'}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      </main>
    </div>
  )
}
