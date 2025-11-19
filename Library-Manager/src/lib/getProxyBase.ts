export function getProxyBase(): string {
  try {
    const meta: any = (typeof import.meta !== 'undefined' ? import.meta : undefined)
    const envBase = meta?.env?.VITE_STEAM_PROXY_URL ? String(meta.env.VITE_STEAM_PROXY_URL).replace(/\/$/, '') : ''
    const hostOrigin = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.origin : ''
    const isProdHost = hostOrigin && !/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
    return envBase || (isProdHost ? hostOrigin : 'http://localhost:3001')
  } catch {
    return 'http://localhost:3001'
  }
}

export default getProxyBase
