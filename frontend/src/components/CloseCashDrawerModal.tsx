import React, { useState, useEffect } from 'react';
import { closeCashSession, getCurrentCashSession } from '../services/api';

interface CloseCashDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cashSessionId: number | null;
}

interface CashSession {
  Id: number;
  OpeningAmount: number;
  Status: string;
  OpenedAt: string;
}

export const CloseCashDrawerModal: React.FC<CloseCashDrawerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  cashSessionId
}) => {
  const [closingAmount, setClosingAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState<CashSession | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    console.log('CloseCashDrawerModal - isOpen:', isOpen, 'cashSessionId:', cashSessionId, 'type:', typeof cashSessionId);
    if (isOpen && cashSessionId) {
      loadSessionData();
    }
  }, [isOpen, cashSessionId]);

  const loadSessionData = async () => {
    try {
      const response = await getCurrentCashSession();
      console.log('loadSessionData response:', response.data);
      setSession(response.data);
    } catch (err) {
      setError('Failed to load cash session data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('handleSubmit - cashSessionId:', cashSessionId, 'type:', typeof cashSessionId);

    try {
      const amount = parseFloat(closingAmount);
      if (isNaN(amount) || amount < 0) {
        setError('Please enter a valid amount');
        setLoading(false);
        return;
      }

      if (!cashSessionId) {
        console.error('ERROR: cashSessionId is null/undefined. Cannot close cash drawer.');
        const errorMsg = `No cash session found. cashSessionId=${cashSessionId}`;
        setError(errorMsg);
        setLoading(false);
        return;
      }

      console.log('Calling closeCashSession with:', { cashSessionId, amount, notes });
      const response = await closeCashSession(cashSessionId, amount, notes);
      console.log('closeCashSession response:', response.data);
      setResult(response.data);
      // Don't auto-close - let user click Accept button
    } catch (err) {
      setError('Failed to close cash drawer. ' + (err instanceof Error ? err.message : ''));
      setLoading(false);
    }
  };

  const handleResultAccept = () => {
    setClosingAmount('');
    setNotes('');
    setResult(null);
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🔐 Close Cash Drawer</h2>

        {result ? (
          // Show result
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${parseFloat(result.Difference) >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className="font-bold text-lg mb-4">Closing Summary</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Opening Amount:</span>
                  <span className="font-medium">${typeof result.OpeningAmount === 'number' ? result.OpeningAmount.toFixed(2) : parseFloat(String(result.OpeningAmount || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sales:</span>
                  <span className="font-medium">${typeof result.totalSales === 'number' ? result.totalSales.toFixed(2) : parseFloat(String(result.totalSales || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600">Expected Amount:</span>
                  <span className="font-medium">${typeof result.ExpectedAmount === 'number' ? result.ExpectedAmount.toFixed(2) : parseFloat(String(result.ExpectedAmount || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Actual Amount:</span>
                  <span className="font-medium">${typeof result.ClosingAmount === 'number' ? result.ClosingAmount.toFixed(2) : parseFloat(String(result.ClosingAmount || 0)).toFixed(2)}</span>
                </div>
                <div className={`flex justify-between border-t pt-2 mt-2 font-bold text-lg ${parseFloat(result.Difference) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  <span>Difference:</span>
                  <span>${typeof result.Difference === 'number' ? result.Difference.toFixed(2) : parseFloat(String(result.Difference || 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 text-center mt-4 bg-gray-50 p-3 rounded">
              ✅ Shift closed successfully!
            </div>

            <button
              onClick={handleResultAccept}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
            >
              ✓ Accept
            </button>
          </div>
        ) : (
          // Show form
          <form onSubmit={handleSubmit} className="space-y-4">
            {session && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Opening At:</span>
                    <span className="font-medium">
                      {session.OpenedAt ? new Date(session.OpenedAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Opening Amount:</span>
                    <span className="font-medium">
                      ${typeof session.OpeningAmount === 'number' ? session.OpeningAmount.toFixed(2) : parseFloat(String(session.OpeningAmount || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Closing Amount (Count)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
                placeholder="Enter actual amount counted"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any observations about this shift..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none h-20"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
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
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Closing...' : 'Close Drawer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
