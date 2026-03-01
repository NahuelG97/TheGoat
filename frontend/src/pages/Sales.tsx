import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Product {
  Id: number;
  Name: string;
}

interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Sale {
  Id: number;
  SaleNumber: string;
  TotalAmount: number;
  Status: string;
  CreatedAt: string;
}

export const Sales: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sales, setSales] = useState<Sale[]>([]);
  const [showSalesHistory, setShowSalesHistory] = useState(false);

  // Load products
  useEffect(() => {
    loadProducts();
    loadSales();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar productos');
    }
  };

  const loadSales = async () => {
    try {
      const response = await api.get('/sales');
      setSales(response.data);
    } catch (err: any) {
      console.error('Error loading sales:', err);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedProductId || !quantity || parseInt(quantity) <= 0) {
      setError('Selecciona un producto y una cantidad válida');
      return;
    }

    try {
      // Get product cost
      const response = await api.get(`/recipes/${selectedProductId}/cost`);
      const unitPrice = response.data.totalCost || 0;

      const newItem: SaleItem = {
        productId: selectedProductId as number,
        productName:
          products.find((p) => p.Id === selectedProductId)?.Name || 'Producto',
        quantity: parseInt(quantity),
        unitPrice: unitPrice,
        subtotal: unitPrice * parseInt(quantity),
      };

      setSaleItems([...saleItems, newItem]);
      setSelectedProductId('');
      setQuantity('1');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al obtener costo del producto');
    }
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleRegisterSale = async () => {
    setError('');
    setSuccess('');

    if (saleItems.length === 0) {
      setError('Debes agregar al menos un producto');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/sales', {
        items: saleItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        notes: notes,
      });

      setSuccess(
        `¡Venta registrada! Número: ${response.data.sale.SaleNumber}`
      );
      setSaleItems([]);
      setNotes('');
      await loadSales();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar venta');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = saleItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Ventas</h1>
          <p className="text-gray-600 mt-1">Registra y gestiona ventas de productos</p>
        </div>
        <button
          onClick={() => setShowSalesHistory(!showSalesHistory)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
        >
          {showSalesHistory ? 'Ver Nueva Venta' : 'Ver Historial'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          ✓ {success}
        </div>
      )}

      {showSalesHistory ? (
        // Sales History Section
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Número
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Total
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Estado
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sales.map((sale) => (
                  <tr key={sale.Id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 font-medium text-gray-900">
                      {sale.SaleNumber}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-green-600 font-semibold">
                      ${sale.TotalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        {sale.Status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                      {new Date(sale.CreatedAt).toLocaleDateString()} {new Date(sale.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sales.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">No hay ventas registradas</p>
            </div>
          )}
        </div>
      ) : (
        // New Sale Section
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Nueva Venta</h2>

            <form onSubmit={handleAddItem} className="space-y-4">
              {/* Product Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Producto
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Selecciona un producto...</option>
                  {products.map((product) => (
                    <option key={product.Id} value={product.Id}>
                      {product.Name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Add Button */}
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
              >
                + Agregar Producto
              </button>
            </form>

            {/* Notes */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Descuento especial, cliente VIP, etc."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Cart Summary */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Resumen</h2>

            {/* Items */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {saleItems.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay productos agregados</p>
              ) : (
                saleItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg space-y-1"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.quantity} x ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-right font-semibold text-green-600">
                      ${item.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleRegisterSale}
                disabled={loading || saleItems.length === 0}
                className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : '💾 Registrar Venta'}
              </button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
              <p>
                <strong>ℹ️</strong> La venta descargará automáticamente los ingredientes del stock.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
