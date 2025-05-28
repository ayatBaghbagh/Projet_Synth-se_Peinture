import React, { useState, useEffect } from 'react'; 
import { 
  ArrowLeft, Edit3, Mail, Phone, MapPin, Building, User, Calendar,
  FileText, Folder, Bell, Settings, LogOut, Save, X, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MesDevisPage } from './MesDevisPage';

export function ProfileClient({ onNavigate, userData }) {
  const navigate = useNavigate();
  
  // État initial avec des valeurs par défaut
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fonction pour récupérer les données du profil
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('client_token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/client/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        withCredentials: true
      });

      if (response.data.success && response.data.client) {
        const clientData = response.data.client;
        setUser(clientData);
        setEditData(clientData);
        setError('');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      
      if (error.response?.status === 401) {
        // Token invalide ou expiré
        localStorage.removeItem('client_token');
        localStorage.removeItem('client');
        navigate('/login');
      } else {
        setError('Erreur lors du chargement du profil');
      }
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les données au montage du composant
  useEffect(() => {
    fetchProfile();
  }, []);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('client_token');
      
      if (token) {
        await axios.post('http://localhost:8000/api/client/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          withCredentials: true
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le localStorage et rediriger
      localStorage.removeItem('client_token');
      localStorage.removeItem('client');
      delete axios.defaults.headers.common['Authorization'];
      navigate('/login');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Ici vous pouvez ajouter la logique pour sauvegarder les modifications
      // Par exemple, envoyer une requête PUT à votre API
      const token = localStorage.getItem('client_token');
      
      // Exemple de requête de mise à jour (à adapter selon votre API)
      /*
      await axios.put('http://localhost:8000/api/client/profile', editData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        withCredentials: true
      });
      */
      
      setUser(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('Erreur lors de la sauvegarde des modifications');
    }
  };

  const handleCancel = () => {
    setEditData({ ...user });
    setIsEditing(false);
  };

  // Affichage du loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchProfile}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // utils/date.js (ou directement dans le fichier)
 const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

  return (
    <div className="min-h-screen bg-gray-50 flex w-screen">
      {/* Sidebar Simple et Élégante */}
      <div className="w-64 bg-white shadow-lg flex flex-col justify-between h-screen">
        {/* Header Sidebar */}
        <div className="p-6 border-b border-gray-100">
          <h4 className="font-semibold text-lg text-gray-800">Espace Client</h4>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            <NavItem icon={Home} label="Dashboard" />
            <NavItem icon={User} label="Mon Profil" active />
            <NavItem icon={FileText} label="Mes Devis" route="/mesdevis" />
            <NavItem icon={Folder} label="Mes Projets" />
            <NavItem icon={Bell} label="Notifications" />
            
          </nav>
        </div>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {/* Header Minimaliste */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              {/* Logo AP */}
              <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                AP
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-red-600">ArtisanPeinture</h1>
                <p className="text-gray-600 text-sm">Gérez vos informations personnelles</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors font-medium"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modifier
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors font-medium"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors font-medium"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Layout: Cards en haut, puis deux divs en bas */}
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          
          {/* Cards Statistiques en Haut */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* Deux Divs Côte à Côte en Bas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Profil Client
              </h2>

              {/* Profile Info */}
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
    value={user.created_at ? formatDate(user.created_at) : 'N/A'} 
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

// Navigation Item Component
function NavItem({ icon: Icon, label, active = false, route }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${active ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-100'}`}
    >
      <Icon className="w-4 h-4 mr-3" />
      {label}
    </button>
  );
}


// Stat Card Component Minimaliste
const StatCard = ({ title, value, color, urgent }) => {
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
};

// Info Row Component
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center text-sm">
    <Icon className="w-4 h-4 mr-2 text-gray-400" />
    <span className="text-gray-600 mr-2">{label}:</span>
    <span className="font-medium text-gray-800">{value}</span>
  </div>
);

// Info Field Component Minimaliste
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