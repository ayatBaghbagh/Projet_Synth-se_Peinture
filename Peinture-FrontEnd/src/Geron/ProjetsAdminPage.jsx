import React, { useState, useEffect, useCallback } from 'react'; 
import EditTaskModal from "./EditTaskModal";
import DeleteTaskModal from "./DeleteTaskModal";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


import axios from 'axios';
import { 
    Contact,
    LogOut,
    MessageSquare,
  Search, 
  Plus, 
  Filter, 
  Calendar,
  MapPin,
  User,
  DollarSign,
  Clock,
  Star,
  StarOff,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  X,
  Save,
  Home,
  Users,
  FileText,
  Settings,
  Bell,
  List,
  File,
  LayoutDashboard,
  ClipboardList,
  Check,
  Circle,
  Menu
} from 'lucide-react';

export function ProjetsAdminPage() {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState('Projets');
    const [expandedProjects, setExpandedProjects] = useState({});
    const [projets, setProjets] = useState([]);
    const [filteredProjets, setFilteredProjets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('Tous les Projets');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [selectedProjet, setSelectedProjet] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showActionsMenu, setShowActionsMenu] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [projetToDelete, setProjetToDelete] = useState(null);
    const [selectedProjetForTask, setSelectedProjetForTask] = useState(null);
    const [clients, setClients] = useState([]);
    const [showProjectTypeModal, setShowProjectTypeModal] = useState(false);
    const [taches, setTaches] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
    const [taskFormData, setTaskFormData] = useState({
        nom_tache: '',
        description: '',
        date_debut: '',
        date_fin: '',
        statut: 'afaire',
        notes: '',
        type_projet: '',
        assignee_id: ''
    });

   const navItems = [
    { id: 'Dashboard', label: 'Tableau de bord', icon: LayoutDashboard, route: '/dashboard' },
    { id: 'listedemande', label: 'Liste des demandes devis', icon: ClipboardList, route: '/listedemande' },
    { id: 'Projets', label: 'Projets', icon: File, route: '/projetvalider' },
    { id: 'Clients', label: 'Utilisateurs', icon: Users, route: '/utilisateurs' },
    { id: 'contactger', label: 'Contact', icon: Contact, route: '/contactger' },
    { id: 'commentaireger', label: 'Commentaire', icon: MessageSquare, route: '/commentaireger' },
    { id: 'Deconnexion', label: 'Deconnexion', icon: LogOut, route: '/' },
];

    const filterOptions = [
        { key: 'all', label: 'Tous les Projets', icon: Filter },
        { key: 'encours', label: 'En Cours', icon: Clock },
        { key: 'termine', label: 'Terminés', icon: CheckCircle },
        { key: 'favoris', label: 'À Affecter', icon: Star }
    ];

    const statusConfig = {
        'encours': { 
            label: 'En cours', 
            color: 'bg-blue-100 text-blue-800 border border-blue-200',
            icon: Clock,
            bgColor: 'bg-blue-500'
        },
        'termine': { 
            label: 'Terminé', 
            color: 'bg-green-100 text-green-800 border border-green-200',
            icon: CheckCircle,
            bgColor: 'bg-green-500'
        },
        'planifie': { 
            label: 'Planifié', 
            color: 'bg-orange-100 text-orange-800 border border-orange-200',
            icon: Calendar,
            bgColor: 'bg-orange-500'
        }
    };

    // Données statiques pour chef de projet et équipes (temporaire)
    const staticChefs = [
        { id: 1, nom: "Ahmed Ben Ali" },
        { id: 2, nom: "Leila Ben Amor" },
        { id: 3, nom: "Mohamed Karray" }
    ];

    const staticPeintres = [
        { id: 1, nom: "Karim Sasai" },
        { id: 2, nom: "Youssef Gharbi" },
        { id: 3, nom: "Ali Mansouri" },
        { id: 4, nom: "Fatma Jaziri" }
    ];
    

    // Fonction pour récupérer le token CSRF depuis les cookies
    const getCSRFToken = () => {
        const tokenCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='));
            
        if (tokenCookie) {
            return decodeURIComponent(tokenCookie.split('=')[1]);
        }
        return '';
    };

    // Fonction pour initialiser la protection CSRF
    const setupCSRF = async () => {
        try {
            await fetch('http://localhost:8000/sanctum/csrf-cookie', {
                credentials: 'include'
            });
            
            const token = getCSRFToken();
            return token;
        } catch (error) {
            console.error('Erreur lors de la configuration CSRF:', error);
            return null;
        }
    };

    // API calls
    const fetchProjets = async () => {
        try {
            const csrfToken = await setupCSRF();
            const response = await fetch('http://localhost:8000/api/projets', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrfToken || ''
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new TypeError("La réponse n'est pas du JSON");
            }

            const data = await response.json();
            
            // Ajouter les données statiques manquantes et récupérer les données devis
            const projetsWithStaticData = data.map(projet => ({
                ...projet,
                chef_projet: { nom: staticChefs[Math.floor(Math.random() * staticChefs.length)].nom },
                avancement: projet.avancement || Math.floor(Math.random() * 100),
                equipe: [
                    { nom: staticChefs[0].nom, role: "Chef" },
                    { nom: staticPeintres[0].nom },
                    { nom: staticPeintres[1].nom }
                ],
                taches: projet.taches || [],
                // Ajouter description et prix du devis
                devis_description: projet.devis?.description || '',
                devis_prix: projet.devis?.prix_total || 0
            }));
            
            setProjets(projetsWithStaticData);
            setFilteredProjets(projetsWithStaticData);
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error);
            setProjets([]);
        }
    };
    useEffect(() => {
    fetchProjets();
  }, [refresh]);

  const handleDeleteTask = (task) => {
    setSelectedTask(task);
    setShowDeleteTaskModal(true);
  };

  const handleSuccessDelete = () => {
    setRefresh(prev => prev + 1);
    setShowDeleteTaskModal(false);
  };
  <ToastContainer />
  
    const fetchClients = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/clients', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new TypeError("La réponse n'est pas du JSON");
            }

            const data = await response.json();
            setClients(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des clients:', error);
            setClients([]);
        }
    };

    const fetchTachesForProject = async (projectId) => {
  try {
    const csrfToken = await setupCSRF();
    const response = await fetch(`http://localhost:8000/api/projets/${projectId}/taches`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': csrfToken || ''
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const taches = await response.json();
    
    // Mettre à jour les tâches du projet
    setProjets(prev => prev.map(p => 
      p.id_projet === projectId ? { ...p, taches: taches || [] } : p
    ));
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    // Assurez-vous que le tableau des tâches est toujours initialisé
    setProjets(prev => prev.map(p => 
      p.id_projet === projectId ? { ...p, taches: [] } : p
    ));
  }
};

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await setupCSRF();
                await Promise.all([fetchProjets(), fetchClients()]);
            } catch (error) {
                console.error('Erreur lors du chargement initial:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        // Filtrage des projets
        let filtered = projets;

        if (selectedFilter !== 'Tous les Projets') {
            const filterKey = filterOptions.find(f => f.label === selectedFilter)?.key;
            if (filterKey === 'favoris') {
                filtered = filtered.filter(p => p.favoris);
            } else if (filterKey !== 'all') {
                filtered = filtered.filter(p => p.status === filterKey);
            }
        }

        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.client?.nom && p.client.nom.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredProjets(filtered);
    }, [projets, selectedFilter, searchTerm]);

    const handleToggleFavori = async (id) => {
        try {
            const csrfToken = await setupCSRF();
            if (!csrfToken) {
                throw new Error('Impossible d\'obtenir le token CSRF');
            }

            const response = await fetch(`http://localhost:8000/api/projets/${id}/toggle-favori`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': csrfToken
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            setProjets(prev => prev.map(p => 
                p.id_projet === id ? { ...p, favoris: data.favoris } : p
            ));

        } catch (error) {
            console.error('Erreur lors de la mise à jour des favoris:', error);
        }
    };

    const handleCreateProject = async (formData) => {
        try {
            const csrfToken = await setupCSRF();
            const response = await fetch('http://localhost:8000/api/projets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': csrfToken || ''
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchProjets();
                setShowAddModal(false);
            }
        } catch (error) {
            console.error('Erreur lors de la création du projet:', error);
        }
    };

    const handleUpdateProject = async (formData) => {
        try {
            const csrfToken = await setupCSRF();
            const response = await fetch(`http://localhost:8000/api/projets/${selectedProjet.id_projet}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': csrfToken || ''
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchProjets();
                setShowEditModal(false);
                setSelectedProjet(null);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du projet:', error);
        }
    };

    const handleDeleteProject = async (id) => {
        try {
            const csrfToken = await setupCSRF();
            const response = await fetch(`http://localhost:8000/api/projets/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': csrfToken || ''
                },
                credentials: 'include'
            });

            if (response.ok) {
                setProjets(prev => prev.filter(p => p.id_projet !== id));
                setShowDeleteModal(false);
                setProjetToDelete(null);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du projet:', error);
        }
    };
    
    const envoyerTache = async (formData) => { 
  try {
    // Obtention du cookie CSRF (ok)
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Récupération du token CSRF (ok)
    const getCSRFToken = () => {
      const tokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='));
      return tokenCookie ? decodeURIComponent(tokenCookie.split('=')[1]) : '';
    };
    const token = getCSRFToken();

    // Envoi de la requête POST
    const response = await axios.post(
      'http://localhost:8000/api/taches-projet',
      formData,
      {
        withCredentials: true,
        headers: {
          'X-XSRF-TOKEN': token,
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    console.log('Tâche créée avec succès', response.data);

    // Affiche le modal ici, AVANT de retourner
    setShowSuccessModal(true);

    // Si tu veux retourner des données, retourne après
    return response.data;

  } catch (error) {
    console.error('Erreur lors de l’envoi de la tâche :', error);
    throw error;
  }
};



   const handleCreateTask = async () => {
  try {
    // 1. Validation des champs obligatoires
    const requiredFields = {
      'nom_tache': 'Le nom de la tâche est requis',
      'date_debut': 'La date de début est requise',
      'date_fin': 'La date de fin est requise',
      'type_projet': 'Le type de projet est requis'
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!taskFormData[field]?.toString().trim()) {
        throw new Error(message);
      }
    }

    // 2. Validation des dates
    const startDate = new Date(taskFormData.date_debut);
    const endDate = new Date(taskFormData.date_fin);
    
    if (endDate < startDate) {
      throw new Error('La date de fin doit être postérieure à la date de début');
    }

    // 3. Préparation des données
    const dataToSend = {
      nom_tache: taskFormData.nom_tache.trim(),
      description: taskFormData.description?.trim() || null,
      date_debut: taskFormData.date_debut,
      date_fin: taskFormData.date_fin,
      statut: taskFormData.statut || 'a_faire',
      notes: taskFormData.notes?.trim() || null,
      type_projet: taskFormData.type_projet,
      projet_id: selectedProjetForTask.id_projet,
      assignee_id: taskFormData.assignee_id || null
    };

    // 4. Envoi à l'API
    const createdTask = await envoyerTache(dataToSend);

    // 5. Gestion du succès
    // a. Rafraîchir les tâches
    await fetchTachesForProject(selectedProjetForTask.id_projet);
    
    // b. Reset du formulaire
    setTaskFormData({
      nom_tache: '',
      description: '',
      date_debut: '',
      date_fin: '',
      statut: 'a_faire',
      notes: '',
      type_projet: '',
      assignee_id: ''
    });

    // c. Fermer les modales
    setShowTaskModal(false);
    setShowProjectTypeModal(false);

    // d. Afficher notification de succès
    setShowSuccessModal({
      show: true,
      message: `Tâche "${createdTask.nom_tache}" créée avec succès`
    });

    return createdTask;

  } catch (error) {
    // 6. Gestion des erreurs détaillée
    let errorMessage = "Une erreur est survenue";
    
    if (error.response) {
      // Erreur API (422 = validation Laravel)
      if (error.response.status === 422) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join('\n');
      } else {
        errorMessage = `Erreur serveur: ${error.response.status}`;
      }
    } else if (error.message) {
      // Erreur de validation manuelle
      errorMessage = error.message;
    }

    // Afficher l'erreur (vous pourriez utiliser un système de toast ici)
    alert(errorMessage);
    console.error('Erreur création tâche:', error);

    // Pour les erreurs de validation, garder la modale ouverte
    if (!error.response || error.response.status !== 422) {
      setShowTaskModal(false);
      setShowProjectTypeModal(false);
    }

    throw error; // Propager l'erreur pour un traitement supplémentaire si nécessaire
  }
};
const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowEditTaskModal(true);
};


    const handleUpdateTask = async () => {
        try {
            const csrfToken = await setupCSRF();
            if (!csrfToken) {
                throw new Error('Impossible d\'obtenir le token CSRF');
            }

            const response = await fetch(`http://localhost:8000/api/taches-projet/${selectedTask.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(taskFormData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await fetchTachesForProject(selectedTask.projet_id);
            setShowEditTaskModal(false);
            setSelectedTask(null);
            resetTaskForm();
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la tâche:', error);
        }
    };

    const resetTaskForm = () => {
        setTaskFormData({
            nom_tache: '',
            description: '',
            date_debut: '',
            date_fin: '',
            statut: 'afaire',
            notes: '',
            type_projet: '',
            assignee_id: ''
        });
    };

    const toggleProjectExpansion = async (projectId) => {
  setExpandedProjects(prev => ({
    ...prev,
    [projectId]: !prev[projectId]
  }));

  if (!expandedProjects[projectId]) {
    await fetchTachesForProject(projectId);
  }
};

    

    const handleEditProject = (projet) => {
        setSelectedProjet(projet);
        setShowEditModal(true);
    };

    // Handlers avec useCallback pour éviter les re-renders
    const handleInputChangeTask = (e) => {
  const { name, value } = e.target;

  setTaskFormData(prev => ({
    ...prev,
    [name]: value,
  }));
};


// 1. Ajoutez cette fonction handleInputChange pour les tâches AVANT le return
const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({
        ...prev,
        [name]: value
    }));
};

    const getStatusIcon = (status) => {
        const config = statusConfig[status];
        const IconComponent = config?.icon || AlertCircle;
        return <IconComponent className="w-4 h-4" />;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'TND',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getTotalStats = () => {
        const total = projets.length;
        const enCours = projets.filter(p => p.status === 'encours').length;
        const termines = projets.filter(p => p.status === 'termine').length;
        const aAffecter = projets.filter(p => p.favoris).length;
        
        return { total, enCours, termines, aAffecter };
    };

    const toggleActionsMenu = (projectId) => {
        setShowActionsMenu(prev => prev === projectId ? null : projectId);
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'termine': 
                return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Terminé</span>;
            case 'encours': 
                return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">En cours</span>;
            case 'afaire': 
            default:
                return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">À faire</span>;
        }
    };

    const stats = getTotalStats();

    // Composant pour choisir le type de projet
    const ProjectTypeModal = ({ onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Type de Projet</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    <p className="text-gray-600">Choisissez le type de projet pour assigner les bonnes personnes :</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => {
                                setTaskFormData(prev => ({ 
                                    ...prev, 
                                    type_projet: 'grand',
                                    description: selectedProjetForTask?.devis_description || ''
                                }));
                                setShowProjectTypeModal(false);
                                setShowTaskModal(true);
                            }}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                        >
                            <div className="text-center">
                                <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                                <h4 className="font-semibold">Grand Projet</h4>
                                <p className="text-sm text-gray-500">Assigné aux chefs d'équipe</p>
                            </div>
                        </button>
                        <button 
                            onClick={() => {
                                setTaskFormData(prev => ({ 
                                    ...prev, 
                                    type_projet: 'petit',
                                    description: selectedProjetForTask?.devis_description || ''
                                }));
                                setShowProjectTypeModal(false);
                                setShowTaskModal(true);
                            }}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                        >
                            <div className="text-center">
                                <User className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                                <h4 className="font-semibold">Petit Projet</h4>
                                <p className="text-sm text-gray-500">Assigné aux peintres</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Composant pour la modale d'ajout de tâche
    const AddTaskModal = ({ onClose, taskFormData, selectedProjetForTask }) => {
    const availableAssignees = taskFormData.type_projet === 'grand' ? staticChefs : staticPeintres;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                        Ajouter une tâche - {taskFormData.type_projet === 'grand' ? 'Grand Projet' : 'Petit Projet'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom de la tâche</label>
                        <input 
                            type="text" 
                            name="nom_tache"
                            value={taskFormData.nom_tache}
                            onChange={handleInputChangeTask}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            placeholder="Nom de la tâche"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea 
                            value={taskFormData.description}
                            name="description"
                            onChange={handleInputChangeTask}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            rows="3"
                            placeholder="Description de la tâche..."
                        />
                        {selectedProjetForTask?.devis_prix > 0 && (
                            <div className="mt-2 p-2 bg-blue-50 rounded">
                                <p className="text-sm text-blue-700">
                                    Prix de référence du devis: {formatCurrency(selectedProjetForTask.devis_prix)}
                                </p>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Assignée à ({taskFormData.type_projet === 'grand' ? 'Chef d\'équipe' : 'Peintre'})
                        </label>
                        <select 
                            value={taskFormData.assignee_id}
                            name="assignee_id"
                            onChange={handleInputChangeTask}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">Sélectionner une personne</option>
                            {availableAssignees.map(person => (
                                <option key={person.id} value={person.id}>{person.nom}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de début</label>
                            <input 
                                type="date" 
                                name="date_debut"
                                value={taskFormData.date_debut}
                                onChange={handleInputChangeTask}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                            <input 
                                type="date" 
                                name="date_fin"
                                value={taskFormData.date_fin}
                                onChange={handleInputChangeTask}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Statut</label>
                        <select 
                            name="statut"
                            value={taskFormData.statut}
                            onChange={handleInputChangeTask}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="a_faire">À faire</option>
                            <option value="en_cours">En cours</option>
                            <option value="termine">Terminé</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea 
                            value={taskFormData.notes}
                            name="notes"
                            onChange={handleInputChangeTask}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            rows="3"
                            placeholder="Notes supplémentaires..."
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button 
                            onClick={handleCreateTask}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                            Ajouter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


    // Composant pour la modale d'édition de projet
    const EditProjectModal = ({ onClose }) => {
        const [formData, setFormData] = useState({
            titre: selectedProjet?.titre || '',
            id_client: selectedProjet?.id_client || '',
            date_d: selectedProjet?.date_d || '',
            date_f: selectedProjet?.date_f || '',
            status: selectedProjet?.status || 'planifie',
        });

        const handleSubmit = (e) => {
            e.preventDefault();
            handleUpdateProject(formData);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Modifier le projet</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nom du projet</label>
                            <input 
                                type="text" 
                                value={formData.titre}
                                onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Client</label>
                            <select 
                                value={formData.id_client}
                                onChange={(e) => setFormData(prev => ({ ...prev, id_client: e.target.value }))}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            >
                                <option value="">Sélectionner un client</option>
                                {clients.map(client => (
                                    <option key={client.id_client} value={client.id_client}>
                                        {client.nom} {client.prenom}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date de début</label>
                                <input 
                                    type="date" 
                                    value={formData.date_d}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date_d: e.target.value }))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                                <input 
                                    type="date" 
                                    value={formData.date_f}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date_f: e.target.value }))}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Statut</label>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="planifie">Planifié</option>
                                <option value="encours">En cours</option>
                                <option value="termine">Terminé</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // Composant DeleteConfirmationModal
    const DeleteConfirmationModal = ({ projet, onConfirm, onCancel }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Êtes-vous sûr de vouloir supprimer le projet <strong>{projet?.titre}</strong> ? 
                        Cette action est irréversible.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button 
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button 
                            onClick={() => onConfirm(projet.id_projet)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Composant AddProjectModal
    const AddProjectModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        titre: '',
        id_client: '',
        type_projet: 'Intérieur',
        date_d: '',
        date_f: '',
        status: 'encours',
        favoris: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Obtenir le cookie CSRF
            await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
                withCredentials: true,
            });
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 2. Récupération du token CSRF
            const getCSRFToken = () => {
                const tokenCookie = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('XSRF-TOKEN='));
                return tokenCookie ? decodeURIComponent(tokenCookie.split('=')[1]) : '';
            };
            const token = getCSRFToken();

            // 3. Envoyer les données avec le bon token
            const response = await axios.post('http://localhost:8000/api/projets', formData, {
                withCredentials: true,
                headers: {
                    'X-XSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            // 4. Gérer la réponse
            toast.success('Projet créé avec succès');
            setRefresh(prev => prev + 1);
            onClose();
        } catch (error) {
            console.error('Erreur création projet:', error);
            if (error.response?.status === 419) {
                toast.error('Session expirée, veuillez rafraîchir');
            } else {
                toast.error('Erreur lors de la création');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Nouveau Projet</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom du projet*</label>
                        <input
                            type="text"
                            name="titre"
                            value={formData.titre}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Client*</label>
                        <select
                            name="id_client"
                            value={formData.id_client}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                        >
                            <option value="">Sélectionner un client</option>
                            {clients.map(client => (
                                <option key={client.id_client} value={client.id_client}>
                                    {client.nom} {client.prenom}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type de projet</label>
                        <select
                            name="type_projet"
                            value={formData.type_projet}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="Intérieur">Intérieur</option>
                            <option value="Extérieur">Extérieur</option>
                            <option value="Mixte">Mixte</option>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de début*</label>
                            <input
                                type="date"
                                name="date_d"
                                value={formData.date_d}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de fin*</label>
                            <input
                                type="date"
                                name="date_f"
                                value={formData.date_f}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Statut</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="planifie">Planifié</option>
                            <option value="encours">En cours</option>
                            <option value="termine">Terminé</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="favoris"
                            checked={formData.favoris}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            Marquer comme favori
                        </label>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                            Créer le projet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des projets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-white shadow-sm flex-shrink-0">
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
    {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeNav === item.id;
        
        return (
            <button
                key={item.id}
                onClick={() => {
                    setActiveNav(item.id);
                    navigate(item.route);
                }}
                className={`flex items-center space-x-3 w-full text-left px-3 py-3 rounded-lg transition-colors ${
                    isActive
                        ? 'text-purple-600 bg-purple-50 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
                <IconComponent size={20} />
                <span>{item.label}</span>
            </button>
        );
    })}
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
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation */}
                <div className="bg-white shadow-sm border-b">
                    <div className="px-6 py-3">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold text-gray-900">{navItems.find(item => item.id === activeNav)?.label}</h1>
                            <div className="flex items-center space-x-4">
                                <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-purple-600 font-medium text-sm">A</span>
                                    </div>
                                    <span className="text-gray-700 font-medium">Admin</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 py-6">
                        {/* Header - Conditionnel pour les projets */}
                        {activeNav === 'Projets' && (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Projets</h1>
                                    <button 
                                        onClick={() => setShowAddModal(true)}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Nouveau Projet</span>
                                    </button>
                                </div>

                                {/* Filters */}
                                <div className="mb-6">
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

                                    <div className="flex items-center justify-between">
                                        <div className="relative">
                                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Rechercher un projet..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-80 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                        
                                        <div className="flex items-center space-x-6 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-500">Total:</span>
                                                <span className="font-semibold text-gray-900">{stats.total}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-500">En cours:</span>
                                                <span className="font-semibold text-blue-600">{stats.enCours}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-500">Terminés:</span>
                                                <span className="font-semibold text-green-600">{stats.termines}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-500">À affecter:</span>
                                                <span className="font-semibold text-orange-600">{stats.aAffecter}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Projects List */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">Liste des Projets</h3>
                                    </div>
                                    
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Projet
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Client
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Chef de Projet
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Statut
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Avancement
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Budget
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Période
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredProjets.map((projet) => (
                                                    <React.Fragment key={projet.id_projet}>
                                                        <tr className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center space-x-3">
                                                                    <button
                                                                        onClick={() => toggleProjectExpansion(projet.id_projet)}
                                                                        className="text-gray-400 hover:text-gray-500"
                                                                    >
                                                                        {expandedProjects[projet.id_projet] ? 
                                                                            <ChevronDown className="w-4 h-4" /> : 
                                                                            <ChevronRight className="w-4 h-4" />
                                                                        }
                                                                    </button>
                                                                    <button
    onClick={(e) => {
        e.stopPropagation(); // Empêche le toggle de l'expansion
        handleToggleFavori(projet.id_projet);
    }}
    className={`p-1 rounded ${
        projet.favoris ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-500'
    }`}
>
    {projet.favoris ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
</button>
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-900">{projet.titre}</div>
                                                                        <div className="text-sm text-gray-500 flex items-center">
                                                                            <MapPin className="w-3 h-3 mr-1" />
                                                                            {projet.adresse}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                                        <User className="w-4 h-4 text-blue-600" />
                                                                    </div>
                                                                    <span className="text-sm font-medium text-gray-900">{projet.client?.nom}</span>
                                                                </div>
                                                            </td>
                                                            
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center space-x-2">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                                                                        projet.chef_projet?.nom === 'Non assigné' ? 'bg-red-400' : 'bg-green-400'
                                                                    }`}>
                                                                        {projet.chef_projet?.nom === 'Non assigné' ? '?' : 
                                                                         projet.chef_projet?.nom.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                    </div>
                                                                    <span className={`text-sm ${
                                                                        projet.chef_projet?.nom === 'Non assigné' ? 'text-red-600 font-medium' : 'text-gray-900'
                                                                    }`}>
                                                                        {projet.chef_projet?.nom}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                        statusConfig[projet.status]?.color || 'bg-gray-100 text-gray-800 border border-gray-200'
                                                                    }`}>
                                                                        {getStatusIcon(projet.status)}
                                                                        <span className="ml-1">{statusConfig[projet.status]?.label || 'Inconnu'}</span>
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center">
                                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                                        <div 
                                                                            className={`h-2 rounded-full ${statusConfig[projet.status]?.bgColor || 'bg-gray-400'}`} 
                                                                            style={{ width: `${projet.avancement}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="ml-2 text-xs text-gray-500">{projet.avancement}%</span>
                                                                </div>
                                                            </td>
                                                            
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm text-gray-900">{formatCurrency(projet.budget)}</div>
                                                            </td>
                                                            
                                                            <td className="px-6 py-4">
                                                                <div className="text-sm text-gray-500">
                                                                    {formatDate(projet.date_d)} - {formatDate(projet.date_f)}
                                                                </div>
                                                            </td>
                                                            
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex justify-end">
                                                                    <div className="relative">
                                                                        <button 
                                                                            onClick={() => toggleActionsMenu(projet.id_projet)}
                                                                            className="text-gray-500 hover:text-gray-700"
                                                                        >
                                                                            <MoreVertical className="w-4 h-4" />
                                                                        </button>
                                                                        
                                                                        {showActionsMenu === projet.id_projet && (
                                                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                                                                <button 
                                                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                    onClick={() => {
                                                                                        setSelectedProjet(projet);
                                                                                        setShowEditModal(true);
                                                                                        setShowActionsMenu(null);
                                                                                    }}
                                                                                >
                                                                                    <Edit className="w-4 h-4 mr-2" />
                                                                                    <span>Modifier</span>
                                                                                </button>
                                                                                <button 
                                                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                    onClick={() => {
                                                                                        setProjetToDelete(projet);
                                                                                        setShowDeleteModal(true);
                                                                                        setShowActionsMenu(null);
                                                                                    }}
                                                                                >
                                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                                    <span>Supprimer</span>
                                                                                </button>
                                                                                <button 
  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
  onClick={() => {
    setSelectedProjetForTask(projet);
    setShowProjectTypeModal(true); // ou un modal pour sélectionner type_projet
    setShowActionsMenu(null);
  }}
>
  <Plus className="w-4 h-4 mr-2" />
  <span>Ajouter Tâche</span>
</button>

                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        
                                                        
                                                        {/* Expanded tasks section */}
                                                        {expandedProjects[projet.id_projet] && (
                                                            <tr className="bg-gray-50">
                                                                <td colSpan="8" className="px-6 py-4">
                                                                    <div className="ml-12">
                                                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                                            {/* Informations du projet */}
                                                                            <div className="lg:col-span-1">
                                                                                <div className="bg-white rounded-lg border border-gray-200 p-5">
                                                                                    <h4 className="font-semibold text-lg mb-4">Informations du Projet</h4>
                                                                                    
                                                                                    <div className="mb-4">
                                                                                        <h5 className="text-sm font-medium text-gray-500 mb-1">Description</h5>
                                                                                        <p className="text-gray-700">{projet.description}</p>
                                                                                    </div>
                                                                                    
                                                                                    <div>
                                                                                        <h5 className="text-sm font-medium text-gray-500 mb-1">Équipe assignée</h5>
                                                                                        <div className="space-y-2">
                                                                                            {projet.equipe?.map((membre, index) => (
                                                                                                <div key={index} className="flex items-center space-x-2">
                                                                                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                                                                        <User size={16} className="text-purple-600" />
                                                                                                    </div>
                                                                                                    <span className="text-gray-700">
                                                                                                        {membre.nom}
                                                                                                        {membre.role && <span className="text-gray-500 text-sm"> ({membre.role})</span>}
                                                                                                    </span>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                           {/* Tâches du projet */}
<div className="lg:col-span-2">
  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h4 className="font-semibold text-lg text-purple-800">Tâches du Projet</h4>
      <button 
        onClick={() => {
          setSelectedProjetForTask(projet);
          setShowProjectTypeModal(true);
        }}
        className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 transition"
      >
        <Plus size={16} />
        <span>Ajouter une tâche</span>
      </button>
    </div>
    
    <div className="space-y-4">
      {projet.taches && projet.taches.length > 0 ? (
        projet.taches.map((tache) => (
          <div key={tache.id} className="border border-purple-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-medium text-purple-900">{tache.nom_tache}</h5>
                {tache.description && (
                  <p className="text-sm text-gray-600 mt-1">{tache.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(tache.statut)}
                <button 
                  onClick={() => handleEditTask(tache, projet)}
                  className="text-blue-500 hover:text-blue-700"
                  title="Modifier"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteTask(tache)}
                  className="text-red-500 hover:text-red-700"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                <User size={14} className="mr-2 text-gray-400" />
                <span>Assigné à: {tache.assignee_id ? (
                  staticChefs.concat(staticPeintres).find(p => p.id == tache.assignee_id)?.nom || 'Non assigné'
                ) : 'Non assigné'}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar size={14} className="mr-2 text-gray-400" />
                <span>{formatDate(tache.date_debut)} - {formatDate(tache.date_fin)}</span>
              </div>
              
              <div className="flex items-center">
                <ClipboardList size={14} className="mr-2 text-gray-400" />
                <span>Type: {tache.type_projet === 'grand' ? 'Grand projet' : 'Petit projet'}</span>
              </div>
            </div>
            
            {tache.notes && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">{tache.notes}</p>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune tâche n'a été créée pour ce projet</p>
        </div>
      )}
      
      <div 
        className="border-2 border-dashed border-purple-300 rounded-lg p-6 flex items-center justify-center hover:bg-purple-50 transition-colors cursor-pointer"
        onClick={() => {
          setSelectedProjetForTask(projet);
          setShowProjectTypeModal(true);
        }}
      >
        <button 
          className="flex flex-col items-center text-gray-500 hover:text-purple-600"
        >
          <Plus className="w-8 h-8" />
          <span className="mt-2">Ajouter une tâche</span>
        </button>
      </div>
    </div>
  </div>

  {/* ✅ Intégration des modales */}
  <EditTaskModal
    show={showEditTaskModal}
    onClose={() => setShowEditTaskModal(false)}
    task={selectedTask}
    onSuccess={() => {
      fetchProjets(); // met à jour la liste
      toast.success("Tâche modifiée avec succès");
    }}
  />

 <DeleteTaskModal
        show={showDeleteTaskModal}
        onClose={() => setShowDeleteTaskModal(false)}
        task={selectedTask}
        onSuccess={handleSuccessDelete}
      />
</div>

                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Autres pages */}
                        {activeNav !== 'Projets' && (
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold mb-4">
                                    {navItems.find(item => item.id === activeNav)?.label}
                                </h2>
                                <p className="text-gray-600">
                                    Contenu de la page {activeNav} sera affiché ici...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Modal de succès */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4">Succès</h2>
            <p>La tâche a été créée avec succès !</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

            {/* Modals */}
            {showProjectTypeModal && <ProjectTypeModal onClose={() => setShowProjectTypeModal(false)} />}
            {showTaskModal && <AddTaskModal onClose={() => setShowTaskModal(false)} taskFormData={taskFormData} 
setFormData={setTaskFormData}
  selectedProjetForTask={selectedProjetForTask}/>}
            {showEditModal && <EditProjectModal onClose={() => setShowEditModal(false)} />}
            {showDeleteModal && (
                <DeleteConfirmationModal 
                    projet={projetToDelete}
                    onConfirm={handleDeleteProject}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
            {showAddModal && <AddProjectModal onClose={() => setShowAddModal(false)} />}
        </div>
    );
}