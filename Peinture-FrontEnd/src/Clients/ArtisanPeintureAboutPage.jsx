import { useState, useEffect } from "react";
import { Clock, Shield, Heart, Award, Users, Rocket } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function ArtisanPeintureAboutPage() {
  const [testimonialTab, setTestimonialTab] = useState("particuliers");
  const [visibleSections, setVisibleSections] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('.section-animate').forEach(
      section => observer.observe(section)
    );

    return () => observer.disconnect();
  }, []);

  const testimonials = {
    particuliers: [
      {
        text: "Un travail impeccable et professionnel. L'équipe a été ponctuelle, soignée et a parfaitement respecté nos demandes. La qualité de la peinture est excellente et le résultat final dépasse nos attentes. Je recommande vivement!",
        name: "Marie Dupont",
        position: "Rénovation appartement, Paris",
        initials: "MD"
      },
      {
        text: "ArtisanPeinture a réalisé la rénovation complète de notre école pendant les vacances scolaires. Le travail a été effectué avec professionnalisme et dans le respect des normes de sécurité.",
        name: "Claire Lefort",
        position: "Directrice d'école, Nantes",
        initials: "CL"
      }
    ],
    professionnels: [
      {
        text: "Service professionnel et efficace. L'équipe a travaillé en dehors de nos heures d'ouverture pour minimiser l'impact sur notre activité. Le résultat est impeccable et nos clients ont remarqué la différence!",
        name: "Sophie Bertrand",
        position: "Boutique de mode, Paris",
        initials: "SB"
      },
      {
        text: "Nous avons fait appel à ArtisanPeinture pour la rénovation complète de nos bureaux. Le projet a été livré dans les délais et le budget. L'équipe a été très professionnelle et à l'écoute de nos besoins.",
        name: "Jean Moreau",
        position: "Entreprise de conseil, Marseille",
        initials: "JM"
      }
    ],
    collectivites: [
      {
        text: "Excellente prestation, du conseil initial jusqu'à la réalisation. Le résultat est à la hauteur de nos attentes. Les conseils en couleurs ont été particulièrement précieux. Merci à toute l'équipe!",
        name: "Pierre Lambert",
        position: "Peinture maison, Lyon",
        initials: "PL"
      },
      {
        text: "Nous avons apprécié le professionnalisme et la réactivité d'ArtisanPeinture pour la rénovation de notre salle polyvalente. Le résultat est à la hauteur de nos attentes.",
        name: "Robert Durand",
        position: "Maire-adjoint, Lille",
        initials: "RD"
      }
    ]
  };

  const sectionClassName = (id) => 
    `section-animate w-full transform transition-all duration-1000 ease-in-out
    ${visibleSections[id] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`;

  return (
     <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
       <div  className="w-full bg-white shadow-md">
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center text-blue-600">
            <div className="text-sm cursor-pointer hover:text-blue-800 transition-colors">
        <a href="/" className="back-link">← Retour à l'accueil</a>
         </div>
            <h1 className="text-4xl font-bold text-blue-700 ml-auto">À Propos de Nous</h1>
          </div>
        </div>
      </div>

      {/* Notre histoire */}
      <div id="histoire" className={`${sectionClassName("histoire")} w-full py-16 section-animate opacity-0 translate-y-12 transition-all duration-1000`}>
        <div className="bg-white rounded-xl shadow-lg p-10 relative overflow-hidden transform transition-all duration-500 hover:shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 rounded-full -mr-20 -mt-20 z-0" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-300 rounded-full -mr-10 -mb-10 z-0" />
          
          <div className="relative z-10 w-full px-8">
            <div className="inline-block px-5 py-2 bg-red-500 text-white text-sm font-medium rounded-full mb-6">
              Notre histoire
            </div>
            
            <h2 className="text-3xl font-bold text-blue-700 mb-8">Artisans passionnés depuis 2005</h2>
            
            <p className="text-gray-600 mb-6 text-lg">
              Fondée en 2005 par Thomas Martin, ArtisanPeinture est née d'une passion pour l'art 
              de la peinture et d'une vision: offrir des services de peinture de la plus haute qualité, 
              avec une attention particulière aux détails et un engagement envers la satisfaction du client.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { value: "20+", label: "Années d'expérience", bg: "bg-blue-50", color: "text-blue-600" },
                { value: "500+", label: "Projets réalisés", bg: "bg-red-50", color: "text-red-600" },
                { value: "25", label: "Artisans qualifiés", bg: "bg-yellow-50", color: "text-yellow-600" },
                { value: "98%", label: "Clients satisfaits", bg: "bg-green-50", color: "text-green-600" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className={`${stat.bg} rounded-xl p-8 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-md`}
                >
                  <h3 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
                  <p className="text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notre mission */}
      <div id="mission" className={`${sectionClassName("mission")} w-full py-16 px-8`}>
        <div className="bg-gradient-to-r from-blue-100 to-pink-100 rounded-xl p-10 shadow-lg">
          <div className="text-center mb-10">
            <div className="inline-block px-5 py-2 bg-blue-500 text-white text-sm font-medium rounded-full mb-6">
              Notre mission
            </div>
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Ce qui nous anime</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                icon: Award, 
                title: "Mission", 
                color: "red",
                content: "Transformer les espaces de vie et de travail grâce à des services de peinture exceptionnels, en créant des environnements qui inspirent et qui durent."
              },
              { 
                icon: Clock, 
                title: "Vision", 
                color: "blue",
                content: "Devenir la référence en matière de services de peinture, reconnus pour notre excellence, notre innovation et notre engagement envers la satisfaction client."
              },
              { 
                icon: Heart, 
                title: "Valeurs", 
                color: "yellow",
                content: "Excellence, intégrité, créativité et respect sont les valeurs fondamentales qui guident chacune de nos actions et décisions au quotidien."
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-8 shadow-md transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div className={`w-16 h-16 rounded-full bg-${item.color}-100 flex items-center justify-center mb-6`}>
                  <item.icon className={`text-${item.color}-500 w-8 h-8`} />
                </div>
                <h3 className={`text-xl font-semibold text-${item.color}-600 mb-4`}>{item.title}</h3>
                <p className="text-gray-600">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notre équipe */}
      <div id="equipe" className={`${sectionClassName("equipe")} w-full py-16 px-8`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-5 py-2 bg-teal-500 text-white text-sm font-medium rounded-full mb-6">
              Notre équipe
            </div>
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Les artisans derrière notre succès</h2>
            <p className="text-gray-600 mb-8 text-lg max-w-3xl mx-auto">
              Découvrez les professionnels passionnés qui transforment vos espaces avec talent et dévouement.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { 
                name: "Thomas Martin", 
                role: "Fondateur & Directeur", 
                bg: "bg-blue-100",
                iconColor: "text-blue-400",
                description: "Plus de 20 ans d'expérience dans le secteur de la peinture et de la décoration."
              },
              { 
                name: "Sophie Dubois", 
                role: "Responsable Projets", 
                bg: "bg-pink-100",
                iconColor: "text-pink-400",
                description: "Experte en gestion de projets et coordination d'équipes de peintres."
              },
              { 
                name: "Pierre Lambert", 
                role: "Chef d'Équipe", 
                bg: "bg-yellow-100",
                iconColor: "text-yellow-400",
                description: "Maître artisan avec une expertise en techniques de peinture décorative."
              },
              { 
                name: "Marie Leroy", 
                role: "Conseillère Couleurs", 
                bg: "bg-green-100",
                iconColor: "text-green-400",
                description: "Spécialiste en design d'intérieur et harmonies de couleurs."
              }
            ].map((member, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                <div className={`h-56 ${member.bg} flex items-center justify-center`}>
                  <Users className={`${member.iconColor} w-16 h-16`} />
                </div>
                <div className="p-6">
                  <h3 className="text-blue-700 font-semibold text-center text-xl">{member.name}</h3>
                  <p className="text-red-500 text-center mb-3">{member.role}</p>
                  <p className="text-gray-600 text-center">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nos valeurs */}
      <div id="valeurs" className={`${sectionClassName("valeurs")} w-full py-16 px-8`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-5 py-2 bg-red-500 text-white text-sm font-medium rounded-full mb-6">
              Nos valeurs
            </div>
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Ce qui guide nos actions</h2>
            <p className="text-gray-600 mb-8 text-lg max-w-3xl mx-auto">
              Nos valeurs fondamentales définissent notre approche et notre engagement envers chaque projet.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { 
                icon: Award, 
                title: "Excellence", 
                color: "blue",
                content: "Nous visons l'excellence dans chaque projet, avec une attention méticuleuse aux détails."
              },
              { 
                icon: Clock, 
                title: "Ponctualité", 
                color: "blue",
                content: "Nous respectons scrupuleusement les délais convenus pour chaque projet."
              },
              { 
                icon: Heart, 
                title: "Passion", 
                color: "red",
                content: "Notre passion pour notre métier se reflète dans la qualité de notre travail."
              },
              { 
                icon: Shield, 
                title: "Fiabilité", 
                color: "blue",
                content: "Nous tenons nos promesses et assurons un service fiable et constant."
              },
              { 
                icon: Users, 
                title: "Collaboration", 
                color: "yellow",
                content: "Nous travaillons en étroite collaboration avec nos clients pour réaliser leur vision."
              },
              { 
                icon: Rocket, 
                title: "Créativité", 
                color: "green",
                content: "Nous apportons des solutions créatives et innovantes à chaque projet."
              }
            ].map((value, index) => (
              <div 
                key={index}
                className="bg-white border-2 border-gray-100 rounded-xl p-8 shadow-md transform transition-all duration-300 hover:shadow-xl"
              >
                <div className={`w-16 h-16 rounded-full bg-${value.color}-100 flex items-center justify-center mb-6`}>
                  <value.icon className={`text-${value.color}-500 w-8 h-8`} />
                </div>
                <h3 className="text-xl font-semibold text-blue-700 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notre parcours */}
      <div id="parcours" className={`${sectionClassName("parcours")} w-full py-16 px-8`}>
        <div className="bg-gradient-to-r from-blue-100 to-pink-100 rounded-xl p-10 shadow-lg">
          <div className="text-center mb-12">
            <div className="inline-block px-5 py-2 bg-yellow-500 text-white text-sm font-medium rounded-full mb-6">
              Notre parcours
            </div>
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Les étapes clés de notre histoire</h2>
            <p className="text-gray-600 mb-12 text-lg max-w-3xl mx-auto">
              Découvrez comment ArtisanPeinture a évolué au fil des années pour devenir l'entreprise qu'elle est aujourd'hui.
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-2 bg-blue-300 rounded-full" />
            
            <div className="grid grid-cols-2 gap-12">
              {[
                { 
                  year: "2005", 
                  title: "Création de l'entreprise", 
                  content: "Fondation d'ArtisanPeinture par Thomas Martin avec une équipe de 3 peintres."
                },
                { 
                  year: "2010", 
                  title: "Expansion des services", 
                  content: "Élargissement de notre offre pour inclure des services de peinture décorative et commerciale."
                },
                { 
                  year: "2015", 
                  title: "Ouverture de nouveaux locaux", 
                  content: "Inauguration de notre showroom et de nos bureaux actuels au cœur de Paris."
                },
                { 
                  year: "2020", 
                  title: "Certification écologique", 
                  content: "Obtention de la certification pour l'utilisation de peintures écologiques et durables."
                },
                { 
                  year: "2023", 
                  title: "Aujourd'hui", 
                  content: "Une équipe de 25 professionnels dédiés à la transformation de vos espaces."
                }
              ].map((step, index) => (
                <div 
                  key={index}
                  className={`${index % 2 === 0 ? "text-right pr-10" : "pl-10"} transform transition-all duration-500 ${index % 2 === 0 ? "hover:-translate-x-2" : "hover:translate-x-2"}`}
                >
                  <h3 className="text-xl font-semibold text-blue-700 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-2">{step.content}</p>
                  <p className="text-blue-500 font-bold text-lg">{step.year}</p>
                  <div className={`absolute ${index % 2 === 0 ? "left-0" : "right-0"} top-2 transform ${index % 2 === 0 ? "-translate-x-1/2" : "translate-x-1/2"} w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-md`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Témoignages */}
      <div id="temoignages" className={`${sectionClassName("temoignages")} w-full py-16 px-8`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-5 py-2 bg-purple-500 text-white text-sm font-medium rounded-full mb-6">
              Témoignages
            </div>
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Ce que disent nos clients</h2>
            <p className="text-gray-600 mb-8 text-lg max-w-3xl mx-auto">
              La satisfaction de nos clients est notre priorité. Voici ce qu'ils pensent de notre travail.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-full inline-flex p-1">
              {Object.keys(testimonials).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTestimonialTab(tab)}
                  className={`px-6 py-2 rounded-full text-sm font-medium capitalize ${
                    testimonialTab === tab 
                      ? "bg-white shadow-sm text-blue-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {testimonials[testimonialTab].map((testimonial, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-600 mr-4">
                    {testimonial.initials}
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-700">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="w-full py-16 px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Prêt à transformer votre espace ?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Contactez-nous dès aujourd'hui pour discuter de votre projet ou demander un devis gratuit.
          </p>
          <div className="flex justify-center gap-4">
            <button
        onClick={() => navigate('/demande-devis')}
        className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all"
      >
        Demander un devis
      </button>

      <button
        onClick={() => navigate('/contact')}
        className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all"
      >
        Nous contacter
      </button>
          </div>
        </div>
      </div>
    </div>
  );
}