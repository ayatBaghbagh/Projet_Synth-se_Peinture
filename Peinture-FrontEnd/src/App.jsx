import React, { useState, useEffect } from 'react';
import axios from 'axios';


const App = () => {
    const [products, setProducts] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
     
    
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };
   
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
          // Before making POST requests
await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
  withCredentials: true
});
            await axios.post('http://localhost:8000/api/products', {
    name,
    description,
    price: parseFloat(price)
}, {
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

            setName('');
            setDescription('');
            setPrice('');
            await fetchProducts();
        } catch (error) {
            console.error('Error creating product:', error);
        }
    };

    return (
        <div>
            <h1>Gestion des Produits</h1>
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nom:</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                </div>
                
                <div>
                    <label>Description:</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                
                <div>
                    <label>Prix ($):</label>
                    <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>
                
                <button type="submit">Ajouter le produit</button>
            </form>

            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Description</th>
                        <th>Prix</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.description || '-'}</td>
                            <td>${Number(product.price).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default App;