import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LocationSection from './LocationSection';
import FAQPage from './FAQPage';

export const ContactPage = () => {
  // État pour gérer les données du formulaire
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    typeProjet: 'Résidentiel',
    message: ''
  });

  // États pour la gestion des messages et du chargement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

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

  // Configuration d'axios avec le token CSRF
  const setupAxios = () => {
    const token = getCSRFToken();
    setCsrfToken(token);
    
    if (token) {
      // Ajouter le token à toutes les requêtes
      axios.defaults.headers.common['X-XSRF-TOKEN'] = token;
    }
    
    console.log('Token CSRF configuré:', token ? 'Présent' : 'Absent');
  };

  // Initialiser le token CSRF au démarrage
  useEffect(() => {
    const initCSRF = async () => {
      try {
        // Récupérer le cookie CSRF de Laravel Sanctum
        await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
          withCredentials: true
        });
        console.log('CSRF cookie obtenu');
        
        // Configurer axios avec le token CSRF
        setupAxios();
      } catch (error) {
        console.error('Erreur initialisation CSRF:', error);
        setError('Erreur de connexion au serveur');
      }
    };
    
    initCSRF();
  }, []);

  // Fonction pour gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Effacer les messages d'erreur/succès lors de la saisie
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Fonction de validation côté client
  const validateForm = () => {
    const errors = [];
    
    if (!formData.prenom.trim()) {
      errors.push('Le prénom est requis');
    }
    
    if (!formData.nom.trim()) {
      errors.push('Le nom est requis');
    }
    
    if (!formData.email.trim()) {
      errors.push('L\'email est requis');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('L\'email n\'est pas valide');
    }
    
    if (!formData.sujet) {
      errors.push('Veuillez sélectionner un sujet');
    }
    
    if (!formData.message.trim()) {
      errors.push('Le message est requis');
    } else if (formData.message.trim().length < 10) {
      errors.push('Le message doit contenir au moins 10 caractères');
    }
    
    return errors;
  };

  // Fonction de gestion des erreurs API
  const handleApiError = (error) => {
    if (error.response) {
      const status = error.response.status;
      
      if (status === 419) {
        setError('Session expirée. Tentative de rafraîchissement...');
        
        // Tenter de récupérer un nouveau token CSRF
        setTimeout(async () => {
          try {
            await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
              withCredentials: true
            });
            setupAxios();
            setError('Token CSRF rafraîchi. Veuillez réessayer.');
          } catch (refreshError) {
            setError('Erreur CSRF persistante. Veuillez recharger la page.');
          }
        }, 1000);
        
      } else if (status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors)
            .flat()
            .join(', ');
          setError(`Validation échouée: ${errorMessages}`);
        } else {
          setError('Données invalides. Veuillez vérifier vos entrées.');
        }
      } else if (status === 500) {
        setError('Erreur serveur interne. Veuillez réessayer plus tard.');
      } else {
        setError(`Erreur serveur (${status}): ${error.response.data.message || 'Veuillez réessayer.'}`);
      }
    } else if (error.request) {
      setError('Aucune réponse du serveur. Vérifiez que votre API est en cours d\'exécution.');
    } else {
      setError(`Erreur: ${error.message}`);
    }
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation côté client
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Réactualiser le token CSRF avant la requête POST
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true
      });
      setupAxios();
      
      // Capture du token mis à jour
      const currentToken = getCSRFToken();
      
      if (!currentToken) {
        throw new Error('Token CSRF non disponible');
      }
      
      console.log('Envoi du formulaire avec token CSRF:', currentToken ? 'Présent' : 'Absent');
      
      // Requête POST avec le token CSRF explicite
      const response = await axios.post('http://localhost:8000/api/contacts', 
        {
          prenom: formData.prenom.trim(),
          nom: formData.nom.trim(),
          email: formData.email.trim(),
          telephone: formData.telephone.trim(),
          sujet: formData.sujet,
          typeProjet: formData.typeProjet,
          message: formData.message.trim()
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': currentToken, // Token CSRF explicite
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );
      
      console.log('Message envoyé avec succès:', response.data);
      setSuccess('Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.');
      
      // Réinitialiser le formulaire
      setFormData({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        sujet: '',
        typeProjet: 'Résidentiel',
        message: ''
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header contact-container">
        <div className="contact-info">
          <a href="/" className="back-link">← Retour à l'accueil</a>
        </div>
        <div className="contact-info">
          <h1>Contactez-Nous</h1>
        </div>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <div className="contact-tag">Nous contacter</div>
          <h2>Parlons de votre projet</h2>
          <p className="contact-description">
            Vous avez un projet de peinture en tête? Vous souhaitez obtenir un devis ou 
            simplement poser une question? N'hésitez pas à nous contacter. Notre équipe est à 
            votre disposition pour vous aider et vous conseiller.
          </p>

          {/* Messages d'état et d'erreur */}
          {error && (
            <div className="alert alert-error">
              <strong>Erreur:</strong> {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              <strong>Succès:</strong> {success}
            </div>
          )}
          
          <div className="alert alert-info">
            <strong>État CSRF:</strong> {csrfToken ? 'Token CSRF présent' : 'Token CSRF non disponible'}
          </div>

          {/* Informations de contact existantes */}
          <div className="info-card">
            <div className="icon-container phone-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <div className="info-label">Téléphone</div>
              <div className="info-value">+33 1 23 45 67 89</div>
            </div>
          </div>

          <div className="info-card">
            <div className="icon-container email-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="info-label">Email</div>
              <div className="info-value">contact@artisanpeinture.fr</div>
            </div>
          </div>

          <div className="info-card">
            <div className="icon-container address-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="info-label">Adresse</div>
              <div className="info-value">123 Rue de la Peinture, 75000 Paris</div>
            </div>
          </div>

          <div className="info-card">
            <div className="icon-container hours-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="info-label">Horaires d'ouverture</div>
              <div className="info-value">Lundi - Vendredi: 8h30 - 18h00</div>
              <div className="info-value">Samedi: 9h00 - 12h00</div>
            </div>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Envoyez-nous un message</h2>
          <p>Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Prénom <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="prenom" 
                  value={formData.prenom} 
                  onChange={handleChange} 
                  placeholder="Votre prénom"
                  required 
                  maxLength="50"
                />
              </div>
              <div className="form-group">
                <label>Nom <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="nom" 
                  value={formData.nom} 
                  onChange={handleChange} 
                  placeholder="Votre nom"
                  required 
                  maxLength="50"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="votre@email.com"
                  required 
                  maxLength="100"
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input 
                  type="tel" 
                  name="telephone" 
                  value={formData.telephone} 
                  onChange={handleChange} 
                  placeholder="Votre numéro de téléphone"
                  maxLength="20"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Sujet <span className="required">*</span></label>
              <select 
                name="sujet" 
                value={formData.sujet} 
                onChange={handleChange}
                required
              >
                <option value="">Sélectionnez un sujet</option>
                <option value="Demande de devis">Demande de devis</option>
                <option value="Information générale">Information générale</option>
                <option value="Planification de travaux">Planification de travaux</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="form-group radio-group">
              <label>Type de projet <span className="required">*</span></label>
              <div className="radio-options">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="typeProjet" 
                    value="Résidentiel" 
                    checked={formData.typeProjet === 'Résidentiel'} 
                    onChange={handleChange} 
                  />
                  Résidentiel
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="typeProjet" 
                    value="Commercial" 
                    checked={formData.typeProjet === 'Commercial'} 
                    onChange={handleChange} 
                  />
                  Commercial
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="typeProjet" 
                    value="Bâtiment public" 
                    checked={formData.typeProjet === 'Bâtiment public'} 
                    onChange={handleChange} 
                  />
                  Bâtiment public
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Message <span className="required">*</span></label>
              <textarea 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                rows="6" 
                placeholder="Décrivez votre projet ou votre demande..."
                required
                maxLength="2000"
                minLength="10"
              ></textarea>
              <div className="char-count">
                {formData.message.length}/2000 caractères
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading || !csrfToken}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="send-icon">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              {loading ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
          </form>
        </div>
      </div>
      <LocationSection></LocationSection>

      <style jsx>{`
        /* Styles existants plus les nouveaux */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .contact-page {
          font-family: 'Poppins', sans-serif;
          width: 100%;
          padding: 2rem;
          background-color: #fff;
        }

        /* Styles pour les alertes */
        .alert {
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .alert-error {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        .alert-success {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        .alert-info {
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
        }

        .required {
          color: #ef4444;
        }

        .char-count {
          font-size: 0.75rem;
          color: #6b7280;
          text-align: right;
          margin-top: 0.25rem;
        }

        .contact-header {
          margin-bottom: 2rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          color: #3b82f6;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          transition: color 0.3s;
          text-decoration: none;
        }

        .back-link:hover {
          color: #2563eb;
        }

        h1 {
          font-size: 2rem;
          color: #2563eb;
          margin-top: 0.5rem;
        }

        h2 {
          font-size: 1.5rem;
          color: #2563eb;
          margin-bottom: 1rem;
        }

        .contact-container {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .contact-info {
          flex: 1;
          min-width: 300px;
        }

        .contact-tag {
          display: inline-block;
          background-color: #ef4444;
          color: white;
          padding: 0.25rem 1rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .contact-description {
          color: #4b5563;
          margin-bottom: 2rem;
        }

        .info-card {
          display: flex;
          align-items: center;
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 9999px;
          margin-right: 1rem;
        }

        .icon-container svg {
          width: 1.5rem;
          height: 1.5rem;
        }

        .phone-icon {
          background-color: #fee2e2;
          color: #ef4444;
        }

        .email-icon {
          background-color: #dbeafe;
          color: #3b82f6;
        }

        .address-icon {
          background-color: #d1fae5;
          color: #10b981;
        }

        .hours-icon {
          background-color: #fef3c7;
          color: #d97706;
        }

        .info-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .info-value {
          font-weight: 600;
        }

        .contact-form-container {
          flex: 1;
          min-width: 300px;
          background-color: #fff;
          padding: 1.5rem;
          border-radius: 0.5rem;
        }

        .contact-form-container p {
          color: #4b5563;
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          flex: 1;
          margin-bottom: 1rem;
        }

        label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        input, select, textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-family: inherit;
          font-size: 0.875rem;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .radio-group {
          margin-bottom: 1.5rem;
        }

        .radio-options {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .radio-label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .radio-label input {
          width: auto;
          margin-right: 0.5rem;
        }

        .submit-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 0.75rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .submit-button:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .submit-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .send-icon {
          width: 1.25rem;
          height: 1.25rem;
          margin-right: 0.5rem;
        }

        /* Media queries pour la responsivité */
        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactPage;