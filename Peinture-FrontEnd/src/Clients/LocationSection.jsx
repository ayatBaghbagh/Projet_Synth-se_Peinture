import React from 'react';

const LocationSection = () => {
  return (
    <div className="page-container">
      {/* Section de localisation */}
      <div className="location-section">
        <div className="section-tag">Nous trouver</div>
        <h2 className="section-title">Notre localisation</h2>
        <p className="section-description">
          Venez nous rencontrer dans nos locaux au cœur de Maarif.
        </p>
        
        <div className="map-container">
          {/* Carte réelle de Maarif, Casablanca */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13293.752237267172!2d-7.650491499999999!3d33.5866189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7d3731f392833%3A0x821e14aaadb3c9!2sMaarif%2C%20Casablanca%2C%20Maroc!5e0!3m2!1sfr!2sma!4v1716330723983!5m2!1sfr!2sma" 
            width="100%" 
            height="100%" 
            style={{border:0}} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Carte Maarif Casablanca"
          ></iframe>
        </div>
        
        <div className="address-info">
          <div className="info-card">
            <div className="icon-container address-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="info-label">Adresse</div>
              <div className="info-value">78 Rue Ibnou Mounir, Quartier Maarif, Casablanca 20370, Maroc</div>
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
          
          <div className="info-card">
            <div className="icon-container phone-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <div className="info-label">Téléphone</div>
              <div className="info-value">+212 5 22 12 34 56</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section FAQ */}
      <div className="faq-section">
        <div className="section-tag">FAQ</div>
        <h2 className="section-title">Questions fréquentes</h2>
        <p className="section-description">
          Trouvez rapidement des réponses à vos questions les plus courantes.
        </p>
        
        <div className="faq-container">
          <div className="faq-card">
            <h3 className="faq-question">Comment obtenir un devis?</h3>
            <p className="faq-answer">
              Vous pouvez demander un devis en remplissant notre formulaire en ligne, 
              en nous appelant ou en nous envoyant un email. Nous vous répondrons 
              dans les 24 heures ouvrées.
            </p>
          </div>
          
          <div className="faq-card">
            <h3 className="faq-question">Quelle est la durée moyenne d'un chantier?</h3>
            <p className="faq-answer">
              La durée dépend de la taille et de la complexité du projet. Pour un 
              appartement standard, comptez entre 3 et 7 jours. Nous vous fournirons un 
              planning précis lors du devis.
            </p>
          </div>
          
          <div className="faq-card">
            <h3 className="faq-question">Utilisez-vous des peintures écologiques?</h3>
            <p className="faq-answer">
              Oui, nous proposons une large gamme de peintures écologiques et 
              respectueuses de l'environnement. Nous pouvons vous conseiller sur les 
              meilleures options pour votre projet.
            </p>
          </div>
          
          <div className="faq-card">
            <h3 className="faq-question">Offrez-vous une garantie sur vos travaux?</h3>
            <p className="faq-answer">
              Oui, tous nos travaux sont garantis 2 ans. Cette garantie couvre les défauts 
              de mise en œuvre et les problèmes liés à la qualité des matériaux utilisés.
            </p>
          </div>
        </div>
      </div>
      
      {/* Call to action */}
      <div className="cta-section">
        <h2 className="cta-title">Prêt à transformer votre espace?</h2>
        <button className="cta-button">Demander un devis gratuit</button>
      </div>
      
      <style jsx>{`
        /* Styles globaux */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .page-container {
          font-family: 'Poppins', sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .location-section, .faq-section {
          margin-bottom: 4rem;
        }
        
        .section-tag {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          padding: 0.25rem 1rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .section-title {
          font-size: 2rem;
          color: #2563eb;
          margin-bottom: 1rem;
          font-weight: 700;
        }
        
        .section-description {
          color: #4b5563;
          margin-bottom: 2rem;
          max-width: 600px;
        }
        
        /* Styles de la carte */
        .map-container {
          width: 100%;
          height: 350px;
          background-color: #f3f4f6;
          border-radius: 0.5rem;
          overflow: hidden;
          margin-bottom: 2rem;
        }
        
        .map-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #e5e7eb;
        }
        
        .map-icon {
          width: 4rem;
          height: 4rem;
          color: #9ca3af;
        }
        
        /* Styles des informations d'adresse */
        .address-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }
        
        .info-card {
          display: flex;
          align-items: center;
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
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
        
        .address-icon {
          background-color: #d1fae5;
          color: #10b981;
        }
        
        .hours-icon {
          background-color: #fef3c7;
          color: #d97706;
        }
        
        .phone-icon {
          background-color: #fee2e2;
          color: #ef4444;
        }
        
        .info-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .info-value {
          font-weight: 500;
          color: #1f2937;
        }
        
        /* Styles de la FAQ */
        .faq-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        
        .faq-card {
          background-color: #f9fafb;
          padding: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .faq-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .faq-question {
          color: #ef4444;
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        
        .faq-answer {
          color: #4b5563;
          font-size: 0.9375rem;
          line-height: 1.6;
        }
        
        /* Styles du CTA */
        .cta-section {
          background-color: #3b82f6;
          color: white;
          padding: 3rem;
          border-radius: 0.5rem;
          text-align: center;
        }
        
        .cta-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: white;
        }
        
        .cta-button {
          padding: 0.75rem 2rem;
          background-color: white;
          color: #2563eb;
          border: none;
          border-radius: 0.375rem;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .cta-button:hover {
          background-color: #f3f4f6;
        }
        
        /* Media queries */
        @media (max-width: 768px) {
          .address-info {
            grid-template-columns: 1fr;
          }
          
          .faq-container {
            grid-template-columns: 1fr;
          }
          
          .section-title {
            font-size: 1.75rem;
          }
          
          .cta-section {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LocationSection;