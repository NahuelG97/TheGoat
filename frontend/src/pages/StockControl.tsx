import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StockMovementModal from '../components/StockMovementModal';

interface Ingredient {
  Id: number;
  Name: string;
  Unit: string;
  CostPerUnit: number;
  CurrentStock: number;
  MinimumStock: number;
}

export const StockControl: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [editingMinimum, setEditingMinimum] = useState<number | null>(null);
  const [newMinimum, setNewMinimum] = useState('');

  // Load ingredients with stock
  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stock');
      setIngredients(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar stock');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedIngredient(null);
  };

  const handleMovement = async (
    movementType: 'IN' | 'OUT',
    quantity: number,
    notes: string
  ) => {
    if (!selectedIngredient) return;

    try {
      const response = await api.post(`/stock/${selectedIngredient.Id}/movement`, {
        movementType,
        quantity,
        notes,
      });

      // Update local state
      const updatedStock = response.data.stock;
      setIngredients((prev) =>
        prev.map((ing) =>
          ing.Id === selectedIngredient.Id
            ? {
                ...ing,
                CurrentStock: updatedStock.CurrentStock,
                MinimumStock: updatedStock.MinimumStock,
              }
            : ing
        )
      );
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || 'Error al procesar movimiento de stock'
      );
    }
  };

  const handleUpdateMinimum = async (ingredientId: number) => {
    if (!newMinimum || parseFloat(newMinimum) < 0) {
      setError('El stock mínimo debe ser válido');
      return;
    }

    try {
      const response = await api.put(`/stock/${ingredientId}/minimum`, {
        minimumStock: parseFloat(newMinimum),
      });

      // Update local state
      setIngredients((prev) =>
        prev.map((ing) =>
          ing.Id === ingredientId
            ? { ...ing, MinimumStock: response.data.MinimumStock }
            : ing
        )
      );

      setEditingMinimum(null);
      setNewMinimum('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar stock mínimo');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📦 Control de Stock</h1>
          <p className="text-gray-600 mt-1">Gestiona el inventario de ingredientes</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total de ingredientes</p>
          <p className="text-2xl font-bold text-orange-600">{ingredients.length}</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Ingrediente
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Unidad
                </th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Stock Mínimo
                </th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ingredients.map((ingredient) => {
                const isLowStock = ingredient.CurrentStock <= ingredient.MinimumStock;
                return (
                  <tr
                    key={ingredient.Id}
                    className={`transition ${
                      isLowStock ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Name */}
                    <td className="px-4 sm:px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{ingredient.Name}</p>
                        <p className="text-xs text-gray-500">
                          ${ingredient.CostPerUnit.toFixed(2)} por {ingredient.Unit}
                        </p>
                      </div>
                    </td>

                    {/* Unit */}
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                      {ingredient.Unit}
                    </td>

                    {/* Current Stock */}
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <span
                        className={`text-sm font-semibold ${
                          isLowStock ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {Math.round(ingredient.CurrentStock)}
                      </span>
                    </td>

                    {/* Minimum Stock */}
                    <td className="px-4 sm:px-6 py-4 text-center">
                      {editingMinimum === ingredient.Id ? (
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={newMinimum}
                            onChange={(e) => setNewMinimum(e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={() => handleUpdateMinimum(ingredient.Id)}
                            className="text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingMinimum(null)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingMinimum(ingredient.Id);
                            setNewMinimum(ingredient.MinimumStock.toString());
                          }}
                          className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
                        >
                          {Math.round(ingredient.MinimumStock)}
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleOpenModal(ingredient)}
                          className="px-3 py-2 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition"
                        >
                          Ajustar Stock
                        </button>
                        {isLowStock && (
                          <span className="px-3 py-2 bg-red-100 text-red-700 text-xs font-semibold rounded">
                            ⚠️ Bajo
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {ingredients.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No hay ingredientes registrados</p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Haz clic en el stock mínimo para editarlo. Cuando el stock actual sea
          menor o igual al mínimo, la fila se resaltará en rojo.
        </p>
      </div>

      {/* Stock Movement Modal */}
      {selectedIngredient && (
        <StockMovementModal
          isOpen={modalOpen}
          ingredientId={selectedIngredient.Id}
          ingredientName={selectedIngredient.Name}
          currentStock={selectedIngredient.CurrentStock}
          onClose={handleCloseModal}
          onSubmit={handleMovement}
        />
      )}
    </div>
  );
};

export default StockControl;
