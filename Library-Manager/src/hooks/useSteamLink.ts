import { useEffect, useState, useCallback } from 'react'
import { getProxyBase } from '../lib/getProxyBase'
import { apiFetch } from '../lib/api'
import storage from '../lib/storage'

type UseSteamLinkResult = {
    linkedSteam: string | null
    steamName: string | null
    link: () => void
    unlink: () => void
}

export default function useSteamLink(): UseSteamLinkResult {
    const [linkedSteam, setLinkedSteam] = useState<string | null>(() => storage.getString('linkedSteamId'))
    const [steamName, setSteamName] = useState<string | null>(null)

    const unlink = useCallback(() => {
        storage.removeItem('linkedSteamId')
        setLinkedSteam(null)
        setSteamName(null)
    }, [])

    const link = useCallback(() => {
        const proxyBase = getProxyBase()
        const loginUrl = `${proxyBase}/auth/steam/login?origin=${encodeURIComponent(window.location.origin)}`
        window.open(loginUrl, 'steam_link', 'width=600,height=700')
    }, [])

    useEffect(() => {
        function onMessage(e: MessageEvent) {
            const allowed: string[] = [window.location.origin]
            const proxyBase = getProxyBase()
            allowed.push(proxyBase.replace(/\/$/, ''))
            if (!allowed.includes(e.origin)) return
            const data = e.data || {}
            if (data && data.type === 'steam_link' && data.steamId) {
                const id = String(data.steamId)
                storage.setString('linkedSteamId', id)
                setLinkedSteam(id)
            }
        }

        window.addEventListener('message', onMessage)
        return () => window.removeEventListener('message', onMessage)
    }, [])

    useEffect(() => {
        if (!linkedSteam) {
            setSteamName(null)
            return
        }
        let mounted = true
            ; (async () => {
                const proxyBase = getProxyBase()
                type SteamApiResponse = { response?: { players?: Array<{ personaname?: string }> } }
                const json = await apiFetch(`${proxyBase}/api/steam/player/${encodeURIComponent(String(linkedSteam))}`) as SteamApiResponse
                const name = json?.response?.players?.[0]?.personaname
                if (mounted) setSteamName(name || null)
            })()
        return () => { mounted = false }
    }, [linkedSteam])

    return { linkedSteam, steamName, link, unlink }
}
