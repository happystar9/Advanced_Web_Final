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
  const [localLinked, setLocalLinked] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('linkedSteamId')
    } catch {
      return false
    }
  })

  useEffect(() => {
    const effectiveEnabled = enabled || localLinked
    if (!effectiveEnabled) return
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

    // also listen for steam-linked events (popup flow) to trigger reload
    function onLinked() {
      setLocalLinked(true)
      setReloadIndex((s) => s + 1)
    }
    window.addEventListener('steam-linked', onLinked)

    return () => {
      mounted = false
      window.removeEventListener('steam-linked', onLinked)
    }
  }, [enabled, localLinked, reloadIndex])

  return {
    games,
    loading,
    error,
    reload: () => setReloadIndex((s) => s + 1),
  }
}