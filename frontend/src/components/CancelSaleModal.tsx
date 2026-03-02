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
      setError('Reason is required to cancel a sale');
      return;
    }

    try {
      setLoading(true);
      await cancelSale(saleId, reason);
      setReason('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error canceling sale');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Cancel Sale</h2>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            You are about to cancel sale <span className="font-bold">{saleNumber}</span>
          </p>
          <p className="text-xs text-gray-600 mt-2">
            This sale will be marked as canceled and excluded from your cash drawer audit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Cancellation (Required)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this sale is being canceled..."
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
              Don't Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50"
            >
              {loading ? 'Canceling...' : '🗑️ Cancel Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
