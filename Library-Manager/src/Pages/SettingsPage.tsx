import NavBar from "../components/NavBar"
import { useEffect, useState } from 'react'

function SettingsPage() {
  const [linkedSteam, setLinkedSteam] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('linkedSteamId')
    if (stored) setLinkedSteam(stored)

    function onMessage(e: MessageEvent) {
      // Accept messages from the client origin or the backend proxy origin
      const allowed: string[] = [window.location.origin]
      try {
        const env = (typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string> }) : undefined)
        const proxyBase = (env?.env?.VITE_STEAM_PROXY_URL) || 'http://localhost:3001'
        allowed.push(proxyBase.replace(/\/$/, ''))
      } catch (e) {
        console.warn('Could not read VITE_STEAM_PROXY_URL', e)
      }
      try {
        if (!allowed.includes(e.origin)) return
      } catch {
        return
      }
      const data = e.data || {}
      if (data && data.type === 'steam-linked') {
        if (data.steamid) {
          setLinkedSteam(String(data.steamid))
          localStorage.setItem('linkedSteamId', String(data.steamid))
        }
        if (data.steam_token) {
          try {
            localStorage.setItem('steam_token', String(data.steam_token))
          } catch (e) {
            console.warn('Could not store steam_token', e)
          }
        }
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  function openSteamLink() {
    const env = (typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string> }) : undefined)
    const proxyBase = (env?.env?.VITE_STEAM_PROXY_URL) || 'http://localhost:3001'
    const loginUrl = `${proxyBase.replace(/\/$/, '')}/auth/steam/login?origin=${encodeURIComponent(window.location.origin)}`
    window.open(loginUrl, 'steam_link', 'width=600,height=700')
  }

  function unlink() {
    localStorage.removeItem('linkedSteamId')
    setLinkedSteam(null)
  }

  return (
    <div>
      <NavBar />
      <div className="container mx-auto px-6 py-8 pt-20">
        <h2 className="text-2xl mb-4">Settings</h2>
        <div className="mb-6">
          <p className="mb-2">Link your Steam account so the app can show your games and achievements.</p>
          {linkedSteam ? (
            <div className="flex items-center gap-4">
              <a className="text-blue-400 underline" href={`https://steamcommunity.com/profiles/${linkedSteam}`} target="_blank" rel="noreferrer">View Steam profile</a>
              <div className="text-sm text-gray-300">Linked SteamID: {linkedSteam}</div>
              <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={unlink}>Unlink</button>
            </div>
          ) : (
            <div className="flex gap-4">
              <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={openSteamLink}>Link Steam account</button>
              <p className="text-sm text-gray-400">or paste a profile URL into the "My games" page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage