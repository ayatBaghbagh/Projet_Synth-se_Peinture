
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Star,
  LogOut,
  StarOff,
  Edit,
  Check,
  Phone,
  Trash2,
  MoreVertical,
  Eye,
  User,
  UserCheck,
  Users,
  MapPin,
  ChevronDown,
  X,
  CheckCircle,
  Home,
  FileText,
  Calendar,
  Settings,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// Configuration de base d'Axios
const API_BASE_URL = 'http://localhost:8000/api';

// Configurer Axios pour envoyer les credentials
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:8000';

export function CommentairePageEspaceGeron() {
    const navigate = useNavigate();
    const [commentaires, setCommentaires] = useState([]);
    const [filteredCommentaires, setFilteredCommentaires] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('Tous les Commentaires');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [commentaireToDelete, setCommentaireToDelete] = useState(null);
    const [showActionsMenu, setShowActionsMenu] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCommentaire, setSelectedCommentaire] = useState(null);
    const [activePage, setActivePage] = useState('commentaires');
    const [error, setError] = useState(null);
    const [isRefreshingToken, setIsRefreshingToken] = useState(false);
    const [csrfToken, setCsrfToken] = useState('');

    const filterOptions = [
        { key: 'all', label: 'Tous les Commentaires', icon: Users },
        { key: 'particuliers', label: 'Particuliers', icon: User },
        { key: 'professionnels', label: 'Professionnels', icon: UserCheck },
        { key: 'collectivites', label: 'Collectivités', icon: Users },
        { key: 'favoris', label: 'Favoris', icon: Star }
    ];

    const typeClientConfig = {
        'Particuliers': { 
            label: 'Particulier', 
            color: 'bg-blue-100 text-blue-800 border border-blue-200',
            icon: User
        },
        'Professionnels': { 
            label: 'Professionnel', 
            color: 'bg-green-100 text-green-800 border border-green-200',
            icon: UserCheck
        },
        'Collectivités': { 
            label: 'Collectivité', 
            color: 'bg-purple-100 text-purple-800 border border-purple-200',
            icon: Users
        }
    };

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

    // Initialisation de l'application avec récupération du token CSRF
    const initializeApp = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Récupérer le cookie CSRF
            await axios.get('/sanctum/csrf-cookie');
            console.log('CSRF cookie obtenu');
            
            // Configurer axios avec le token CSRF
            setupAxios();
            
            // Charger les commentaires
            await fetchCommentaires();
        } catch (error) {
            console.error("Erreur d'initialisation:", error);
            setError("Erreur de connexion au serveur");
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction pour récupérer les commentaires
    const fetchCommentaires = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await axios.get(`${API_BASE_URL}/commentaires`);
            
            setCommentaires(response.data);
            setFilteredCommentaires(response.data);
        } catch (error) {
            console.error("Erreur lors du chargement des commentaires:", error);
            handleApiError(error);
            
            // Données simulées en cas d'erreur (pour le développement)
            const simulatedData = [
                {
                    id: 1,
                    nom: "Ben Amor",
                    prenom: "Leila",
                    type_client: "Particuliers",
                    contenu: "Excellent service, je recommande vivement!",
                    favori: true,
                    nation: "Tunisie",
                    ville: "Tunis",
                    created_at: "2025-05-15T10:30:00Z"
                },
                {
                    id: 2,
                    nom: "Ben Ali",
                    prenom: "Ahmed",
                    type_client: "Professionnels",
                    contenu: "Travail professionnel et soigné, équipe compétente.",
                    favori: false,
                    nation: "Tunisie",
                    ville: "Sfax",
                    created_at: "2025-05-10T14:45:00Z"
                }
            ];
            
            setCommentaires(simulatedData);
            setFilteredCommentaires(simulatedData);
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction pour gérer les erreurs API
    const handleApiError = (error) => {
        console.error('Erreur API complète:', error);
        
        if (error.response) {
            const status = error.response.status;
            
            if (status === 419) {
                setError('Erreur CSRF (419): Session expirée. Tentative de rafraîchissement...');
                
                // Ajouter un bouton pour recharger la page si nécessaire
                setTimeout(() => {
                    if (error) { // Vérifier si l'erreur persiste
                        setError('Erreur CSRF persistante. Veuillez recharger la page.');
                    }
                }, 3000);
            } else if (status === 401) {
                setError('Non autorisé. Veuillez vous reconnecter.');
            } else if (status === 404) {
                setError('Ressource non trouvée.');
            } else if (status === 422) {
                const validationErrors = error.response.data.errors;
                if (validationErrors) {
                    const errorMessages = Object.values(validationErrors)
                        .flat()
                        .join(', ');
                    setError(`Validation échouée: ${errorMessages}`);
                } else {
                    setError('Données invalides. Veuillez vérifier vos entrées.');
                }
            } else {
                setError(`Erreur serveur (${status}): ${error.response.data.message || 'Veuillez réessayer.'}`);
            }
        } else if (error.request) {
            setError('Aucune réponse du serveur. Vérifiez que votre API est en cours d\'exécution.');
        } else {
            setError(`Erreur: ${error.message}`);
        }
    };

    // Fonction pour gérer les favoris avec gestion CSRF robuste
    const handleToggleFavori = async (id) => {
        try {
            const commentaire = commentaires.find(c => c.id === id);
            const updatedFavori = !commentaire.favori;

            // Réactualiser le token CSRF avant la requête PUT
            await axios.get('/sanctum/csrf-cookie');
            setupAxios();
            
            // Capture du token mis à jour
            const currentToken = getCSRFToken();

            const response = await axios.put(
                `${API_BASE_URL}/commentaires/${id}`, 
                {
                    favori: updatedFavori
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-XSRF-TOKEN': currentToken, // Token CSRF explicite
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }
            );

            console.log('Favori mis à jour avec succès:', response.data);

            // Mettre à jour l'état local
            const updatedCommentaires = commentaires.map(c => 
                c.id === id ? { ...c, favori: updatedFavori } : c
            );
            
            setCommentaires(updatedCommentaires);
            
            // Mettre à jour selectedCommentaire si affiché
            if (selectedCommentaire && selectedCommentaire.id === id) {
                setSelectedCommentaire({ ...selectedCommentaire, favori: updatedFavori });
            }
            
            // Message de succès
            setSuccessMessage(`Commentaire ${updatedFavori ? 'ajouté aux' : 'retiré des'} favoris`);
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 3000);
            
            // Réinitialiser l'erreur si elle existait
            setError(null);
            
        } catch (error) {
            console.error("Erreur lors de la mise à jour du favori:", error);
            handleApiError(error);
        }
    };

    // Fonction pour supprimer un commentaire avec gestion CSRF
    const handleDeleteCommentaire = async (id) => {
        try {
            // Réactualiser le token CSRF avant la requête DELETE
            await axios.get('/sanctum/csrf-cookie');
            setupAxios();
            
            // Capture du token mis à jour
            const currentToken = getCSRFToken();

            await axios.delete(
                `${API_BASE_URL}/commentaires/${id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-XSRF-TOKEN': currentToken, // Token CSRF explicite
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }
            );
            
            // Mettre à jour l'état local
            const updatedCommentaires = commentaires.filter(c => c.id !== id);
            setCommentaires(updatedCommentaires);
            setShowDeleteModal(false);
            
            // Message de succès
            setSuccessMessage('Commentaire supprimé avec succès');
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 3000);
            
            // Réinitialiser l'erreur si elle existait
            setError(null);
            
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            handleApiError(error);
        }
    };

    // Rafraîchir le token CSRF
    const refreshCsrfToken = async () => {
        try {
            setIsRefreshingToken(true);
            await axios.get('/sanctum/csrf-cookie');
            setupAxios();
            setError(null);
            setSuccessMessage('Session rafraîchie avec succès');
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 3000);
        } catch (refreshError) {
            setError('Échec du rafraîchissement de la session. Veuillez recharger la page.');
            console.error('Erreur rafraîchissement CSRF:', refreshError);
        } finally {
            setIsRefreshingToken(false);
        }
    };

    // Filtrage des commentaires
    useEffect(() => {
        let filtered = commentaires;

        if (selectedFilter !== 'Tous les Commentaires') {
            const filterKey = filterOptions.find(f => f.label === selectedFilter)?.key;
            if (filterKey === 'particuliers') {
                filtered = filtered.filter(c => c.type_client === 'Particuliers');
            } else if (filterKey === 'professionnels') {
                filtered = filtered.filter(c => c.type_client === 'Professionnels');
            } else if (filterKey === 'collectivites') {
                filtered = filtered.filter(c => c.type_client === 'Collectivités');
            } else if (filterKey === 'favoris') {
                filtered = filtered.filter(c => c.favori);
            }
        }

        if (searchTerm) {
            filtered = filtered.filter(c => 
                c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${c.prenom} ${c.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.type_client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.nation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.contenu.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredCommentaires(filtered);
    }, [commentaires, selectedFilter, searchTerm]);

    // Initialisation au montage du composant
    useEffect(() => {
        initializeApp();
    }, []);

    // Fonctions utilitaires
    const getTypeClientIcon = (type) => {
        const config = typeClientConfig[type];
        const IconComponent = config?.icon || User;
        return <IconComponent className="w-4 h-4" />;
    };

    const getTotalStats = () => {
        const total = commentaires.length;
        const particuliers = commentaires.filter(c => c.type_client === 'Particuliers').length;
        const professionnels = commentaires.filter(c => c.type_client === 'Professionnels').length;
        const collectivites = commentaires.filter(c => c.type_client === 'Collectivités').length;
        const favorisCount = commentaires.filter(c => c.favori).length;
        
        return { total, particuliers, professionnels, collectivites, favoris: favorisCount };
    };

    const toggleActionsMenu = (commentaireId) => {
        setShowActionsMenu(prev => prev === commentaireId ? null : commentaireId);
    };

    const showCommentaireDetails = (commentaire) => {
        setSelectedCommentaire(commentaire);
        setShowDetailModal(true);
    };

    const stats = getTotalStats();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des commentaires...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-screen bg-gray-50">
            <div className="flex w-full">
                {/* Sidebar - Fixed Width */}
                <aside className="w-64 bg-white shadow-sm flex-shrink-0 min-h-screen">
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
      <button
        onClick={() => { setActivePage('dashbordadmin'); navigate('/dashbordadmin'); }}
        className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg ${
          activePage === 'dashbordadmin'
            ? 'text-purple-600 bg-purple-50 font-medium'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Home size={20} />
        <span>Dashboard</span>
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
        className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg text-purple-600 bg-purple-50 font-medium ${
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
                                    <p className="text-sm font-medium text-gray-800">Admin Gérant</p>
                                    <p className="text-xs text-gray-500">Administrateur</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content - Full Width */}
                <div className="flex-1 flex flex-col min-w-0 w-full">
                    {/* Error Banner & CSRF Status */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-6 mt-4 rounded">
                            <div className="flex items-center justify-between">
                                <span><strong>Erreur:</strong> {error}</span>
                                {error.includes('CSRF') && (
                                    <button
                                        onClick={refreshCsrfToken}
                                        disabled={isRefreshingToken}
                                        className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {isRefreshingToken ? 'Rafraîchissement...' : 'Rafraîchir'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CSRF Status Indicator */}
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 mx-6 mt-4 rounded">
                        <strong>État CSRF:</strong> {csrfToken ? 'Token CSRF présent' : 'Token CSRF non disponible'}
                    </div>

                    {/* Header */}
                    <header className="bg-white shadow-sm">
                        <div className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Gestion des Commentaires</h2>
                                    <p className="text-sm text-gray-600">Liste et gestion des commentaires clients</p>
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
                                    
                                    <button 
                                        onClick={fetchCommentaires}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        Actualiser
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

                    {/* Main Content Area - Full Width */}
                    <div className="flex-1 px-6 py-8 w-full overflow-y-auto">
                        {/* Stats Cards - Full Width */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 w-full">
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Total</p>
                                        <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                                    </div>
                                    <div className="bg-purple-100 p-3 rounded-full">
                                        <Users className="text-purple-600 w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Particuliers</p>
                                        <p className="text-2xl font-bold text-blue-600">{stats.particuliers}</p>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-full">
                                        <User className="text-blue-600 w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Professionnels</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.professionnels}</p>
                                    </div>
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <UserCheck className="text-green-600 w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Collectivités</p>
                                        <p className="text-2xl font-bold text-purple-600">{stats.collectivites}</p>
                                    </div>
                                    <div className="bg-purple-100 p-3 rounded-full">
                                        <Users className="text-purple-600 w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Favoris</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats.favoris}</p>
                                    </div>
                                    <div className="bg-yellow-100 p-3 rounded-full">
                                        <Star className="text-yellow-600 w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters - Full Width */}
                        <div className="mb-6 w-full">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {filterOptions.map((option) => {
                                    const IconComponent = option.icon;
                                    const isActive = selectedFilter === option.label;
                                    
                                    return (
                                        <button
                                            key={option.key}
                                            onClick={() => setSelectedFilter(option.label)}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <IconComponent className="w-4 h-4" />
                                            <span>{option.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Table Container - Full Width */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Auteur
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Localisation
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Commentaire
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredCommentaires.map((commentaire) => (
                                            <tr key={commentaire.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <button
                                                            onClick={() => handleToggleFavori(commentaire.id)}
                                                            className={`mr-3 p-1 rounded-full ${
                                                                commentaire.favori 
                                                                    ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50' 
                                                                    : 'text-gray-400 hover:text-gray-500 bg-gray-50'
                                                            }`}
                                                        >
                                                            {commentaire.favori ? 
                                                                <Star className="w-4 h-4 fill-current" /> : 
                                                                <StarOff className="w-4 h-4" />
                                                            }
                                                        </button>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {commentaire.prenom} {commentaire.nom}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        typeClientConfig[commentaire.type_client]?.color || 'bg-gray-100 text-gray-800 border border-gray-200'
                                                    }`}>
                                                        {getTypeClientIcon(commentaire.type_client)}
                                                        <span className="ml-1">{typeClientConfig[commentaire.type_client]?.label || commentaire.type_client}</span>
                                                    </span>
                                                </td>
                                                
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                        <span>{commentaire.ville}, {commentaire.nation}</span>
                                                    </div>
                                                </td>
                                                
                                                <td className="px-6 py-4 max-w-xs">
                                                    <div className="text-sm text-gray-600 truncate">
                                                        {commentaire.contenu}
                                                    </div>
                                                </td>
                                                
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end">
                                                        <div className="relative">
                                                            <button 
                                                                onClick={() => toggleActionsMenu(commentaire.id)}
                                                                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                                                            >
                                                                <MoreVertical className="w-5 h-5" />
                                                            </button>
                                                            
                                                            {showActionsMenu === commentaire.id && (
                                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                                                    <button 
                                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                                        onClick={() => {
                                                                            showCommentaireDetails(commentaire);
                                                                            setShowActionsMenu(null);
                                                                        }}
                                                                    >
                                                                        <Eye className="w-4 h-4 mr-2" />
                                                                        <span>Voir détails</span>
                                                                    </button>
                                                                    <button 
                                                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                                                                        onClick={() => {
                                                                            setCommentaireToDelete(commentaire);
                                                                            setShowDeleteModal(true);
                                                                            setShowActionsMenu(null);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                                        <span>Supprimer</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        </div>
                                                       
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {filteredCommentaires.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-2">Aucun commentaire trouvé</div>
                                    <button 
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedFilter('Tous les Commentaires');
                                        }}
                                        className="text-purple-600 hover:text-purple-800 font-medium"
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-lg p-6 w-96 animate-scaleIn">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
                            <button 
                                onClick={() => setShowDeleteModal(false)} 
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                Êtes-vous sûr de vouloir supprimer le commentaire de <strong>{commentaireToDelete?.prenom} {commentaireToDelete?.nom}</strong> ? 
                                Cette action est irréversible.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button 
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button 
                                    onClick={() => handleDeleteCommentaire(commentaireToDelete.id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Commentaire Detail Modal */}
            {showDetailModal && selectedCommentaire && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-lg p-6 w-11/12 max-w-2xl animate-scaleIn">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Détails du commentaire</h3>
                            <button 
                                onClick={() => setShowDetailModal(false)} 
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <button
                                    onClick={() => handleToggleFavori(selectedCommentaire.id)}
                                    className={`mr-3 p-1 rounded-full ${
                                        selectedCommentaire.favori 
                                            ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50' 
                                            : 'text-gray-400 hover:text-gray-500 bg-gray-50'
                                    }`}
                                >
                                    {selectedCommentaire.favori ? 
                                        <Star className="w-5 h-5 fill-current" /> : 
                                        <StarOff className="w-5 h-5" />
                                    }
                                </button>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">
                                        {selectedCommentaire.prenom} {selectedCommentaire.nom}
                                    </h4>
                                    <div className="flex items-center mt-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            typeClientConfig[selectedCommentaire.type_client]?.color || 'bg-gray-100 text-gray-800 border border-gray-200'
                                        }`}>
                                            {getTypeClientIcon(selectedCommentaire.type_client)}
                                            <span className="ml-1">{typeClientConfig[selectedCommentaire.type_client]?.label || selectedCommentaire.type_client}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="text-sm font-medium text-gray-500 mb-2">Localisation</h5>
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                        <span className="text-gray-800">{selectedCommentaire.ville}, {selectedCommentaire.nation}</span>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="text-sm font-medium text-gray-500 mb-2">Date</h5>
                                    <div className="text-gray-800">
                                        {new Date(selectedCommentaire.created_at).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <h5 className="text-sm font-medium text-gray-500 mb-2">Commentaire</h5>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-800 whitespace-pre-line">{selectedCommentaire.contenu}</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Notification */}
            {showSuccessModal && (
                <div className="fixed bottom-4 right-4 z-50 animate-slideInUp">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5" />
                        <span>{successMessage}</span>
                        <button 
                            onClick={() => setShowSuccessModal(false)} 
                            className="text-white hover:text-green-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}