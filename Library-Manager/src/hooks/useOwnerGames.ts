import { useEffect, useState } from 'react'
import { fetchOwnerSteamId, fetchOwnedGames } from './useSteam'

export type OwnerGame = {
  appid: number
  name?: string
  playtime_forever?: number
}

export default function useOwnerGames(enabled: boolean) {
  const [games, setGames] = useState<OwnerGame[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadIndex, setReloadIndex] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let mounted = true

    async function loadOwnerGames() {
      setError(null)
      setLoading(true)
      if (mounted) setGames([])
      try {
        const ownerId = await fetchOwnerSteamId()
        if (!ownerId) throw new Error('Owner SteamID not available')
        const res = await fetchOwnedGames(ownerId, { include_appinfo: true, include_played_free_games: true })
        const json = res as Record<string, unknown>
        const response = (json['response'] as Record<string, unknown> | undefined) || undefined
        const list = response && Array.isArray(response['games']) ? (response['games'] as unknown[]) : []
        if (mounted) setGames(list as OwnerGame[])
      } catch (err: unknown) {
        if (mounted) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadOwnerGames()

    return () => {
      mounted = false
    }
  }, [enabled, reloadIndex])

  return {
    games,
    loading,
    error,
    reload: () => setReloadIndex((s) => s + 1),
  }
}
