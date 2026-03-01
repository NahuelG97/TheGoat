import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, Product } from '../services/api';

const ProductsManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [productName, setProductName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.data);
    } catch (err) {
      setError('Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct({ name: productName });
      setProductName('');
      setShowForm(false);
      await loadProducts();
    } catch (err) {
      setError('Error creando producto');
    }
  };

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setProductName('');
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Producto'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="ej: Lomito, Pizza, Hamburguesa"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Crear Producto
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.Id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.Name}</h3>
            <p className="text-sm text-gray-600">ID: {product.Id}</p>
            <p className="text-sm text-gray-600 mt-2">
              Ingredientes: {product.ingredients?.length || 0}
            </p>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No hay productos creados. Crea uno para empezar.</p>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;
