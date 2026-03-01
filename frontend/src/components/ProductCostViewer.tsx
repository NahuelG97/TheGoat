import React, { useEffect, useState } from 'react';
import { getProducts, getProductCost, Product, ProductCost } from '../services/api';

const ProductCostViewer: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productCost, setProductCost] = useState<ProductCost | null>(null);
  const [loading, setLoading] = useState(false);
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

  const handleSelectProduct = async (productId: number) => {
    try {
      setSelectedProductId(productId);
      setLoading(true);
      const response = await getProductCost(productId);
      setProductCost(response.data);
    } catch (err) {
      setError('Error calculando costo');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Visor de Costos</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Producto</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {products.map((product) => (
              <button
                key={product.Id}
                onClick={() => handleSelectProduct(product.Id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition ${
                  selectedProductId === product.Id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{product.Name}</div>
                <div className="text-sm text-gray-600">ID: {product.Id}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Costo */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Costo del Producto</h3>
          {productCost ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-2xl font-bold text-gray-900">{productCost.name}</h4>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-300">
                <p className="text-sm text-green-700 font-medium mb-2">COSTO TOTAL DEL PRODUCTO</p>
                <p className="text-4xl font-bold text-green-700">
                  ${productCost.totalCost.toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Número de Ingredientes</p>
                  <p className="text-2xl font-bold text-gray-900">{productCost.ingredientCount}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">ID del Producto</p>
                  <p className="text-2xl font-bold text-gray-900">{productCost.id}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Selecciona un producto para ver su costo</p>
          )}
        </div>
      </div>

      {products.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No hay productos disponibles.</p>
        </div>
      )}
    </div>
  );
};

export default ProductCostViewer;
