import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Phone, Mail, MapPin, Facebook, Twitter, Instagram, CheckCircle, Star, Send, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('accueil');
  const [isBgVisible, setIsBgVisible] = useState(false);
  const [favoriteComments, setFavoriteComments] = useState([]);
  const [nations, setNations] = useState([]);
  const [villes, setVilles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [projets, setProjets] = useState([]);
  const [projetsFavoris, setProjetsFavoris] = useState([]);
  const [loadingProjets, setLoadingProjets] = useState(true);

  const navigate = useNavigate();
  
  // Configuration de l'URL de base de l'API
  const API_BASE_URL = 'http://localhost:8000/api';
  
  // Fonction améliorée pour récupérer les projets favoris
  useEffect(() => {
    const fetchProjetsFavoris = async () => {
      try {
        setLoadingProjets(true);
        setApiError('');
        
        const response = await fetch(`${API_BASE_URL}/projets/favoris`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text();
          console.log('Response text (first 500 chars):', responseText.substring(0, 500));
          throw new TypeError("La réponse n'est pas du JSON valide");
        }

        const data = await response.json();
        console.log('Projets favoris récupérés:', data);
        setProjetsFavoris(data);
        
      } catch (error) {
        console.error('Erreur de récupération des projets favoris:', error);
        setApiError(`Impossible de charger les projets favoris: ${error.message}`);
        
        // Données de secours pour les tests
        setProjetsFavoris([
          {
            id_projet: 1,
            titre: "Rénovation Appartement Moderne",
            image: "/images/default-project.jpg",
            type_projet: "Intérieur",
            favoris: true
          },
          {
            id_projet: 2,
            titre: "Peinture Façade Villa",
            image: "/images/default-project.jpg",
            type_projet: "Extérieur",
            favoris: true
          },
          {
            id_projet: 3,
            titre: "Décoration Bureau",
            image: "/images/default-project.jpg",
            type_projet: "Commercial",
            favoris: true
          }
        ]);
      } finally {
        setLoadingProjets(false);
      }
    };

    fetchProjetsFavoris();
  }, []);

  // Fonction pour récupérer tous les projets (gardée pour compatibilité)
  useEffect(() => {
    const fetchAllProjets = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/projets`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
          const data = await response.json();
          setProjets(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de tous les projets:', error);
      }
    };

    fetchAllProjets();
  }, []);
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    type_client: 'Particuliers',
    contenu: '',
    nation: '',
    ville: '',
    favori: false
  });
  
  const handleDevisClickDemande = () => {
    navigate('/demande-devis');
  };
  
  const handleContactClick = () => {
    navigate('/contact');
  };

  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur API: ${error.message}`);
      throw error;
    }
  };

  // Chargement des commentaires favoris
  const fetchFavoriteComments = async () => {
    try {
      setApiError('');
      const response = await apiCall('/commentaires-favoris');
      setFavoriteComments(response.slice(0, 2));
    } catch (error) {
      setApiError('Erreur de chargement des commentaires');
      // Données de secours
      setFavoriteComments([
        {
          id: 1,
          nom: 'Dupont',
          prenom: 'Marie',
          type_client: 'Particuliers',
          ville: 'Paris',
          nation: 'France',
          contenu: 'Excellent travail, très professionnel et soigné. Je recommande vivement cette entreprise pour tous vos travaux de peinture.'
        },
        {
          id: 2,
          nom: 'Martin',
          prenom: 'Pierre',
          type_client: 'Professionnels',
          ville: 'Lyon',
          nation: 'France',
          contenu: 'Service rapide et efficace. L\'équipe est ponctuelle et le résultat est impeccable. Très satisfait de cette collaboration.'
        }
      ]);
    }
  };

  // Fonction pour récupérer les nations
  const fetchNations = async () => {
    try {
      const response = await apiCall('/nations');
      const nationsData = response.data || response || [];
      setNations(Array.isArray(nationsData) ? nationsData : []);
    } catch (error) {
      console.error('Erreur nations:', error);
      setNations([
        'France', 'Belgique', 'Suisse', 'Luxembourg', 'Canada', 
        'Maroc', 'Algérie', 'Tunisie', 'Sénégal', 'Côte d\'Ivoire', 
        'Mali', 'Burkina Faso', 'Niger', 'Guinée', 'Bénin', 'Togo', 
        'Madagascar', 'Maurice', 'Seychelles', 'Comores'
      ]);
    }
  };

  const fetchVilles = async (nation) => {
    if (!nation) return;
    setLoading(true);
    
    try {
      setApiError('');
      const response = await apiCall(`/villes?nation=${encodeURIComponent(nation)}`);
      const villesList = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
      setVilles(villesList);

    } catch (error) {
      console.error('Erreur villes:', error);
      setApiError(`Impossible de charger les villes pour ${nation}`);
      
      const defaultCities = {
        'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier'],
        'Belgique': ['Bruxelles', 'Anvers', 'Gand', 'Charleroi', 'Liège', 'Bruges'],
        'Suisse': ['Zurich', 'Genève', 'Bâle', 'Berne', 'Lausanne'],
        'Luxembourg': ['Luxembourg', 'Esch-sur-Alzette', 'Differdange'],
        'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa'],
        'Maroc': ['Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Agadir', 'Tanger'],
        'Algérie': ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna'],
        'Tunisie': ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès'],
        'Sénégal': ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor'],
        'Côte d\'Ivoire': ['Abidjan', 'Yamoussoukro', 'Bouaké', 'Daloa', 'San-Pédro'],
        'Mali': ['Bamako', 'Sikasso', 'Mopti', 'Koutiala', 'Kayes'],
        'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya'],
        'Niger': ['Niamey', 'Zinder', 'Maradi', 'Agadez', 'Tahoua'],
        'Guinée': ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé'],
        'Bénin': ['Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Bohicon'],
        'Togo': ['Lomé', 'Sokodé', 'Kara', 'Palimé', 'Atakpamé'],
        'Madagascar': ['Antananarivo', 'Toamasina', 'Antsirabe', 'Mahajanga', 'Fianarantsoa'],
        'Maurice': ['Port-Louis', 'Beau-Bassin', 'Vacoas-Phoenix', 'Curepipe', 'Quatre-Bornes'],
        'Seychelles': ['Victoria', 'Anse Boileau', 'Beau Vallon', 'Cascade'],
        'Comores': ['Moroni', 'Mutsamudu', 'Fomboni', 'Domoni']
      };
      
      setVilles(defaultCities[nation] || []);
    } finally {
      setLoading(false);
    }
  };

  const getCSRFToken = () => {
    const tokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='));
    if (tokenCookie) {
      return decodeURIComponent(tokenCookie.split('=')[1]);
    }
    return '';
  };

  const setupAxios = () => {
    const token = getCSRFToken();
    setCsrfToken(token);
    if (token) {
      axios.defaults.headers.common['X-XSRF-TOKEN'] = token;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
          withCredentials: true,
        });
        setupAxios();
      } catch (e) {
        console.error('Erreur initialisation CSRF:', e);
        setError('Impossible d\'initialiser la sécurité du formulaire.');
      }
    };
    init();
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!formData.nom.trim() || 
        !formData.prenom.trim() || 
        !formData.contenu.trim() || 
        formData.contenu.trim().length < 10) {
      setError('Nom, prénom et contenu (au moins 10 caractères) sont requis.');
      setSubmitting(false);
      return;
    }

    if (!formData.nation || !formData.ville) {
      setError('Pays et ville sont requis.');
      setSubmitting(false);
      return;
    }

    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true,
      });

      setupAxios();
      const currentToken = getCSRFToken();

      const payload = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        type_client: formData.type_client,
        nation: formData.nation,
        ville: formData.ville,
        contenu: formData.contenu.trim(),
        favori: formData.favori ? 1 : 0
      };

      console.log('Payload envoyé:', payload);

      const response = await axios.post(
        'http://localhost:8000/api/commentaires',
        payload,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': currentToken,
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      );

      console.log('Réponse API:', response.data);
      setSuccess('Commentaire ajouté avec succès !');
      
      setFormData({
        nom: '',
        prenom: '',
        type_client: 'Particuliers',
        contenu: '',
        nation: '',
        ville: '',
        favori: false,
      });

      fetchFavoriteComments();

    } catch (err) {
      console.error('Erreur complète:', err);
      console.error('Réponse erreur:', err.response?.data);
      
      if (err.response?.status === 419) {
        setError('Session expirée. Veuillez recharger la page.');
      } else if (err.response?.status === 422) {
        const errors = err.response.data.errors || {};
        const messages = Object.values(errors).flat().join(', ');
        setError(`Validation échouée : ${messages}`);
        console.log('Erreurs de validation détaillées:', errors);
      } else if (err.response?.data?.error) {
        setError(`Erreur: ${err.response.data.error}`);
      } else {
        setError('Erreur serveur, veuillez réessayer.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count = 5) => [...Array(count)].map((_, i) => (
    <Star 
      key={i} 
      size={16} 
      className="text-yellow-400 fill-current" 
    />
  ));

  const handleDevisClick = () => {
    setIsBgVisible(!isBgVisible);
  };

  useEffect(() => {
    fetchFavoriteComments();
    fetchNations();
  }, []);

  useEffect(() => {
    if (formData.nation) {
      fetchVilles(formData.nation);
    } else {
      setVilles([]);
      setFormData(prev => ({ ...prev, ville: '' }));
    }
  }, [formData.nation]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Affichage des erreurs API pour debug
  if (apiError) {
    console.log('Erreur API affichée:', apiError);
  }
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Fond animé */}
      <div className={`fixed inset-0 bg-red-50 transition-all duration-500 ease-in-out z-0 ${isBgVisible ? 'oportfoacity-100' : 'opacity-0 pointer-events-none'}`} />

      {/* Alerte d'erreur API */}
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative z-20 mx-4 mt-4">
          <div className="flex items-center">
            <AlertCircle size={20} className="mr-2" />
            <span className="block sm:inline">{apiError}</span>
            <button 
              onClick={() => setApiError('')}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="sr-only">Fermer</span>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Messages de succès et d'erreur pour le formulaire */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative z-20 mx-4 mt-4">
          <div className="flex items-center">
            <CheckCircle size={20} className="mr-2" />
            <span className="block sm:inline">{success}</span>
            <button 
              onClick={() => setSuccess('')}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="sr-only">Fermer</span>
              ×
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative z-20 mx-4 mt-4">
          <div className="flex items-center">
            <AlertCircle size={20} className="mr-2" />
            <span className="block sm:inline">{error}</span>
            <button 
              onClick={() => setError('')}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="sr-only">Fermer</span>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <header className="bg-white shadow-sm w-full relative z-10">
        <div className="w-full px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center mr-6">
                <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  AP
                </div>
                <span className="ml-2 text-red-500 font-bold text-xl">ArtisanPeinture</span>
              </div>
              <nav className="flex space-x-8">
                {['accueil', 'galerie', 'services', 'apropos', 'contact'].map((tab) => {
                  const path = tab === 'accueil' ? '/' : `/${tab === 'apropos' ? 'a-propos' : tab}`;
                  
                  return (
                    <a
                      key={tab}
                      href={path}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab(tab);
                        navigate(path);
                      }}
                      className={`relative text-sm font-semibold cursor-pointer transition-colors duration-300
                        ${activeTab === tab ? 'text-red-500' : 'text-gray-600'}
                        hover:text-red-500`}
                    >
                      {tab === 'apropos' ? 'À Propos' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {activeTab === tab && (
                        <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-red-500 rounded transition-all duration-300" />
                      )}
                    </a>
                  );
                })}
              </nav>
            </div>
            <div className="flex space-x-3">
              <button className="border border-red-500 text-red-500 px-4 py-2 rounded-md text-sm transition-all duration-300 hover:bg-red-50">
                Connexion
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded-md text-sm transition-all duration-300 hover:bg-red-600">
                Inscription
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-100 to-pink-50 py-16 relative z-10">
        <div className="w-full px-6">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2">
              <div className="inline-block bg-red-500 text-white rounded-full text-xs px-4 py-1 mb-4">
                Service professionnel
              </div>
              <h1 className="text-4xl font-bold mb-6">
                <span className="text-blue-600">Transformez votre espace</span><br />
                <span className="text-blue-600">avec nos </span>
                <span className="text-red-500">services de peinture</span><br />
                <span className="text-blue-600">professionnels</span>
              </h1>
              <p className="text-gray-600 mb-8">
                Nous offrons des services de peinture de haute qualité pour les
                particuliers et les entreprises. Découvrez notre galerie et
                demandez un devis personnalisé.
              </p>
              <div className="flex space-x-4 mb-12">
                <button className="bg-red-500 text-white px-6 py-3 rounded-md flex items-center text-sm transition-all duration-300 hover:bg-red-600 group">
                  Voir nos réalisations <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                </button>
                
                <button
                  onClick={handleDevisClickDemande}
                  className="border border-gray-300 bg-white text-gray-700 px-6 py-3 rounded-md text-sm 
                          transition-all duration-300 hover:border-red-500 hover:text-red-500"
                >
                  Demander un devis
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[1, 2, 3, 4].map(num => (
                    <div key={num} className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-1">
                      {num}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-600">+500 clients satisfaits</span>
              </div>
            </div>
            <div className="md:w-1/2 flex items-center justify-center bg-gray-100 rounded-lg 
              transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center 
                            relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center 
                              transform transition-all duration-500 group-hover:scale-125 group-hover:bg-red-500 
                              group-hover:text-white shadow-lg">
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="animate-pulse"
                  >
                    <rect 
                      x="6" 
                      y="6" 
                      width="12" 
                      height="12" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      className="transition-colors duration-300"
                    />
                  </svg>
                </div>

                <button 
                  onClick={() => navigate('/a-propos')}
                  className="absolute bottom-4 bg-white px-4 py-2 rounded-full text-sm 
                                    opacity-0 group-hover:opacity-100 transition-all duration-300
                                    flex items-center hover:bg-red-500 hover:text-white shadow-md group/btn"
                >
                  Voir les détails
                  <ArrowRight size={16} className="ml-2 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white relative z-10">
        <div className="w-full px-6">
          <div className="flex justify-center mb-2">
            <div className="bg-blue-100 text-blue-600 rounded-full px-4 py-1 text-sm">
              Nos expertises
            </div>
          </div>
          <h2 className="text-3xl font-bold text-blue-600 text-center mb-4">Nos Services</h2>
          <p className="text-gray-600 text-center mb-12">
            Nous offrons une gamme complète de services de peinture pour répondre à tous vos besoins.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="border border-red-100 rounded-lg p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
              <div className="mb-4">
                <CheckCircle className="text-red-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-red-500 mb-3">Peinture Intérieure</h3>
              <p className="text-gray-600 mb-6">
                Transformez l'intérieur de votre maison avec nos services de peinture professionnels.
              </p>
              <div className="flex space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full transition-colors duration-300 group-hover:bg-red-600"></div>
                <div className="w-4 h-4 bg-blue-300 rounded-full"></div>
                <div className="w-4 h-4 bg-teal-300 rounded-full"></div>
              </div>
            </div>
            
            <div className="border border-blue-100 rounded-lg p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
              <div className="mb-4">
                <CheckCircle className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-blue-500 mb-3">Peinture Extérieure</h3>
              <p className="text-gray-600 mb-6">
                Améliorez l'apparence extérieure de votre propriété avec notre expertise en peinture.
              </p>
              <div className="flex space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full transition-colors duration-300 group-hover:bg-blue-600"></div>
                <div className="w-4 h-4 bg-blue-800 rounded-full"></div>
              </div>
            </div>
            
            <div className="border border-yellow-100 rounded-lg p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
              <div className="mb-4">
                <CheckCircle className="text-yellow-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-yellow-500 mb-3">Peinture Décorative</h3>
              <p className="text-gray-600 mb-6">
                Ajoutez une touche unique à votre espace avec nos techniques de peinture décorative.
              </p>
              <div className="flex space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full transition-colors duration-300 group-hover:bg-yellow-600"></div>
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <div className="w-4 h-4 bg-red-400 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button className="bg-red-500 text-white px-6 py-3 rounded-md text-sm
                              transition-all duration-300 hover:bg-red-600 flex items-center group">
              Voir tous nos services
              <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
    <section className="py-16 bg-gradient-to-r from-gray-100 to-pink-50 relative z-10">
        <div className="w-full px-6">
          <div className="flex justify-center mb-2">
            <div className="bg-yellow-100 text-yellow-600 rounded-full px-4 py-1 text-sm">
              Portfolio
            </div>
          </div>
          <h2 className="text-3xl font-bold text-blue-600 text-center mb-4">Nos Réalisations</h2>
          <p className="text-gray-600 text-center mb-12">
            Découvrez nos projets les plus marquants
          </p>
          
          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {apiError}
            </div>
          )}
          
          {loadingProjets ? (
            <div className="text-center py-8">Chargement des projets...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projetsFavoris.length > 0 ? (
                projetsFavoris.map((projet) => (
                  <div
                    key={projet.id_projet}
                    className="bg-white rounded-lg overflow-hidden shadow-sm relative group
                             transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                      <img
                        src={projet.image}
                        alt={projet.titre}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = '/images/default-project.jpg';
                        }}
                      />
                      <button
                        onClick={() => navigate(`/projets/${projet.id_projet}`)}
                        className="absolute bottom-4 bg-white px-4 py-2 rounded-full text-sm
                                 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                 shadow-md hover:shadow-lg hover:bg-red-500 hover:text-white"
                      >
                        Voir les détails
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">{projet.titre}</h3>
                      <p className="text-gray-500 text-sm">{projet.type_projet}</p>
                      {projet.favoris && (
                        <div className="absolute top-2 right-2 bg-yellow-400 p-2 rounded-full">
                          ⭐
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-gray-500">
                  Aucun projet favori pour le moment
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      {/* Testimonials Section - Dynamique */}
      <section className="py-16 bg-white relative z-10">
        <div className="w-full px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Commentaires favoris dynamiques */}
            <div className="lg:w-1/2">
              <div className="inline-block bg-teal-100 text-teal-600 rounded-full text-xs px-4 py-1 mb-4">
                Témoignages Favoris
              </div>
              <h2 className="text-3xl font-bold text-blue-600 mb-4">Ce que nos clients disent</h2>
              <p className="text-gray-600 mb-8">
                Découvrez les témoignages favoris de nos clients satisfaits.
              </p>
              
              <div className="space-y-6">
                {favoriteComments.length > 0 ? (
                  favoriteComments.slice(0, 2).map((comment, index) => (
                    <div key={comment.id} className={`border-l-4 ${index === 0 ? 'border-yellow-400' : 'border-red-400'} bg-white p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md`}>
                      <div className="flex mb-2">
                        {renderStars(5)}
                      </div>
                      <p className="text-gray-600 italic mb-4">
                        "{comment.contenu}"
                      </p>
                      <div className="flex items-center">
                        <div className={`${index === 0 ? 'bg-yellow-100' : 'bg-red-100'} w-8 h-8 rounded-full flex items-center justify-center ${index === 0 ? 'text-yellow-600' : 'text-red-600'} font-medium text-sm`}>
                          {comment.nom.charAt(0)}{comment.prenom.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{comment.prenom} {comment.nom}</p>
                          <p className="text-gray-500 text-sm">{comment.type_client} - {comment.ville}, {comment.nation}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border-l-4 border-gray-300 bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-500 italic">
                      Aucun commentaire favori pour le moment. Soyez le premier à laisser un avis !
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Formulaire d'ajout de commentaire */}
           <div className="lg:w-1/2">
  <div className="bg-purple-50 rounded-lg p-8">
    <div className="inline-block bg-purple-200 text-purple-600 rounded-full text-xs px-4 py-1 mb-4">
      Votre Avis
    </div>
    <h2 className="text-3xl font-bold text-blue-600 mb-4">Partagez votre expérience</h2>
    <p className="text-gray-600 mb-6">
      Votre avis nous aide à améliorer nos services et guide d&apos;autres clients.
    </p>

    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleInputChange}
            required
            placeholder="Votre nom"
            className="w-full px-3 py-2 border border-gray-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleInputChange}
            required
            placeholder="Votre prénom"
            className="w-full px-3 py-2 border border-gray-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type de client *</label>
        <select
          name="type_client"
          value={formData.type_client}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="Particuliers">Particuliers</option>
          <option value="Professionnels">Professionnels</option>
          <option value="Collectivités">Collectivités</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pays */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pays <span className="text-red-500">*</span>
          </label>
          <select
            name="nation"
            value={formData.nation}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                       bg-white text-gray-800 transition duration-200"
          >
            <option value="">Sélectionnez un pays</option>
            {nations.map((nation) => (
              <option key={nation} value={nation}>
                {nation}
              </option>
            ))}
          </select>
        </div>

        {/* Ville */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ville <span className="text-red-500">*</span>
          </label>
          <select
            name="ville"
            value={formData.ville}
            onChange={handleInputChange}
            required
            disabled={!formData.nation || loading}
            className={`w-full px-4 py-2 border rounded-xl shadow-sm transition duration-200 ${
              !formData.nation || loading
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            }`}
          >
            {loading ? (
              <option>Chargement...</option>
            ) : (
              <>
                <option value="">Sélectionnez une ville</option>
                {villes.map((ville, index) => (
                  <option key={ville || index} value={ville}>
                    {ville}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Votre commentaire *</label>
        <textarea
  name="contenu"
  value={formData.contenu}
  onChange={handleInputChange}
  required
  minLength={10}
  rows={4}
  placeholder="Partagez votre expérience avec nos services..."
  className="w-full px-3 py-2 border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
/>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-purple-600 text-white py-3 px-4 rounded-md font-medium 
                   hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center
                   transition-colors duration-200"
      >
        {submitting ? (
          'Envoi en cours...'
        ) : (
          <>
            Envoyer mon avis
            <Send size={16} className="ml-2" />
          </>
        )}
      </button>
    </form>
  </div>
</div>

          </div>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="mt-auto">
        <div className="bg-white py-12">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="mb-8 md:mb-0">
                <div className="flex items-center mb-4">
                  <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    AP
                  </div>
                  <span className="ml-2 text-red-500 font-bold">ArtisanPeinture</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Services de peinture professionnels pour tous vos projets.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-blue-600">
                    <Facebook size={20} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-blue-400">
                    <Twitter size={20} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-pink-600">
                    <Instagram size={20} />
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4 text-blue-600">Liens Rapides</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm">Accueil</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm">Galerie</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm">Services</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-blue-600 text-sm">Demander un devis</a></li>
                  <li><a href="#" onClick={handleContactClick} className="text-gray-600 hover:text-blue-600 text-sm">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-4 text-blue-600">Contact</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <Mail size={16} className="mr-2 text-red-500" />
                    contact@artisanpeinture.fr
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <Phone size={16} className="mr-2 text-red-500" />
                    +33 1 23 45 67 89
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <MapPin size={16} className="mr-2 text-red-500" />
                    123 Rue de la Peinture, 75000 Paris
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-600 py-4">
          <div className="container mx-auto px-6">
            <p className="text-white text-center text-sm">
              © 2025 ArtisanPeinture. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}