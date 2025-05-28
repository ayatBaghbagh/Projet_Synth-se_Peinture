import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Gallery = () => {
  const [projets, setProjets] = useState([]);
  const [filteredProjets, setFilteredProjets] = useState([]);
  const [selectedType, setSelectedType] = useState('Tous');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const typesProjets = ['Tous', 'Intérieur', 'Extérieur', 'Commercial', 'Résidentiel', 'Décoratif'];

  const typeColors = {
    'Intérieur': 'bg-indigo-500',
    'Extérieur': 'bg-emerald-500',
    'Commercial': 'bg-amber-500',
    'Résidentiel': 'bg-rose-500',
    'Décoratif': 'bg-violet-500',
  };

  useEffect(() => {
    const fetchProjets = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:8000/api/projets/favoris-complet'); 
        setProjets(response.data);
        setFilteredProjets(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjets();
  }, []);

  useEffect(() => {
    if (selectedType === 'Tous') {
      setFilteredProjets(projets);
    } else {
      setFilteredProjets(projets.filter(p => p.type_projet === selectedType));
    }
  }, [selectedType, projets]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-stretch p-4 w-screen">
  <div className="w-full max-w-none mx-0">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-6">Notre Galerie</h1>
        <div className="flex flex-wrap justify-center gap-4">
          {typesProjets.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`cursor-pointer px-5 py-2 rounded-full border font-semibold transition duration-300 
                ${
                  selectedType === type
                    ? `${type !== 'Tous' ? typeColors[type] : 'bg-blue-600'} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              aria-pressed={selectedType === type}
              aria-label={`Filtrer par type ${type}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu dynamique */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-5 rounded-lg text-center">{error}</div>
      ) : filteredProjets.length === 0 ? (
        <div className="bg-yellow-100 text-yellow-700 p-8 rounded-lg text-center text-lg">
          Aucun projet ne correspond au filtre sélectionné.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2 sm:px-4">
          {filteredProjets.map(projet => (
            <motion.div
              key={projet.id_projet}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-transform duration-300 hover:scale-[1.03]"
              role="article"
              aria-label={`Projet ${projet.titre}`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={projet.image}
                  alt={projet.titre}
                  className="w-full h-60 object-cover group-hover:grayscale-0 transition duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 flex-col">
                  <Link
                    to={`/projets/${projet.id_projet}`}
                    className="bg-white text-blue-600 px-5 py-2 rounded-full font-semibold shadow-lg hover:bg-blue-600 hover:text-white transition transform hover:scale-105"
                    aria-label={`Voir les détails du projet ${projet.titre}`}
                  >
                    Voir détails
                  </Link>
                  
                  <Link 
                    to="/demande-devis"
                    className="bg-green-500 text-white px-5 py-2 rounded-full font-semibold shadow-lg hover:bg-green-600 transition transform hover:scale-105"
                    aria-label="Demander un devis pour ce projet"
                  >
                    Demander un devis
                  </Link>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg mb-1 text-gray-800 truncate" title={projet.titre}>
                  {projet.titre}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {projet.date_d}
                  {projet.date_f ? ` - ${projet.date_f}` : ''}
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-xs select-none ${typeColors[projet.type_projet] || 'bg-gray-400'}`}
                    aria-label={`Type de projet : ${projet.type_projet}`}
                  >
                    {projet.type_projet}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-white text-xs select-none ${
                      projet.status === 'termine' ? 'bg-green-500' : 'bg-blue-400'
                    }`}
                    aria-label={`Statut : ${projet.status === 'termine' ? 'Terminé' : 'En cours'}`}
                  >
                    {projet.status === 'termine' ? 'Terminé' : 'En cours'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;