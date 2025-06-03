import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, User, Mail, Lock, Phone, MapPin } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const Register = ({ onNavigate, onRegister }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    acceptTerms: false
  });
    const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom) newErrors.prenom = 'Le prénom est requis';
    if (!formData.adresse) newErrors.adresse = 'L\'adresse est requise';
    if (!formData.telephone) newErrors.telephone = 'Le téléphone est requis';
    
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Configuration axios avec interceptors pour gérer CSRF automatiquement
  useEffect(() => {
    // Intercepteur pour ajouter automatiquement les headers CSRF
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = getCookie('XSRF-TOKEN');
        if (token) {
          config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les erreurs 419 automatiquement
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 419) {
          // Renouveler le token CSRF et réessayer
          await fetchCSRFToken();
          // Réessayer la requête originale
          const originalRequest = error.config;
          const newToken = getCookie('XSRF-TOKEN');
          if (newToken) {
            originalRequest.headers['X-XSRF-TOKEN'] = decodeURIComponent(newToken);
            return axios.request(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    // Obtenir le token CSRF initial
    fetchCSRFToken();

    // Cleanup des interceptors
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const fetchCSRFToken = async () => {
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setLoading(true);
  setErrors({});

  try {
    // Rafraîchir le token CSRF (si tu utilises sanctum)
    await fetchCSRFToken();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Envoi des données
    const response = await axios.post(
      'http://localhost:8000/api/clients',
      {
        nom: formData.nom,
        prenom: formData.prenom,
        adresse: formData.adresse,
        email: formData.email,
        password: formData.password,
        telephone: formData.telephone
      },
      {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    // Gestion de la réussite
    if (response.status === 201) {
      console.log('Client enregistré avec succès:', response.data);
      // Tu peux afficher un message ou rediriger, par exemple :
      setShowSuccessModal(true);
      if (onRegister) {
        onRegister(response.data); // Optionnel si tu veux propager le nouvel utilisateur
      }
    }

  } catch (error) {
    console.error('Erreur d\'enregistrement :', error);

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 419:
          setErrors({ general: 'Session expirée. Veuillez réessayer.' });
          break;

        case 422:
          const backendErrors = data.errors || {};
          const formattedErrors = {};

          Object.keys(backendErrors).forEach(key => {
            switch (key) {
              case 'email':
                formattedErrors.email = backendErrors[key][0].replace('users', 'comptes existants');
                break;
              case 'password':
                formattedErrors.password = backendErrors[key][0].replace('The password', 'Le mot de passe');
                break;
              default:
                formattedErrors[key] = backendErrors[key][0];
            }
          });
          setErrors(formattedErrors);
          break;

        case 500:
          setErrors({ general: 'Erreur interne du serveur' });
          break;

        default:
          setErrors({ general: data.message || 'Erreur inconnue' });
      }
    } else if (error.request) {
      setErrors({ general: 'Pas de réponse du serveur' });
    } else {
      setErrors({ general: 'Erreur de configuration' });
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-stretch p-4 w-screen">
      <div className="w-full max-w-md mx-auto">
        {/* Bouton Retour */}
        <button 
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
         <a href="/" className="back-link"> Retour à l'accueil</a>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Créer un compte</h2>
            <p className="text-gray-600">Inscrivez-vous pour demander des devis et suivre vos projets</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Nom et Prénom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    placeholder="Votre prénom"
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.prenom ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.prenom && <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    placeholder="Votre nom"
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.nom ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="votre@email.com"
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  placeholder="Votre numéro de téléphone"
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.telephone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>}
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  placeholder="Votre adresse complète"
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.adresse ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.adresse && <p className="mt-1 text-sm text-red-600">{errors.adresse}</p>}
            </div>

            {/* Mots de passe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 6 caractères"
                    className={`w-full pl-11 pr-11 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirmez votre mot de passe"
                    className={`w-full pl-11 pr-11 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Conditions d'utilisation */}
            <div className="flex items-start">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-3 text-sm text-gray-700">
                J'accepte les{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => alert('Conditions d\'utilisation à implémenter')}
                >
                  conditions d'utilisation
                </button>
                {' '}et la{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => alert('Politique de confidentialité à implémenter')}
                >
                  politique de confidentialité
                </button>
              </label>
            </div>
            {errors.acceptTerms && <p className="text-sm text-red-600">{errors.acceptTerms}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Création du compte...
                </div>
              ) : (
                'Créer un compte'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Vous avez déjà un compte?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
      {showSuccessModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center">
      <h3 className="text-xl font-semibold mb-4">Inscription réussie !</h3>
      <p className="mb-6">Votre compte a bien été créé.</p>
       <button
      onClick={() => {
        setShowSuccessModal(false);
        if (onNavigate) {
          onNavigate('/');
        } else {
          navigate('/');
        }
      }}
      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Fermer
    </button>
    </div>
  </div>
)}

    </div>
  );
};