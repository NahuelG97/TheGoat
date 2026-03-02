import React, { useState } from 'react';
import { openCashSession } from '../services/api';

interface CashDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CashDrawerModal: React.FC<CashDrawerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [openingAmount, setOpeningAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const amount = parseFloat(openingAmount);
      if (isNaN(amount) || amount < 0) {
        setError('Please enter a valid amount');
        setLoading(false);
        return;
      }

      await openCashSession(amount);
      setOpeningAmount('');
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to open cash drawer. ' + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">💰 Open Cash Drawer</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opening Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={openingAmount}
              onChange={(e) => setOpeningAmount(e.target.value)}
              placeholder="Enter opening amount"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Opening...' : 'Open Drawer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
