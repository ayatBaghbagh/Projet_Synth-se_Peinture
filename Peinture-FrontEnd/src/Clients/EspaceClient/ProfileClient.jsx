import React, { useState, useEffect } from 'react';
import { 
  User, Home, FileText, FolderOpen, Bell, LogOut, 
  Edit3, Mail, Phone, MapPin, Building, Calendar, Save, X
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function ProfileClient() {
  const [user, setUser] = useState({
    id: '',
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    entreprise: '',
    dateInscription: '',
    clientId: '',
    statut: '',
    notes: '',
    avatar: null
  });
  
  const [stats] = useState({
    devisEnAttente: 1,
    projetsEnCours: 1,
    projetsTermines: 5,
    totalInvesti: '€15,420'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...user });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE_URL = 'http://localhost:8000/api';

  // Navigation items (identique à MesDevisPage)
  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: User, label: 'Mon Profil', path: '/profile', protected: true },
    { icon: FileText, label: 'Mes Devis', path: '/mesdevis', protected: true },
    { icon: FolderOpen, label: 'Mes Projets', path: '/mes-projets', protected: true },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  // Fonctions pour gérer les tokens (identique à MesDevisPage)
  const getCSRFToken = () => {
    const tokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='));
      
    if (tokenCookie) {
      return decodeURIComponent(tokenCookie.split('=')[1]);
    }
    return '';
  };

  const getAuthToken = () => {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  };

  const getHeaders = () => {
    const authToken = getAuthToken();
    const csrfToken = getCSRFToken();
    
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken })
    };
  };

  // Initialisation CSRF et auth (identique à MesDevisPage)
  const initializeApp = async () => {
    try {
      // 1. Récupérer le cookie CSRF
      await fetch(`${API_BASE_URL}/../sanctum/csrf-cookie`, {
        method: 'GET',
        credentials: 'include'
      });
      
      // 2. Mettre à jour le token CSRF
      const token = getCSRFToken();
      setCsrfToken(token);
      
      // 3. Vérifier l'authentification
      const authToken = getAuthToken();
      if (!authToken) {
        localStorage.setItem('redirectAfterLogin', '/profile');
        navigate('/login');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erreur initialisation CSRF:', error);
      setError('Erreur de connexion au serveur');
      return false;
    }
  };

  // Charger les données du profil
  const fetchProfile = async () => {
    try {
      const initialized = await initializeApp();
      if (!initialized) return;

      const response = await fetch(`${API_BASE_URL}/client/profile`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      if (response.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        localStorage.setItem('redirectAfterLogin', '/profile');
        navigate('/login');
        return;
      }

      if (response.status === 419) {
        const refreshed = await initializeApp();
        if (refreshed) {
          return fetchProfile();
        }
        throw new Error('Erreur CSRF persistante. Veuillez recharger la page.');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.client) {
        setUser(data.client);
        setEditData(data.client);
      } else {
        throw new Error(data.message || 'Erreur lors du chargement du profil');
      }
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err);
      setError(err.message || 'Erreur lors du chargement du profil');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la déconnexion (identique à MesDevisPage)
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/client/logout`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include'
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('client');
      sessionStorage.removeItem('auth_token');
      navigate('/login');
    }
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    try {
      setError('');
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/client/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(editData)
      });

      if (response.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        localStorage.setItem('redirectAfterLogin', '/profile');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setUser(editData);
        setIsEditing(false);
      } else {
        throw new Error(data.message || 'Erreur lors de la mise à jour du profil');
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...user });
    setIsEditing(false);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // Charger les données au montage
  useEffect(() => {
    fetchProfile();
  }, []);

  // Formatage des dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Affichage du loading
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex w-screen">
      {/* Sidebar (identique à MesDevisPage) */}
      <div className="w-64 bg-white shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Espace Client</h2>
        </div>
        
        <nav className="mt-8">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isAuthenticated = !!getAuthToken();

            if (item.protected && !isAuthenticated) return null;

            return (
              <div key={index} className="relative">
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-red-600 bg-red-50 border-r-2 border-red-600'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                  {isActive && (
                    <div className="absolute right-0 w-1 h-full bg-red-600 rounded-l"></div>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6">
          <button 
            onClick={handleLogout}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                AP
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ArtisanPeinture</h1>
                <p className="text-sm text-gray-600">Gérez votre profil</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modifier
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'En cours...' : 'Sauvegarder'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                <X className="w-5 h-5 mr-2" />
                {error}
              </div>
              <button 
                onClick={() => setError('')}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Fermer
              </button>
            </div>
          )}

          {/* Cards Statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard 
              title="Projets en Cours" 
              value={stats.projetsEnCours}
              color="blue"
            />
            <StatCard 
              title="Projets Terminés" 
              value={stats.projetsTermines}
              color="green"
            />
            <StatCard 
              title="Total Investi" 
              value={stats.totalInvesti}
              color="purple"
            />
            <StatCard 
              title="Devis en Attente" 
              value={stats.devisEnAttente}
              color="red"
              urgent
            />
          </div>

          {/* Deux Divs Côte à Côte */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Profil Client
              </h2>

              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {user.prenom} {user.nom}
                  </h3>
                  <p className="text-gray-600">{user.entreprise || 'Particulier'}</p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mt-2">
                    {user.statut || 'Client'}
                  </span>
                </div>

                <div className="space-y-3">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <InfoRow 
                      icon={Calendar} 
                      label="Membre depuis" 
                      value={user.dateInscription ? formatDate(user.dateInscription) : 'N/A'} 
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <InfoRow 
                      icon={User} 
                      label="ID Client" 
                      value={user.id ? `CLI-${user.id}` : 'N/A'} 
                    />
                  </motion.div>
                </div>

                <div className="pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                  {isEditing ? (
                    <textarea
                      name="notes"
                      value={editData.notes || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      rows="3"
                      placeholder="Ajoutez vos notes..."
                    />
                  ) : (
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                      {user.notes || 'Aucune note'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Informations personnelles Card */}
            <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-green-600" />
                Informations Personnelles
              </h2>

              <div className="space-y-4">
                <InfoField 
                  label="Prénom" 
                  value={user.prenom || ''} 
                  editable={isEditing} 
                  name="prenom"
                  editValue={editData.prenom || ''}
                  onChange={handleInputChange}
                />
                <InfoField 
                  label="Nom" 
                  value={user.nom || ''} 
                  editable={isEditing} 
                  name="nom"
                  editValue={editData.nom || ''}
                  onChange={handleInputChange}
                />
                <InfoField 
                  label="Email" 
                  value={user.email || ''} 
                  icon={<Mail />}
                  iconColor="text-blue-500"
                  editable={isEditing} 
                  name="email"
                  editValue={editData.email || ''}
                  onChange={handleInputChange}
                />
                <InfoField 
                  label="Téléphone" 
                  value={user.telephone || ''} 
                  icon={<Phone />}
                  iconColor="text-green-500"
                  editable={isEditing} 
                  name="telephone"
                  editValue={editData.telephone || ''}
                  onChange={handleInputChange}
                />
                <InfoField 
                  label="Adresse" 
                  value={user.adresse || ''} 
                  icon={<MapPin />}
                  iconColor="text-red-500"
                  editable={isEditing} 
                  name="adresse"
                  editValue={editData.adresse || ''}
                  onChange={handleInputChange}
                  textarea
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composants utilitaires (identique à votre version précédente)
function StatCard({ title, value, color, urgent }) {
  const colorMap = {
    blue: 'border-blue-200 bg-blue-50 text-blue-600',
    green: 'border-green-200 bg-green-50 text-green-600',
    purple: 'border-purple-200 bg-purple-50 text-purple-600',
    red: 'border-red-200 bg-red-50 text-red-600'
  };

  return (
    <div className={`rounded-xl p-6 border-2 ${colorMap[color]} ${urgent ? 'ring-2 ring-red-300' : ''}`}>
      <div className="text-center">
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-sm font-medium opacity-80">{title}</div>
      </div>
    </div>
  );
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center text-sm">
    <Icon className="w-4 h-4 mr-2 text-gray-400" />
    <span className="text-gray-600 mr-2">{label}:</span>
    <span className="font-medium text-gray-800">{value}</span>
  </div>
);

const InfoField = ({ label, value, icon, iconColor = 'text-gray-400', editable, name, onChange, editValue, textarea }) => (
  <div className="border-b border-gray-100 pb-3">
    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
    {editable ? (
      textarea ? (
        <textarea
          name={name}
          value={editValue}
          onChange={onChange}
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          rows="2"
        />
      ) : (
        <input
          type="text"
          name={name}
          value={editValue}
          onChange={onChange}
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      )
    ) : (
      <div className="flex items-center mt-1">
        {icon && React.cloneElement(icon, { className: `w-4 h-4 mr-2 ${iconColor}` })}
        <span className="text-gray-800 text-sm">{value || 'Non renseigné'}</span>
      </div>
    )}
  </div>
);