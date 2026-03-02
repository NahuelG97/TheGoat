import React from 'react';

interface SaleItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes: string;
}

interface SalePayment {
  id: number;
  paymentMethodId: number;
  paymentMethodName: string;
  amount: number;
}

interface ArqueoSaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleDetail: {
    id: number;
    saleNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    cashSessionStatus: string;
    isClosed: boolean;
    items: SaleItem[];
    payments: SalePayment[];
  };
  isClosed: boolean;
}

export const ArqueoSaleDetailModal: React.FC<ArqueoSaleDetailModalProps> = ({
  isOpen,
  onClose,
  saleDetail,
  isClosed
}) => {
  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    if (saleDetail.status === 'COMPLETED') {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
          ✓ COMPLETADA
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
        ✕ CANCELADA
      </span>
    );
  };

  const getSessionStatusBadge = () => {
    if (isClosed) {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
          🔒 SESIÓN CERRADA
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
        🔓 SESIÓN ABIERTA
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-white">🧾 Detalle de Venta</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-full w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sale Header Info */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-600">Número de Venta</p>
                <p className="text-2xl font-bold text-gray-800">{saleDetail.saleNumber}</p>
              </div>
              <div className="flex flex-col gap-2">
                {getStatusBadge()}
                {getSessionStatusBadge()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Fecha y Hora</p>
                <p className="font-semibold text-gray-800">{formatDate(saleDetail.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-bold text-lg text-gray-800">{formatCurrency(saleDetail.totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Warning if session is closed */}
          {isClosed && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-800 font-semibold">ℹ️ Esta venta pertenece a una sesión cerrada</p>
              <p className="text-blue-700 text-sm mt-1">No se pueden hacer cambios en ventas de sesiones cerradas.</p>
            </div>
          )}

          {/* Sale Items */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold mb-3 text-gray-800">📦 Artículos</h3>
            {saleDetail.items.length === 0 ? (
              <p className="text-gray-600">No hay artículos registrados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Producto</th>
                      <th className="px-3 py-2 text-center font-semibold">Cantidad</th>
                      <th className="px-3 py-2 text-right font-semibold">Precio Unit.</th>
                      <th className="px-3 py-2 text-right font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saleDetail.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-300 bg-white hover:bg-gray-100">
                        <td className="px-3 py-2 text-gray-800">
                          <p className="font-semibold">{item.productName}</p>
                          {item.notes && <p className="text-xs text-gray-600 mt-1">{item.notes}</p>}
                        </td>
                        <td className="px-3 py-2 text-center text-gray-800">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-gray-800">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-800">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payments */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold mb-3 text-gray-800">💳 Métodos de Pago</h3>
            {saleDetail.payments.length === 0 ? (
              <p className="text-gray-600">No hay métodos de pago registrados</p>
            ) : (
              <div className="space-y-2">
                {saleDetail.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded">
                    <p className="font-semibold text-gray-800">{payment.paymentMethodName}</p>
                    <p className="font-bold text-gray-800">{formatCurrency(payment.amount)}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-blue-50 border-2 border-blue-300 rounded mt-3">
                  <p className="font-bold text-gray-800">Total Pagado</p>
                  <p className="text-lg font-bold text-blue-800">
                    {formatCurrency(saleDetail.payments.reduce((sum, p) => sum + p.amount, 0))}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Read-only Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-yellow-800 font-semibold">👁️ Vista de Solo Lectura</p>
            <p className="text-yellow-700 text-sm mt-1">Los datos mostrados son históricos y no pueden ser modificados.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 border-t flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArqueoSaleDetailModal;
