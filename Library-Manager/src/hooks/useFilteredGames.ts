import { useMemo } from 'react'
import type { OwnerGame as Game } from './useOwnerGames'

export type SortMode = 'alpha' | 'alpha-desc' | 'hours-desc' | 'hours-asc'
export type HoursFilter = 'all' | 'gt100' | 'gt10' | 'lt10'

export default function useFilteredGames(
  games: Game[] | undefined,
  sortMode: SortMode,
  hoursFilter: HoursFilter,
  searchTerm?: string,
) {
  return useMemo(() => {
    let list = Array.isArray(games) ? [...games] : []

    // filter by search term (name or appid)
    if (searchTerm && searchTerm.trim().length > 0) {
      const q = String(searchTerm).toLowerCase().trim()
      list = list.filter((g: Game) => {
        const name = String(g.name || '').toLowerCase()
        const id = String(g.appid || '')
        return name.includes(q) || id.includes(q)
      })
    }

    // filter by hours (playtime_forever is in minutes)
    list = list.filter((g: Game) => {
      const mins = Number(g.playtime_forever ?? 0)
      if (hoursFilter === 'gt100') return mins >= 100 * 60
      if (hoursFilter === 'gt10') return mins >= 10 * 60
      if (hoursFilter === 'lt10') return mins < 10 * 60
      return true
    })

    // sort
    if (sortMode === 'alpha') list.sort((a: Game, b: Game) => String(a.name || '').localeCompare(String(b.name || '')))
    else if (sortMode === 'alpha-desc') list.sort((a: Game, b: Game) => String(b.name || '').localeCompare(String(a.name || '')))
    else if (sortMode === 'hours-desc') list.sort((a: Game, b: Game) => (Number(b.playtime_forever ?? 0) - Number(a.playtime_forever ?? 0)))
    else if (sortMode === 'hours-asc') list.sort((a: Game, b: Game) => (Number(a.playtime_forever ?? 0) - Number(b.playtime_forever ?? 0)))

    return list
  }, [games, sortMode, hoursFilter, searchTerm])
}