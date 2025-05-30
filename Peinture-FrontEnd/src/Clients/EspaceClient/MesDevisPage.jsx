import React, { useState, useEffect } from 'react';
import { User, Home, FileText, FolderOpen, Bell, Settings, LogOut, Search, Plus, Eye, Download, Check, X, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const MesDevisPage = () => {
  const [devis, setDevis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('Tous');
  const [showModal, setShowModal] = useState(false);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const filterOptions = ['Tous', 'En attente', 'Acceptés', 'Refusés'];
  
  const statusColors = {
    'en_attente': 'bg-orange-100 text-orange-800 border-orange-200',
    'accepte': 'bg-green-100 text-green-800 border-green-200',
    'refuse': 'bg-red-100 text-red-800 border-red-200'
  };

  const statusLabels = {
    'en_attente': 'En attente',
    'accepte': 'Accepté',
    'refuse': 'Refusé'
  };

  // Navigation items
  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: User, label: 'Mon Profil', path: '/profile' },
    { icon: FileText, label: 'Mes Devis', path: '/mesdevis', protected: true },
    { icon: FolderOpen, label: 'Mes Projets', path: '/mes-projets', protected: true },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  // CORRECTION 3: URLs API cohérentes
  const API_BASE_URL = 'http://localhost:8000/api/client';
  const API_PROTECTED_URL = 'http://localhost:8000/api';

  // CORRECTION 4: Fonction pour obtenir le token d'authentification (cohérent avec Login)
  const getAuthToken = () => {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  };

  // Fonction pour obtenir les headers d'authentification
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // CORRECTION 5: Vérification d'authentification simplifiée
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      // Sauvegarder la route actuelle pour rediriger après login
      localStorage.setItem('redirectAfterLogin', '/mesdevis');
      navigate('/login');
      return;
    }
    // Si authentifié, charger les devis
    fetchDevis();
  }, [navigate]);

  const fetchDevis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        setError('Vous devez être connecté pour voir vos devis');
        navigate('/login');
        return;
      }

      // CORRECTION 6: URL cohérente avec les routes Laravel
      const url = `${API_PROTECTED_URL}/mes-devis`;
      
      console.log(`Récupération des devis depuis: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('Réponse reçue, status:', response.status);

      if (response.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        localStorage.setItem('redirectAfterLogin', '/mesdevis');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Données reçues:', data);

      if (data.success) {
        const normalizedDevis = data.devis.map(devis => ({
          id_devis: devis.id_devis,
          numero_devis: devis.numero_devis,
          description_travaux: devis.description_travaux || 
                              (devis.demande_devis?.description || 'Description non disponible'),
          prix_total: parseFloat(devis.prix_total) || 0,
          statut: devis.statut || 'en_attente',
          date_creation: devis.date_creation,
          date_acceptation: devis.date_acceptation,
          date_refus: devis.date_refus,
          motif_refus: devis.motif_refus,
          validite_devis: devis.validite_devis || 30,
          delai_execution: devis.delai_execution,
          demande_devis: devis.demande_devis ? {
            id: devis.demande_devis.id,
            description: devis.demande_devis.description,
            surface: devis.demande_devis.surface,
            type_travaux: devis.demande_devis.type_travaux,
            budget_estime: devis.demande_devis.budget_estime,
          } : null
        }));

        setDevis(normalizedDevis);
        console.log(`${normalizedDevis.length} devis chargés`);
      } else {
        throw new Error(data.message || 'Erreur API lors du chargement des devis');
      }
      
    } catch (err) {
      console.error('Erreur lors du chargement des devis:', err);
      setError(err.message || 'Erreur lors du chargement des devis');
      
      if (err.message.includes('Failed to fetch')) {
        setError('Erreur réseau. Vérifiez votre connexion internet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (devisId, newStatus, motifRefus = null) => {
    try {
      setActionLoading(true);
      
      const token = getAuthToken();
      if (!token) {
        setError('Vous devez être connecté');
        return;
      }

      // CORRECTION 7: URL pour mise à jour du statut
      const url = `${API_PROTECTED_URL}/devis/${devisId}/status`;
      const requestBody = {
        statut: newStatus,
        ...(motifRefus && { motif_refus: motifRefus })
      };

      console.log(`Mise à jour du statut via: ${url}`);
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (response.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        localStorage.setItem('redirectAfterLogin', '/mesdevis');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour l'état local
        setDevis(prevDevis => 
          prevDevis.map(d => 
            d.id_devis === devisId 
              ? { 
                  ...d, 
                  statut: newStatus,
                  date_acceptation: newStatus === 'accepte' ? new Date().toISOString() : d.date_acceptation,
                  date_refus: newStatus === 'refuse' ? new Date().toISOString() : d.date_refus,
                  motif_refus: newStatus === 'refuse' ? motifRefus : d.motif_refus
                }
              : d
          )
        );
        
        setShowModal(false);
        setSelectedDevis(null);
        
        alert(`Devis ${newStatus === 'accepte' ? 'accepté' : 'refusé'} avec succès`);
      } else {
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setError(`Erreur lors de la mise à jour: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('client');
    localStorage.removeItem('redirectAfterLogin');
    sessionStorage.removeItem('auth_token');
    navigate('/login');
  };

  const filteredDevis = devis.filter(d => {
    const matchesFilter = filter === 'Tous' || 
      (filter === 'En attente' && d.statut === 'en_attente') ||
      (filter === 'Acceptés' && d.statut === 'accepte') ||
      (filter === 'Refusés' && d.statut === 'refuse');
    
    const matchesSearch = searchTerm === '' || 
      d.description_travaux?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.numero_devis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.demande_devis?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateValidityDate = (creationDate, validityDays = 30) => {
    if (!creationDate) return 'Non définie';
    const date = new Date(creationDate);
    date.setDate(date.getDate() + validityDays);
    return date.toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos devis...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex w-screen">
      {/* Modal de confirmation */}
      {showModal && selectedDevis && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white rounded-lg p-6 z-10 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Confirmer votre décision</h3>
            <p className="text-gray-600 mb-6">
              Voulez-vous vraiment {selectedDevis.action === 'accepte' ? 'accepter' : 'refuser'} ce devis de {formatCurrency(selectedDevis.prix_total)} ?
            </p>
            
            {selectedDevis.action === 'refuse' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif du refus (optionnel)
                </label>
                <textarea
                  id="motif-refus"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Précisez le motif de votre refus..."
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  const motifRefus = selectedDevis.action === 'refuse' 
                    ? document.getElementById('motif-refus')?.value || null
                    : null;
                  handleStatusChange(selectedDevis.id_devis, selectedDevis.action, motifRefus);
                }}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-md text-white disabled:opacity-50 ${
                  selectedDevis.action === 'accepte' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {actionLoading ? 'En cours...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Espace Client</h2>
        </div>
        
        <nav className="mt-8">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isAuthenticated = !!getAuthToken();

            // Ne pas afficher les routes protégées si non connecté
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
                <p className="text-sm text-gray-600">Gérez vos devis en ligne</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mes Devis</h2>
                <p className="text-gray-600">Consultez et gérez vos demandes de devis ({devis.length} devis au total)</p>
              </div>
              <button 
                onClick={fetchDevis}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Actualiser
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un devis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              {filterOptions.map(option => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    filter === option
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                <X className="w-5 h-5 mr-2" />
                {error}
              </div>
              <button 
                onClick={() => setError(null)}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Fermer
              </button>
            </div>
          )}

          {/* Content */}
          {filteredDevis.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {devis.length === 0 ? 'Aucun devis trouvé' : 'Aucun résultat'}
              </h3>
              <p className="text-gray-600 mb-4">
                {devis.length === 0 
                  ? 'Vous n\'avez pas encore de devis.' 
                  : `Aucun devis ${filter.toLowerCase()} ne correspond à votre recherche.`}
              </p>
              {devis.length === 0 && (
                <button 
                  onClick={() => navigate('/demande-devis')}
                  className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
                >
                  Demander un devis
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDevis.map(devis => (
                <div key={devis.id_devis} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition p-6">
                  {/* Header with status indicator */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        devis.statut === 'en_attente' ? 'bg-orange-400' :
                        devis.statut === 'accepte' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {devis.description_travaux || devis.demande_devis?.description || 'Devis sans description'}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Numéro: {devis.numero_devis || `DEV-${devis.id_devis}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {formatCurrency(devis.prix_total)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[devis.statut] || statusColors['en_attente']}`}>
                        {statusLabels[devis.statut] || statusLabels['en_attente']}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Date création:</span>
                      <div className="font-medium">{formatDate(devis.date_creation)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Surface:</span>
                      <div className="font-medium">
                        {devis.demande_devis?.surface ? `${devis.demande_devis.surface}m²` : 'Non précisée'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Type travaux:</span>
                      <div className="font-medium">
                        {devis.demande_devis?.type_travaux || 'Non précisé'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Valide jusqu'au:</span>
                      <div className="font-medium">
                        {calculateValidityDate(devis.date_creation, devis.validite_devis)}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info for accepted/refused */}
                  {(devis.statut === 'accepte' || devis.statut === 'refuse') && (
                    <div className="bg-gray-50 rounded-md p-3 mb-4 text-sm">
                      {devis.statut === 'accepte' && (
                        <div className="text-green-700">
                          ✓ Devis accepté le {formatDate(devis.date_acceptation)}
                          {devis.delai_execution && (
                            <div className="mt-1">Délai d'exécution: {devis.delai_execution} jours</div>
                          )}
                        </div>
                      )}
                      {devis.statut === 'refuse' && (
                        <div className="text-red-700">
                          ✗ Devis refusé le {formatDate(devis.date_refus)}
                          {devis.motif_refus && (
                            <div className="mt-1">Motif: {devis.motif_refus}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-2">
                      <button className="flex items-center px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </button>
                      <button className="flex items-center px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </button>
                    </div>
                    
                    {devis.statut === 'en_attente' && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedDevis({ ...devis, action: 'refuse' });
                            setShowModal(true);
                          }}
                          disabled={actionLoading}
                          className="flex items-center px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md disabled:opacity-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Refuser
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedDevis({ ...devis, action: 'accepte' });
                            setShowModal(true);
                          }}
                          disabled={actionLoading}
                          className="flex items-center px-3 py-1 text-sm text-white bg-green-500 hover:bg-green-600 rounded-md disabled:opacity-50"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accepter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};