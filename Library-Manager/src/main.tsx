import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Pages/HomePage.tsx'
import LoginPage from './Pages/LoginPage.tsx'
import './index.css'

const oidcConfig = {
  authority: "https://auth-dev.snowse.io/realms/DevRealm",
  client_id: "Ricardo-Final",
  redirect_uri: "http://localhost:5173/Home",
  post_redirect_uri: "http://localhost:5173/Home"
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <BrowserRouter>
        <Routes>
          <Route index element={<LoginPage />} />
          <Route path="/Home" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
