import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Pages/HomePage'
import SettingsPage from './Pages/SettingsPage'
import GamesListPage from './Pages/GamesListPage'
import SavedVideos from './Pages/SavedVideosPage'
import Todo from './Pages/TodoPage'
import ProtectedRoute from './ProtectedRoute'
import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const oidcConfig = {
  authority: 'https://auth-dev.snowse.io/realms/DevRealm',
  client_id: 'Ricardo-Final',
  redirect_uri: window.location.origin + '/',
  post_redirect_uri: window.location.origin + '/',

}

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <QueryClientProvider client={queryClient}>
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
              path="/games"
              element={
                <ProtectedRoute>
                  <GamesListPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
)