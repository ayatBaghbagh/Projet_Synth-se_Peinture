import React, { useState, useEffect } from 'react';
import { User, Bell, Eye, UserPlus, Edit, Trash2, X, Save, Plus, AlertCircle, RefreshCw, LogOut, Settings } from 'lucide-react';

export const PaintProManager = () => {
  const [painters, setPainters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPainter, setSelectedPainter] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    tele: '',
    disponibilite: true
  });

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPainterForTask, setSelectedPainterForTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    nom_tache: '',
    description: '',
    date_debut: '',
    date_fin: '',
    priorite: 'moyenne'
  });

  // Fonction pour obtenir une salutation selon l'heure
  const getSalutation = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  // Charger les informations de l'utilisateur connecté
  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        // Essayer de récupérer depuis window.currentUser (défini lors de la connexion)
        if (window.currentUser) {
          setCurrentUser(window.currentUser);
          return;
        }

        // Sinon, essayer depuis localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
          return;
        }

        // Si aucune donnée utilisateur n'est trouvée, utiliser des données par défaut
        console.warn('Aucune donnée utilisateur trouvée, utilisation de données par défaut');
        setCurrentUser({
          nom: 'Admin',
          prenom: 'Chef',
          role: 'chef_equipe',
          email: 'chef@example.com'
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        setCurrentUser({
          nom: 'Admin',
          prenom: 'Chef',
          role: 'chef_equipe',
          email: 'chef@example.com'
        });
      }
    };

    loadCurrentUser();
  }, []);

  // Valeurs par défaut pour le formulaire de tâche
  const initialTaskForm = {
    nom_tache: '',
    description: '',
    date_debut: '',
    date_fin: '',
    priorite: 'moyenne'
  };

  const getCsrfToken = async () => {
    const response = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
      credentials: 'include'
    });
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];
  };

  const assignerTache = async () => {
    try {
      setDebugInfo(prev => prev + '\nDébut assignation tâche...');
      
      // Validation côté client
      if (!taskForm.nom_tache.trim()) {
        setError('Le nom de la tâche est requis');
        return;
      }
      
      if (!selectedPainterForTask?.num_peintre) {
        setError('Aucun peintre sélectionné');
        return;
      }
  
      // 1. Récupérer le token CSRF comme pour la suppression
      const csrfSuccess = await fetchCSRFToken();
      if (!csrfSuccess) {
        setError('Failed to fetch CSRF token');
        return;
      }
  
      const csrfToken = getCookie('XSRF-TOKEN');
      setDebugInfo(prev => prev + `\nCSRF Token: ${csrfToken ? 'Found' : 'Not found'}`);
  
      // 2. Préparer les données selon l'API Laravel
      const taskData = {
        titre: taskForm.nom_tache.trim(),
        description: taskForm.description.trim(),
        date_debut: taskForm.date_debut || new Date().toISOString().split('T')[0],
        date_fin: taskForm.date_fin || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        statut: 'à faire',
        peintre_id: selectedPainterForTask.num_peintre
      };
  
      setDebugInfo(prev => prev + `\nDonnées à envoyer: ${JSON.stringify(taskData)}`);
  
      // 3. Envoyer la requête avec la même structure que deletePainter
      const response = await fetch('http://localhost:8000/api/tache', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken && { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) })
        },
        body: JSON.stringify(taskData)
      });
  
      setDebugInfo(prev => prev + `\nRéponse status: ${response.status}`);
  
      if (!response.ok) {
        const errorData = await response.json();
        setDebugInfo(prev => prev + `\nErreur réponse: ${JSON.stringify(errorData)}`);
        
        if (response.status === 422) {
          const validationErrors = errorData.errors || {};
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          throw new Error(`Erreurs de validation: ${errorMessages}`);
        } else {
          throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
        }
      }
  
      const data = await response.json();
      setDebugInfo(prev => prev + `\nTâche créée avec succès: ${JSON.stringify(data)}`);
      
      // Mettre à jour l'état local
      setPainters(prev => prev.map(p => 
        p.num_peintre === selectedPainterForTask.num_peintre 
          ? { 
              ...p, 
              disponibilite: false, 
              taches: [...(p.taches || []), data.data || data] 
            } 
          : p
      ));
  
      // Réinitialiser et fermer le modal
      setShowAssignModal(false);
      setSelectedPainterForTask(null);
      setTaskForm(initialTaskForm);
      setError(null);
  
    } catch (error) {
      console.error('Erreur assignation:', error);
      setError(`Erreur assignation: ${error.message}`);
      setDebugInfo(prev => prev + `\nErreur: ${error.message}`);
    }
  };

  // Mock data for testing when API is down
  const mockPainters = [
    {
      num_peintre: 1,
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      tele: '0123456789',
      disponibilite: true,
      taches: [],
      groupes: []
    },
    {
      num_peintre: 2,
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@example.com',
      tele: '0987654321',
      disponibilite: false,
      taches: [{id: 1}, {id: 2}],
      groupes: [{id: 1}]
    }
  ];

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const fetchCSRFToken = async () => {
    try {
      const response = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`CSRF fetch failed: ${response.status}`);
      }
      
      setDebugInfo(prev => prev + '\nCSRF token fetched successfully');
      return true;
    } catch (error) {
      setDebugInfo(prev => prev + `\nCSRF fetch error: ${error.message}`);
      return false;
    }
  };

  // Enhanced fetch function with better error handling
  const fetchPainters = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('Starting fetch painters...');
      
      const response = await fetch('http://localhost:8000/api/peintre', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      setDebugInfo(prev => prev + `\nAPI Response Status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      setDebugInfo(prev => prev + `\nReceived data: ${JSON.stringify(data).substring(0, 100)}...`);
      
      if (data && data.success) {
        setPainters(data.data || []);
      } else if (Array.isArray(data)) {
        setPainters(data);
      } else {
        setPainters(data.painters || []);
      }
      
    } catch (err) {
      console.error('Erreur lors du chargement des peintres:', err);
      setError(`API Error: ${err.message}. Using mock data for demonstration.`);
      setPainters(mockPainters);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced add function with validation
  const addPainter = async (data) => {
    try {
      setDebugInfo(prev => prev + `\nAttempting to add painter: ${JSON.stringify(data)}`);
      
      // Client-side validation
      const validation = validatePainterData(data);
      if (!validation.isValid) {
        setError(`Validation Error: ${validation.errors.join(', ')}`);
        return false;
      }
      
      await fetchCSRFToken();
      
      const csrfToken = getCookie('XSRF-TOKEN');
      setDebugInfo(prev => prev + `\nCSRF Token: ${csrfToken ? 'Found' : 'Not found'}`);
      
      const response = await fetch('http://localhost:8000/api/peintre', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken && { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) })
        },
        body: JSON.stringify(data)
      });
      
      setDebugInfo(prev => prev + `\nAdd Response Status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        setDebugInfo(prev => prev + `\nAdd Error Response: ${JSON.stringify(errorData)}`);
        
        if (response.status === 422) {
          const validationErrors = errorData.errors || {};
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('; ');
          setError(`Validation Error: ${errorMessages}`);
        } else {
          setError(`HTTP ${response.status}: ${errorData.message || 'Unknown error'}`);
        }
        return false;
      }
      
      // Success - add to local state for demo
      const newPainter = {
        num_peintre: Date.now(),
        ...data,
        taches: [],
        groupes: []
      };
      setPainters(prev => [...prev, newPainter]);
      
      setShowAddModal(false);
      resetForm();
      setError(null);
      return true;
      
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err);
      setDebugInfo(prev => prev + `\nAdd Exception: ${err.message}`);
      setError(`Network Error: ${err.message}`);
      return false;
    }
  };

  // Validation function
  const validatePainterData = (data) => {
    const errors = [];
    
    if (!data.nom || data.nom.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }
    
    if (!data.prenom || data.prenom.trim().length < 2) {
      errors.push('Le prénom doit contenir au moins 2 caractères');
    }
    
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email invalide');
    }
    
    if (!data.tele || !/^[0-9+\-\s()]{8,}$/.test(data.tele)) {
      errors.push('Numéro de téléphone invalide (minimum 8 chiffres)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Enhanced update function
  const updatePainter = async (id, data) => {
    try {
      setDebugInfo(prev => prev + `\nUpdating painter ${id}: ${JSON.stringify(data)}`);
      
      const validation = validatePainterData(data);
      if (!validation.isValid) {
        setError(`Validation Error: ${validation.errors.join(', ')}`);
        return false;
      }
      
      await fetchCSRFToken();
      
      const csrfToken = getCookie('XSRF-TOKEN');
      
      const response = await fetch(`http://localhost:8000/api/peintre/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken && { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) })
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(`Update Error: ${errorData.message || 'Unknown error'}`);
        return false;
      }
      
      // Update local state
      setPainters(prev => prev.map(p => 
        p.num_peintre === id ? { ...p, ...data } : p
      ));
      
      setShowEditModal(false);
      setSelectedPainter(null);
      resetForm();
      setError(null);
      return true;
      
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      setError(`Network Error: ${err.message}`);
      return false;
    }
  };

  // FIXED delete function with proper CSRF handling
  const deletePainter = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce peintre ?')) {
      return;
    }
  
    try {
      setDebugInfo(prev => prev + `\nAttempting to delete painter ID: ${id}`);
      
      // Fetch CSRF token before DELETE request
      const csrfSuccess = await fetchCSRFToken();
      if (!csrfSuccess) {
        setError('Failed to fetch CSRF token');
        return;
      }

      const csrfToken = getCookie('XSRF-TOKEN');
      setDebugInfo(prev => prev + `\nDelete CSRF Token: ${csrfToken ? 'Found' : 'Not found'}`);
      
      const response = await fetch(`http://localhost:8000/api/peintre/${id}`, {
        method: 'DELETE',
        credentials: 'include', // Important for CSRF
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken && { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) })
        }
      });
      
      setDebugInfo(prev => prev + `\nDelete Response Status: ${response.status}`);
      
      if (response.ok) {
        setPainters(prev => prev.filter(p => p.num_peintre !== id));
        setError(null);
        setDebugInfo(prev => prev + `\nDelete successful for ID: ${id}`);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || `HTTP ${response.status}`;
        setError(`Delete Error: ${errorMessage}`);
        setDebugInfo(prev => prev + `\nDelete failed: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(`Network Error: ${err.message}`);
      setDebugInfo(prev => prev + `\nDelete exception: ${err.message}`);
    }
  };

  // Load painters on component mount
  useEffect(() => {
    fetchPainters();
  }, []);

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      tele: '',
      disponibilite: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (showEditModal && selectedPainter) {
      await updatePainter(selectedPainter.num_peintre, formData);
    } else {
      await addPainter(formData);
    }
  };

  const openEditModal = (painter) => {
    setSelectedPainter(painter);
    setFormData({
      nom: painter.nom || '',
      prenom: painter.prenom || '',
      email: painter.email || '',
      tele: painter.tele || '',
      disponibilite: painter.disponibilite !== undefined ? painter.disponibilite : true
    });
    setShowEditModal(true);
    setError(null);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedPainter(null);
    resetForm();
    setError(null);
  };

  const getInitials = (nom, prenom) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const getStatusBadge = (disponibilite) => {
    if (disponibilite) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Disponible</span>;
    } else {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Occupé</span>;
    }
  };

  const getProjectsBadge = (taches) => {
    const count = taches ? taches.length : 0;
    if (count === 0) {
      return (
        <div className="text-gray-400 text-sm text-center">
          <div>0</div>
          <div className="text-xs">tâche(s)</div>
        </div>
      );
    } else {
      return (
        <div className="text-orange-600 text-sm text-center">
          <div>{count}</div>
          <div className="text-xs">tâche(s)</div>
        </div>
      );
    }
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      localStorage.removeItem('currentUser');
      window.currentUser = null;
      // Rediriger vers la page de connexion ou d'accueil
      window.location.href = '/login';
    }
  };

  const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" >
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des peintres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-gray-50 flex flex-col" style={{width: '107rem', margin: 0, padding: 0}}>
      {/* Header avec salutation personnalisée */}
      <div className="bg-gray shadow-sm border-b">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Salutation personnalisée */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {currentUser ? getInitials(currentUser.nom, currentUser.prenom) : 'AD'}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {getSalutation()}, {currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Chef d\'équipe'} ! 
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Bienvenue dans votre espace de gestion des peintres
                </p>
              </div>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-2">
              
              

              
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 py-6 overflow-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <button 
              onClick={fetchPainters}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center space-x-2 w-full sm:w-auto"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            <button 
              onClick={() => {
                resetForm();
                setShowAddModal(true);
                setError(null);
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter Peintre</span>
            </button>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Peintres</p>
                <p className="text-2xl font-bold text-gray-800">{painters.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">
                  {painters.filter(p => p.disponibilite).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupés</p>
                <p className="text-2xl font-bold text-red-600">
                  {painters.filter(p => !p.disponibilite).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">⚠</span>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Debug Info:</span>
              <button 
                onClick={() => setDebugInfo('')}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            </div>
            <pre className="mt-2 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              {error}
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Painters List Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 sm:px-6 py-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🎨</span>
              <div>
                <h2 className="text-lg font-semibold">Liste des Peintres</h2>
                <p className="text-sm text-orange-100">Gérez votre équipe de peintres ({painters.length} peintres)</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 sm:px-6 text-sm font-medium text-gray-600">Peintre</th>
                  <th className="text-left py-3 px-4 sm:px-6 text-sm font-medium text-gray-600 hidden sm:table-cell">Contact</th>
                  <th className="text-left py-3 px-4 sm:px-6 text-sm font-medium text-gray-600">Statut</th>
                  <th className="text-center py-3 px-4 sm:px-6 text-sm font-medium text-gray-600 hidden md:table-cell">Tâches</th>
                  <th className="text-center py-3 px-4 sm:px-6 text-sm font-medium text-gray-600 hidden lg:table-cell">Groupes</th>
                  <th className="text-left py-3 px-4 sm:px-6 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {painters.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 px-4 sm:px-6 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                        <span>Aucun peintre trouvé. Ajoutez votre premier peintre !</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  painters.map((painter) => (
                    <tr key={painter.num_peintre || painter.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {getInitials(painter.nom, painter.prenom)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">
                              {painter.prenom} {painter.nom}
                            </div>
                            <div className="text-sm text-gray-500 sm:hidden truncate">
                              {painter.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 hidden sm:table-cell">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center space-x-1 mb-1">
                            <span>✉️</span>
                            <span className="truncate">{painter.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>📱</span>
                            <span>{painter.tele}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        {getStatusBadge(painter.disponibilite)}
                      </td>
                      <td className="py-4 px-4 sm:px-6 hidden md:table-cell">
                        {getProjectsBadge(painter.taches)}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-center hidden lg:table-cell">
                        <span className="text-sm text-gray-600">
                          {painter.groupes ? painter.groupes.length : 0}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <button 
                            onClick={() => openEditModal(painter)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Modifier</span>
                          </button>
                          <button 
                            onClick={() => deletePainter(painter.num_peintre || painter.id)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Supprimer</span>
                          </button>
                        
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal 
        show={showAssignModal} 
        onClose={() => {
          setShowAssignModal(false);
          setSelectedPainterForTask(null);
        }}
        title={`Assigner une tâche à ${selectedPainterForTask?.prenom} ${selectedPainterForTask?.nom}`}
>
  <form onSubmit={(e) => {
    e.preventDefault();
    assignerTache();
  }}>
    <div className="space-y-4">

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la tâche *</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={taskForm.nom_tache}
          onChange={(e) => setTaskForm({...taskForm, nom_tache: e.target.value})}
          placeholder="Préparation des murs"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={taskForm.description}
          onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
          placeholder="Détails de la tâche à effectuer..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Priorité *</label>
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={taskForm.priorite}
          onChange={(e) => setTaskForm({...taskForm, priorite: e.target.value})}
          required
        >
          <option value="faible">Faible</option>
          <option value="moyenne">Moyenne</option>
          <option value="haute">Haute</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={taskForm.date_debut}
            onChange={(e) => setTaskForm({...taskForm, date_debut: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={taskForm.date_fin}
            onChange={(e) => setTaskForm({...taskForm, date_fin: e.target.value})}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setShowAssignModal(false);
            setSelectedPainterForTask(null);
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Assigner la tâche
        </button>
      </div>
    </div>
  </form>
</Modal>

      <Modal 
        show={showAddModal || showEditModal} 
        onClose={closeModal}
        title={showEditModal ? "Modifier le peintre" : "Ajouter un peintre"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom complet */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Saisissez le nom"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Saisissez le prénom"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="exemple@email.com"
              />
            </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="tele"
          value={formData.tele}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          placeholder="06 12 34 56 78"
        />
      </div>
    </div>

    {/* Disponibilité */}
    <div className="flex items-center">
      <input
        type="checkbox"
        name="disponibilite"
        checked={formData.disponibilite}
        onChange={handleInputChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label className="ml-2 block text-sm text-gray-700">
        Disponible
      </label>
    </div>

    {/* Boutons */}
    <div className="flex space-x-4 pt-4">
      <button
        type="button"
        onClick={closeModal}
        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium"
      >
        Annuler
      </button>
      <button
        type="submit"
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
      >
        {showEditModal ? 'Modifier' : 'Ajouter'}
      </button>
    </div>
  </form>
</Modal>
    </div>
  );
};
