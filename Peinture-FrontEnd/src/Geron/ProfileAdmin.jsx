import React, { useState, useEffect } from 'react';
import { 
  User, Home, FileText, FolderOpen, Bell, LogOut, 
  Edit3, Mail, Phone, MapPin, Building, Calendar, Save, X, Lock, Unlock
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

export function ProfileAdmin() {
  const [admin, setAdmin] = useState({
    num_User: '',
    prenom: '',
    nom: '',
    email: '',
    Phone: '',
    role: '',
    created_at: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...admin });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE_URL = 'http://localhost:8000/api';

  // Navigation items spécifiques à l'admin
  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: User, label: 'Mon Profil', path: '/admin/profile' },
    { icon: FileText, label: 'Gestion Devis', path: '/admin/devis' },
    { icon: FolderOpen, label: 'Gestion Projets', path: '/admin/projets' },
    { icon: Building, label: 'Gestion Clients', path: '/admin/clients' },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
  ];

  const getHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/profile`, {
        headers: getHeaders()
      });

      if (response.data.success && response.data.admin) {
        setAdmin(response.data.admin);
        setEditData(response.data.admin);
      } else {
        throw new Error(response.data.message || 'Erreur lors du chargement du profil');
      }
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement du profil');
      if (err.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/admin/login');
  };

  const handleSave = async () => {
    try {
      setError('');
      setIsLoading(true);
      
      const payload = { ...editData };
      if (showPasswordForm) {
        payload.current_password = passwordData.current_password;
        payload.new_password = passwordData.new_password;
        payload.new_password_confirmation = passwordData.new_password_confirmation;
      }
      
      const response = await axios.put(`${API_BASE_URL}/admin/profile`, payload, {
        headers: getHeaders()
      });

      if (response.data.success) {
        setAdmin(response.data.admin);
        setEditData(response.data.admin);
        setIsEditing(false);
        setShowPasswordForm(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
      } else {
        throw new Error(response.data.message || 'Erreur lors de la mise à jour du profil');
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...admin });
    setIsEditing(false);
    setShowPasswordForm(false);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordForm = () => {
    setShowPasswordForm(!showPasswordForm);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

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
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Espace Admin</h2>
        </div>
        
        <nav className="mt-8">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

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
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                {admin.prenom ? admin.prenom.charAt(0) : 'A'}
                {admin.nom ? admin.nom.charAt(0) : 'D'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Administration</h1>
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

          {/* Deux Divs Côte à Côte */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Profil Administrateur
              </h2>

              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {admin.prenom} {admin.nom}
                  </h3>
                  <p className="text-gray-600">{admin.role === 'admin' ? 'Administrateur' : 'Chef d\'équipe'}</p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mt-2">
                    ID: {admin.num_User}
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
                      value={admin.created_at ? formatDate(admin.created_at) : 'N/A'} 
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <InfoRow 
                      icon={User} 
                      label="Rôle" 
                      value={admin.role === 'admin' ? 'Administrateur' : 'Chef d\'équipe'} 
                    />
                  </motion.div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={togglePasswordForm}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {showPasswordForm ? (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Masquer le formulaire de mot de passe
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Changer le mot de passe
                      </>
                    )}
                  </button>

                  {showPasswordForm && (
                    <div className="mt-4 space-y-3">
                      <div className="border-b border-gray-100 pb-3">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Mot de passe actuel
                        </label>
                        <input
                          type="password"
                          name="current_password"
                          value={passwordData.current_password}
                          onChange={handlePasswordChange}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div className="border-b border-gray-100 pb-3">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          name="new_password"
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div className="border-b border-gray-100 pb-3">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Confirmer le nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          name="new_password_confirmation"
                          value={passwordData.new_password_confirmation}
                          onChange={handlePasswordChange}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
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
                  value={admin.prenom || ''} 
                  editable={isEditing} 
                  name="prenom"
                  editValue={editData.prenom || ''}
                  onChange={handleInputChange}
                />
                <InfoField 
                  label="Nom" 
                  value={admin.nom || ''} 
                  editable={isEditing} 
                  name="nom"
                  editValue={editData.nom || ''}
                  onChange={handleInputChange}
                />
                <InfoField 
                  label="Email" 
                  value={admin.email || ''} 
                  icon={<Mail />}
                  iconColor="text-blue-500"
                  editable={isEditing} 
                  name="email"
                  editValue={editData.email || ''}
                  onChange={handleInputChange}
                />
                <InfoField 
                  label="Téléphone" 
                  value={admin.Phone || ''} 
                  icon={<Phone />}
                  iconColor="text-green-500"
                  editable={isEditing} 
                  name="Phone"
                  editValue={editData.Phone || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composants utilitaires
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center text-sm">
      <Icon className="w-4 h-4 mr-2 text-gray-400" />
      <span className="text-gray-600 mr-2">{label}:</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}

function InfoField({ label, value, icon, iconColor = 'text-gray-400', editable, name, onChange, editValue }) {
  return (
    <div className="border-b border-gray-100 pb-3">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      {editable ? (
        <div className="flex items-center mt-1">
          {icon && React.cloneElement(icon, { className: `w-4 h-4 mr-2 ${iconColor}` })}
          <input
            type="text"
            name={name}
            value={editValue}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      ) : (
        <div className="flex items-center mt-1">
          {icon && React.cloneElement(icon, { className: `w-4 h-4 mr-2 ${iconColor}` })}
          <span className="text-gray-800 text-sm">{value || 'Non renseigné'}</span>
        </div>
      )}
    </div>
  );
}