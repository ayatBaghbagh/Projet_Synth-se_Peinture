import React, { useState, useEffect } from 'react'; 
import { 
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
    const [selectedProjet, setSelectedProjet] = useState(null);
    const [showActionsMenu, setShowActionsMenu] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [projetToDelete, setProjetToDelete] = useState(null);
    const [selectedProjetForTask, setSelectedProjetForTask] = useState(null);

    const navItems = [
        { id: 'Dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { id: 'Demandes', label: 'Liste des demandes devis', icon: ClipboardList },
        { id: 'Projets', label: 'Projets', icon: File },
        { id: 'Clients', label: 'Clients', icon: Users },
        { id: 'Equipes', label: 'Équipes', icon: Users },
        { id: 'Planning', label: 'Planning', icon: Calendar },
        { id: 'Parametres', label: 'Paramètres', icon: Settings }
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

    // Données statiques pour démonstration
    const projetsData = [
        {
            id_projet: 1,
            titre: "Villa Moderne",
            adresse: "123 Rue des Roses, Tunis",
            client: { nom: "Pierre Durand" },
            chef_projet: { nom: "Ahmed Ben Ali" },
            status: "encours",
            avancement: 75,
            budget: 5000,
            date_d: "2024-05-10",
            date_f: "2024-05-30",
            favoris: true,
            description: "Peinture complète d’une villa moderne avec finitions haut de gamme",
            equipe: [
                { nom: "Ahmed Ben Ali", role: "Chef" },
                { nom: "Karim Sasai" },
                { nom: "Youssef Gharbi" }
            ],
            taches: [
                { 
                    id: 1, 
                    nom: "Peinture du salon", 
                    status: "termine", 
                    assignee: "Karim Sasai", 
                    date_d: "2024-05-10", 
                    date_f: "2024-05-15",
                    notes: "Finition mate, couleur beige"
                },
                { 
                    id: 2, 
                    nom: "Peinture des chambres", 
                    status: "encours", 
                    assignee: "Youssef Gharbi", 
                    date_d: "2024-05-16", 
                    date_f: "2024-05-25",
                    notes: "Couleurs personnalisées selon..."
                },
                { 
                    id: 3, 
                    nom: "Peinture de la cuisine", 
                    status: "afaire", 
                    assignee: "Karim Sasai", 
                    date_d: "2024-05-26", 
                    date_f: "2024-05-30",
                    notes: "Peinture résistante à l’humidité"
                }
            ]
        },
        {
            id_projet: 2,
            titre: "Appartement Luxe",
            adresse: "45 Avenue Habib Bourguiba, Sousse",
            client: { nom: "Sophie Martin" },
            chef_projet: { nom: "Leila Ben Amor" },
            status: "planifie",
            avancement: 10,
            budget: 3500,
            date_d: "2024-06-01",
            date_f: "2024-06-20",
            favoris: false,
            description: "Rénovation complète d'un appartement de luxe avec matériaux premium",
            equipe: [
                { nom: "Leila Ben Amor", role: "Chef" },
                { nom: "Mohamed Karray" }
            ],
            taches: [
                { 
                    id: 1, 
                    nom: "Démolition des cloisons", 
                    status: "afaire", 
                    assignee: "Mohamed Karray", 
                    date_d: "2024-06-01", 
                    date_f: "2024-06-05"
                }
            ]
        }
    ];

    useEffect(() => {
        // Chargement initial des données
        setTimeout(() => {
            setProjets(projetsData);
            setFilteredProjets(projetsData);
            setIsLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        // Filtrage des projets
        let filtered = projets;

        if (selectedFilter !== 'Tous les Projets') {
            const filterKey = filterOptions.find(f => f.label === selectedFilter)?.key;
            if (filterKey === 'favoris') {
                filtered = filtered.filter(p => p.favoris || p.chef_projet?.nom === 'Non assigné');
            } else if (filterKey !== 'all') {
                filtered = filtered.filter(p => p.status === filterKey);
            }
        }

        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.client?.nom && p.client.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.chef_projet?.nom && p.chef_projet.nom.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredProjets(filtered);
    }, [projets, selectedFilter, searchTerm]);

    const handleToggleFavori = (id) => {
        setProjets(prev => prev.map(p => 
            p.id_projet === id ? { ...p, favoris: !p.favoris } : p
        ));
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
        const aAffecter = projets.filter(p => p.favoris || p.chef_projet?.nom === 'Non assigné').length;
        
        return { total, enCours, termines, aAffecter };
    };

    const toggleProjectExpansion = (projectId) => {
        setExpandedProjects(prev => ({
            ...prev,
            [projectId]: !prev[projectId]
        }));
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

    const handleDeleteProjet = (id) => {
        setProjets(prev => prev.filter(p => p.id_projet !== id));
        setShowDeleteModal(false);
    };

    // Composant pour la modale d'ajout de tâche
    const AddTaskModal = ({ onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Ajouter une tâche</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom de la tâche</label>
                        <input 
                            type="text" 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            placeholder="Nom de la tâche"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Assignée à</label>
                        <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <option>Ahmed Ben Ali</option>
                            <option>Karim Sasai</option>
                            <option>Youssef Gharbi</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de début</label>
                            <input 
                                type="date" 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                            <input 
                                type="date" 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Statut</label>
                        <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <option value="afaire">À faire</option>
                            <option value="encours">En cours</option>
                            <option value="termine">Terminé</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            rows="3"
                            placeholder="Notes supplémentaires..."
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                            Ajouter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Composant pour la modale d'édition de projet
    const EditProjectModal = ({ onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Modifier le projet</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom du projet</label>
                        <input 
                            type="text" 
                            defaultValue={selectedProjet?.titre || ""}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Client</label>
                        <input 
                            type="text" 
                            defaultValue={selectedProjet?.client?.nom || ""}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Adresse</label>
                        <input 
                            type="text" 
                            defaultValue={selectedProjet?.adresse || ""}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Chef de projet</label>
                        <select 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            defaultValue={selectedProjet?.chef_projet?.nom || ""}
                        >
                            <option>Ahmed Ben Ali</option>
                            <option>Karim Sasai</option>
                            <option>Youssef Gharbi</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de début</label>
                            <input 
                                type="date" 
                                defaultValue={selectedProjet?.date_d || ""}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                            <input 
                                type="date" 
                                defaultValue={selectedProjet?.date_f || ""}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Budget</label>
                        <input 
                            type="number" 
                            defaultValue={selectedProjet?.budget || ""}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea 
                            defaultValue={selectedProjet?.description || ""}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            rows="3"
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                            Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

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
                            onClick={onConfirm}
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
    const AddProjectModal = ({ onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Nouveau Projet</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom du projet*</label>
                        <input 
                            type="text" 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            placeholder="Nom du projet"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Client*</label>
                        <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <option>Sélectionner un client</option>
                            <option>Pierre Durand</option>
                            <option>Sophie Martin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Adresse*</label>
                        <input 
                            type="text" 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            placeholder="Adresse complète"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Chef de projet</label>
                        <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <option>Sélectionner un chef</option>
                            <option>Ahmed Ben Ali</option>
                            <option>Leila Ben Amor</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de début*</label>
                            <input 
                                type="date" 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date de fin estimée*</label>
                            <input 
                                type="date" 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Budget (TND)</label>
                        <input 
                            type="number" 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            placeholder="Montant"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            rows="3"
                            placeholder="Détails du projet..."
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                            Créer Projet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

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
                                    onClick={() => setActiveNav(item.id)}
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
                                                                        onClick={() => handleToggleFavori(projet.id_projet)}
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
                                                                                        setShowTaskModal(true);
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
                                                                                <div className="bg-white rounded-lg border border-gray-200 p-5">
                                                                                    <div className="flex justify-between items-center mb-4">
                                                                                        <h4 className="font-semibold text-lg">Tâches du Projet</h4>
                                                                                        <button 
                                                                                            onClick={() => {
                                                                                                setSelectedProjetForTask(projet);
                                                                                                setShowTaskModal(true);
                                                                                            }}
                                                                                            className="flex items-center space-x-1 text-purple-600 hover:text-purple-800"
                                                                                        >
                                                                                            <Plus size={16} />
                                                                                            <span>Ajouter une tâche</span>
                                                                                        </button>
                                                                                    </div>
                                                                                    
                                                                                    <div className="space-y-4">
                                                                                        {projet.taches.map((tache) => (
                                                                                            <div key={tache.id} className="border border-gray-200 rounded-lg p-4">
                                                                                                <div className="flex justify-between items-start">
                                                                                                    <h5 className="font-medium text-gray-900">{tache.nom}</h5>
                                                                                                    {getStatusBadge(tache.status)}
                                                                                                </div>
                                                                                                
                                                                                                <div className="mt-3 flex items-center text-sm text-gray-600">
                                                                                                    <User size={14} className="mr-2 text-gray-400" />
                                                                                                    <span>Assigné à {tache.assignee}</span>
                                                                                                </div>
                                                                                                
                                                                                                <div className="mt-2 flex items-center text-sm text-gray-600">
                                                                                                    <Calendar size={14} className="mr-2 text-gray-400" />
                                                                                                    <span>{formatDate(tache.date_d)} - {formatDate(tache.date_f)}</span>
                                                                                                </div>
                                                                                                
                                                                                                {tache.notes && (
                                                                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                                                                        <p className="text-sm text-gray-600">{tache.notes}</p>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        ))}
                                                                                        
                                                                                        <div 
                                                                                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                                                                                            onClick={() => {
                                                                                                setSelectedProjetForTask(projet);
                                                                                                setShowTaskModal(true);
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

            {/* Modals */}
            {showTaskModal && <AddTaskModal onClose={() => setShowTaskModal(false)} />}
            {showEditModal && <EditProjectModal onClose={() => setShowEditModal(false)} />}
            {showDeleteModal && (
                <DeleteConfirmationModal 
                    projet={projetToDelete}
                    onConfirm={() => handleDeleteProjet(projetToDelete.id_projet)}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
            {showAddModal && <AddProjectModal onClose={() => setShowAddModal(false)} />}
        </div>
    );
}