import React, { useEffect, useState } from 'react';
import api, { SalePayment, getSalePayments } from '../services/api';
import { EditSaleModal } from './EditSaleModal';
import { CancelSaleModal } from './CancelSaleModal';

interface SaleItem {
  Id: number;
  ProductId: number;
  ProductName: string;
  Quantity: number;
  UnitPrice: number;
  Subtotal: number;
  Notes: string;
}

interface SaleDetail {
  Id: number;
  SaleNumber: string;
  TotalAmount: number;
  Status: string;
  CreatedAt: string;
  items: SaleItem[];
}

interface SaleDetailsModalProps {
  isOpen: boolean;
  saleId: number | null;
  onClose: () => void;
}

const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({
  isOpen,
  saleId,
  onClose,
}) => {
  const [saleDetail, setSaleDetail] = useState<SaleDetail | null>(null);
  const [payments, setPayments] = useState<SalePayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (isOpen && saleId) {
      loadSaleDetail();
    }
  }, [isOpen, saleId]);

  const loadSaleDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/sales/${saleId}`);
      setSaleDetail(response.data);
      
      // Load payments for this sale
      const paymentsResponse = await getSalePayments(saleId!);
      setPayments(paymentsResponse.data || []);
    } catch (err: any) {
      setError('Error cargando detalles de la venta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Detalles de Venta</h2>
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
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : saleDetail ? (
            <>
              {/* Sale Header Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Venta:</span>
                  <span className="font-medium text-gray-900">{saleDetail.SaleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="font-medium">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      {saleDetail.Status}
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(saleDetail.CreatedAt).toLocaleDateString()} {new Date(saleDetail.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Items</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                          Producto
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-gray-700">
                          Cantidad
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-gray-700">
                          P. Unitario
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-gray-700">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {saleDetail.items.map((item) => (
                        <React.Fragment key={item.Id}>
                          <tr>
                            <td className="px-3 py-2 text-gray-900">{item.ProductName}</td>
                            <td className="px-3 py-2 text-center text-gray-900">
                              {item.Quantity}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-900">
                              ${Number(item.UnitPrice).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-900 font-medium">
                              ${Number(item.Subtotal).toFixed(2)}
                            </td>
                          </tr>
                          {item.Notes && (
                            <tr className="bg-blue-50">
                              <td colSpan={4} className="px-3 py-2 text-sm text-blue-700">
                                <span className="font-medium">Notas:</span> {item.Notes}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Método de Pago</h3>
                <div className="bg-blue-50 rounded-lg overflow-hidden">
                  {payments.length > 0 ? (
                    <div className="space-y-2 p-4">
                      {payments.map((payment) => (
                        <div key={payment.Id} className="flex justify-between items-center">
                          <span className="text-gray-700">{payment.Name}</span>
                          <span className="font-medium text-gray-900">
                            ${Number(payment.Amount).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-gray-600">Sin métodos de pago registrados</div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${Number(saleDetail.TotalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 space-y-2">
          {saleDetail && saleDetail.Status === 'COMPLETED' && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
              >
                ✏️ Editar
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                ✕ Cancelar
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition"
          >
            Cerrar
          </button>
        </div>

        {/* Edit Sale Modal */}
        {saleDetail && (
          <EditSaleModal
            isOpen={showEditModal}
            saleId={saleDetail.Id}
            saleNumber={saleDetail.SaleNumber}
            items={saleDetail.items.map((item) => ({
              productId: item.ProductId,
              productName: item.ProductName,
              quantity: item.Quantity,
              unitPrice: item.UnitPrice,
              subtotal: item.Subtotal,
              notes: item.Notes,
            }))}
            payments={payments}
            totalAmount={saleDetail.TotalAmount}
            onClose={() => setShowEditModal(false)}
            onSuccess={() => {
              setShowEditModal(false);
              loadSaleDetail();
            }}
          />
        )}

        {/* Cancel Sale Modal */}
        {saleDetail && (
          <CancelSaleModal
            isOpen={showCancelModal}
            saleNumber={saleDetail.SaleNumber}
            saleId={saleDetail.Id}
            onClose={() => setShowCancelModal(false)}
            onSuccess={() => {
              setShowCancelModal(false);
              loadSaleDetail();
            }}
          />
        )}
      </div>
    </div>
  );
};

export { SaleDetailsModal };
