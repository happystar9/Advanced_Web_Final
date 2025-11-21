import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Pages/HomePage'
import SettingsPage from './Pages/SettingsPage'
import GamesListPage from './Pages/GamesListPage'
import SavedVideos from './Pages/SavedVideosPage'
import YouTubeResultsPage from './Pages/YouTubeResultsPage'
import Todo from './Pages/TodoPage'
import GameDetailsPage from './Pages/GameDetailsPage'
import ProtectedRoute from './ProtectedRoute'
import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SteamMessageListener from './components/SteamMessageListener'
import { AppToaster } from './Toast'
import ErrorBoundary from './components/ErrorBoundary'
import toast from 'react-hot-toast'

const oidcConfig = {
  authority: 'https://auth-dev.snowse.io/realms/DevRealm',
  client_id: 'Ricardo-Final',
  redirect_uri: window.location.origin + '/',
  post_redirect_uri: window.location.origin + '/',
}

const queryClient = new QueryClient()
type QueryClientSetter = {
  setDefaultOptions: (opts: { queries?: { onError?: (err: unknown) => void } }) => void
}
;(queryClient as unknown as QueryClientSetter).setDefaultOptions({
  queries: {
    onError: (err: unknown) => {
      const maybe = err as unknown as { message?: unknown }
      const msg = maybe && typeof maybe.message === 'string' ? maybe.message : 'An error occurred while fetching data.'
      toast.error(String(msg))
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AppToaster />
          <SteamMessageListener />
          <BrowserRouter>
          <Routes>
            <Route index path="/" element={<Home />} />
            <Route path="/settings" element={<SettingsPage />} />
              <Route
                path="/saved-videos"
                element={
                  <ProtectedRoute>
                    <SavedVideos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/todo"
                element={
                  <ProtectedRoute>
                    <Todo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/:appid"
                element={
                  <ProtectedRoute>
                    <GameDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/youtube"
                element={
                  <ProtectedRoute>
                    <YouTubeResultsPage />
                  </ProtectedRoute>
                }
              />
            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <GamesListPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
        </ErrorBoundary>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
)