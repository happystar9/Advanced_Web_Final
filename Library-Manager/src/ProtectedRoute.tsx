import React from 'react'
import { useAuth } from 'react-oidc-context'
import { Navigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'

type Props = {
  children: React.ReactElement
}

export default function ProtectedRoute({ children }: Props) {
  const auth = useAuth()
  const location = useLocation()
  // Accept either OIDC authentication OR a valid steam_token stored locally
  let hasSteamToken = false
  try {
    hasSteamToken = !!localStorage.getItem('steam_token')
  } catch {
    hasSteamToken = false
  }

  if (!auth.isAuthenticated && !hasSteamToken) {
    try {
      const key = `unauth_toast:${location.pathname}`
      if (!sessionStorage.getItem(key)) {
        toast.error('Need to be signed in')
        sessionStorage.setItem(key, '1')
      }
    } catch {
      toast.error('Need to be signed in')
    }
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}