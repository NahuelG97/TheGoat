import React, { useState } from 'react';

interface StockMovementModalProps {
  isOpen: boolean;
  ingredientId: number;
  ingredientName: string;
  currentStock: number;
  onClose: () => void;
  onSubmit: (movementType: 'IN' | 'OUT', quantity: number, notes: string) => Promise<void>;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  ingredientId,
  ingredientName,
  currentStock,
  onClose,
  onSubmit,
}) => {
  const [quantity, setQuantity] = useState('');
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!quantity || parseFloat(quantity) <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (movementType === 'OUT' && parseFloat(quantity) > currentStock) {
      setError(`No hay suficiente stock. Stock actual: ${currentStock}`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(movementType, parseFloat(quantity), notes);
      // Reset form
      setQuantity('');
      setMovementType('IN');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al procesar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-bold">Movimiento de Stock</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ingredient Info */}
            <div>
              <p className="text-sm text-gray-600">Ingrediente</p>
              <p className="text-lg font-semibold text-gray-900">{ingredientName}</p>
              <p className="text-sm text-gray-500 mt-1">Stock actual: {Math.round(currentStock)}</p>
            </div>

            {/* Movement Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Movimiento
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="IN"
                    checked={movementType === 'IN'}
                    onChange={(e) => setMovementType(e.target.value as 'IN' | 'OUT')}
                    className="w-4 h-4 text-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">📥 Entrada</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="OUT"
                    checked={movementType === 'OUT'}
                    onChange={(e) => setMovementType(e.target.value as 'IN' | 'OUT')}
                    className="w-4 h-4 text-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">📤 Salida</span>
                </label>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ingrese cantidad"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Falta de stock, devolución, etc."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition ${
                  movementType === 'IN'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                } disabled:opacity-50`}
              >
                {loading ? 'Procesando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockMovementModal;
