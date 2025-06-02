import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  LogOut,
  Edit,
  Check,
  MapPin,
  Trash2,
  MoreVertical,
  Eye,
  User,
  Users,
  ChevronDown,
  X,
  CheckCircle,
  Home,
  FileText,
  Calendar,
  Settings,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  Briefcase,
  Building,
  Plus,
  Bookmark,
  Star,
  StarOff
} from 'lucide-react';

// Configuration de base d'Axios - Simulé pour cet exemple
const API_BASE_URL = 'http://localhost:8000/api';

export default function ContactPageEspaceGeron() {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('Tous les Contacts');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);
    const [showActionsMenu, setShowActionsMenu] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [activePage, setActivePage] = useState('contacts');
    const [showContactModal, setShowContactModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // Ajoutez cette ligne
     const [Loading,setLoading] = useState(false); // Pour le chargement global
     const [success,setSuccess] = useState(false); // Pour le chargement global
     const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
     // États pour le formulaire de contact
    const [contactFormData, setContactFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        sujet: '',
        typeProjet: 'Résidentiel',
        message: ''
    });
    const [contactFormError, setContactFormError] = useState('');
    const [contactFormSuccess, setContactFormSuccess] = useState('');
    const [contactFormLoading, setContactFormLoading] = useState(false);
    const [newContact, setNewContact] = useState({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        sujet: '',
        typeProjet: 'Résidentiel',
        message: ''
    });

    const filterOptions = [
        { key: 'all', label: 'Tous les Contacts', icon: Users },
        { key: 'residentiel', label: 'Résidentiel', icon: Home },
        { key: 'commercial', label: 'Commercial', icon: Briefcase },
        { key: 'batiment-public', label: 'Bâtiment public', icon: Building }
    ];

    const typeProjetConfig = {
        'Résidentiel': { 
            label: 'Résidentiel', 
            color: 'bg-blue-100 text-blue-800 border border-blue-200',
            icon: Home
        },
        'Commercial': { 
            label: 'Commercial', 
            color: 'bg-green-100 text-green-800 border border-green-200',
            icon: Briefcase
        },
        'Bâtiment public': { 
            label: 'Bâtiment public', 
            color: 'bg-purple-100 text-purple-800 border border-purple-200',
            icon: Building
        }
    };

    // Fonction pour récupérer les contacts depuis l'API Laravel
    const fetchContacts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Simulation d'un appel API - Remplacez par votre vraie logique
            const response = await fetch(`${API_BASE_URL}/contactss`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            const contactsData = result.data || [];
            
            setContacts(contactsData);
            setFilteredContacts(contactsData);
            
        } catch (error) {
            console.error("Erreur lors du chargement des contacts:", error);
            setError(`Erreur de connexion: ${error.message}`);
            
            // Données de test pour le développement
            const testData = [
                {
                    id: 1,
                    prenom: "Leila",
                    nom: "Ben Amor",
                    email: "leila@example.com",
                    telephone: "12345678",
                    sujet: "Demande de devis",
                    typeProjet: "Résidentiel",
                    message: "Je souhaite un devis pour une rénovation complète.",
                    created_at: "2025-05-15T10:30:00Z"
                },
                {
                    id: 2,
                    prenom: "Ahmed",
                    nom: "Ben Ali",
                    email: "ahmed@entreprise.com",
                    telephone: "98765432",
                    sujet: "Projet commercial",
                    typeProjet: "Commercial",
                    message: "Nous avons besoin d'un architecte pour notre nouveau siège.",
                    created_at: "2025-05-10T14:45:00Z"
                },
                {
                    id: 3,
                    prenom: "Fatima",
                    nom: "Alaoui",
                    email: "fatima@mairie.ma",
                    telephone: "55667788",
                    sujet: "Projet municipal",
                    typeProjet: "Bâtiment public",
                    message: "Construction d'un centre culturel municipal.",
                    created_at: "2025-05-20T09:15:00Z"
                }
            ];
            
            setContacts(testData);
            setFilteredContacts(testData);
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction pour ajouter un nouveau contact
    const handleAddContact = async (e) => {
        e.preventDefault();
        
        try {
            const contactData = {
                ...newContact,
                created_at: new Date().toISOString()
            };

            const response = await fetch(`${API_BASE_URL}/contacts`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(contactData)
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            
            // Simulation : Ajouter le nouveau contact avec un ID généré
            const newContactWithId = {
                ...contactData,
                id: Math.max(...contacts.map(c => c.id)) + 1
            };
            
            const updatedContacts = [...contacts, newContactWithId];
            setContacts(updatedContacts);
            
            // Réinitialiser le formulaire
            setNewContact({
                prenom: '',
                nom: '',
                email: '',
                telephone: '',
                sujet: '',
                typeProjet: 'Résidentiel',
                message: ''
            });
            
            setShowAddModal(false);
            setSuccessMessage('Contact ajouté avec succès');
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 3000);
            
        } catch (error) {
            console.error("Erreur lors de l'ajout:", error);
            setError(`Erreur d'ajout: ${error.message}`);
        }
    };

    // Fonction pour supprimer un contact
  const handleDeleteContact = async (id) => {
  try {
    // 1. Obtenir le cookie CSRF
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true
    });

    // 2. Extraire le token du cookie
    const getCsrfToken = () => {
      const cookie = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
      return cookie ? decodeURIComponent(cookie[1]) : null;
    };

    // 3. Envoyer la requête DELETE avec le token
    const response = await axios.delete(`${API_BASE_URL}/contacts/${id}`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    // 4. Gestion de la réponse
    if (response.data.message) {
      setContacts(prev => prev.filter(contact => contact.id !== id));
      setShowDeleteModal(false);
      setSuccessMessage(response.data.message);
      setShowSuccessModal(true);
    }
    
  } catch (error) {
    console.error("Erreur suppression:", error);
    setError(error.response?.data?.message || "Erreur lors de la suppression");
  }
};

    // Filtrage des contacts
    useEffect(() => {
        let filtered = [...contacts];

        // Filtrer par type
        if (selectedFilter !== 'Tous les Contacts') {
            const filterKey = filterOptions.find(f => f.label === selectedFilter)?.key;
            
            switch(filterKey) {
                case 'residentiel':
                    filtered = filtered.filter(c => c.typeProjet === 'Résidentiel');
                    break;
                case 'commercial':
                    filtered = filtered.filter(c => c.typeProjet === 'Commercial');
                    break;
                case 'batiment-public':
                    filtered = filtered.filter(c => c.typeProjet === 'Bâtiment public');
                    break;
                default:
                    break;
            }
        }

        // Filtrer par terme de recherche
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(c => 
                c.nom?.toLowerCase().includes(searchLower) ||
                c.prenom?.toLowerCase().includes(searchLower) ||
                `${c.prenom} ${c.nom}`.toLowerCase().includes(searchLower) ||
                c.email?.toLowerCase().includes(searchLower) ||
                c.telephone?.toLowerCase().includes(searchLower) ||
                c.sujet?.toLowerCase().includes(searchLower) ||
                c.typeProjet?.toLowerCase().includes(searchLower) ||
                c.message?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredContacts(filtered);
    }, [contacts, selectedFilter, searchTerm]);

    // Initialisation au montage du composant
    useEffect(() => {
        fetchContacts();
    }, []);

    // Fonctions utilitaires
    const getTypeProjetIcon = (type) => {
        const config = typeProjetConfig[type];
        const IconComponent = config?.icon || Briefcase;
        return <IconComponent className="w-4 h-4" />;
    };

    const getTotalStats = () => {
        if (!Array.isArray(contacts)) {
            return {
                total: 0,
                residentiel: 0,
                commercial: 0,
                batimentPublic: 0
            };
        }

        const total = contacts.length;
        const residentiel = contacts.filter(c => c?.typeProjet === 'Résidentiel').length;
        const commercial = contacts.filter(c => c?.typeProjet === 'Commercial').length;
        const batimentPublic = contacts.filter(c => c?.typeProjet === 'Bâtiment public').length;
        
        return { total, residentiel, commercial, batimentPublic };
    };

    const toggleActionsMenu = (contactId) => {
        setShowActionsMenu(prev => prev === contactId ? null : contactId);
    };

    const showContactDetails = (contact) => {
        setSelectedContact(contact);
        setShowDetailModal(true);
    };

    const handleToggleFavori = (contactId) => {
        setContacts(prevContacts => 
            prevContacts.map(contact => 
                contact.id === contactId 
                    ? { ...contact, favori: !contact.favori } 
                    : contact
            )
        );
    };

    const stats = getTotalStats();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des contacts...</p>
                </div>
            </div>
        );
    }

    const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactFormData({
        ...contactFormData,
        [name]: value
    });
    // Effacer les erreurs lors de la modification
    if (contactFormError) setContactFormError('');
};

