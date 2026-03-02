import React, { useState } from 'react';
import { ArqueoDetail, getArqueoSaleDetail } from '../services/api';
import ArqueoSaleDetailModal from './ArqueoSaleDetailModal';

interface ArqueoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  arqueoDetail: ArqueoDetail;
}

export const ArqueoDetailModal: React.FC<ArqueoDetailModalProps> = ({
  isOpen,
  onClose,
  arqueoDetail
}) => {
  const [showSaleDetail, setShowSaleDetail] = useState(false);
  const [saleDetailData, setSaleDetailData] = useState<any>(null);

  if (!isOpen) return null;

  const formatCurrency = (value: number | null | undefined) => {
    const numValue = typeof value === 'number' ? value : 0;
    if (!Number.isFinite(numValue)) return '$0.00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(numValue);
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

  const handleViewSaleDetail = async (saleId: number) => {
    try {
      const response = await getArqueoSaleDetail(saleId);
      setSaleDetailData(response.data);
      setShowSaleDetail(true);
    } catch (error) {
      console.error('Error loading sale detail:', error);
    }
  };

  const handleCloseSaleDetail = () => {
    setShowSaleDetail(false);
    setSaleDetailData(null);
  };

  const { session, sales, profitability, paymentSummary, totalPaymentAmount, difference } = arqueoDetail;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-2xl font-bold text-white">📋 Detalle Arqueo Z</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-800 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Session Info */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-3 text-gray-800">📌 Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Usuario</p>
                  <p className="font-semibold text-gray-800">{session.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha Apertura</p>
                  <p className="font-semibold text-gray-800">{formatDate(session.openedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha Cierre</p>
                  <p className="font-semibold text-gray-800">{formatDate(session.closedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monto Inicial</p>
                  <p className="font-semibold text-gray-800">{formatCurrency(session.openingAmount)}</p>
                </div>
              </div>
              {session.notes && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-sm text-gray-600">Notas</p>
                  <p className="text-gray-800">{session.notes}</p>
                </div>
              )}
            </div>

            {/* Sales Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-3 text-gray-800">📊 Resumen de Ventas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p className="text-sm text-green-700">Ventas Completadas</p>
                  <p className="text-2xl font-bold text-green-800">{sales.completedCount}</p>
                  <p className="text-sm text-green-700 mt-1">{formatCurrency(sales.completedTotal)}</p>
                </div>
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <p className="text-sm text-red-700">Ventas Canceladas</p>
                  <p className="text-2xl font-bold text-red-800">{sales.cancelledCount}</p>
                  <p className="text-sm text-red-700 mt-1">{formatCurrency(sales.cancelledTotal)}</p>
                </div>
              </div>
            </div>

            {/* Payment Methods Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-3 text-gray-800">💳 Totalización por Método de Pago</h3>
              {paymentSummary.length === 0 ? (
                <p className="text-gray-600">No hay métodos de pago registrados</p>
              ) : (
                <div className="space-y-2">
                  {paymentSummary.map((method) => (
                    <div key={method.id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded">
                      <div>
                        <p className="font-semibold text-gray-800">{method.paymentMethod}</p>
                        <p className="text-sm text-gray-600">{method.transactionCount} transacción{method.transactionCount !== 1 ? 'es' : ''}</p>
                      </div>
                      <p className="font-bold text-gray-800">{formatCurrency(method.total)}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 bg-blue-50 border-2 border-blue-300 rounded mt-3">
                    <p className="font-bold text-gray-800">Total de Pagos</p>
                    <p className="text-lg font-bold text-blue-800">{formatCurrency(totalPaymentAmount)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Rentability Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
              <h3 className="text-lg font-bold mb-3 text-green-900">📈 Rentabilidad</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Total Ventas</p>
                  <p className="text-xl font-bold text-green-700">{formatCurrency(profitability.totalSales)}</p>
                </div>
                <div className="bg-white p-3 rounded border border-red-200">
                  <p className="text-xs text-gray-600 mb-1">Total Costos</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(profitability.totalCosts)}</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-300">
                  <p className="text-xs text-gray-600 mb-1">Ganancia Neta</p>
                  <p className={`text-xl font-bold ${profitability.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(profitability.netProfit)}
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Margen (%)</p>
                  <p className={`text-xl font-bold ${parseFloat(profitability.profitMargin as string) >= 20 ? 'text-blue-700' : 'text-orange-600'}`}>
                    {profitability.profitMargin}%
                  </p>
                </div>
              </div>
            </div>

            {/* Reconciliation */}
            <div className={`p-4 rounded-lg border-2 ${
              difference === 0 ? 'bg-green-50 border-green-300' :
              difference < 0 ? 'bg-red-50 border-red-300' :
              'bg-yellow-50 border-yellow-300'
            }`}>
              <h3 className="text-lg font-bold mb-3 text-gray-800">🔏 Conciliación</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Monto Esperado</p>
                  <p className="font-bold text-gray-800">{formatCurrency(session.expectedAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monto Real</p>
                  <p className="font-bold text-gray-800">{formatCurrency(session.closingAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Diferencia</p>
                  <p className={`text-2xl font-bold ${
                    difference === 0 ? 'text-green-800' :
                    difference < 0 ? 'text-red-800' :
                    'text-yellow-800'
                  }`}>
                    {formatCurrency(difference)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sales Table */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-3 text-gray-800">🧾 Ventas del Turno</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Nº Venta</th>
                      <th className="px-3 py-2 text-left font-semibold">Hora</th>
                      <th className="px-3 py-2 text-right font-semibold">Total</th>
                      <th className="px-3 py-2 text-center font-semibold">Estado</th>
                      <th className="px-3 py-2 text-left font-semibold">Forma de Pago</th>
                      <th className="px-3 py-2 text-center font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.completed.map((sale) => (
                      <tr key={sale.id} className="border-b border-gray-300 bg-white hover:bg-gray-100">
                        <td className="px-3 py-2 font-medium text-gray-800">{sale.saleNumber}</td>
                        <td className="px-3 py-2 text-gray-700">
                          {new Date(sale.createdAt).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-800">
                          {formatCurrency(sale.totalAmount)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                            COMPLETADA
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-700 text-xs">{sale.paymentMethods}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => handleViewSaleDetail(sale.id)}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                    {sales.cancelled.map((sale) => (
                      <tr key={sale.id} className="border-b border-gray-300 bg-red-50 hover:bg-red-100">
                        <td className="px-3 py-2 font-medium text-gray-800">{sale.saleNumber}</td>
                        <td className="px-3 py-2 text-gray-700">
                          {new Date(sale.createdAt).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-red-800">
                          {formatCurrency(sale.totalAmount)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-semibold">
                            CANCELADA
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-700 text-xs">{sale.paymentMethods}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => handleViewSaleDetail(sale.id)}
                            className="text-red-600 hover:text-red-800 font-semibold text-xs"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

      {/* Sale Detail Modal */}
      {showSaleDetail && saleDetailData && (
        <ArqueoSaleDetailModal
          isOpen={showSaleDetail}
          onClose={handleCloseSaleDetail}
          saleDetail={saleDetailData}
          isClosed={session.status === 'CLOSED'}
        />
      )}
    </>
  );
};

export default ArqueoDetailModal;
