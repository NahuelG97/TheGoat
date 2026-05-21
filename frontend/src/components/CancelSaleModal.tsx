import React, { useState } from 'react';
import { cancelSale } from '../services/api';

interface CancelSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  saleId: number;
  saleNumber: string;
}

export const CancelSaleModal: React.FC<CancelSaleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  saleId,
  saleNumber
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reason.trim()) {
      setError('Se requiere una razón para cancelar una venta');
      return;
    }

    try {
      setLoading(true);
      await cancelSale(saleId, reason);
      setReason('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cancelar venta');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Cancelar Venta</h2>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            Estás a punto de cancelar la venta <span className="font-bold">{saleNumber}</span>
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Esta venta será marcada como cancelada y excluida de tu auditoría de caja.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón de Cancelación (Requerida)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explica por qué se esta cancelando esta venta..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none h-24"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              disabled={loading}
            >
              No Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50"
            >
              {loading ? 'Cancelando...' : '🗑️ Cancelar Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
