import React, { useState, useEffect } from 'react';
import { 
  Home, User, FileText, Folder, Bell, Settings, Plus, Eye, Download, 
  AlertCircle, Calendar, Search, Check, ArrowLeft, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const DashboardPage = () => {
  const [activeTab] = useState('dashboard');
  const [activeSection, setActiveSection] = useState('devis');
  const [filterDevis, setFilterDevis] = useState('tous');
  const [client, setClient] = useState(null);
  const [devis, setDevis] = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:8000/api';

  // Fonction pour récupérer le token d'authentification
  const getAuthToken = () => {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  };

  // Fonction pour récupérer les données du client
 const fetchClientData = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn("Token manquant, redirection vers /login");
      navigate('/login');
      return;
    }

    // Configuration des headers pour toutes les requêtes
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';

    // Utilisation de Promise.all pour paralléliser les requêtes
    const [profileResponse, devisResponse, projetsResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/profile`),
      axios.get(`${API_BASE_URL}/client/mes-devis`),
      axios.get(`${API_BASE_URL}/client/mes-projets`)
    ]);

    console.log("Profil client reçu:", profileResponse.data);
    setClient(profileResponse.data.client);
    setDevis(devisResponse.data.devis);
    setProjets(projetsResponse.data.projets);

  } catch (err) {
    setError(err.message || "Erreur inconnue");
    console.error('Erreur dans fetchClientData:', err);
    
    // Redirection si erreur 401 (non autorisé)
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token');
      navigate('/login');
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchClientData();
  }, []);

  // Statistiques calculées
  const stats = {
    devisEnAttente: devis.filter(d => d.statut === 'en_attente').length,
    projetsEnCours: projets.filter(p => p.status === 'en_cours').length,
    projetsTermines: projets.filter(p => p.status === 'termine').length,
    totalInvesti: projets.reduce((sum, p) => sum + (p.budget || 0), 0)
  };

  // Formatage de la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Composant de carte statistique
  const StatCard = ({ title, value, color, subtitle, icon: Icon }) => (
    <div className={`${color} rounded-xl p-6 text-gray-700 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-gray-600 font-medium">{title}</h3>
          <p className="text-3xl font-bold mt-1 text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && <Icon className="w-8 h-8 text-gray-400" />}
      </div>
    </div>
  );
   // utils/format.js
 const formatPrice = (price) => {
  if (price === null || price === undefined) return 'Non spécifié';
  const num = Number(price);
  return isNaN(num) ? 'Non spécifié' : `€${num.toFixed(2)}`;
};
  // Sidebar
  const Sidebar = () => (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 transition-all duration-300 z-10">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3 animate-fade-in">
          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">AP</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-800">ArtisanPeinture</h2>
            <p className="text-sm text-gray-500">Espace Client</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              activeTab === 'dashboard' 
                ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 border-l-4 border-red-500 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
        </div>
      </nav>

      <div className="h-full relative bg-white rounded-xl shadow-md overflow-hidden p-4 space-y-4">
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <User className="w-4 h-4 mr-3" />
              Mon Profil
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('/mesdevis')}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <AlertCircle className="w-4 h-4 mr-3" />
              Mes Devis
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('/mes-projets')}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <Calendar className="w-4 h-4 mr-3" />
              Mes Projets
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                localStorage.removeItem('auth_token');
                sessionStorage.removeItem('auth_token');
                navigate('/login');
              }}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-3" />
              Déconnexion
            </button>
          </li>
        </ul>
      </div>

      {/* User Profile at Bottom */}
      <div className="absolute bottom-6 left-4 right-4 animate-fade-in-up">
        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
          <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs">
              {client ? `${client.prenom?.charAt(0)}${client.nom?.charAt(0)}` : 'JD'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              {client ? `${client.prenom} ${client.nom}` : 'Jean Dupont'}
            </p>
            <p className="text-xs text-gray-500">
              {client ? client.email : 'jean@example.com'}
            </p>
          </div>
          <Settings className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
        </div>
      </div>
    </div>
  );

  // Contenu du dashboard
  const DashboardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-2">
              <span>Bonjour, {client?.prenom || 'Client'}</span>
              <span className="text-2xl">👋</span>
            </h1>
            <p className="text-gray-600 mt-1">Bienvenue dans votre espace client</p>
          </div>
          <button 
            onClick={() => navigate('/nouveau-devis')}
            className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau devis</span>
          </button>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Devis en attente"
            value={stats.devisEnAttente}
            color="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
            subtitle="Dernière mise à jour: aujourd'hui"
            icon={FileText}
          />
          <StatCard
            title="Projets en cours"
            value={stats.projetsEnCours}
            color="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
            subtitle="Dernière mise à jour: aujourd'hui"
            icon={Folder}
          />
          <StatCard
            title="Projets terminés"
            value={stats.projetsTermines}
            color="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
            subtitle="Dernière mise à jour: aujourd'hui"
            icon={Check}
          />
          <StatCard
            title="Total Investi"
            value={`€${stats.totalInvesti.toLocaleString()}`}
            color="bg-gradient-to-br from-purple-400 to-purple-500 text-white"
            icon={User}
          />
        </div>

        {/* Onglets de navigation */}
        <div className="bg-white rounded-xl shadow-sm p-2 inline-flex space-x-1">
          <button
            onClick={() => setActiveSection('devis')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeSection === 'devis'
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            Mes devis
          </button>
          <button
            onClick={() => setActiveSection('projects')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeSection === 'projects'
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            Mes projets
          </button>
        </div>

        {/* Section de contenu */}
        {activeSection === 'devis' ? (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Devis récents</h2>
                <p className="text-gray-600 text-sm">Consultez vos demandes de devis et leurs statuts</p>
              </div>
              <button 
                onClick={() => navigate('/mesdevis')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-300"
              >
                Voir tous les devis
              </button>
            </div>

            <div className="space-y-4">
              {devis.slice(0, 2).map((devisItem) => (
                <div 
                  key={devisItem.id_devis} 
                  className="border border-gray-100 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {devisItem.description_travaux || 'Devis sans description'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          devisItem.statut === 'accepte' 
                            ? 'bg-green-100 text-green-700 shadow-sm' 
                            : devisItem.statut === 'refuse'
                            ? 'bg-red-100 text-red-700 shadow-sm'
                            : 'bg-yellow-100 text-yellow-700 shadow-sm'
                        }`}>
                          {devisItem.statut === 'accepte' ? 'Accepté' : devisItem.statut === 'refuse' ? 'Refusé' : 'En attente'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Référence:</span> {devisItem.numero_devis}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {formatDate(devisItem.date_creation)}
                        </div>
                        <div>
                          <span className="font-medium">Montant:</span> {formatPrice(devisItem.prix_total)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <button 
                        onClick={() => navigate(`/mesdevis/${devisItem.id_devis}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1 transition-colors duration-300"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Voir détails</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {devis.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun devis trouvé
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Projets en cours</h2>
                <p className="text-gray-600 text-sm">Suivez l'avancement de vos projets de peinture</p>
              </div>
              <button 
                onClick={() => navigate('/mes-projets')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-300"
              >
                Voir tous les projets
              </button>
            </div>

            <div className="space-y-4">
              {projets.slice(0, 1).map((projet) => (
                <div 
                  key={projet.id_projet} 
                  className="border border-gray-100 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-800">{projet.titre}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                          projet.status === 'en_cours' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {projet.status === 'en_cours' ? 'En cours' : 'Terminé'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Référence:</span> {projet.id_projet}
                        </div>
                        <div>
                          <span className="font-medium">Période:</span> {formatDate(projet.date_d)} - {formatDate(projet.date_f)}
                        </div>
                        
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {projet.status === 'en_cours' ? '60%' : '100%'}
                      </div>
                      <button 
                        onClick={() => navigate(`/mes-projets/${projet.id_projet}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm transition-colors duration-300"
                      >
                        Voir détails
                      </button>
                    </div>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="mt-3">
                    <div className="text-sm text-gray-600 mb-1">Progression</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${projet.status === 'en_cours' ? '60%' : '100%'}` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {projets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun projet trouvé
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="ml-64 p-8">
        <DashboardContent />
      </div>
    </div>
  );
};