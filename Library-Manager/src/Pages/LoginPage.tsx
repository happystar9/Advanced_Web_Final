import '../App.css'
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useEffect, useState } from 'react';

function LoginPage() {
    const [email] = useState("");
    const navigate = useNavigate();
    const auth = useAuth();

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate("/Home")
            return;
        }
    }, [auth.isAuthenticated, navigate]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        auth.signinRedirect({ login_hint: email});
    }

    return (
    <>
      <div>
        <button
            onClick={handleLogin}
        >
            Sign In
        </button>
      </div>
    </>
  )
}

export default LoginPage