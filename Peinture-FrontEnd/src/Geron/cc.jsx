import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, User, Phone, Camera, CheckCircle, Clock, AlertCircle, ArrowLeft, Filter } from 'lucide-react';
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
        // Fetch tasks for each project
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
      case 'termine': return 'text-green-600 bg-green-50';
      case 'encours': return 'text-blue-600 bg-blue-50';
      case 'en_attente': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
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

  const filteredProjects = projects.filter(project => {
    if (statusFilter === 'all') return true;
    return project.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">Chargement des projets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              AP
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">ArtisanPeinture</h2>
              <p className="text-sm text-gray-500">Espace Client</p>
            </div>
          </div>
          {client && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{client.prenom} {client.nom}</p>
              <p className="text-xs text-gray-500">{client.email}</p>
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
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <User className="w-4 h-4 mr-3" />
                  Mon Profil
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/mes-devis')}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <AlertCircle className="w-4 h-4 mr-3" />
                  Mes Devis
                </button>
              </li>
              <li>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-md">
                  <Calendar className="w-4 h-4 mr-3" />
                  Mes Projets
                </a>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
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
        <div className="max-w-6xl mx-auto">
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
                  className={`px-4 py-2 rounded-md ${statusFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setStatusFilter('en_attente')}
                  className={`px-4 py-2 rounded-md ${statusFilter === 'en_attente' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  En attente
                </button>
                <button
                  onClick={() => setStatusFilter('encours')}
                  className={`px-4 py-2 rounded-md ${statusFilter === 'encours' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  En cours
                </button>
                <button
                  onClick={() => setStatusFilter('termine')}
                  className={`px-4 py-2 rounded-md ${statusFilter === 'termine' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
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
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
              <p className="text-gray-500">Aucun projet ne correspond à votre filtre.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredProjects.map((project) => (
                <div key={project.id_projet} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Project Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h2 className="text-xl font-semibold text-gray-900">{project.titre}</h2>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getStatusText(project.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">
                          {project.description || 'Projet de peinture'}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Type: {project.type_projet || 'Non spécifié'}
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Avancement</span>
                            <span className="text-sm font-medium text-gray-900">
                              {calculateProgress(project.status)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                project.status === 'termine' ? 'bg-green-500' :
                                project.status === 'encours' ? 'bg-blue-500' :
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${calculateProgress(project.status)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Project Info */}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <div>
                              <p className="text-gray-500">Début</p>
                              <p className="font-medium">{formatDate(project.date_d)}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <div>
                              <p className="text-gray-500">Fin prévue</p>
                              <p className="font-medium">{formatDate(project.date_f)}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <div>
                              <p className="text-gray-500">Adresse</p>
                              <p className="font-medium">{project.adresse || 'Non spécifiée'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          €{project.budget ? project.budget.toLocaleString() : '0'}
                        </div>
                        <div className="text-sm text-gray-500 mb-4">Budget total</div>
                        <div className="flex space-x-2">
                          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center">
                            <Camera className="w-4 h-4 mr-2" />
                            Photos
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Tasks */}
                  <div className="p-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tâches du projet</h3>
                    {tasks[project.id_projet]?.length > 0 ? (
                      <div className="space-y-3">
                        {tasks[project.id_projet].map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`p-1 rounded-full ${
                                task.statut === 'terminee' ? 'text-green-600 bg-green-50' :
                                task.statut === 'en_cours' ? 'text-blue-600 bg-blue-50' :
                                'text-yellow-600 bg-yellow-50'
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
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.statut === 'terminee' ? 'text-green-600 bg-green-50' :
                              task.statut === 'en_cours' ? 'text-blue-600 bg-blue-50' :
                              'text-yellow-600 bg-yellow-50'
                            }`}>
                              {task.statut === 'terminee' ? 'Terminée' :
                               task.statut === 'en_cours' ? 'En cours' :
                               'À faire'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                        Aucune tâche disponible pour ce projet
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