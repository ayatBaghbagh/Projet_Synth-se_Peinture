import React, { useState, useEffect } from 'react';
import { Search, User, Home, Users,Check,LogOut, Settings, Plus, Edit, Trash2, Lock, Unlock, Phone, MapPin } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



export const Utilisateurs = () => {
    const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activePage, setActivePage] = useState('utilisateurs');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [csrfToken, setCsrfToken] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    role: 'client',
    status: 'active',
    adresse: '',
    telephone: '',
    tele: '',
    Phone: ''
  });

  const getCSRFToken = () => {
    const tokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='));
      
    if (tokenCookie) {
      return decodeURIComponent(tokenCookie.split('=')[1]);
    }
    return '';
  };

  const setupAxios = () => {
    const token = getCSRFToken();
    setCsrfToken(token);
    
    if (token) {
      axios.defaults.headers.common['X-XSRF-TOKEN'] = token;
    }
    
    console.log('Token CSRF configuré:', token ? 'Présent' : 'Absent');
  };

  const handleApiError = (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 419) {
        window.location.reload();
      } else if (status === 422) {
        const errors = data.errors || {};
        const errorMessages = Object.values(errors).flat().join('\n');
        alert(`Erreur de validation:\n${errorMessages}`);
      } else if (status === 500) {
        alert(`Erreur serveur: ${data.message || 'Veuillez réessayer plus tard.'}`);
      } else {
        alert(`Erreur ${status}: ${data.message || 'Une erreur est survenue'}`);
      }
    } else if (error.request) {
      alert('Pas de réponse du serveur. Vérifiez votre connexion.');
    } else {
      alert(`Erreur: ${error.message}`);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
          withCredentials: true
        });
        console.log('CSRF cookie obtenu');
        setupAxios();
        loadUsers();
      } catch (error) {
        console.error('Erreur initialisation:', error);
      }
    };
    
    initApp();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true
      });
      
      const response = await axios.get('http://127.0.0.1:8000/api/admin/users', {
        params: {
          search: searchTerm,
          status: statusFilter,
          sort: sortBy,
          order: 'desc'
        },
        withCredentials: true
      });
      
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        throw new Error(response.data.message || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm, statusFilter, sortBy]);

  const handleCreateUser = async () => {
    try {
      const dataToSend = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        role: formData.role,
        status: formData.status
      };

      if (formData.role === 'client') {
        dataToSend.adresse = formData.adresse;
        dataToSend.telephone = formData.telephone;
      } else if (formData.role === 'peintre') {
        dataToSend.tele = formData.tele;
      } else if (formData.role === 'chef_equipe') {
        dataToSend.Phone = formData.Phone;
      }

      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true
      });
      setupAxios();

      const response = await axios.post(
        'http://localhost:8000/api/admin/users',
        dataToSend,
        {
          withCredentials: true,
          headers: {
            'X-XSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setShowCreateModal(false);
        resetFormData();
        loadUsers();
        alert('Utilisateur créé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      handleApiError(error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const dataToSend = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        status: formData.status
      };

      const response = await axios.put(
        `http://localhost:8000/api/admin/users/${selectedUser.id}`,
        dataToSend,
        {
          withCredentials: true,
          headers: {
            'X-XSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setShowEditModal(false);
        loadUsers();
        alert('Utilisateur mis à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Une erreur est survenue');
      }
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
          withCredentials: true
        });
        setupAxios();

        const response = await axios.delete(
          `http://localhost:8000/api/admin/users/${user.id}`,
          {
            withCredentials: true,
            headers: {
              'X-XSRF-TOKEN': csrfToken,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          loadUsers();
          alert('Utilisateur supprimé avec succès');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        handleApiError(error);
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true
      });
      setupAxios();

      const response = await axios.post(
        `http://localhost:8000/api/admin/users/${user.id}/toggle-block`,
        {},
        {
          withCredentials: true,
          headers: {
            'X-XSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        loadUsers();
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      handleApiError(error);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      status: user.status,
      adresse: user.adresse || '',
      telephone: user.telephone || '',
      tele: user.tele || '',
      Phone: user.Phone || ''
    });
    setShowEditModal(true);
  };

  const resetFormData = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      role: 'client',
      status: 'active',
      adresse: '',
      telephone: '',
      tele: '',
      Phone: ''
    });
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'client': return 'Client';
      case 'peintre': return 'Peintre';
      case 'chef_equipe': return 'Chef d\'équipe';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'peintre': return 'bg-green-100 text-green-800';
      case 'chef_equipe': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 w-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm flex-shrink-0">
        <div className="p-6 h-full flex flex-col">
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
            </div>
          </div>
          
         <nav className="space-y-1 flex-grow">
            <button
    onClick={() => { setActivePage('dashbordadmin'); navigate('/dashbordadmin'); }}
    className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg ${
      activePage === 'dashbordadmin'
        ? 'text-purple-600 bg-purple-50 font-medium'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Home size={20} />
    <span>Dashbord</span>
  </button>
  <button
    onClick={() => { setActivePage('listedemandedevis'); navigate('/listedemande'); }}
    className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg ${
      activePage === 'listedemandedevis'
        ? 'text-purple-600 bg-purple-50 font-medium'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Edit size={20} />
    <span>Liste des demandes de devis</span>
  </button>

  <button
    onClick={() => { setActivePage('utilisateurs'); navigate('/utilisateurs'); }}
    className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg ${
      activePage === 'utilisateurs'
        ? 'text-purple-600 bg-purple-50 font-medium'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Users size={20} />
    <span>Gestion des utilisateurs</span>
  </button>
  <button
    onClick={() => { setActivePage('projetvalider'); navigate('/projetvalider'); }}
    className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg ${
      activePage === 'projetvalider'
        ? 'text-purple-600 bg-purple-50 font-medium'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Check size={20} />
    <span>Projets validés</span>
  </button>

  <button
    onClick={() => { setActivePage('contactger'); navigate('/contactger'); }}
    className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg ${
      activePage === 'contactger'
        ? 'text-purple-600 bg-purple-50 font-medium'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Phone size={20} />
    <span>Contacts</span>
  </button>

  <button
    onClick={() => { setActivePage('commentaireger'); navigate('/commentaireger'); }}
    className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg ${
      activePage === 'commentaireger'
        ? 'text-purple-600 bg-purple-50 font-medium'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <MapPin size={20} />
    <span>Commentaires</span>
  </button>
  <button
    onClick={() => { setActivePage('equipe'); navigate('/equipe'); }}
    className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg ${
      activePage === 'equipe'
        ? 'text-purple-600 bg-purple-50 font-medium'
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Users size={20} />
    <span>Equipes</span>
  </button>
  <button
          onClick={() => {
            // Effacer les informations d'authentification
            localStorage.removeItem('authToken');
            // Rediriger vers la page d'accueil
            navigate('/');
          }}
          className="flex items-center space-x-3 px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg w-full text-left"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>

</nav>

          
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Admin</p>
                <p className="text-xs text-gray-500">Administrateur</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Gestion des utilisateurs</h2>
                <p className="text-sm text-gray-600">Liste et administration des utilisateurs</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-64"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 right-0 border-2 border-white"></div>
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Liste des utilisateurs</h2>
                <p className="text-gray-600">{users.length} utilisateurs enregistrés</p>
              </div>
              <button 
                onClick={() => {
                  resetFormData();
                  setShowCreateModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={18} />
                <span>Nouvel utilisateur</span>
              </button>
            </div>
          </div>

          {/* Utilisateurs Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h3 className="text-lg font-bold text-gray-800 mr-4">
                  Tous les utilisateurs
                </h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg text-sm ${statusFilter === 'all' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Tous
                  </button>
                  <button 
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1 rounded-lg text-sm ${statusFilter === 'active' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Actifs
                  </button>
                  <button 
                    onClick={() => setStatusFilter('blocked')}
                    className={`px-3 py-1 rounded-lg text-sm ${statusFilter === 'blocked' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Bloqués
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <span>Trier par :</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1"
                >
                  <option value="created_at">Date récente</option>
                  <option value="nom">Nom (A-Z)</option>
                  <option value="role">Rôle</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Chargement des utilisateurs...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Informations
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="text-purple-600" size={16} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.nom} {user.prenom}</div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.role === 'client' && user.adresse && (
                              <div className="flex items-center text-xs text-gray-500">
                                <MapPin size={12} className="mr-1" />
                                {user.adresse}
                              </div>
                            )}
                            {(user.telephone || user.tele || user.Phone) && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Phone size={12} className="mr-1" />
                                {user.telephone || user.tele || user.Phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 'active' ? 'Actif' : 'Bloqué'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Modifier"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={user.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                              title={user.status === 'active' ? 'Bloquer' : 'Débloquer'}
                            >
                              {user.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {users.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucun utilisateur trouvé.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Nouvel utilisateur</h2>
                <p className="text-sm text-gray-600">Les informations de connexion seront envoyées par email</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-grow">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rôle *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="client">Client</option>
                    <option value="peintre">Peintre</option>
                    <option value="chef_equipe">Chef d'équipe</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Prénom *</label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {formData.role === 'client' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Adresse *</label>
                      <input
                        type="text"
                        value={formData.adresse}
                        onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label>
                      <input
                        type="text"
                        value={formData.telephone}
                        onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </>
                )}

                {formData.role === 'peintre' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone *</label>
                    <input
                      type="text"
                      value={formData.tele}
                      onChange={(e) => setFormData({...formData, tele: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                )}

                {formData.role === 'chef_equipe' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone *</label>
                    <input
                      type="text"
                      value={formData.Phone}
                      onChange={(e) => setFormData({...formData, Phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="active">Actif</option>
                    <option value="blocked">Bloqué</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
             
              <button
                onClick={handleCreateUser}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Créer l'utilisateur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Modifier utilisateur</h2>
                <p className="text-sm text-gray-600">ID: {selectedUser?.id} - Rôle: {getRoleLabel(selectedUser?.role)}</p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-grow">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {formData.role === 'client' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Adresse</label>
                      <input
                        type="text"
                        value={formData.adresse}
                        onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label>
                      <input
                        type="text"
                        value={formData.telephone}
                        onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </>
                )}

                {formData.role === 'peintre' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="text"
                      value={formData.tele}
                      onChange={(e) => setFormData({...formData, tele: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                )}

                {formData.role === 'chef_equipe' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="text"
                      value={formData.Phone}
                      onChange={(e) => setFormData({...formData, Phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="active">Actif</option>
                    <option value="blocked">Bloqué</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
             
              <button
                onClick={handleUpdateUser}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};