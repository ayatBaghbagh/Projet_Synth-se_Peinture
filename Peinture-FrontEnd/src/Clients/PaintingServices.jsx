import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Home, Building, Palette, Briefcase, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import videoPeinture from '../assets/deuxVediopeinture.mp4'; // adapte le chemin si nécessaire

export const PaintingServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Service icons mapping
  const serviceIcons = {
    'Intérieur': Home,
    'Extérieur': Building,
    'Décoratif': Palette,
    'Résidentiel': Home,
    'Commercial': Briefcase,
    'Collectivité': Users
  };

  // Service colors mapping
  const serviceColors = {
    'Intérieur': 'bg-red-100 border-red-200 text-red-600',
    'Extérieur': 'bg-blue-100 border-blue-200 text-blue-600',
    'Décoratif': 'bg-yellow-100 border-yellow-200 text-yellow-600',
    'Résidentiel': 'bg-green-100 border-green-200 text-green-600',
    'Commercial': 'bg-purple-100 border-purple-200 text-purple-600',
    'Collectivité': 'bg-gray-100 border-gray-200 text-gray-600'
  };

  // Service descriptions mapping
  const serviceDescriptions = {
    'Intérieur': {
      title: 'Peinture Intérieure',
      description: 'Transformez l\'intérieur de votre maison avec nos services de peinture professionnels.',
      features: [
        'Préparation complète des surfaces',
        'Peintures écologiques disponibles',
        'Finitions impeccables',
        'Protection des meubles et sols',
        'Nettoyage après travaux'
      ]
    },
    'Extérieur': {
      title: 'Peinture Extérieure',
      description: 'Améliorez l\'apparence extérieure de votre propriété avec notre expertise en peinture.',
      features: [
        'Traitement anti-humidité',
        'Peintures résistantes aux UV',
        'Protection contre les intempéries',
        'Préparation des surfaces extérieures',
        'Garantie longue durée'
      ]
    },
    'Décoratif': {
      title: 'Peinture Décorative',
      description: 'Ajoutez une touche unique à votre espace avec nos techniques de peinture décorative.',
      features: [
        'Effets décoratifs personnalisés',
        'Techniques artistiques variées',
        'Conseils de design d\'intérieur',
        'Création d\'ambiances uniques',
        'Finitions luxueuses'
      ]
    },
    'Résidentiel': {
      title: 'Services Résidentiels',
      description: 'Solutions complètes de peinture pour votre maison et appartement.',
      features: [
        'Peinture intérieure et extérieure',
        'Conseil en couleurs',
        'Rénovation d\'appartements',
        'Peinture décorative',
        'Finitions de qualité'
      ]
    },
    'Commercial': {
      title: 'Peinture Commerciale',
      description: 'Solutions de peinture professionnelles pour entreprises et commerces.',
      features: [
        'Intervention en dehors des heures d\'ouverture',
        'Respect des normes commerciales',
        'Peintures sans odeur pour espaces publics',
        'Délais rapides et efficaces',
        'Solutions adaptées aux entreprises'
      ]
    },
    'Collectivité': {
      title: 'Services Collectivités',
      description: 'Solutions pour bâtiments publics et institutions.',
      features: [
        'Peinture d\'écoles',
        'Rénovation de bâtiments publics',
        'Peinture anti-graffiti',
        'Signalétique',
        'Revêtements spécifiques'
      ]
    }
  };

  // Default services to show if API fails
  const defaultServices = ['Intérieur', 'Extérieur', 'Commercial', 'Résidentiel', 'Décoratif', 'Collectivité'];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('http://localhost:8000/api/projets');
      const projets = Array.isArray(response.data) ? response.data : [];

      // Extract unique service types from projects
      const uniqueTypes = [
        ...new Set(
          projets
            .map(projet => projet?.type_projet)
            .filter(type => type && serviceDescriptions[type])
        )
      ];

      // If we have valid types from API, use them, otherwise use defaults
      const validTypes = uniqueTypes.length > 0 ? uniqueTypes : defaultServices;

      setServices(validTypes);
    } catch (err) {
      console.error('Erreur lors du chargement des services:', err);
      setError('Erreur lors du chargement des services');
      setServices(defaultServices);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceRequest = (serviceType) => {
    navigate('/demande-devis', { state: { serviceType } });
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-screen min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
          ></motion.div>
          <p className="text-gray-600">Chargement des services...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-screen min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <div className="text-center text-red-600">
          <p className="text-lg mb-4">{error}</p>
          <button 
            onClick={fetchServices}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-screen min-h-screen bg-gray-50"
    >
      {/* Header Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium"
            >
              ← Retour à l'accueil
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                Expertise professionnelle
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Des services de peinture de qualité supérieure
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Chez ArtisanPeinture, nous offrons une gamme complète de services de peinture 
                professionnels pour répondre à tous vos besoins. Notre équipe d'artisans qualifiés 
                s'engage à fournir un travail de qualité supérieure, avec une attention particulière aux détails.
              </p>
              
              <div className="space-y-3 mb-8">
                {[
                  "Artisans qualifiés avec plus de 15 ans d'expérience",
                  "Matériaux et peintures de haute qualité",
                  "Respect des délais et du budget",
                  "Garantie sur tous nos travaux"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center text-gray-700"
                  >
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    {item}
                  </motion.div>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleServiceRequest('general')}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Demander un devis gratuit →
              </motion.button>
            </motion.div>
            
            <motion.div 
  initial={{ x: 50, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.5 }}
  className="w-full h-[36rem] bg-gray-200 rounded-lg flex items-center justify-center 
                      relative overflow-hidden"
>
  <video
    src={videoPeinture}
    controls
    className="absolute w-full h-full object-cover"
    style={{
      objectFit: 'cover',
      border: '4px solid #f3f4f6', // gris clair
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
    }}
  />
</motion.div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
            Nos prestations
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Découvrez nos services
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Nous proposons une large gamme de services adaptés à vos besoins spécifiques, qu'il 
            s'agisse de peinture intérieure, extérieure ou de projets décoratifs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((serviceType, index) => {
            const IconComponent = serviceIcons[serviceType] || Palette;
            const serviceInfo = serviceDescriptions[serviceType] || {
              title: serviceType,
              description: `Services professionnels de ${serviceType.toLowerCase()}`,
              features: ['Service de qualité', 'Équipe expérimentée', 'Matériaux premium']
            };
            const colorClass = serviceColors[serviceType] || 'bg-gray-100 border-gray-200 text-gray-600';

            return (
              <motion.div
                key={`${serviceType}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-4 ${colorClass}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {serviceInfo.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {serviceInfo.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    {serviceInfo.features.map((feature, featureIndex) => (
                      <motion.div 
                        key={featureIndex}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: featureIndex * 0.05 }}
                        className="flex items-start"
                      >
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleServiceRequest(serviceType)}
                    className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors ${colorClass.replace('bg-100', 'bg-600').replace('text-600', 'text-white')} hover:opacity-90`}
                  >
                    Demander un devis
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Process Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
              Notre méthode
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Notre processus de travail
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Découvrez comment nous travaillons pour vous garantir un résultat parfait.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: "1",
                title: "Consultation",
                description: "Nous discutons de votre projet, vos besoins et vos préférences pour comprendre parfaitement vos attentes.",
                color: "bg-red-600"
              },
              {
                number: "2", 
                title: "Devis détaillé",
                description: "Nous vous fournissons un devis transparent et détaillé, incluant les matériaux, le temps et les coûts.",
                color: "bg-blue-600"
              },
              {
                number: "3",
                title: "Réalisation", 
                description: "Notre équipe d'artisans qualifiés réalise les travaux avec soin, précision et dans le respect des délais.",
                color: "bg-yellow-600"
              },
              {
                number: "4",
                title: "Suivi et garantie",
                description: "Nous assurons un suivi après les travaux et offrons une garantie sur toutes nos prestations.",
                color: "bg-green-600"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-white text-xl font-bold">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto px-4 py-16 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à transformer votre espace?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Contactez-nous dès aujourd'hui pour discuter de votre projet ou demander un devis 
            gratuit. Notre équipe d'experts est à votre disposition pour répondre à toutes vos questions.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/demande-devis')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Demander un devis
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};