import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import '../styles/NavBar.css'

export default function NavBar() {
    const auth = useAuth()
    const navigate = useNavigate()

    const handleSignOut = (e: React.MouseEvent) => {
        e.preventDefault()
        auth.removeUser()
        try {
            sessionStorage.clear()
        } catch (err) {
            console.debug('sessionStorage clear failed', err)
        }
        navigate('/')
    }

    const handleSignIn = (e: React.MouseEvent) => {
        e.preventDefault()
        auth.signinRedirect()
    }

    return (
        <div className='navbar-header'>
            <div className='navbar-container'>
                <nav className="navbar-nav">
                    <Link to="/Home" style={{ marginRight: 8 }}>
                        Home
                    </Link>
                    {auth.isAuthenticated ? (
                        <>
                            <Link to="/settings" style={{ marginRight: 8 }}>
                                Settings
                            </Link>
                            <Link to="/games" style={{ marginRight: 12 }}>
                                Games
                            </Link>
                            <a href="#" onClick={handleSignOut} style={{ color: 'blue' }}>
                                Logout
                            </a>
                        </>
                    ) : (
                        <a href="#" onClick={handleSignIn}>
                            Sign In
                        </a>
                    )}
                </nav>
            </div>
        </div>
    )
}