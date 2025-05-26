import React from 'react';

const FAQPage = () => {
  return (
    <div className="faq-page">
      {/* Section FAQ */}
      <div className="faq-section">
        <h1>Questions fréquentes</h1>
        <p className="section-description">
          Trouvez rapidement des réponses à vos questions les plus courantes.
        </p>

        <div className="faq-items">
          <div className="faq-item">
            <h2>Comment obtenir un devis?</h2>
            <p>Vous pouvez demander un devis en remplissant notre formulaire en ligne, en nous appelant ou en nous envoyant un email. Nous vous répondrons dans les 24 heures ouvrées.</p>
          </div>

          <div className="faq-item">
            <h2>Quelle est la durée moyenne d'un chantier?</h2>
            <p>La durée dépend de la taille et de la complexité du projet. Pour un appartement standard, comptez entre 3 et 7 jours. Nous vous fournirons un planning précis lors du devis.</p>
          </div>

          <div className="faq-item">
            <h2>Utilisez-vous des peintures écologiques?</h2>
            <p>Oui, nous proposons une large gamme de peintures écologiques et respectueuses de l'environnement. Nous pouvons vous conseiller sur les meilleures options pour votre projet.</p>
          </div>

          <div className="faq-item">
            <h2>Offrez-vous une garantie sur vos travaux?</h2>
            <p>Oui, tous nos travaux sont garantis 2 ans. Cette garantie couvre les défauts de mise en œuvre et les problèmes liés à la qualité des matériaux utilisés.</p>
          </div>
        </div>
      </div>

      {/* Section Rencontrer notre espace */}
      <div className="location-section">
        <h2>Rencontrer notre espace</h2>
        <div className="location-content">
          <div className="map-container">
            <iframe
              title="Localisation Paris"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937596!2d2.292292615509614!3d48.85837007928746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sTour%20Eiffel!5e0!3m2!1sfr!2sfr!4v1623500000000!5m2!1sfr!2sfr"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>

          <div className="location-info">
            <div className="info-card">
              <div className="icon">
                📍
              </div>
              <div className="details">
                <h3>Nos locaux</h3>
                <p>15 Avenue des Champs-Élysées<br/>
                75008 Paris<br/>
                France</p>
              </div>
            </div>

            <div className="info-card">
              <div className="icon">
                🕒
              </div>
              <div className="details">
                <h3>Horaires d'accueil</h3>
                <p>Lundi - Vendredi : 8h30 - 18h30<br/>
                Samedi : 9h00 - 12h30<br/>
                Dimanche : Fermé</p>
              </div>
            </div>

            <div className="cta-section">
              <h3>Prêt à transformer votre espace?</h3>
              <p>N'attendez plus pour donner vie à votre projet. Venez discuter de vos besoins avec nos experts.</p>
              <button className="cta-button">Prendre rendez-vous</button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .faq-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .faq-section {
          margin-bottom: 4rem;
        }

        h1 {
          color: #2d3748;
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .section-description {
          color: #4a5568;
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }

        .faq-items {
          display: grid;
          gap: 1.5rem;
        }

        .faq-item {
          background: #ffffff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        h2 {
          color: #2d3748;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .location-section {
          background: #f7fafc;
          padding: 3rem 2rem;
          border-radius: 12px;
        }

        .location-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        .map-container {
          border-radius: 8px;
          overflow: hidden;
        }

        .location-info {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .info-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .icon {
          font-size: 1.8rem;
          padding: 1rem;
        }

        .details h3 {
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .details p {
          color: #4a5568;
          line-height: 1.6;
        }

        .cta-section {
          text-align: center;
          padding: 2rem;
          background: #2563eb;
          border-radius: 8px;
          color: white;
        }

        .cta-button {
          background: white;
          color: #2563eb;
          padding: 0.8rem 2rem;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
          transition: transform 0.2s;
        }

        .cta-button:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .location-content {
            grid-template-columns: 1fr;
          }
          
          .faq-item {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQPage;