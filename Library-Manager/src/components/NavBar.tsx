import { Link, useLocation } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import useAuthActions from '../hooks/useAuthActions'
import '../styles/NavBar.css'

function NavBar() {
    const auth = useAuth()
    const { signIn, signOut } = useAuthActions()
    const location = useLocation()
    const showHomeLink = !( !auth?.isAuthenticated && (location?.pathname === '/' || location?.pathname === '') )

    return (
        <div className="navbar-header">
            <div className="navbar-container">
                <div className="flex items-center w-full">
                    <nav className={`navbar-nav sm:flex sm:ml-auto`}>
                        {showHomeLink && <Link to="/" className="font-semibold ml-2 sm:ml-0">Home</Link>}
                        {auth.isAuthenticated ? (
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
                    </nav>
                </div>
            </div>
        </div>
    )
}

export default NavBar