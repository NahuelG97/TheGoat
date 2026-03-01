import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, deleteProduct, Product } from '../services/api';
import ProductDetailsModal from './ProductDetailsModal';

const ProductsManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [error, setError] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getProducts();
      setProducts(response.data);
    } catch (err) {
      setError('Error cargando productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const price = productPrice ? parseFloat(productPrice) : 0;

      if (isNaN(price) || price < 0) {
        setError('El precio debe ser un número válido positivo');
        return;
      }

      await createProduct({ name: productName, price });
      setProductName('');
      setProductPrice('');
      setShowForm(false);
      await loadProducts();
    } catch (err) {
      setError('Error creando producto');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleting(true);
      setError('');
      await deleteProduct(id);
      setDeleteConfirm(null);
      await loadProducts();
    } catch (err) {
      setError('Error eliminando producto');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleViewDetails = (id: number) => {
    setSelectedProductId(id);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedProductId(null);
  };

  const handleModalSave = () => {
    loadProducts();
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
            setProductPrice('');
            setError('');
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Producto
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="ej: Lomito, Pizza, Hamburguesa"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio de Venta ($)
              </label>
              <input
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="0.00"
              />
            </div>
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
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex flex-col relative"
          >
            {/* Delete Confirmation */}
            {deleteConfirm === product.Id && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex flex-col items-center justify-center z-10 p-4">
                <div className="bg-white rounded-lg p-6 text-center space-y-4">
                  <p className="font-medium text-gray-900">
                    ¿Eliminar producto "{product.Name}"?
                  </p>
                  <p className="text-sm text-gray-600">Esta acción no se puede deshacer.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition"
                      disabled={deleting}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleDelete(product.Id)}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition disabled:opacity-50"
                      disabled={deleting}
                    >
                      {deleting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Card Content */}
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{product.Name}</h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ingredientes:</span>
                  <span className="font-medium text-gray-900">{product.ingredientCount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Precio de Venta:</span>
                  <span className="font-medium text-gray-900">
                    ${Number(product.Price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => handleViewDetails(product.Id)}
                className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition"
              >
                Ver Detalles
              </button>
              <button
                onClick={() => setDeleteConfirm(product.Id)}
                className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No hay productos creados. Crea uno para empezar.</p>
        </div>
      )}

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={showModal}
        productId={selectedProductId}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </div>
  );
};

export default ProductsManager;
