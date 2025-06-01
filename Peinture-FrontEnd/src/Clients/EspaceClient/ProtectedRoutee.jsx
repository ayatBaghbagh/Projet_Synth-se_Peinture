// Créer un composant ProtectedRoute.jsx :
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ProtectedRoutee = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getAuthToken = () => {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  };

  useEffect(() => {
    const token = getAuthToken();
    
    if (!token) {
      // Sauvegarder la route demandée
      localStorage.setItem('redirectAfterLogin', location.pathname);
      navigate('/login');
    }
  }, [navigate, location]);

  return getAuthToken() ? children : null;
};

export default ProtectedRoutee;