const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation côté client
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        setLoading(false);
        return;
    }

    // Fonction de réessai automatique
    const withRetry = async (fn, maxRetries = 3) => {
        let attempts = 0;
        let lastError = null;

        while (attempts <= maxRetries) {
            try {
                // Rafraîchir le token CSRF avant chaque tentative
                await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
                    withCredentials: true
                });
                const token = getCSRFToken();
                axios.defaults.headers.common['X-XSRF-TOKEN'] = token;

                return await fn();
            } catch (error) {
                lastError = error;
                if (error.response?.status === 419 && attempts < maxRetries) {
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Backoff exponentiel
                    continue;
                }
                throw error;
            }
        }
        throw lastError;
    };

    try {
        await withRetry(async () => {
            const response = await axios.post('http://localhost:8000/api/contacts', 
                {
                    prenom: formData.prenom.trim(),
                    nom: formData.nom.trim(),
                    email: formData.email.trim(),
                    telephone: formData.telephone.trim(),
                    sujet: formData.sujet,
                    typeProjet: formData.typeProjet,
                    message: formData.message.trim()
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }
            );

            setSuccess('Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.');
            
            // Réinitialiser le formulaire
            setFormData({
                prenom: '',
                nom: '',
                email: '',
                telephone: '',
                sujet: '',
                typeProjet: 'Résidentiel',
                message: ''
            });
        });
    } catch (error) {
        handleApiError(error);
    } finally {
        setLoading(false);
    }
};

