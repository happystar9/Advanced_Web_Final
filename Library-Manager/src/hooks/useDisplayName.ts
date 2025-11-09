import { useAuth } from 'react-oidc-context'

export function useDisplayName() {
  const auth = useAuth()
  const profile = auth.user?.profile as Record<string, unknown> | undefined

  const getDisplayName = (p?: Record<string, unknown>) => {
    if (!p) return ''
    const candidates = ['preferred_username', 'name', 'email']
    for (const k of candidates) {
      const val = p[k]
      if (typeof val === 'string' && val.trim()) return val
    }
    return ''
  }

  const displayName = getDisplayName(profile)

  return { displayName, profile, isAuthenticated: auth.isAuthenticated }
}

export default useDisplayName