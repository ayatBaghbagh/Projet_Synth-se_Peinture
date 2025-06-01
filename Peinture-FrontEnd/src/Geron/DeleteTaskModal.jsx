import React, { useState } from 'react';
import axios from 'axios';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const DeleteTaskModal = ({ show, onClose, task, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');

      // Configuration CSRF
      const csrfToken = await setupCSRF();
      if (!csrfToken) {
        throw new Error('Impossible d\'obtenir le token CSRF');
      }

      // Envoi de la requête de suppression
      const response = await axios.delete(
        `http://localhost:8000/api/taches-projet/${task.id}`,
        {
          withCredentials: true,
          headers: {
            'X-XSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
          }
        }
      );

      console.log('Tâche supprimée avec succès', response.data);

      // Afficher le modal de succès
      setShowSuccessModal(true);

      // Fermer le modal après 2 secondes et déclencher onSuccess
      setTimeout(() => {
        setShowSuccessModal(false);
        onSuccess();
        onClose();
      }, 2000);

    } catch (err) {
      console.error("Erreur suppression tâche", err);
      
      let errorMessage = "Une erreur est survenue lors de la suppression";
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = "La tâche n'existe plus";
        } else if (err.response.status === 403) {
          errorMessage = "Vous n'avez pas les droits pour supprimer cette tâche";
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

  if (!show || !task) return null;

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
          <p className="text-gray-600">La tâche a été supprimée avec succès.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-900 font-medium">Supprimer la tâche</p>
              <p className="text-gray-600 text-sm">Cette action est irréversible</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700">
              <strong>Tâche :</strong> {task.nom_tache}
            </p>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1">
                <strong>Description :</strong> {task.description}
              </p>
            )}
          </div>

          <p className="text-gray-700">
            Voulez-vous vraiment supprimer cette tâche ? Cette action ne peut pas être annulée.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Annuler
          </button>
          <button 
            onClick={handleDelete} 
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTaskModal;