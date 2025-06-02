// import React, { useState, useEffect } from 'react';
// import axios from 'axios';


// const App = () => {
//     const [products, setProducts] = useState([]);
//     const [name, setName] = useState('');
//     const [description, setDescription] = useState('');
//     const [price, setPrice] = useState('');
     
    
//     useEffect(() => {
//         fetchProducts();
//     }, []);

//     const fetchProducts = async () => {
//         try {
//             const response = await axios.get('http://localhost:8000/api/products');
//             setProducts(response.data);
//         } catch (error) {
//             console.error('Error fetching products:', error);
//         }
//     };
   
//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         try {
//           // Before making POST requests
// await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
//   withCredentials: true
// });
//             await axios.post('http://localhost:8000/api/products', {
//     name,
//     description,
//     price: parseFloat(price)
// }, {
//     headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//     }
// });

//             setName('');
//             setDescription('');
//             setPrice('');
//             await fetchProducts();
//         } catch (error) {
//             console.error('Error creating product:', error);
//         }
//     };

//     return (
//         <div>
//             <h1>Gestion des Produits</h1>
            
//             <form onSubmit={handleSubmit}>
//                 <div>
//                     <label>Nom:</label>
//                     <input 
//                         type="text" 
//                         value={name} 
//                         onChange={(e) => setName(e.target.value)} 
//                         required 
//                     />
//                 </div>
                
//                 <div>
//                     <label>Description:</label>
//                     <textarea 
//                         value={description} 
//                         onChange={(e) => setDescription(e.target.value)}
//                     />
//                 </div>
                
//                 <div>
//                     <label>Prix ($):</label>
//                     <input
//                         type="number"
//                         step="0.01"
//                         value={price}
//                         onChange={(e) => setPrice(e.target.value)}
//                         required
//                     />
//                 </div>
                
//                 <button type="submit">Ajouter le produit</button>
//             </form>

//             <table>
//                 <thead>
//                     <tr>
//                         <th>Nom</th>
//                         <th>Description</th>
//                         <th>Prix</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {products.map(product => (
//                         <tr key={product.id}>
//                             <td>{product.name}</td>
//                             <td>{product.description || '-'}</td>
//                             <td>${Number(product.price).toFixed(2)}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default App;

import { Routes, Route } from "react-router-dom"
import Layout from "./Clients/Components/Layout"
import HomePage from "./Clients/HomePage"
import { DemandeDevisPage } from "./Clients/DemandeDevisPage";
import { ContactPage } from "./Clients/ContactPage";
import ArtisanPeintureAboutPage from "./Clients/ArtisanPeintureAboutPage";
import  Gallery  from "./Clients/Gallery.jsx";
import { PaintingServices } from './Clients/PaintingServices.jsx';
import { Login } from './Clients/Login.jsx';
import { Register } from './Clients/Register.jsx';
import ProtectedRoutee from './Clients/EspaceClient/ProtectedRoutee.jsx';
import { ProfileClient } from './Clients/EspaceClient/ProfileClient.jsx';
import { MesDevisPage } from './Clients/EspaceClient/MesDevisPage.jsx';
import { MesProjet } from './Clients/EspaceClient/MesProjet.jsx';
import { DashboardPage } from './Clients/EspaceClient/DashboardPage.jsx';
import { ListeDemandeDevis } from './Geron/ListeDemandeDevis.jsx';
import { ProjetsAdminPage } from './Geron/ProjetsAdminPage.jsx';
import { ChefsAdminPage } from './Geron/ChefsAdminPage.jsx';
import { CommentairePageEspaceGeron } from './Geron/CommentairePageEspaceGeron.jsx'; 
import  ContactPageEspaceGeron  from './Geron/ContactPageEspaceGeron.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Utilisateurs} from './Geron/Utilisateurs.jsx';
import {AdminDashboard} from './Geron/AdminDashboard.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="demande-devis" element={<DemandeDevisPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="utilisateurs" element={<Utilisateurs />} />
        <Route path="a-propos" element={<ArtisanPeintureAboutPage />} />
        <Route path="galerie" element={<Gallery  />} />
        <Route path="services" element={<PaintingServices />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register/>} />
        <Route path="profile" element={<ProfileClient/>} />
        <Route path="mesdevis" element={<MesDevisPage/>} />
        <Route path="dashboard" element={<DashboardPage/>} />
        <Route path="listedemande" element={<ListeDemandeDevis/>} />
        <Route path="projetvalider" element={<ProjetsAdminPage/>} />
        <Route path="chefsprojets" element={<ChefsAdminPage/>} />
        <Route path="commentaireger" element={<CommentairePageEspaceGeron/>} />
        <Route path="mes-projets" element={<MesProjet/>} />
        <Route path="contactger" element={<ContactPageEspaceGeron/>} />
        <Route path="admindashboard" element={<AdminDashboard/>} />
        <Route path="/mesdevis" element={
        <ProtectedRoutee>
          <MesDevisPage />
        </ProtectedRoutee>
      } />
      </Route>
    </Routes>
  )
}

export default App
