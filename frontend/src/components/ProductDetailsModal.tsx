import React, { useEffect, useState } from 'react';
import { getProduct, updateProductPrice, Product, ProductIngredient } from '../services/api';

interface ProductDetailsModalProps {
  isOpen: boolean;
  productId: number | null;
  onClose: () => void;
  onSave: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  productId,
  onClose,
  onSave,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [price, setPrice] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && productId) {
      loadProduct();
    }
  }, [isOpen, productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getProduct(productId!);
      setProduct(response.data);
      setPrice(response.data.Price?.toString() || '0');
    } catch (err) {
      setError('Error cargando detalles del producto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const priceValue = parseFloat(price);

      if (isNaN(priceValue) || priceValue < 0) {
        setError('El precio debe ser un número válido positivo');
        return;
      }

      await updateProductPrice(productId!, priceValue);
      onSave();
      onClose();
    } catch (err) {
      setError('Error guardando cambios');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Detalles del Producto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 mt-2">Cargando...</p>
            </div>
          ) : product ? (
            <>
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto
                </label>
                <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-900 font-medium">
                  {product.Name}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredientes ({product.ingredients?.length || 0})
                </label>
                {product.ingredients && product.ingredients.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">
                            Ingrediente
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-gray-700">
                            Cantidad
                          </th>
                          <th className="px-3 py-2 text-center font-medium text-gray-700">
                            Unidad
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {product.ingredients.map((ing) => (
                          <tr key={ing.Id}>
                            <td className="px-3 py-2 text-gray-900">{ing.Name}</td>
                            <td className="px-3 py-2 text-right text-gray-900">
                              {parseFloat(ing.Quantity.toString()).toFixed(3)}
                            </td>
                            <td className="px-3 py-2 text-center text-gray-900">
                              {ing.Unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm">
                    Sin ingredientes asignados
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Venta ($)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="0.00"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Producto no encontrado
            </div>
          )}
        </div>

        {/* Footer */}
        {product && !loading && (
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsModal;
