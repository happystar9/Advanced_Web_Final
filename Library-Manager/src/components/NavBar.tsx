import { Link } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import useAuthActions from '../hooks/useAuthActions'
import '../styles/NavBar.css'

function NavBar() {
    const auth = useAuth()

    const { signIn, signOut } = useAuthActions()

    return (
        <div className='navbar-header'>
            <div className='navbar-container'>
                <nav className="navbar-nav">
                    <Link to="/" style={{ marginRight: 8 }}>
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
                            <Link to="/saved-videos" style={{ marginRight: 12 }}>
                                Saved Videos
                            </Link>
                            <Link to="/todo" style={{ marginRight: 12 }}>
                                Todo
                            </Link>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    signOut()
                                }}
                            >
                                Logout
                            </a>
                        </>
                    ) : (
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                signIn()
                            }}
                        >
                            Sign In
                        </a>
                    )}
                </nav>
            </div>
        </div>
    )
}

export default NavBar