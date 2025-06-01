// AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const clientData = localStorage.getItem('client');
      
      if (token && clientData) {
        try {
          // Configurer axios avec le token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          axios.defaults.withCredentials = true;
          
          // Parser les données client
          const client = JSON.parse(clientData);
          setUser(client);
          
          console.log('Utilisateur authentifié:', client);
        } catch (e) {
          console.error('Erreur parsing client data:', e);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (token, client) => {
    try {
      // Stocker les données
      localStorage.setItem('auth_token', token);
      localStorage.setItem('client', JSON.stringify(client));
      
      // Configurer axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.withCredentials = true;
      
      // Mettre à jour l'état
      setUser(client);
      
      console.log('Login réussi:', client);
    } catch (error) {
      console.error('Erreur lors du login:', error);
    }
  };

  const logout = () => {
    // Supprimer les données stockées
    localStorage.removeItem('auth_token');
    localStorage.removeItem('client');
    
    // Nettoyer axios
    delete axios.defaults.headers.common['Authorization'];
    
    // Réinitialiser l'état
    setUser(null);
    
    // Rediriger vers login
    navigate('/login');
    
    console.log('Déconnexion effectuée');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
};