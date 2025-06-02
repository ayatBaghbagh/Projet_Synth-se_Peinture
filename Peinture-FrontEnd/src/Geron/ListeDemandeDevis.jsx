import React, { useState, useEffect } from 'react';
import { Search, Eye, User, Calendar, Settings, FilePlus,LogOut, RefreshCw ,Contact ,MessageSquare} from 'lucide-react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Users } from 'lucide-react';

export const ListeDemandeDevis = () => {
  const [showCreateDevis, setShowCreateDevis] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [activePage, setActivePage] = useState('listeDevis');
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [csrfToken, setCsrfToken] = useState('');

  const location = useLocation();
const current = location.pathname;


  // Fonction pour extraire le token CSRF du cookie
  const getCSRFToken = () => {
    const tokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='));
      
    if (tokenCookie) {
      // Décoder le token (Laravel encode en URL le token dans le cookie)
      return decodeURIComponent(tokenCookie.split('=')[1]);
    }
    return '';
  };

  // Configuration d'axios avec le token CSRF
  const setupAxios = () => {
    const token = getCSRFToken();
    setCsrfToken(token);
    
    if (token) {
      // Ajouter le token à toutes les requêtes
      axios.defaults.headers.common['X-XSRF-TOKEN'] = token;
    }
    
    console.log('Token CSRF configuré:', token ? 'Présent' : 'Absent');
  };

  // Initialiser le CSRF au démarrage
  useEffect(() => {
    const initCSRF = async () => {
      try {
        // Récupérer le cookie CSRF
        await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
          withCredentials: true
        });
        console.log('CSRF cookie obtenu');
        
        // Configurer axios avec le token CSRF
        setupAxios();
        
        // Charger les demandes après l'initialisation CSRF
        loadDemandes();
      } catch (error) {
        console.error('Erreur initialisation CSRF:', error);
      }
    };
    
    initCSRF();
  }, []);

  // Charger les demandes depuis l'API
  const loadDemandes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/admin/demandes-devis', {
        params: {
          search: searchTerm,
          status: statusFilter,
          sort: sortBy,
          order: 'desc'
        },
        withCredentials: true
      });
      
      if (response.data.success) {
        setDemandes(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les demandes lors des changements de filtres (mais pas au montage initial)
  useEffect(() => {
    if (csrfToken) { // Ne charger que si le CSRF est configuré
      loadDemandes();
    }
  }, [searchTerm, statusFilter, sortBy, csrfToken]);

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (csrfToken) {
        loadDemandes();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [csrfToken]);

  const handleCreateDevis = (demande) => {
    setSelectedDemande(demande);
    setShowCreateDevis(true);
  };

  // Fonction de gestion des erreurs API
  const handleApiError = (error) => {
    if (error.response) {
      const status = error.response.status;
      
      if (status === 419) {
        console.error('Erreur CSRF (419): Token expiré ou invalide');
        return 'Erreur CSRF: Session expirée. Veuillez recharger la page.';
      } else if (status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors)
            .flat()
            .join(', ');
          return `Validation échouée: ${errorMessages}`;
        } else {
          return 'Données invalides. Veuillez vérifier vos entrées.';
        }
      } else {
        return `Erreur serveur (${status}): ${error.response.data.message || 'Veuillez réessayer.'}`;
      }
    } else if (error.request) {
      return 'Aucune réponse du serveur. Vérifiez que votre API est en cours d\'exécution.';
    } else {
      return `Erreur: ${error.message}`;
    }
  };

  const CreateDevisModal = () => {
    const [formData, setFormData] = useState({
      numeroDevis: 'DEV-2024-001',
      dateCreation: new Date().toISOString().split('T')[0],
      client: selectedDemande?.client || '',
      typeProjet: selectedDemande?.typeProjet || 'Peinture intérieure',
      surface: selectedDemande?.surface || '',
      prixTotal: '',
      delaiExecution: '30',
      validiteDevis: '30',
      description: selectedDemande?.description || '',
      notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmitDevis = async () => {
      if (!formData.prixTotal) {
        setError('Le prix total est obligatoire');
        return;
      }

      try {
        setIsSubmitting(true);
        setError('');
        
        // Réactualiser le token CSRF avant la requête POST
        await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
          withCredentials: true
        });
        setupAxios();
        
        // Capture du token mis à jour
        const currentToken = getCSRFToken();
        
        console.log('Token CSRF avant envoi:', currentToken ? 'Présent' : 'Absent');

        const response = await axios.post(
          `http://localhost:8000/api/admin/demandes-devis/${selectedDemande.id_demandedevis}/creer-devis`,
          {
            prix_total: parseFloat(formData.prixTotal),
            description_travaux: formData.description,
            delai_execution: formData.delaiExecution + ' jours',
            validite_devis: parseInt(formData.validiteDevis),
            notes_supplementaires: formData.notes,
            client_id: selectedDemande.client_id
          },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-XSRF-TOKEN': currentToken, // Token CSRF explicite
              'X-Requested-With': 'XMLHttpRequest'
            }
          }
        );

        if (response.data.success) {
          alert('Devis créé et envoyé avec succès !');
          setShowCreateDevis(false);
          loadDemandes(); // Recharger la liste
          
          // Envoyer une notification au client (optionnel)
          try {
            await axios.post(
              'http://localhost:8000/api/notifications',
              {
                user_id: selectedDemande.client_id,
                message: 'Un nouveau devis est disponible pour votre demande',
                type: 'devis'
              },
              { 
                withCredentials: true,
                headers: {
                  'X-XSRF-TOKEN': currentToken
                }
              }
            );
          } catch (notifError) {
            console.warn('Erreur lors de l\'envoi de la notification:', notifError);
            // Ne pas bloquer le processus principal pour une erreur de notification
          }
        }
      } catch (error) {
        console.error('Erreur lors de la création du devis:', error);
        const errorMessage = handleApiError(error);
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
        <div className="bg-white w-screen p-4 rounded-xl  max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Créer un Devis</h2>
              <p className="text-sm text-gray-600">Demande {selectedDemande?.id} - Client: {selectedDemande?.client}</p>
            </div>
            <button 
              onClick={() => setShowCreateDevis(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="overflow-y-auto p-6 flex-grow">
            {/* Affichage des erreurs */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Erreur:</strong> {error}
              </div>
            )}

            {/* État CSRF pour debug */}
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
              <strong>État CSRF:</strong> {csrfToken ? 'Token CSRF présent' : 'Token CSRF non disponible'}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Client</label>
                <input
                  type="text"
                  value={formData.client}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Type de projet</label>
                <input
                  type="text"
                  value={formData.typeProjet}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Surface</label>
                <input
                  type="text"
                  value={formData.surface}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Prix total (DT) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.prixTotal}
                  onChange={(e) => setFormData({...formData, prixTotal: e.target.value})}
                  placeholder="Ex: 1500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Description des travaux</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Description détaillée des travaux à effectuer"
              />
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Délai d'exécution <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.delaiExecution}
                  onChange={(e) => setFormData({...formData, delaiExecution: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="15">15 jours</option>
                  <option value="30">30 jours</option>
                  <option value="45">45 jours</option>
                  <option value="60">60 jours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Validité du devis</label>
                <select
                  value={formData.validiteDevis}
                  onChange={(e) => setFormData({...formData, validiteDevis: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="30">30 jours</option>
                  <option value="60">60 jours</option>
                  <option value="90">90 jours</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Notes supplémentaires</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Informations complémentaires pour le client..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
            <button
              onClick={() => setShowCreateDevis(false)}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
           
            <button
              onClick={handleSubmitDevis}
              disabled={isSubmitting || !csrfToken}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer le Devis'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm flex-shrink-0">
        <div className="p-6 h-full flex flex-col">
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-800">Espace Gérant</h1>
            </div>
          </div>
          
          <nav className="space-y-1 flex-grow">
  <Link 
    to="/dashboard" 
    className={`flex items-center space-x-3 px-3 py-3 rounded-lg ${
      current === '/dashboard' 
        ? 'text-purple-600 bg-purple-50 font-medium' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Home size={20} />
    <span>Tableau de bord</span>
  </Link>

  <Link 
  to="/listedemandedevis" 
  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-purple-600 bg-purple-50 font-medium ${
    current === '/listedemandedevis' 
      ? 'text-purple-600 bg-purple-50 font-medium' 
      : 'text-gray-600 hover:bg-gray-50'
  }`}
>
  <FileText size={20} />
  <span>Liste des demandes devis</span>
</Link>

  <Link 
    to="/utilisateurs" 
    className={`flex items-center space-x-3 px-3 py-3 rounded-lg ${
      current === '/utilisateurs' 
        ? 'text-purple-600 bg-purple-50 font-medium' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Users size={20} />
    <span>Utilisateurs</span>
  </Link>

  <Link 
    to="/projetvalider"
    className={`flex items-center space-x-3 px-3 py-3 rounded-lg ${
      current === '/projetvalider' 
        ? 'text-purple-600 bg-purple-50 font-medium' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Users size={20} />
    <span>Projets</span>
  </Link>
  <Link 
    to="/contactger"
    className={`flex items-center space-x-3 px-3 py-3 rounded-lg ${
      current === '/projetvalider' 
        ? 'text-purple-600 bg-purple-50 font-medium' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Contact size={20} />
    <span>Contacts</span>
  </Link>
  <Link 
    to="/commentaireger"
    className={`flex items-center space-x-3 px-3 py-3 rounded-lg ${
      current === '/projetvalider' 
        ? 'text-purple-600 bg-purple-50 font-medium' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <MessageSquare size={20} />
    <span>Commentaires</span>
  </Link>

  <Link 
    to="/equipe"
    className={`flex items-center space-x-3 px-3 py-3 rounded-lg ${
      current === '/equipe' 
        ? 'text-purple-600 bg-purple-50 font-medium' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Users size={20} />
    <span>Équipes</span>
  </Link>
  <Link 
    to="/"
    className={`flex items-center space-x-3 px-3 py-3 rounded-lg ${
      current === '/déconnexion' 
        ? 'text-purple-600 bg-purple-50 font-medium' 
        : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <LogOut size={20} />
    <span>Déconnexion</span>
  </Link>
</nav>

          
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Jacques Martin</p>
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
                <h2 className="text-xl font-bold text-gray-800">Liste des demandes de devis</h2>
                <p className="text-sm text-gray-600">Gestion des demandes clients</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-64"
                  />
                </div>
                
                <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                  Voir le site
                </button>
                
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
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Demandes de devis</h2>
                <p className="text-gray-600">{demandes.length} demandes en attente de traitement</p>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <FilePlus size={18} />
                <span>Nouvelle demande</span>
              </button>
            </div>
          </div>

          {/* Demandes de Devis Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h3 className="text-lg font-bold text-gray-800 mr-4">
                  Toutes les demandes
                </h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg text-sm ${statusFilter === 'all' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Toutes
                  </button>
                  <button 
                    onClick={() => setStatusFilter('urgent')}
                    className={`px-3 py-1 rounded-lg text-sm ${statusFilter === 'urgent' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Urgentes
                  </button>
                  <button 
                    onClick={() => setStatusFilter('normal')}
                    className={`px-3 py-1 rounded-lg text-sm ${statusFilter === 'normal' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Normales
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
                  <option value="client">Client (A-Z)</option>
                  <option value="type_projet">Type de projet</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Chargement des demandes...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {demandes.map((demande) => (
                  <div key={demande.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-bold text-gray-800">Demande {demande.id}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            demande.status === 'urgent' 
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {demande.status === 'urgent' ? 'Urgent' : 'Normal'}
                          </span>
                          <span className="text-sm text-gray-500">En attente</span>
                        </div>
                        <p className="text-purple-600 font-medium">Client: {demande.client}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                          <Eye size={16} className="mr-1" />
                          <span>Détails</span>
                        </button>
                        <button
                          onClick={() => handleCreateDevis(demande)}
                          disabled={!csrfToken}
                          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center disabled:bg-gray-400"
                        >
                          <FilePlus size={16} className="mr-1" />
                          <span>Créer Devis</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-6 text-sm mb-3">
                      <div>
                        <label className="text-gray-500 font-medium block mb-1">Date de demande</label>
                        <p className="text-gray-800 font-medium">{demande.dateCreation}</p>
                      </div>
                      
                      <div>
                        <label className="text-gray-500 font-medium block mb-1">Type de projet</label>
                        <p className="text-gray-800 font-medium">{demande.typeProjet}</p>
                      </div>
                      
                      <div>
                        <label className="text-gray-500 font-medium block mb-1">Surface</label>
                        <p className="text-gray-800 font-medium">{demande.surface}</p>
                      </div>
                      
                      <div>
                        <label className="text-gray-500 font-medium block mb-1">Contact</label>
                        <p className="text-gray-800 font-medium">{demande.contact}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <label className="text-gray-500 font-medium text-sm block mb-1">Description</label>
                      <p className="text-gray-800">{demande.description}</p>
                    </div>
                  </div>
                ))}
                
                {demandes.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucune demande de devis trouvée.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showCreateDevis && <CreateDevisModal />}
    </div>
  );
};