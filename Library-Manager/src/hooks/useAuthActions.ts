import { useAuth } from 'react-oidc-context'
import { useNavigate } from 'react-router-dom'

export function useAuthActions() {
    const auth = useAuth()
    const navigate = useNavigate()

    const signIn = async (opts?: Record<string, unknown>) => {
        return auth.signinRedirect(opts as unknown as Record<string, unknown>)
    }

    const signOut = async () => {
        await auth.removeUser()
        sessionStorage.clear()
        navigate('/')
    }

    return { auth, signIn, signOut }
}

export default useAuthActions