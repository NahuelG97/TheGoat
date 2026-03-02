import React, { useState, useEffect } from 'react';
import { getPaymentMethods, PaymentMethod } from '../services/api';

interface PaymentSelection {
  paymentMethodId: number;
  amount: number;
}

interface PaymentSelectorProps {
  totalAmount: number;
  onChange: (payments: PaymentSelection[]) => void;
  disabled?: boolean;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  totalAmount,
  onChange,
  disabled = false
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [payments, setPayments] = useState<PaymentSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await getPaymentMethods();
      setPaymentMethods(response.data || []);
    } catch (err) {
      console.error('Error loading payment methods:', err);
      setError('Error loading payment methods');
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = () => {
    const newPayment: PaymentSelection = {
      paymentMethodId: paymentMethods[0]?.Id || 0,
      amount: 0
    };
    const newPayments = [...payments, newPayment];
    setPayments(newPayments);
    onChange(newPayments);
  };

  const updatePaymentMethod = (index: number, paymentMethodId: number) => {
    const newPayments = [...payments];
    newPayments[index].paymentMethodId = paymentMethodId;
    setPayments(newPayments);
    onChange(newPayments);
  };

  const updatePaymentAmount = (index: number, amount: number) => {
    const newPayments = [...payments];
    newPayments[index].amount = amount;
    setPayments(newPayments);
    onChange(newPayments);
  };

  const removePaymentMethod = (index: number) => {
    const newPayments = payments.filter((_, i) => i !== index);
    setPayments(newPayments);
    onChange(newPayments);
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const difference = totalAmount - totalPaid;
  const isValid = Math.abs(difference) < 0.01; // Allow for floating point errors

  const getMethodName = (methodId: number) => {
    return paymentMethods.find(m => m.Id === methodId)?.Name || 'Unknown';
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">💳 Payment Methods</h3>
        <button
          type="button"
          onClick={addPaymentMethod}
          disabled={disabled || paymentMethods.length === 0}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 transition"
        >
          + Add Method
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500">Loading payment methods...</div>
      ) : (
        <>
          {payments.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              Select at least one payment method
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">
                      Method
                    </label>
                    <select
                      value={payment.paymentMethodId}
                      onChange={(e) => updatePaymentMethod(index, parseInt(e.target.value))}
                      disabled={disabled}
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
                    <label className="block text-xs text-gray-600 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={payment.amount}
                      onChange={(e) => updatePaymentAmount(index, parseFloat(e.target.value) || 0)}
                      disabled={disabled}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePaymentMethod(index)}
                    disabled={disabled}
                    className="px-2 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sale Total:</span>
              <span className="font-semibold">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Paid:</span>
              <span className="font-semibold">${totalPaid.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              <span>Difference:</span>
              <span>${difference.toFixed(2)}</span>
            </div>
          </div>

          {!isValid && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              ⚠️ Payment total must equal sale total ({difference > 0 ? `add $${Math.abs(difference).toFixed(2)}` : `remove $${Math.abs(difference).toFixed(2)}`})
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentSelector;
