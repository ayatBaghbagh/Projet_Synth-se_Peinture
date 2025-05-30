import React, { useState, useEffect } from 'react'; 
import { 
  Search, 
  Plus, 
  Filter, 
  User,
  Star,
  Calendar,
  Clock,
  StarOff,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
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
  Menu,
  Phone,
  Mail,
  UserCheck,
  UserCog,
  UserMinus
} from 'lucide-react';

export function ChefsAdminPage() {
    const [activeNav, setActiveNav] = useState('Chefs');
    const [chefs, setChefs] = useState([]);
    const [filteredChefs, setFilteredChefs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('Tous les Chefs');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedChef, setSelectedChef] = useState(null);
    const [chefToDelete, setChefToDelete] = useState(null);
    const [showActionsMenu, setShowActionsMenu] = useState(null);

    const navItems = [
        { id: 'Dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { id: 'Demandes', label: 'Liste des demandes devis', icon: ClipboardList },
        { id: 'Projets', label: 'Projets', icon: File },
        { id: 'Clients', label: 'Clients', icon: Users },
        { id: 'Equipes', label: 'Équipes', icon: Users },
        { id: 'Planning', label: 'Planning', icon: Calendar },
        { id: 'Parametres', label: 'Paramètres', icon: Settings },
        { id: 'Chefs', label: 'Chefs de Projet', icon: UserCog }
    ];

    const filterOptions = [
        { key: 'all', label: 'Tous les Chefs', icon: Filter },
        { key: 'disponible', label: 'Disponible', icon: UserCheck },
        { key: 'occupe', label: 'Occupé', icon: UserMinus },
        { key: 'depositaire', label: 'Dépositaire', icon: UserCog }
    ];

    const disponibiliteConfig = {
        'Disponible': { 
            label: 'Disponible', 
            color: 'bg-green-100 text-green-800 border border-green-200',
            icon: CheckCircle,
            bgColor: 'bg-green-500'
        },
        'Occupé': { 
            label: 'Occupé', 
            color: 'bg-orange-100 text-orange-800 border border-orange-200',
            icon: Clock,
            bgColor: 'bg-orange-500'
        },
        'Dépositaire': { 
            label: 'Dépositaire', 
            color: 'bg-purple-100 text-purple-800 border border-purple-200',
            icon: UserCog,
            bgColor: 'bg-purple-500'
        }
    };

    // Données statiques pour démonstration
    const chefsData = [
        {
            id: 1,
            nom: "ABA Ahmed Ben Ali",
            specialite: "Peinture Intérieure",
            contact: {
                email: "ahmed.benali@email.com",
                telephone: "06 11 22 33 44"
            },
            projets: { actifs: 2, termines: 5 },
            equipe: ["Karin", "Basri", "Youssef", "Okuchi"],
            disponibilite: "Occupé",
            favoris: true
        },
        {
            id: 2,
            nom: "MT Mohamed Tounsi",
            specialite: "Peinture décorative",
            contact: {
                email: "mohamed.tounsi@email.com",
                telephone: "06 55 66 77 58"
            },
            projets: { actifs: 0, termines: 7 },
            equipe: ["Youssef", "Okuchi", "Amine", "Dostiri"],
            disponibilite: "Dépositaire",
            favoris: false
        },
        {
            id: 3,
            nom: "ST Sami Trabelsi",
            specialite: "Peinture extérieure",
            contact: {
                email: "sami.trabelsi@email.com",
                telephone: "06 99 88 77 66"
            },
            projets: { actifs: 0, termines: 3 },
            equipe: ["Amine", "Dostiri", "Manda", "Bouazizi"],
            disponibilite: "Dépositaire",
            favoris: true
        }
    ];

    useEffect(() => {
        // Chargement initial des données
        setTimeout(() => {
            setChefs(chefsData);
            setFilteredChefs(chefsData);
            setIsLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        // Filtrage des chefs
        let filtered = chefs;

        if (selectedFilter !== 'Tous les Chefs') {
            const filterKey = filterOptions.find(f => f.label === selectedFilter)?.key;
            if (filterKey === 'disponible') {
                filtered = filtered.filter(c => c.disponibilite === 'Disponible');
            } else if (filterKey === 'occupe') {
                filtered = filtered.filter(c => c.disponibilite === 'Occupé');
            } else if (filterKey === 'depositaire') {
                filtered = filtered.filter(c => c.disponibilite === 'Dépositaire');
            }
        }

        if (searchTerm) {
            filtered = filtered.filter(c => 
                c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.specialite.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.contact.telephone.includes(searchTerm)
            );
        }

        setFilteredChefs(filtered);
    }, [chefs, selectedFilter, searchTerm]);

    const handleToggleFavori = (id) => {
        setChefs(prev => prev.map(c => 
            c.id === id ? { ...c, favoris: !c.favoris } : c
        ));
    };

    const getDisponibiliteIcon = (disponibilite) => {
        const config = disponibiliteConfig[disponibilite];
        const IconComponent = config?.icon || XCircle;
        return <IconComponent className="w-4 h-4" />;
    };

    const getTotalStats = () => {
        const total = chefs.length;
        const disponible = chefs.filter(c => c.disponibilite === 'Disponible').length;
        const occupe = chefs.filter(c => c.disponibilite === 'Occupé').length;
        const depositaire = chefs.filter(c => c.disponibilite === 'Dépositaire').length;
        
        return { total, disponible, occupe, depositaire };
    };

    const toggleActionsMenu = (chefId) => {
        setShowActionsMenu(prev => prev === chefId ? null : chefId);
    };

    const stats = getTotalStats();

    const handleDeleteChef = (id) => {
        setChefs(prev => prev.filter(c => c.id !== id));
        setShowDeleteModal(false);
    };

    // Composant pour la modale d'ajout de chef
    const AddChefModal = ({ onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Nouveau Chef de Projet</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom complet*</label>
                        <input 
                            type="text" 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            placeholder="Nom du chef de projet"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Spécialité*</label>
                        <input 
                            type="text" 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            placeholder="Spécialité principale"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email*</label>
                        <input 
                            type="email" 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            placeholder="email@exemple.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Téléphone*</label>
                        <input 
                            type="tel" 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            placeholder="06 00 00 00 00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Disponibilité</label>
                        <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <option value="Disponible">Disponible</option>
                            <option value="Occupé">Occupé</option>
                            <option value="Dépositaire">Dépositaire</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Équipe</label>
                        <textarea 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            rows="3"
                            placeholder="Liste des membres de l'équipe (séparés par des virgules)"
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
                            Ajouter Chef
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Composant pour la modale d'édition de chef
    const EditChefModal = ({ onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Modifier Chef de Projet</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom complet*</label>
                        <input 
                            type="text" 
                            defaultValue={selectedChef?.nom || ""}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Spécialité*</label>
                        <input 
                            type="text" 
                            defaultValue={selectedChef?.specialite || ""}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email*</label>
                        <input 
                            type="email" 
                            defaultValue={selectedChef?.contact?.email || ""}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Téléphone*</label>
                        <input 
                            type="tel" 
                            defaultValue={selectedChef?.contact?.telephone || ""}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Disponibilité</label>
                        <select 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            defaultValue={selectedChef?.disponibilite || "Disponible"}
                        >
                            <option value="Disponible">Disponible</option>
                            <option value="Occupé">Occupé</option>
                            <option value="Dépositaire">Dépositaire</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Équipe</label>
                        <textarea 
                            defaultValue={selectedChef?.equipe?.join(", ") || ""}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            rows="3"
                            placeholder="Liste des membres de l'équipe (séparés par des virgules)"
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
    const DeleteConfirmationModal = ({ chef, onConfirm, onCancel }) => (
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
                        Êtes-vous sûr de vouloir supprimer le chef de projet <strong>{chef?.nom}</strong> ? 
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des chefs de projet...</p>
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
                        {/* Header - Conditionnel pour les chefs */}
                        {activeNav === 'Chefs' && (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Chefs de Projet</h1>
                                    <button 
                                        onClick={() => setShowAddModal(true)}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Nouveau Chef</span>
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
                                                placeholder="Rechercher un chef..."
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
                                                <span className="text-gray-500">Disponibles:</span>
                                                <span className="font-semibold text-green-600">{stats.disponible}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-500">Occupés:</span>
                                                <span className="font-semibold text-orange-600">{stats.occupe}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-500">Dépositaires:</span>
                                                <span className="font-semibold text-purple-600">{stats.depositaire}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chefs List */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">Liste des Chefs de Projet</h3>
                                    </div>
                                    
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Chef de Projet
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Spécialité
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Contact
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Projets
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Équipe
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Disponibilité
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredChefs.map((chef) => (
                                                    <tr key={chef.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-3">
                                                                <button
                                                                    onClick={() => handleToggleFavori(chef.id)}
                                                                    className={`p-1 rounded ${
                                                                        chef.favoris ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-500'
                                                                    }`}
                                                                >
                                                                    {chef.favoris ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                                                                </button>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">{chef.nom}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-900">{chef.specialite}</div>
                                                        </td>
                                                        
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                                    <span>{chef.contact.email}</span>
                                                                </div>
                                                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                                                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                                    <span>{chef.contact.telephone}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-900">
                                                                <span className="font-medium">{chef.projets.actifs}</span> actifs
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                <span className="font-medium">{chef.projets.termines}</span> terminés
                                                            </div>
                                                        </td>
                                                        
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap gap-1">
                                                                {chef.equipe.slice(0, 2).map((membre, index) => (
                                                                    <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                                                        {membre}
                                                                    </span>
                                                                ))}
                                                                {chef.equipe.length > 2 && (
                                                                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                                                        +{chef.equipe.length - 2}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    disponibiliteConfig[chef.disponibilite]?.color || 'bg-gray-100 text-gray-800 border border-gray-200'
                                                                }`}>
                                                                    {getDisponibiliteIcon(chef.disponibilite)}
                                                                    <span className="ml-1">{disponibiliteConfig[chef.disponibilite]?.label || chef.disponibilite}</span>
                                                                </span>
                                                            </div>
                                                        </td>
                                                        
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end">
                                                                <div className="relative">
                                                                    <button 
                                                                        onClick={() => toggleActionsMenu(chef.id)}
                                                                        className="text-gray-500 hover:text-gray-700"
                                                                    >
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </button>
                                                                    
                                                                    {showActionsMenu === chef.id && (
                                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                                                            <button 
                                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                onClick={() => {
                                                                                    setSelectedChef(chef);
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
                                                                                    setChefToDelete(chef);
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
                                                                                    setShowActionsMenu(null);
                                                                                }}
                                                                            >
                                                                                <Eye className="w-4 h-4 mr-2" />
                                                                                <span>Voir détails</span>
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
                                    
                                    {filteredChefs.length === 0 && (
                                        <div className="text-center py-12">
                                            <div className="text-gray-400 mb-2">Aucun chef de projet trouvé</div>
                                            <button 
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setSelectedFilter('Tous les Chefs');
                                                }}
                                                className="text-purple-600 hover:text-purple-800 font-medium"
                                            >
                                                Réinitialiser les filtres
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Autres pages */}
                        {activeNav !== 'Chefs' && (
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
            {showEditModal && <EditChefModal onClose={() => setShowEditModal(false)} />}
            {showDeleteModal && (
                <DeleteConfirmationModal 
                    chef={chefToDelete}
                    onConfirm={() => handleDeleteChef(chefToDelete.id)}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
            {showAddModal && <AddChefModal onClose={() => setShowAddModal(false)} />}
        </div>
    );
}