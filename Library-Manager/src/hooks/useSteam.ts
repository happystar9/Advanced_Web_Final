import { apiFetch } from '../lib/api'

type PlayerSummariesResponse = {
  response?: {
    players?: Array<Record<string, unknown>>
  }
}

type ImportMetaWithViteEnv = {
  readonly env?: {
    readonly VITE_STEAM_PROXY_URL?: string
  }
}

const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as unknown as ImportMetaWithViteEnv).env?.VITE_STEAM_PROXY_URL) || ''

export async function fetchPlayerSummaries(steamid: string): Promise<PlayerSummariesResponse> {
  const base = API_BASE || ''
  const url = `${base}/api/steam/player/${encodeURIComponent(steamid)}`
  return await apiFetch(url)
}

export async function resolveVanity(vanity: string): Promise<Record<string, unknown>> {
  const base = API_BASE || ''
  const url = `${base}/api/steam/resolve/${encodeURIComponent(vanity)}`
  return await apiFetch(url)
}

export async function fetchOwnedGames(
  steamid: string,
  options?: { include_appinfo?: boolean; include_played_free_games?: boolean },
): Promise<Record<string, unknown>> {
  const base = API_BASE || ''
  const params = new URLSearchParams()
  if (options?.include_appinfo) params.set('include_appinfo', '1')
  if (options?.include_played_free_games) params.set('include_played_free_games', '1')
  const q = params.toString() ? `?${params.toString()}` : ''
  const url = `${base}/api/steam/owned/${encodeURIComponent(steamid)}${q}`
  return await apiFetch(url)
}

export default {
  fetchPlayerSummaries,
  resolveVanity,
}

export async function fetchOwnerSteamId(): Promise<string> {
  const base = API_BASE || ''
  try {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('linkedSteamId')
      if (local) return local
    }
  } catch {
    // ignore
  }

  const url = `${base}/api/steam/me`
  const json = (await apiFetch(url)) as Record<string, unknown> | null
  if (!json || typeof json['steamid'] !== 'string') {
    throw new Error('Invalid response from steam proxy: missing steamid')
  }
  return json['steamid']
}

export async function fetchGameSchema(appid: string): Promise<Record<string, unknown>> {
  const base = API_BASE || ''
  const url = `${base}/api/steam/schema/${encodeURIComponent(appid)}`
  return await apiFetch(url)
}

export async function fetchPlayerAchievements(appid: string, steamid?: string): Promise<Record<string, unknown>> {
  const base = API_BASE || ''
  const q = steamid ? `?steamid=${encodeURIComponent(steamid)}` : ''
  const url = `${base}/api/steam/playerachievements/${encodeURIComponent(appid)}${q}`
  return await apiFetch(url)
}