import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Pages/HomePage'
import LoginPage from './Pages/LoginPage'
import SettingsPage from './Pages/SettingsPage'
import GamesListPage from './Pages/GamesListPage'
import ProtectedRoute from './ProtectedRoute'
import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const oidcConfig = {
  authority: 'https://auth-dev.snowse.io/realms/DevRealm',
  client_id: 'Ricardo-Final',
  redirect_uri: 'http://localhost:5173/Home',
  post_redirect_uri: 'http://localhost:5173/Home',
}

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route index element={<LoginPage />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/settings" element={<SettingsPage />} />
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