import { useQuery } from '@tanstack/react-query'
import { useAuth } from 'react-oidc-context'
import { fetchGameSchema, fetchPlayerAchievements, fetchOwnerSteamId } from '../hooks/useSteam'
import useAchievements from './useAchievements'
import type { GameSchema, PlayerStatsResponse, ComputedAchievement } from '../types/steam'

export default function useGameDetails(appid?: string) {
  const auth = useAuth()

  const ownerQuery = useQuery({
    queryKey: ['ownerSteamId'],
    queryFn: () => fetchOwnerSteamId(),
    enabled: !!auth?.isAuthenticated,
  })

  const schemaQuery = useQuery({
    queryKey: ['schema', appid],
    queryFn: () => fetchGameSchema(appid || ''),
    enabled: !!appid,
  })

  const playerQuery = useQuery({
    queryKey: ['playerAchievements', appid, ownerQuery.data],
    queryFn: () => fetchPlayerAchievements(appid || '', ownerQuery.data),
    enabled: !!appid && !!ownerQuery.data,
  })

  const schema = schemaQuery.data as GameSchema | undefined
  const player = playerQuery.data as PlayerStatsResponse | undefined

  const schemaAchievements = schema?.game?.availableGameStats?.achievements
  const playerAchievementsList = player?.playerstats?.achievements

  const computed = useAchievements(schemaAchievements, playerAchievementsList)

  return {
    schema,
    player,
    achievements: computed as ComputedAchievement[],
    isLoading: ownerQuery.isLoading || schemaQuery.isLoading || playerQuery.isLoading,
    isError: ownerQuery.isError || schemaQuery.isError || playerQuery.isError,
    refetch: () => {
      ownerQuery.refetch()
      schemaQuery.refetch()
      playerQuery.refetch()
    },
  }
}