import NavBar from "../components/NavBar"
import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import '../styles/SettingsPage.css'
import SettingsLayout, { SidebarCard, SidebarItem } from '../components/SettingsLayout'
import SettingRow from '../components/SettingRow'
import SmallButton from '../components/SmallButton'

function SettingsPage() {
  const [linkedSteam, setLinkedSteam] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'Account' | 'Notification'>('Account')
  const [steamName, setSteamName] = useState<string | null>(null)
  const [notificationTimer, setNotificationTimer] = useState<number>(15)
  const [timerSaved, setTimerSaved] = useState<boolean>(false)

  useEffect(() => {
    const stored = localStorage.getItem('linkedSteamId')
    if (stored) setLinkedSteam(stored)
    function onMessage(e: MessageEvent) {
      const allowed: string[] = [window.location.origin]
      const env = (typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string> }) : undefined)
      const proxyBase = (env?.env?.VITE_STEAM_PROXY_URL) || 'http://localhost:3001'
      allowed.push(proxyBase.replace(/\/$/, ''))

      if (!allowed.includes(e.origin)) return

      const data = e.data || {}
      if (data && data.type === 'steam_link' && data.steamId) {
        const id = String(data.steamId)
        localStorage.setItem('linkedSteamId', id)
        setLinkedSteam(id)
      }
    }

    window.addEventListener('message', onMessage)
    return () => { window.removeEventListener('message', onMessage) }
  }, [])

  function openSteamLink() {
    const proxyBase = getProxyBase()
    const loginUrl = `${proxyBase}/auth/steam/login?origin=${encodeURIComponent(window.location.origin)}`
    window.open(loginUrl, 'steam_link', 'width=600,height=700')
  }

  function unlink() {
    localStorage.removeItem('linkedSteamId')
    setLinkedSteam(null)
  }

  function getProxyBase() {
    const env = (typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string> }) : undefined)
    const envBase = env?.env?.VITE_STEAM_PROXY_URL ? String(env.env.VITE_STEAM_PROXY_URL).replace(/\/$/, '') : ''
    const hostOrigin = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.origin : ''
    const isProdHost = hostOrigin && !/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
    return envBase || (isProdHost ? hostOrigin : 'http://localhost:3001')
  }

  useEffect(() => {
    if (!linkedSteam) {
      setSteamName(null)
      return
    }
    let mounted = true
    async function fetchName() {
        const proxyBase = getProxyBase()
        const json = await apiFetch(`${proxyBase}/api/steam/player/${encodeURIComponent(String(linkedSteam))}`)
        type PlayerApi = { response?: { players?: Array<{ personaname?: string }> } }
        const j = json as unknown as PlayerApi
        const name = j?.response?.players?.[0]?.personaname
        if (mounted) setSteamName(name || null)
      }
    fetchName()
    return () => { mounted = false }
  }, [linkedSteam])

  useEffect(() => {
    const raw = localStorage.getItem('notificationTimer')
    if (raw) {
      const n = parseInt(raw, 10)
      if (!Number.isNaN(n)) setNotificationTimer(n)
    }
  }, [])

  function saveNotificationTimer() {
    const n = Number(notificationTimer) || 0
    localStorage.setItem('notificationTimer', String(n))
    setTimerSaved(true)
    setTimeout(() => setTimerSaved(false), 2000)
  }

  return (
    <div>
      <NavBar />
      <div className="w-full pl-6 pr-6 pt-20 settings-page-wrapper left-anchored">
        <SettingsLayout
          sidebar={(
            <SidebarCard>
              <SidebarItem active={activeTab === 'Account'} onClick={() => setActiveTab('Account')}>Account</SidebarItem>
              <SidebarItem active={activeTab === 'Notification'} onClick={() => setActiveTab('Notification')}>Notification</SidebarItem>
            </SidebarCard>
          )}
        >
          {activeTab === 'Account' && (
            <div>
              <h2 className="section-header">Account Settings</h2>
              <div className="section">
                <SettingRow>
                  {!linkedSteam && <p className="mb-2">Link your Steam account</p>}
                  {linkedSteam ? (
                    <div className="settings-actions">
                      <div className="muted-2">{steamName ? `Signed in as ${steamName}` : 'Steam account linked'}</div>
                      <a className="profile-link" href={`https://steamcommunity.com/profiles/${linkedSteam}`} target="_blank" rel="noreferrer">View Steam profile</a>
                      <div>
                        <SmallButton onClick={unlink}>Unlink</SmallButton>
                      </div>
                    </div>
                  ) : (
                    <div className="settings-actions">
                      <p className="muted">Connect your Steam account to view games and achievements.</p>
                      <div>
                        <SmallButton onClick={openSteamLink}>Link Steam account</SmallButton>
                      </div>
                    </div>
                  )}
                </SettingRow>
              </div>
            </div>
          )}

          {activeTab === 'Notification' && (
            <div>
              <h2 className="section-header">Notification Settings</h2>
              <div className="section">
                <SettingRow label="Notification timer (minutes)">
                  <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                    <input type="number" min={0} value={notificationTimer} onChange={(e) => setNotificationTimer(Number(e.target.value || 0))} className="control-select" />
                    <SmallButton onClick={saveNotificationTimer}>Save</SmallButton>
                    {timerSaved && <div className="small-note">Saved</div>}
                  </div>
                  <div className="small-note">This value will be used to notify the player (minutes).</div>
                </SettingRow>
              </div>
            </div>
          )}
        </SettingsLayout>
      </div>
    </div>
  )
}

export default SettingsPage