import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Edit, 
  Users, 
  Check, 
  Phone, 
  MapPin, 
  LogOut, 
  Plus, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  Loader, 
  MessageSquare 
} from 'lucide-react';
export const AdminDashboard = () => {
    const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashbordadmin');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuration de l'API
  const API_BASE_URL = 'http://localhost:8000/api';

  // Fonction pour récupérer les données du dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        setError(null);
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des données');
      }
    } catch (err) {
      console.error('Erreur API:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fonction pour rafraîchir les données
  const refreshData = () => {
    fetchDashboardData();
  };

  // Construction des stats à partir des données backend
  const getStatsFromBackend = () => {
    if (!dashboardData?.stats) return [];

    return [
      {
        title: "Demandes de devis",
        value: dashboardData.stats.total_demandes.toString(),
        subtitle: `Total des demandes`,
        color: "bg-gradient-to-br from-blue-50 to-blue-100",
        textColor: "text-blue-600",
        icon: Edit,
        iconBg: "bg-blue-500"
      },
      {
        title: "Utilisateurs",
        value: dashboardData.stats.total_clients.toString(),
        subtitle: "Clients enregistrés",
        color: "bg-gradient-to-br from-green-50 to-green-100",
        textColor: "text-green-600",
        icon: Users,
        iconBg: "bg-green-500"
      },
      {
        title: "Contacts",
        value: dashboardData.stats.nouveaux_contacts.toString(),
        subtitle: "Nouveaux contacts",
        color: "bg-gradient-to-br from-red-50 to-red-100",
        textColor: "text-red-600",
        icon: Phone,
        iconBg: "bg-red-500"
      },
      {
        title: "Commentaires",
        value: "12", // Remplacez par la vraie valeur depuis le backend
        subtitle: "Nouveaux commentaires",
        color: "bg-gradient-to-br from-purple-50 to-purple-100",
        textColor: "text-purple-600",
        icon: MessageSquare,
        iconBg: "bg-purple-500"
      }
    ];
  };

  // Fonction pour formater les activités récentes
  // Fonction pour formater les activités récentes
// Fonction pour formater les activités récentes
const formatRecentActivities = () => {
  if (!dashboardData?.recent_activities) return [];

  return dashboardData.recent_activities.map((activity) => {
    // Déterminer le type d'activité et les propriétés associées
    let activityType, icon, status, statusColor;
    
    if (activity.type.toLowerCase().includes('demande')) {
      activityType = 'demande';
      icon = <Edit className="w-5 h-5 text-purple-600" />;
      status = 'En attente';
      statusColor = 'bg-yellow-100 text-yellow-700';
    } 
    else if (activity.type.toLowerCase().includes('utilisateur')) {
      activityType = 'user';
      icon = <Users className="w-5 h-5 text-purple-600" />;
      status = 'Actif';
      statusColor = 'bg-green-100 text-green-700';
    }
    else if (activity.type.toLowerCase().includes('contact')) {
      activityType = 'contact';
      icon = <Phone className="w-5 h-5 text-purple-600" />; // Icône téléphone pour les contacts
      status = 'Non traité';
      statusColor = 'bg-blue-100 text-blue-700';
    }
    else if (activity.type.toLowerCase().includes('commentaire')) {
      activityType = 'comment';
      icon = <MessageSquare className="w-5 h-5 text-purple-600" />; // Icône message pour les commentaires
      status = 'Non lu';
      statusColor = 'bg-purple-100 text-purple-700';
    }
    else {
      activityType = 'project';
      icon = <Check className="w-5 h-5 text-purple-600" />;
      status = 'En cours';
      statusColor = 'bg-blue-100 text-blue-700';
    }

    return {
      type: activityType,
      icon: icon,
      title: activity.type,
      client: activity.client,
      time: activity.date,
      status: status,
      statusColor: statusColor
    };
  });
};


  // Fonction pour les actions rapides
  const handleQuickAction = async (action) => {
    console.log(`Action rapide: ${action}`);
    switch(action) {
      case 'nouveau-utilisateur':
        navigate('/utilisateurs');
        break;
      case 'nouvelle-demande':
        navigate('/listedemande');
        break;
      case 'nouveau-contact':
        navigate('/contactger');
        break;
      case 'nouveau-commentaire':
        navigate('/commentaireger');
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-gray-600">Chargement du dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de connexion</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refreshData}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const stats = getStatsFromBackend();
  const recentActivities = formatRecentActivities();

  return (
    
    <div className="flex h-screen bg-gray-50  w-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col flex-shrink-0">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Espace Gérant</h1>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 flex-grow p-4">
          <button
            onClick={() => { setActivePage('dashbordadmin'); navigate('/dashbordadmin'); }}
            className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg transition-colors ${
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
            className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg transition-colors ${
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
            className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg transition-colors ${
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
            className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg transition-colors ${
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
            className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg transition-colors ${
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
            className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg transition-colors ${
              activePage === 'commentaireger'
                ? 'text-purple-600 bg-purple-50 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MessageSquare size={20} />
            <span>Commentaires</span>
          </button>

          <button
            onClick={() => { setActivePage('equipe'); navigate('/equipe'); }}
            className={`flex items-center w-full text-left space-x-3 px-3 py-3 rounded-lg transition-colors ${
              activePage === 'equipe'
                ? 'text-purple-600 bg-purple-50 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users size={20} />
            <span>Équipes</span>
          </button>

          <button
            onClick={() => {
              navigate('/');
            }}
            className="flex items-center space-x-3 px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg w-full text-left transition-colors"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Admin Gérant</p>
              <p className="text-xs text-gray-500">Administrateur</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 100% width */}
      <div className="flex-1 overflow-auto w-full">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 w-full">
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
              <p className="text-gray-600 text-sm mt-1">Vue d'ensemble de votre espace gérant</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>Actualiser</span>
              </button>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content - 100% width */}
        <div className="p-6 w-full">
          {/* Stats Grid - 100% width */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
            {stats.map((stat, index) => (
              <div key={index} className={`${stat.color} rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.iconBg} p-3 rounded-xl shadow-sm`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${stat.textColor} mb-2`}>{stat.value}</h3>
                  <p className="text-gray-700 font-semibold text-base mb-1">{stat.title}</p>
                  <p className="text-sm text-gray-600">{stat.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activities and Quick Actions - 100% width */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* Recent Activities - 100% width */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Activités récentes</h2>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-semibold hover:underline">
                  Voir tout
                </button>
              </div>
              <div className="space-y-4">
  {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200">
      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
        {activity.icon} {/* Utilisation de l'icône définie */}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-base">{activity.title}</h4>
        <p className="text-sm text-gray-600">Client: {activity.client}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${activity.statusColor}`}>
        {activity.status}
      </span>
    </div>
  )) : (
    <div className="text-center py-12 text-gray-500">
      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p className="text-base font-medium">Aucune activité récente</p>
    </div>
  )}
</div>
            </div>

            {/* Quick Actions - Simplified */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Actions rapides</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => handleQuickAction('nouveau-utilisateur')}
                  className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors flex-shrink-0 shadow-sm">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900 text-base">Nouvel utilisateur</span>
                </button>
                
                <button 
                  onClick={() => handleQuickAction('nouvelle-demande')}
                  className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors flex-shrink-0 shadow-sm">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900 text-base">Nouvelle demande devis</span>
                </button>
                
                <button 
                  onClick={() => handleQuickAction('nouveau-contact')}
                  className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center group-hover:bg-red-600 transition-colors flex-shrink-0 shadow-sm">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900 text-base">Nouveau contact</span>
                </button>
                
                <button 
                  onClick={() => handleQuickAction('nouveau-commentaire')}
                  className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors flex-shrink-0 shadow-sm">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900 text-base">Nouveau commentaire</span>
                </button>
              </div>

              {/* Alert Section */}
              {dashboardData?.stats?.demandes_en_attente > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-800 text-base">Attention</h4>
                      <p className="text-sm text-red-700 mt-1">
                        {dashboardData.stats.demandes_en_attente} demande(s) en attente nécessitent votre attention
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};