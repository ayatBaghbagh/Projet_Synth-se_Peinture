import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, User, Users, Calendar, FileText, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';


const EditTaskModal = ({ show, onClose, task, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom_tache: '',
    description: '',
    date_debut: '',
    date_fin: '',
    statut: 'a_faire',
    notes: '',
    type_projet: '',
    assignee_id: '',
    projet_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Données statiques pour les assignés
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

  // Initialiser le formulaire avec les données de la tâche
  useEffect(() => {
    if (task && show) {
      setFormData({
        nom_tache: task.nom_tache || '',
        description: task.description || '',
        date_debut: task.date_debut || '',
        date_fin: task.date_fin || '',
        statut: task.statut || 'a_faire',
        notes: task.notes || '',
        type_projet: task.type_projet || '',
        assignee_id: task.assignee_id || '',
        projet_id: task.projet_id || ''
      });
      setError('');
    }
  }, [task, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour obtenir le token CSRF
  const setupCSRF = async () => {
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const getCSRFToken = () => {
        const tokenCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('XSRF-TOKEN='));
        return tokenCookie ? decodeURIComponent(tokenCookie.split('=')[1]) : '';
      };

      return getCSRFToken();
    } catch (error) {
      console.error('Erreur lors de la configuration CSRF:', error);
      return null;
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError('');

      // Validation des champs obligatoires
      const requiredFields = {
        'nom_tache': 'Le nom de la tâche est requis',
        'date_debut': 'La date de début est requise',
        'date_fin': 'La date de fin est requise',
        'type_projet': 'Le type de projet est requis'
      };

      for (const [field, message] of Object.entries(requiredFields)) {
        if (!formData[field]?.toString().trim()) {
          throw new Error(message);
        }
      }

      // Validation des dates
      const startDate = new Date(formData.date_debut);
      const endDate = new Date(formData.date_fin);
      
      if (endDate < startDate) {
        throw new Error('La date de fin doit être postérieure à la date de début');
      }

      // Configuration CSRF
      const csrfToken = await setupCSRF();
      if (!csrfToken) {
        throw new Error('Impossible d\'obtenir le token CSRF');
      }

      // Préparation des données
      const dataToSend = {
        nom_tache: formData.nom_tache.trim(),
        description: formData.description?.trim() || null,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        statut: formData.statut || 'a_faire',
        notes: formData.notes?.trim() || null,
        type_projet: formData.type_projet,
        assignee_id: formData.assignee_id || null,
        projet_id: formData.projet_id
      };

      // Envoi de la requête
      const response = await axios.put(
        `http://localhost:8000/api/taches-projet/${task.id}`,
        dataToSend,
        {
          withCredentials: true,
          headers: {
            'X-XSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('Tâche mise à jour avec succès', response.data);

      // Afficher le modal de succès
      setShowSuccessModal(true);

      // Fermer le modal après 2 secondes et déclencher onSuccess
      setTimeout(() => {
        setShowSuccessModal(false);
        onSuccess();
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      
      let errorMessage = "Une erreur est survenue";
      
      if (err.response) {
        if (err.response.status === 422) {
          const errors = err.response.data.errors;
          errorMessage = Object.values(errors).flat().join('\n');
        } else {
          errorMessage = `Erreur serveur: ${err.response.status}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableAssignees = () => {
    return formData.type_projet === 'grand' ? staticChefs : staticPeintres;
  };

  if (!show) return null;

  // Modal de succès
  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Succès!</h3>
          <p className="text-gray-600">La tâche a été modifiée avec succès.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Modifier la tâche</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 whitespace-pre-line">{error}</div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom de la tâche *</label>
            <input 
              type="text" 
              name="nom_tache"
              value={formData.nom_tache}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              placeholder="Nom de la tâche"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              rows="3"
              placeholder="Description de la tâche..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type de projet *</label>
            <select 
              name="type_projet"
              value={formData.type_projet}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner un type</option>
              <option value="grand">Grand Projet</option>
              <option value="petit">Petit Projet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Assigné à ({formData.type_projet === 'grand' ? 'Chef d\'équipe' : 'Peintre'})
            </label>
            <select 
              name="assignee_id"
              value={formData.assignee_id}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Sélectionner une personne</option>
              {getAvailableAssignees().map(person => (
                <option key={person.id} value={person.id}>{person.nom}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de début *</label>
              <input 
                type="date" 
                name="date_debut"
                value={formData.date_debut}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de fin *</label>
              <input 
                type="date" 
                name="date_fin"
                value={formData.date_fin}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select 
              name="statut"
              value={formData.statut}
              onChange={handleChange}
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
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              rows="3"
              placeholder="Notes supplémentaires..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              onClick={handleUpdate}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Mettre à jour
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;