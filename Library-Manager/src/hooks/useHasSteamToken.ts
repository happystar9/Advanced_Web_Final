import { useEffect, useState } from 'react'

export default function useHasSteamToken(): boolean {
  const [hasSteamToken, setHasSteamToken] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('steam_token')
    } catch {
      return false
    }
  })

  useEffect(() => {
    function onLinked() {
      try {
        setHasSteamToken(!!localStorage.getItem('steam_token'))
      } catch {
        setHasSteamToken(false)
      }
    }

    window.addEventListener('steam-linked', onLinked)
    return () => window.removeEventListener('steam-linked', onLinked)
  }, [])

  return hasSteamToken
}
