import { Link, useLocation } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import useAuthActions from '../hooks/useAuthActions'
import '../styles/NavBar.css'
import { useEffect, useState } from 'react'

function NavBar() {
    const auth = useAuth()
    const { signIn, signOut } = useAuthActions()
    const location = useLocation()
    const [hasSteamToken, setHasSteamToken] = useState(false)

    useEffect(() => {
        try {
            setHasSteamToken(!!localStorage.getItem('steam_token'))
        } catch {
            setHasSteamToken(false)
        }

        function onLinked() {
            try {
                setHasSteamToken(!!localStorage.getItem('steam_token'))
            } catch {
                setHasSteamToken(false)
            }
        }

        window.addEventListener('steam-linked', onLinked)
        return () => window.removeEventListener('steam-linked', onLinked)
    }, [])

    const showHomeLink = !(!auth?.isAuthenticated && (location?.pathname === '/' || location?.pathname === ''))

    return (
        <div className="navbar-header">
            <div className="navbar-container">
                <div className="flex items-center w-full">
                    <nav className={`navbar-nav sm:flex sm:ml-auto`}>
                        {showHomeLink && <Link to="/" className="font-semibold ml-2 sm:ml-0">Home</Link>}
                        {(auth.isAuthenticated || hasSteamToken) ? (
                            <>
                                <Link to="/settings" className="ml-2 sm:ml-4">Settings</Link>
                                <Link to="/games" className="ml-2 sm:ml-4">Games</Link>
                                <Link to="/saved-videos" className="ml-2 sm:ml-4">Saved Videos</Link>
                                <Link to="/todo" className="ml-2 sm:ml-4">Todo</Link>
                                <a
                                    href="#"
                                    className="ml-2 sm:ml-4"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        try {
                                            localStorage.removeItem('steam_token')
                                            localStorage.removeItem('linkedSteamId')
                                            setHasSteamToken(false)
                                        } catch (e) {
                                            console.warn('Could not clear steam token', e)
                                        }
                                        signOut()
                                    }}
                                >
                                    Logout
                                </a>
                            </>
                        ) : (
                            <a
                                href="#"
                                className="ml-2 sm:ml-4"
                                onClick={(e) => {
                                    e.preventDefault()
                                    signIn()
                                }}
                            >
                                Sign In
                            </a>
                        )}
                        {!auth.isAuthenticated && !hasSteamToken && (
                            <a
                                href="#"
                                className="ml-2 sm:ml-4"
                                onClick={(e) => {
                                    e.preventDefault()
                                    const env = (typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string> }) : undefined)
                                    const proxyBase = (env?.env?.VITE_STEAM_PROXY_URL) || 'http://localhost:3001'
                                    const loginUrl = `${proxyBase.replace(/\/$/, '')}/auth/steam/login?origin=${encodeURIComponent(window.location.origin)}`
                                    window.open(loginUrl, 'steam_login', 'width=600,height=700')
                                }}
                            >
                                Sign In with Steam
                            </a>
                        )
                        }
                    </nav>
                </div>
            </div>
        </div>
    )
}

export default NavBar