import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, User, Phone, Camera, CheckCircle, Home,Clock, AlertCircle, ArrowLeft, Filter, Users, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const MesProjet = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [client, setClient] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Données statiques pour chef de projet et équipe
  const projectTeams = {
    1: {
      chef: { nom: "Marie Dubois", initiales: "MD", couleur: "bg-red-500" },
      equipe: [
        { nom: "Jean Martin", initiales: "JM", couleur: "bg-emerald-400" },
        { nom: "Pierre Laurent", initiales: "PL", couleur: "bg-sky-400" },
        { nom: "Sophie Bernard", initiales: "SB", couleur: "bg-amber-400" }
      ]
    },
    2: {
      chef: { nom: "Paul Rodriguez", initiales: "PR", couleur: "bg-red-500" },
      equipe: [
        { nom: "Anne Lefevre", initiales: "AL", couleur: "bg-emerald-400" },
        { nom: "Michel Blanc", initiales: "MB", couleur: "bg-sky-400" }
      ]
    },
    3: {
      chef: { nom: "Julie Moreau", initiales: "JM", couleur: "bg-red-500" },
      equipe: [
        { nom: "David Garcia", initiales: "DG", couleur: "bg-emerald-400" },
        { nom: "Laura Simon", initiales: "LS", couleur: "bg-sky-400" },
        { nom: "Thomas Petit", initiales: "TP", couleur: "bg-amber-400" },
        { nom: "Emma Roux", initiales: "ER", couleur: "bg-rose-400" }
      ]
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const clientData = localStorage.getItem('client');
    
    if (!token || !clientData) {
      navigate('/login');
      return;
    }

    try {
      setClient(JSON.parse(clientData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      console.error('Erreur parsing client data:', e);
      navigate('/login');
      return;
    }

    fetchProjects();
  }, [navigate]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await axios.get('http://localhost:8000/api/client/mes-projets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.data.success) {
        setProjects(response.data.projets);
        await fetchTasksForProjects(response.data.projets);
      } else {
        setError('Erreur lors de la récupération des projets');
      }
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('client');
        navigate('/login');
      } else {
        setError('Erreur de connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForProjects = async (projects) => {
    const token = localStorage.getItem('auth_token');
    const tasksData = {};
    
    for (const project of projects) {
      try {
        const response = await axios.get(`http://localhost:8000/api/taches-projet/${project.id_projet}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        tasksData[project.id_projet] = response.data;
      } catch (error) {
        console.error(`Erreur lors de la récupération des tâches pour le projet ${project.id_projet}:`, error);
        tasksData[project.id_projet] = [];
      }
    }
    
    setTasks(tasksData);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('client');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'termine': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'encours': return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'en_attente': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'termine': return <CheckCircle className="w-4 h-4" />;
      case 'encours': return <Clock className="w-4 h-4" />;
      case 'en_attente': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'termine': return 'Terminé';
      case 'encours': return 'En cours';
      case 'en_attente': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const calculateProgress = (status) => {
    switch (status) {
      case 'termine': return 100;
      case 'encours': return 65;
      case 'en_attente': return 10;
      default: return 0;
    }
  };

  const getTeamForProject = (projectId) => {
    // Utiliser un ID cyclique pour assigner les équipes
    const teamIndex = ((projectId - 1) % 3) + 1;
    return projectTeams[teamIndex] || projectTeams[1];
  };

  const filteredProjects = projects.filter(project => {
    if (statusFilter === 'all') return true;
    return project.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-green-50 items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <span className="text-gray-600">Chargement des projets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gree-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-red-100">
        <div className="p-6 border-b border-red-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              AP
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">ArtisanPeinture</h2>
              <p className="text-sm text-red-500">Espace Client</p>
            </div>
          </div>
          {client && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
              <p className="text-sm font-medium text-gray-900">{client.prenom} {client.nom}</p>
              <p className="text-xs text-red-600">{client.email}</p>
            </div>
          )}
        </div>

        <nav className="mt-6">
          <div className="px-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Menu
            </p>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <Home className="w-4 h-4 mr-3" />
                  Tableau de bord
                </button>
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
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-md shadow-md">
                  <Calendar className="w-4 h-4 mr-3" />
                  Mes Projets
                </a>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-3" />
                  Déconnexion
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Projets</h1>
                <p className="text-gray-600">Suivez l'avancement de vos projets de peinture</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-md transition-all ${statusFilter === 'all' 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-red-50 border border-red-200'}`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setStatusFilter('en_attente')}
                  className={`px-4 py-2 rounded-md transition-all ${statusFilter === 'en_attente' 
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-amber-50 border border-amber-200'}`}
                >
                  En attente
                </button>
                <button
                  onClick={() => setStatusFilter('encours')}
                  className={`px-4 py-2 rounded-md transition-all ${statusFilter === 'encours' 
                    ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-sky-50 border border-sky-200'}`}
                >
                  En cours
                </button>
                <button
                  onClick={() => setStatusFilter('termine')}
                  className={`px-4 py-2 rounded-md transition-all ${statusFilter === 'termine' 
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-emerald-50 border border-emerald-200'}`}
                >
                  Terminés
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center border border-red-100">
              <Calendar className="w-16 h-16 text-red-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
              <p className="text-gray-500">Aucun projet ne correspond à votre filtre.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredProjects.map((project) => {
                const team = getTeamForProject(project.id_projet);
                return (
                  <div key={project.id_projet} className="bg-white rounded-lg shadow-lg overflow-hidden border border-red-100 hover:shadow-xl transition-shadow">
                    {/* Project Header */}
                    <div className="p-6 border-b border-red-100">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h2 className="text-xl font-semibold text-gray-900">{project.titre}</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(project.status)}
                                <span>{getStatusText(project.status)}</span>
                              </div>
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">
                            {project.description || 'Projet de peinture'}
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            Type: {project.type_projet || 'Non spécifié'}
                          </p>
                          
                          {/* Progress Bar */}
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-500">Avancement</span>
                              <span className="text-sm font-medium text-gray-900">
                                {calculateProgress(project.status)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  project.status === 'termine' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                                  project.status === 'encours' ? 'bg-gradient-to-r from-sky-400 to-sky-500' :
                                  'bg-gradient-to-r from-amber-400 to-amber-500'
                                }`}
                                style={{ width: `${calculateProgress(project.status)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Team Section */}
                          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                              <Users className="w-4 h-4 mr-2 text-red-500" />
                              Équipe du projet
                            </h4>
                            
                            {/* Chef de projet */}
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 mb-2 flex items-center">
                                <Crown className="w-3 h-3 mr-1 text-red-500" />
                                Chef de projet
                              </p>
                              <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 ${team.chef.couleur} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                  {team.chef.initiales}
                                </div>
                                <span className="text-sm font-medium text-gray-900">{team.chef.nom}</span>
                              </div>
                            </div>

                            {/* Équipe */}
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Équipe assignée</p>
                              <div className="flex flex-wrap gap-2">
                                {team.equipe.map((membre, index) => (
                                  <div key={index} className="flex items-center space-x-2 bg-white px-2 py-1 rounded-md border border-red-100">
                                    <div className={`w-6 h-6 ${membre.couleur} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                      {membre.initiales}
                                    </div>
                                    <span className="text-xs text-gray-700">{membre.nom}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Project Info */}
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 text-red-400" />
                              <div>
                                <p className="text-gray-500">Début</p>
                                <p className="font-medium">{formatDate(project.date_d)}</p>
                              </div>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 text-red-400" />
                              <div>
                                <p className="text-gray-500">Fin prévue</p>
                                <p className="font-medium">{formatDate(project.date_f)}</p>
                              </div>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-red-400" />
                              <div>
                                <p className="text-gray-500">Adresse</p>
                                <p className="font-medium">{project.adresse || 'Non spécifiée'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="ml-6 text-right">
                          <div className="text-2xl font-bold text-red-600 mb-1">
                            €{project.budget ? project.budget.toLocaleString() : '0'}
                          </div>
                          <div className="text-sm text-gray-500 mb-4">Budget total</div>
                          <div className="flex space-x-2">
                            <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-all flex items-center shadow-md">
                              <Camera className="w-4 h-4 mr-2" />
                              Photos
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Project Tasks */}
                    <div className="p-6 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-red-500" />
                        Tâches du projet
                      </h3>
                      {tasks[project.id_projet]?.length > 0 ? (
                        <div className="space-y-3">
                          {tasks[project.id_projet].map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-red-100 hover:shadow-md transition-shadow">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full ${
                                  task.statut === 'terminee' ? 'text-emerald-600 bg-emerald-50 border border-emerald-200' :
                                  task.statut === 'en_cours' ? 'text-sky-600 bg-sky-50 border border-sky-200' :
                                  'text-amber-600 bg-amber-50 border border-amber-200'
                                }`}>
                                  {task.statut === 'terminee' ? <CheckCircle className="w-4 h-4" /> :
                                   task.statut === 'en_cours' ? <Clock className="w-4 h-4" /> :
                                   <AlertCircle className="w-4 h-4" />}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{task.nom_tache}</p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(task.date_debut)} - {formatDate(task.date_fin)}
                                  </p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                task.statut === 'terminee' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                                task.statut === 'en_cours' ? 'text-sky-700 bg-sky-50 border-sky-200' :
                                'text-amber-700 bg-amber-50 border-amber-200'
                              }`}>
                                {task.statut === 'terminee' ? 'Terminée' :
                                 task.statut === 'en_cours' ? 'En cours' :
                                 'À faire'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 bg-white rounded-lg text-center text-gray-500 border border-red-100">
                          <AlertCircle className="w-8 h-8 text-red-200 mx-auto mb-2" />
                          Aucune tâche disponible pour ce projet
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};