// Fonction de gestion des erreurs API (optimisée)
const handleApiError = (error) => {
    if (error.response) {
        const status = error.response.status;
        
        if (status === 419) {
            setError('Session expirée. Veuillez recharger la page et réessayer.');
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
        } else if (status === 500) {
            setError('Erreur serveur interne. Veuillez réessayer plus tard.');
        } else {
            setError(`Erreur serveur (${status}): ${error.response.data.message || 'Veuillez réessayer.'}`);
        }
    } else if (error.request) {
        setError('Aucune réponse du serveur. Vérifiez votre connexion internet.');
    } else {
        setError(`Erreur: ${error.message}`);
    }
};


    return (
        <div className=" w-screen bg-gray-50">
            <div className="flex w-full">
                {/* Sidebar */}
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
        className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg text-purple-600 bg-purple-50 font-medium${
          activePage === 'contactger'
            
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

                {/* Main Content */}
                <div className="w-full">
                    {/* Error Banner */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-6 mt-4 rounded">
                            <div className="flex items-center justify-between">
                                <span><strong>Erreur:</strong> {error}</span>
                                <button
                                    onClick={() => setError(null)}
                                    className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <header className="bg-white shadow-sm">
                        <div className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Gestion des Contacts</h2>
                                    <p className="text-sm text-gray-600">Liste et gestion des contacts clients</p>
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
                                        onClick={fetchContacts}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        Actualiser
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main Content Area */}
                    <div className="flex-1 px-6 py-8 w-full overflow-y-auto max-w-full">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 w-full max-w-full">
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Total</p>
                                        <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                                    </div>
                                    <div className="bg-purple-100 p-3 rounded-full">
                                        <Bookmark className="text-purple-600 w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Résidentiel</p>
                                        <p className="text-2xl font-bold text-blue-600">{stats.residentiel}</p>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-full">
                                        <Home className="text-blue-600 w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Commercial</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.commercial}</p>
                                    </div>
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <Briefcase className="text-green-600 w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Bâtiment public</p>
                                        <p className="text-2xl font-bold text-purple-600">{stats.batimentPublic}</p>
                                    </div>
                                    <div className="bg-purple-100 p-3 rounded-full">
                                        <Building className="text-purple-600 w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
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

                        {/* Table Container */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full max-w-full">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Coordonnées
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type de projet
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Sujet
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Array.isArray(filteredContacts) && filteredContacts.length > 0 ? (
                                            filteredContacts.map((contact) => (
                                                <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {contact.prenom} {contact.nom}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {contact.created_at ? new Date(contact.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-600">
                                                            <div className="flex items-center">
                                                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span>{contact.email}</span>
                                                            </div>
                                                            {contact.telephone && (
                                                                <div className="flex items-center mt-1">
                                                                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                                    <span>{contact.telephone}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            typeProjetConfig[contact.typeProjet]?.color || 'bg-gray-100 text-gray-800 border border-gray-200'
                                                        }`}>
                                                            {getTypeProjetIcon(contact.typeProjet)}
                                                            <span className="ml-1">{contact.typeProjet}</span>
                                                        </span>
                                                    </td>
                                                    
                                                    <td className="px-6 py-4 max-w-xs">
                                                        <div className="text-sm text-gray-600 truncate">
                                                            {contact.sujet}
                                                        </div>
                                                    </td>
                                                    
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end">
                                                            <div className="relative">
                                                                <button 
                                                                    onClick={() => toggleActionsMenu(contact.id)}
                                                                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                                                                >
                                                                    <MoreVertical className="w-5 h-5" />
                                                                </button>
                                                                
                                                                {showActionsMenu === contact.id && (
                                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                                                        <button 
                                                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                                            onClick={() => {
                                                                                showContactDetails(contact);
                                                                                setShowActionsMenu(null);
                                                                            }}
                                                                        >
                                                                            <Eye className="w-4 h-4 mr-2" />
                                                                            <span>Voir détails</span>
                                                                        </button>
                                                                        <button 
                                                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                                                                            onClick={() => {
                                                                                setContactToDelete(contact);
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
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center">
                                                    <div className="text-gray-400 mb-2">
                                                        {searchTerm || selectedFilter !== 'Tous les Contacts' 
                                                            ? 'Aucun contact trouvé avec ces critères' 
                                                            : 'Aucun contact disponible'}
                                                    </div>
                                                    {(searchTerm || selectedFilter !== 'Tous les Contacts') && (
                                                        <button 
                                                            onClick={() => {
                                                                setSearchTerm('');
                                                                setSelectedFilter('Tous les Contacts');
                                                            }}
                                                            className="text-purple-600 hover:text-purple-800 font-medium"
                                                        >
                                                            Réinitialiser les filtres
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
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
                                Êtes-vous sûr de vouloir supprimer le contact de <strong>{contactToDelete?.prenom} {contactToDelete?.nom}</strong> ? 
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
    onClick={() => handleDeleteContact(contactToDelete.id)}
    className={`px-4 py-2 rounded-md transition-colors ${
        isDeleting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700 text-white'
    }`}
    disabled={isDeleting}
>
    {isDeleting ? (
        <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Suppression...
        </>
    ) : 'Supprimer'}
</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Detail Modal */}
            {showDetailModal && selectedContact && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-lg p-6 w-11/12 max-w-2xl animate-scaleIn">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Détails du contact</h3>
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
                                    onClick={() => handleToggleFavori(selectedContact.id)}
                                    className={`mr-3 p-1 rounded-full ${
                                        selectedContact.favori 
                                            ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50' 
                                            : 'text-gray-400 hover:text-gray-500 bg-gray-50'
                                    }`}
                                >
                                    {selectedContact.favori ? 
                                        <Star className="w-5 h-5 fill-current" /> : 
                                        <StarOff className="w-5 h-5" />
                                    }
                                </button>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">
                                        {selectedContact.prenom} {selectedContact.nom}
                                    </h4>
                                    <div className="flex items-center mt-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            typeProjetConfig[selectedContact.typeProjet]?.color || 'bg-gray-100 text-gray-800 border border-gray-200'
                                        }`}>
                                            {getTypeProjetIcon(selectedContact.typeProjet)}
                                            <span className="ml-1">{selectedContact.typeProjet}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="text-sm font-medium text-gray-500 mb-2">Coordonnées</h5>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="text-gray-800">{selectedContact.email}</span>
                                        </div>
                                        {selectedContact.telephone && (
                                            <div className="flex items-center">
                                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                <span className="text-gray-800">{selectedContact.telephone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="text-sm font-medium text-gray-500 mb-2">Date</h5>
                                    <div className="text-gray-800">
                                        {new Date(selectedContact.created_at).toLocaleDateString('fr-FR', {
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
                                <h5 className="text-sm font-medium text-gray-500 mb-2">Sujet</h5>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-800 font-medium">{selectedContact.sujet}</p>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <h5 className="text-sm font-medium text-gray-500 mb-2">Message</h5>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-800 whitespace-pre-line">{selectedContact.message}</p>
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

            {/* Empty State for No Contacts */}
            {contacts.length === 0 && !isLoading && (
                <div className="fixed inset-0 flex items-center justify-center z-40 bg-white bg-opacity-90">
                    <div className="text-center max-w-md p-6">
                        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <Mail className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contact trouvé</h3>
                        <p className="text-gray-500 mb-6">
                            Vous n'avez pas encore de contacts enregistrés. Les nouveaux contacts apparaîtront ici lorsqu'ils seront disponibles.
                        </p>
                        <div className="space-x-3">
                            <button
                                onClick={fetchContacts}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4 inline mr-2" />
                                Rafraîchir
                            </button>
                            <button
                                onClick={() => setActivePage('dashboard')}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Retour au tableau de bord
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}