import React, { useState, useEffect } from 'react';
import { User, Home, FileText, FolderOpen, Bell, Settings, LogOut, Search, Plus, Eye, Download, Check, X, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const MesDevisPage = () => {
  const [devis, setDevis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('Tous');
  const [showModal, setShowModal] = useState(false);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filterOptions = ['Tous', 'En attente', 'Acceptés', 'Refusés'];
  const location = useLocation();
  const statusColors = {
    'en_attente': 'bg-orange-100 text-orange-800 border-orange-200',
    'valide': 'bg-green-100 text-green-800 border-green-200',
    'refuse': 'bg-red-100 text-red-800 border-red-200'
  };

  const statusLabels = {
    'en_attente': 'En attente',
    'valide': 'Accepté',
    'refuse': 'Refusé'
  };

  // Navigation items
  const navigationItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: User, label: 'Mon Profil', path: '/profile' },
  { icon: FileText, label: 'Mes Devis', path: '/mesdevis' },
  { icon: FolderOpen, label: 'Mes Projets', path: '/mes-projets' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
];


  useEffect(() => {
    fetchDevis();
  }, []);

  const fetchDevis = async () => {
    try {
      setIsLoading(true);
      
      // Mock data similar to your interface
      const mockData = [
        {
          id_devis: 1,
          montant: 2450,
          status: 'en_attente',
          date_creation: '2024-05-20',
          numero: 'DEV-2024-001',
          demande: {
            description: 'Peinture salon et cuisine',
            detail: 'Peinture complète salon 25m² + cuisine 15m²',
            surface: 40,
            type_projet: 'Intérieur',
            date_demande: '2024-05-18'
          },
          validite: '12/06/2024',
          projet: null
        },
        {
          id_devis: 2,
          montant: 5200,
          status: 'valide',
          date_creation: '2024-05-15',
          numero: 'DEV-2024-002',
          demande: {
            description: 'Peinture façade maison',
            detail: 'Ravalement façade complète avec préparation',
            surface: 120,
            type_projet: 'Extérieur',
            date_demande: '2024-05-12'
          },
          validite: '10/02/2024',
          projet: {
            status: 'encours',
            date_debut: '2024-05-22',
            date_fin: null
          }
        },
        {
          id_devis: 3,
          montant: 890,
          status: 'refuse',
          date_creation: '2024-05-10',
          numero: 'DEV-2024-003',
          demande: {
            description: 'Peinture chambre enfant',
            detail: 'Peinture chambre avec motifs décoratifs',
            surface: 25,
            type_projet: 'Décoratif',
            date_demande: '2024-05-08'
          },
          validite: '15/06/2024',
          projet: null
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      setDevis(mockData);
      setError(null);
      
    } catch (err) {
      setError('Erreur lors du chargement des devis');
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (devisId, newStatus) => {
    try {
      setDevis(prevDevis => 
        prevDevis.map(d => 
          d.id_devis === devisId 
            ? { ...d, status: newStatus }
            : d
        )
      );
      setShowModal(false);
      setSelectedDevis(null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const filteredDevis = devis.filter(d => {
    const matchesFilter = filter === 'Tous' || 
      (filter === 'En attente' && d.status === 'en_attente') ||
      (filter === 'Acceptés' && d.status === 'valide') ||
      (filter === 'Refusés' && d.status === 'refuse');
    
    const matchesSearch = searchTerm === '' || 
      d.demande?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.numero?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
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
              Voulez-vous vraiment {selectedDevis.action === 'valide' ? 'accepter' : 'refuser'} ce devis de {selectedDevis.montant}€ ?
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button 
                onClick={() => handleStatusChange(selectedDevis.id_devis, selectedDevis.action)}
                className={`px-4 py-2 rounded-md text-white ${
                  selectedDevis.action === 'valide' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Confirmer
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
          <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
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
                <p className="text-sm text-gray-600">Gérez vos informations personnelles</p>
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
                <p className="text-gray-600">Consultez et gérez vos demandes de devis</p>
              </div>
              <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau devis
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

          {/* Content */}
          {error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
              {error}
            </div>
          ) : filteredDevis.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun devis trouvé</h3>
              <p className="text-gray-600 mb-4">
                {filter === 'Tous' 
                  ? 'Vous n\'avez pas encore de devis.' 
                  : `Aucun devis ${filter.toLowerCase()} trouvé.`}
              </p>
              <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800">
                Demander un devis
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDevis.map(devis => (
                <div key={devis.id_devis} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition p-6">
                  {/* Header with status indicator */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        devis.status === 'en_attente' ? 'bg-orange-400' :
                        devis.status === 'valide' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {devis.demande?.description}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {devis.demande?.detail}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        € {devis.montant?.toLocaleString('fr-FR')}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[devis.status]}`}>
                        {statusLabels[devis.status]}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Numéro:</span>
                      <div className="font-medium">{devis.numero}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Surface:</span>
                      <div className="font-medium">{devis.demande?.surface}m²</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <div className="font-medium">{devis.demande?.type_projet}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Valide jusqu'au:</span>
                      <div className="font-medium">{devis.validite}</div>
                    </div>
                  </div>

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
                    
                    {devis.status === 'en_attente' && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedDevis({ ...devis, action: 'refuse' });
                            setShowModal(true);
                          }}
                          className="flex items-center px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Refuser
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedDevis({ ...devis, action: 'valide' });
                            setShowModal(true);
                          }}
                          className="flex items-center px-3 py-1 text-sm text-white bg-green-500 hover:bg-green-600 rounded-md"
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

