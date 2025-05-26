import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const DemandeDevisPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    type_projet: '',
    surface: '',
    urgence_projet: 'normal',
    couleur_peinture: '',
    finition: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Fonction pour extraire le token CSRF du cookie
  const getCSRFToken = () => {
    const tokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='));
        
    if (tokenCookie) {
      // Décoder le token (Laravel encode en URL le token dans le cookie)
      return decodeURIComponent(tokenCookie.split('=')[1]);
    }
    return '';
  };

  // Configuration initiale
  useEffect(() => {
    const initForm = async () => {
      try {
        // Récupérer le cookie CSRF
        await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
          withCredentials: true
        });
        console.log('CSRF cookie obtenu');
        
        // Configurer axios avec le token CSRF
        const token = getCSRFToken();
        setCsrfToken(token);
        
        if (token) {
          // Ajouter le token à toutes les requêtes
          axios.defaults.headers.common['X-XSRF-TOKEN'] = token;
        }
        
        console.log('Token CSRF configuré:', token ? 'Présent' : 'Absent');
      } catch (error) {
        console.error('Erreur initialisation CSRF:', error);
        setSubmitError('Erreur de connexion au serveur');
      }
    };
    
    initForm();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Réactualiser le token CSRF avant la requête POST
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true
      });
      
      // Récupérer le token CSRF actualisé
      const currentToken = getCSRFToken();
      
      // Requête POST avec le token CSRF explicite dans l'en-tête
      const response = await axios.post(
        'http://localhost:8000/api/demande-devis', 
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': currentToken,
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );

      // Traitement du succès
      setShowSuccessModal(true);
      
      // Réinitialiser le formulaire
      setFormData({
        type_projet: '',
        surface: '',
        urgence_projet: 'normal',
        couleur_peinture: '',
        finition: '',
        description: ''
      });

      // Redirection automatique après 3 secondes
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Erreur:', error);
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fonction de gestion des erreurs API
  const handleApiError = (error) => {
    if (error.response) {
      const status = error.response.status;
      
      if (status === 419) {
        setSubmitError('Erreur CSRF (419): Session expirée. Tentative de rafraîchissement...');
        
        // Ajouter un délai pour informer l'utilisateur si l'erreur persiste
        setTimeout(() => {
          setSubmitError('Erreur CSRF persistante. Veuillez recharger la page.');
        }, 3000);
      } else if (status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors)
            .flat()
            .join(', ');
          setSubmitError(`Validation échouée: ${errorMessages}`);
        } else {
          setSubmitError('Données invalides. Veuillez vérifier vos entrées.');
        }
      } else {
        setSubmitError(`Erreur serveur (${status}): ${error.response.data.message || 'Veuillez réessayer.'}`);
      }
    } else if (error.request) {
      setSubmitError('Aucune réponse du serveur. Vérifiez que votre API est en cours d\'exécution.');
    } else {
      setSubmitError(`Erreur: ${error.message}`);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };
  
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      {/* Modal de succès */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white rounded-lg p-8 z-10 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center">Demande envoyée avec succès !</h3>
            <p className="text-gray-600 text-center mt-2">
              Votre demande de devis a été envoyée avec succès. Nous vous contacterons prochainement.
            </p>
            <div className="mt-6 flex justify-center">
              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/');
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-[80%] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-800 flex items-center no-underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="mr-1">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            Retour à l'accueil
          </button>
          <h2 className="text-2xl font-semibold">Demande de Devis</h2>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-medium mb-3">Formulaire de demande</h3>
              <p className="text-gray-600 mb-6">Remplissez ce formulaire pour recevoir un devis personnalisé pour votre projet de peinture.</p>
              
              {submitError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {submitError}
                </div>
              )}
              
              {/* Afficher le statut du token CSRF (pour le débogage) */}
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
                <strong>État CSRF:</strong> {csrfToken ? 'Token CSRF présent' : 'Token CSRF non disponible'}
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-4">Détails du projet</h4>
                  
                  <div className="mb-4">
                    <label htmlFor="type_projet" className="block text-gray-700 mb-2">Type de projet</label>
                    <select 
                      id="type_projet" 
                      name="type_projet" 
                      value={formData.type_projet}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="" disabled>Sélectionnez un type de projet</option>
                      <option value="interieur">Peinture intérieure</option>
                      <option value="exterieur">Peinture extérieure</option>
                      <option value="commercial">Projet commercial</option>
                      <option value="residentiel">Projet résidentiel</option>
                      <option value="decoratif">Peinture décorative</option>
                      <option value="personnalise">Projet personnalisé</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="surface" className="block text-gray-700 mb-2">Surface approximative (m²)</label>
                    <input 
                      type="number" 
                      id="surface" 
                      name="surface" 
                      value={formData.surface}
                      onChange={handleChange}
                      placeholder="Surface en m²" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Urgence du projet</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="urgent" 
                          name="urgence_projet" 
                          value="urgent"
                          checked={formData.urgence_projet === "urgent"}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <label htmlFor="urgent">Urgent (moins d'un mois)</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="normal" 
                          name="urgence_projet" 
                          value="normal"
                          checked={formData.urgence_projet === "normal"}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <label htmlFor="normal">Normal (1-3 mois)</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="flexible" 
                          name="urgence_projet" 
                          value="flexible"
                          checked={formData.urgence_projet === "flexible"}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <label htmlFor="flexible">Flexible (plus de 3 mois)</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="couleur_peinture" className="block text-gray-700 mb-2">Couleurs souhaitées (optionnel)</label>
                    <input 
                      type="text" 
                      id="couleur_peinture" 
                      name="couleur_peinture"
                      value={formData.couleur_peinture}
                      onChange={handleChange}
                      placeholder="Ex: Blanc cassé, Bleu ciel..." 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="finition" className="block text-gray-700 mb-2">Type de finition (optionnel)</label>
                    <select 
                      id="finition" 
                      name="finition"
                      value={formData.finition}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="" disabled>Sélectionnez une finition</option>
                      <option value="mat">Mat</option>
                      <option value="satin">Satiné</option>
                      <option value="brillant">Brillant</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-gray-700 mb-2">Description du projet</label>
                    <textarea 
                      id="description" 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4" 
                      placeholder="Décrivez votre projet en détail (type de surface, couleurs souhaitées, finitions, etc.)" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !csrfToken}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-300"
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-medium mb-4">Comment ça marche</h3>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold mr-2">1</div>
                  <strong>Soumission de la demande</strong>
                </div>
                <p className="text-gray-600 ml-10">Remplissez le formulaire avec les détails de votre projet.</p>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold mr-2">2</div>
                  <strong>Analyse du projet</strong>
                </div>
                <p className="text-gray-600 ml-10">Notre équipe étudie votre demande et prépare un devis personnalisé.</p>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold mr-2">3</div>
                  <strong>Réception du devis</strong>
                </div>
                <p className="text-gray-600 ml-10">Vous recevez le devis détaillé par email et dans votre espace client.</p>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold mr-2">4</div>
                  <strong>Validation et planification</strong>
                </div>
                <p className="text-gray-600 ml-10">Après validation, nous planifions ensemble les détails du projet.</p>
              </div>
              
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="mr-2">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                  </svg>
                  <strong>Besoin d'aide?</strong>
                </div>
                <p className="text-sm text-gray-600">Si vous avez des questions, n'hésitez pas à nous contacter au +33 1 23 45 67 89 ou par email à contact@artisanpeinture.fr</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};