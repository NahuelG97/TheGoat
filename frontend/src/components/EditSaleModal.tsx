import React, { useState, useEffect } from 'react';
import { editSale, SalePayment, getPaymentMethods, PaymentMethod } from '../services/api';

interface EditSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  saleId: number;
  saleNumber: string;
  items: any[];
  payments: SalePayment[];
  totalAmount: number;
}

interface PaymentInput {
  paymentMethodId: number;
  amount: number;
}

export const EditSaleModal: React.FC<EditSaleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  saleId,
  saleNumber,
  items: initialItems,
  payments: initialPayments,
  totalAmount: initialTotalAmount
}) => {
  const [items, setItems] = useState(initialItems || []);
  const [payments, setPayments] = useState<PaymentInput[]>(
    (initialPayments || []).map(p => ({
      paymentMethodId: p.PaymentMethodId,
      amount: p.Amount
    }))
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && getPaymentMethods) {
      loadPaymentMethods();
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    try {
      const methodsRes = await getPaymentMethods();
      setPaymentMethods(methodsRes.data || []);
    } catch (err) {
      console.error('Error loading payment methods:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reason.trim()) {
      setError('Reason is required for editing');
      return;
    }

    if (payments.length === 0) {
      setError('At least one payment method is required');
      return;
    }

    // Validate payments add up to total
    const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const newTotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    
    if (Math.abs(totalPaid - newTotal) > 0.01) {
      setError(`Payments ($${totalPaid.toFixed(2)}) must equal total ($${newTotal.toFixed(2)})`);
      return;
    }

    try {
      setLoading(true);
      await editSale(saleId, items, payments, reason);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error editing sale');
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updatePayment = (index: number, paymentMethodId: number) => {
    const newPayments = [...payments];
    newPayments[index].paymentMethodId = paymentMethodId;
    setPayments(newPayments);
  };

  const updatePaymentAmount = (index: number, amount: number) => {
    const newPayments = [...payments];
    newPayments[index].amount = amount;
    setPayments(newPayments);
  };

  const addPaymentMethod = () => {
    setPayments([...payments, { paymentMethodId: paymentMethods[0]?.Id || 0, amount: 0 }]);
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  const newTotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
  const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const paymentsBalance = Math.abs(totalPaid - newTotal);
  const isValid = paymentsBalance < 0.01;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">✏️ Edit Sale</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Items Section */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Items</h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end bg-gray-50 p-3 rounded">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Product</label>
                    <input
                      type="text"
                      value={item.productName}
                      disabled
                      className="w-full px-2 py-2 border border-gray-300 rounded bg-gray-100 text-sm"
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-xs text-gray-600 mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-gray-600 mb-1">Unit Price</label>
                    <input
                      type="text"
                      value={`$${item.unitPrice.toFixed(2)}`}
                      disabled
                      className="w-full px-2 py-2 border border-gray-300 rounded bg-gray-100 text-sm"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-gray-600 mb-1">Subtotal</label>
                    <input
                      type="text"
                      value={`$${(item.quantity * item.unitPrice).toFixed(2)}`}
                      disabled
                      className="w-full px-2 py-2 border border-gray-300 rounded bg-gray-100 text-sm font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="px-2 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payments Section */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">💳 Payment Methods</h3>
              <button
                type="button"
                onClick={addPaymentMethod}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
              >
                + Add
              </button>
            </div>
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Method</label>
                    <select
                      value={payment.paymentMethodId}
                      onChange={(e) => updatePayment(index, parseInt(e.target.value))}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {paymentMethods.map(method => (
                        <option key={method.Id} value={method.Id}>
                          {method.Name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={payment.amount}
                      onChange={(e) => updatePaymentAmount(index, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePayment(index)}
                    className="px-2 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t mt-4 pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">${newTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid:</span>
                <span className="font-semibold">${totalPaid.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                <span>Balance:</span>
                <span>${(totalPaid - newTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Edit (Required)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this sale is being edited..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
              required
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
              disabled={loading || !isValid}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : '✓ Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
