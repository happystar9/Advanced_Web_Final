import { useAuth } from 'react-oidc-context'
import NavBar from '../components/NavBar'

export default function GamesListPage() {
  const auth = useAuth()
  const username = auth.user?.profile?.preferred_username || auth.user?.profile?.name || 'user'

  return (
    <div>
      <NavBar />
      <h2>Games (Authorized)</h2>
      {auth?.isAuthenticated ? (
        <div>
          <p>Welcome, {username}.</p>
          <p>This page is protected and only visible to authenticated users.</p>
          <ul>
            <li>Game A</li>
            <li>Game B</li>
            <li>Game C</li>
          </ul>
        </div>
      ) : (
        <p>Loading authentication...</p>
      )}
    </div>
  )
}