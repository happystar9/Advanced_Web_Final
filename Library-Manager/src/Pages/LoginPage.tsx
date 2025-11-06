import '../App.css'
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import NavBar from '../components/NavBar';

function LoginPage() {
    const navigate = useNavigate();
    const auth = useAuth();

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate("/Home")
            return;
        }
    }, [auth.isAuthenticated, navigate]);

    return (
    <>
      <div>
        <NavBar />
      </div>
    </>
  )
}

export default LoginPage