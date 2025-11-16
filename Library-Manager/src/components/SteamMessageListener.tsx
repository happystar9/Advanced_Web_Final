import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

export default function SteamMessageListener() {
  const qc = useQueryClient()
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      // allow messages from either the client origin or the configured backend proxy origin
      let allowed = [window.location.origin]
      try {
        const env = (typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string> }) : undefined)
        const proxy = (env?.env?.VITE_STEAM_PROXY_URL) || 'http://localhost:3001'
        const protoHost = proxy.replace(/\/$/, '')
        allowed.push(protoHost)
      } catch {}
      try {
        if (!allowed.includes(e.origin)) return
      } catch {
        return
      }
      const data = e.data || {}
      if (data && data.type === 'steam-linked') {
        if (data.steamid) {
          try {
            localStorage.setItem('linkedSteamId', String(data.steamid))
          } catch (err) {
            console.warn('Could not store linkedSteamId', err)
          }
        }
        if (data.steam_token) {
          try {
            localStorage.setItem('steam_token', String(data.steam_token))
          } catch (err) {
            console.warn('Could not store steam_token', err)
          }
        }
        try {
          toast.success('Signed in with Steam')
        } catch {}
        // invalidate react-query caches so pages refresh
        try {
          qc.invalidateQueries({ queryKey: ['ownerSteamId'] })
          qc.invalidateQueries({ queryKey: ['playerAchievements'] })
          qc.invalidateQueries({ queryKey: ['ownedGames'] })
        } catch (e) {
          // ignore
        }
        // dispatch an event so other parts of the app can react
        try {
          window.dispatchEvent(new Event('steam-linked'))
        } catch {}
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return null
}
