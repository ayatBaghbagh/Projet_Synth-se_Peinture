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
  AlertCircle
} from 'lucide-react';

export const ProjetsAdminPage = () => {
  const [projets, setProjets] = useState([]);
  const [filteredProjets, setFilteredProjets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Tous les Projets');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProjet, setSelectedProjet] = useState(null);

  const filterOptions = [
    { key: 'all', label: 'Tous les Projets', icon: Filter },
    { key: 'encours', label: 'En Cours', icon: Clock },
    { key: 'termine', label: 'Terminés', icon: CheckCircle },
    { key: 'favoris', label: 'À Affecter', icon: Star }
  ];

  const statusConfig = {
    'encours': { 
      label: 'En cours', 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Clock,
      bgColor: 'bg-blue-500'
    },
    'termine': { 
      label: 'Terminé', 
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      bgColor: 'bg-green-500'
    },
    'planifie': { 
      label: 'Planifié', 
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: Calendar,
      bgColor: 'bg-orange-500'
    }
  };

  // Données statiques pour démonstration
  const projetsData = [
    {
      id_projet: 1,
      titre: 'Villa Moderne',
      client: { nom: 'Pierre Durand' },
      chef_projet: { nom: 'Ahmed Ben Ali' },
      adresse: '123 Rue des Roses, Tunis',
      description: 'Peinture complète d\'une villa moderne avec finitions haut de gamme',
      budget: 5000,
      date_d: '2024-05-10',
      date_f: '2024-05-30',
      status: 'encours',
      avancement: 75,
      image: '/api/placeholder/300/200',
      favoris: true,
      taches: [
        { id: 1, nom: 'Préparation des murs', status: 'termine', date_limite: '2024-05-15' },
        { id: 2, nom: 'Application première couche', status: 'encours', date_limite: '2024-05-20' },
        { id: 3, nom: 'Finitions décoratives', status: 'planifie', date_limite: '2024-05-25' }
      ]
    },
    {
      id_projet: 2,
      titre: 'Appartement Centre-ville',
      client: { nom: 'Sophie Leroy' },
      chef_projet: { nom: 'Mohamed Tourni' },
      adresse: '45 Avenue Habib Bourguiba, Tunis',
      description: 'Rénovation peinture appartement 3 pièces',
      budget: 2500,
      date_d: '2024-05-05',
      date_f: '2024-05-20',
      status: 'termine',
      avancement: 100,
      image: '/api/placeholder/300/200',
      favoris: false,
      taches: [
        { id: 1, nom: 'Préparation', status: 'termine', date_limite: '2024-05-08' },
        { id: 2, nom: 'Peinture salon', status: 'termine', date_limite: '2024-05-12' },
        { id: 3, nom: 'Peinture chambres', status: 'termine', date_limite: '2024-05-18' }
      ]
    },
    {
      id_projet: 3,
      titre: 'Bureau Commercial',
      client: { nom: 'Jean Dupont' },
      chef_projet: { nom: 'Ahmed Ben Ali' },
      adresse: '78 Rue du Commerce, Sousse',
      description: 'Peinture bureaux commerciaux - 500m²',
      budget: 3500,
      date_d: '2024-06-01',
      date_f: '2024-06-15',
      status: 'planifie',
      avancement: 0,
      image: '/api/placeholder/300/200',
      favoris: false,
      taches: []
    },
    {
      id_projet: 4,
      titre: 'Résidence Les Oliviers',
      client: { nom: 'Marie Martin' },
      chef_projet: { nom: 'Non assigné' },
      adresse: 'Résidence Les Oliviers, Ariana',
      description: 'Peinture complète d\'un immeuble de 10 appartements',
      budget: 15000,
      date_d: '2024-06-10',
      date_f: '2024-07-15',
      status: 'planifie',
      avancement: 0,
      image: '/api/placeholder/300/200',
      favoris: true,
      taches: []
    }
  ];

  useEffect(() => {
    // Simulation du chargement des données
    setTimeout(() => {
      setProjets(projetsData);
      setFilteredProjets(projetsData);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = projets;

    // Filtrage par statut
    if (selectedFilter !== 'Tous les Projets') {
      const filterKey = filterOptions.find(f => f.label === selectedFilter)?.key;
      if (filterKey === 'favoris') {
        filtered = filtered.filter(p => p.favoris || p.chef_projet?.nom === 'Non assigné');
      } else if (filterKey !== 'all') {
        filtered = filtered.filter(p => p.status === filterKey);
      }
    }

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.chef_projet?.nom.toLowerCase().includes(searchTerm.toLowerCase())
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
    currency: 'TND', // ✅ Le vrai code ISO du dinar tunisien
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

  const stats = getTotalStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Projets</h1>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Projet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-6 py-6">
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
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
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
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-80 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <span className="font-semibold text-red-600">{stats.aAffecter}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm">
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
                    <tr key={projet.id_projet} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
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
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          statusConfig[projet.status]?.color || 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {getStatusIcon(projet.status)}
                          <span>{statusConfig[projet.status]?.label || projet.status}</span>
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${statusConfig[projet.status]?.bgColor || 'bg-gray-400'}`}
                              style={{ width: `${projet.avancement}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{projet.avancement}%</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(projet.budget)}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div>{formatDate(projet.date_d)}</div>
                          <div className="text-gray-500">
                            {projet.date_f ? formatDate(projet.date_f) : '—'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 hidden group-hover:block">
                            <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Eye className="w-4 h-4" />
                              <span>Voir détails</span>
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedProjet(projet);
                                setShowTaskModal(true);
                              }}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Ajouter tâche</span>
                            </button>
                            <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Edit className="w-4 h-4" />
                              <span>Modifier</span>
                            </button>
                            <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
