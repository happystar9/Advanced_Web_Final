import { useMemo } from 'react'
import type { SchemaAchievement, PlayerAchievement, ComputedAchievement } from '../types/steam'

export default function useAchievements(
  schemaAchievements?: SchemaAchievement[],
  playerAchievements?: PlayerAchievement[] | undefined
): ComputedAchievement[] {
  return useMemo(() => {
    const rawAchievements: SchemaAchievement[] = schemaAchievements || []

    const findPlayerAchievementFor = (
      schemaAch: SchemaAchievement,
      playerAchievements?: PlayerAchievement[] | undefined
    ): PlayerAchievement | undefined => {
      if (!playerAchievements || !Array.isArray(playerAchievements)) return undefined
      const candidates = playerAchievements
      const schemaKeys = new Set<string>()
      if (schemaAch.apiname) schemaKeys.add(String(schemaAch.apiname))
      if (schemaAch.name) schemaKeys.add(String(schemaAch.name))
      if (schemaAch.displayName) schemaKeys.add(String(schemaAch.displayName))
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

    return rawAchievements.map((ach) => {
      const key = ach.name || ach.apiname || ach.displayName || JSON.stringify(ach)
      const playerAch = findPlayerAchievementFor(ach, playerAchievements)
      const achieved = !!(playerAch ? (playerAch.achieved === 1 || playerAch.unlocktime) : false)
      return { ...(ach as SchemaAchievement), __key: key, __achieved: achieved } as ComputedAchievement
    })
  }, [schemaAchievements, playerAchievements])
}