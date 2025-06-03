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
import ProtectedRoute from './Clients/EspaceClient/ProtectedRoute.jsx';
import { ProfileClient } from './Clients/EspaceClient/ProfileClient.jsx';ListeDemandeDevis
import { MesDevisPage } from './Clients/EspaceClient/MesDevisPage.jsx';
import { ListeDemandeDevis } from './Geron/ListeDemandeDevis.jsx';
import { ProjetsAdminPage } from './Geron/ProjetsAdminPage.jsx';
import { ChefsAdminPage } from './Geron/ChefsAdminPage.jsx';
import {Utilisateurs} from './Geron/Utilisateurs.jsx';
import {ProfileAdmin} from './Geron/ProfileAdmin.jsx';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="demande-devis" element={<DemandeDevisPage />} />
         <Route path="utilisateurs" element={<Utilisateurs />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="a-propos" element={<ArtisanPeintureAboutPage />} />
        <Route path="galerie" element={<Gallery  />} />
        <Route path="services" element={<PaintingServices />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register/>} />
        <Route path="profile" element={<ProfileClient/>} />
        <Route path="mesdevis" element={<MesDevisPage/>} />
        <Route path="listedemande" element={<ListeDemandeDevis/>} />
        <Route path="projetvalider" element={<ProjetsAdminPage/>} />
        <Route path="chefsprojets" element={<ChefsAdminPage/>} />
        <Route path="profil" element={<ProfileAdmin/>} />
        <Route path="/mesdevis" element={
        <ProtectedRoute>
          <MesDevisPage />
        </ProtectedRoute>
      } />
      </Route>
    </Routes>
  )
}

export default App
