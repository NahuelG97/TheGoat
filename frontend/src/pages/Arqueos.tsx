import React, { useState, useEffect } from 'react';
import { getArqueosList, getArqueoDetail, ArqueoSession, ArqueoDetail } from '../services/api';
import ArqueoDetailModal from '../components/ArqueoDetailModal';

export const Arqueos: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [arqueos, setArqueos] = useState<ArqueoSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [arqueoDetail, setArqueoDetail] = useState<ArqueoDetail | null>(null);

  // Load arqueos for selected date
  useEffect(() => {
    loadArqueos();
  }, [selectedDate]);

  const loadArqueos = async () => {
    try {
      setLoading(true);
      setError('');
      const results = await getArqueosList(selectedDate);
      setArqueos(results.data);
    } catch (err) {
      console.error('Error loading arqueos:', err);
      setError('Error loading arqueos');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (arqueoId: number) => {
    try {
      setLoading(true);
      const detail = await getArqueoDetail(arqueoId);
      setArqueoDetail(detail.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error loading arqueo detail:', err);
      setError('Error loading arqueo detail');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setArqueoDetail(null);
  };

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

  const getDifferenceBg = (difference: number) => {
    if (difference === 0) return 'bg-green-100';
    if (difference < 0) return 'bg-red-100';
    return 'bg-yellow-100';
  };

  const getDifferenceText = (difference: number) => {
    if (difference === 0) return 'text-green-800';
    if (difference < 0) return 'text-red-800';
    return 'text-yellow-800';
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📊 Arqueos</h1>

      {/* Date Filter */}
      <div className="mb-6 flex items-center gap-4">
        <label className="font-semibold text-gray-700">Filtrar por fecha:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando arqueos...</p>
        </div>
      )}

      {/* Arqueos Table */}
      {!loading && arqueos.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No hay cierres Z registrados para esta fecha</p>
        </div>
      )}

      {!loading && arqueos.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Turno</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Usuario</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Apertura</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cierre</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Ventas</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Diferencia</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {arqueos.map((arqueo, index) => (
                <tr key={arqueo.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-gray-800">{index + 1}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{arqueo.username}</td>
                  <td className="px-4 py-3 text-gray-700 text-sm">
                    {formatDate(arqueo.openedAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm">
                    {formatDate(arqueo.closedAt)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-800 font-medium">
                    <div className="text-green-700">{formatCurrency(arqueo.completedSalesTotal)}</div>
                    {arqueo.cancelledSalesTotal > 0 && (
                      <div className="text-red-600 text-sm">
                        -{formatCurrency(arqueo.cancelledSalesTotal)}
                      </div>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${getDifferenceText(arqueo.difference)} ${getDifferenceBg(arqueo.difference)}`}>
                    {formatCurrency(arqueo.difference)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleViewDetail(arqueo.id)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition"
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {arqueoDetail && (
        <ArqueoDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseModal}
          arqueoDetail={arqueoDetail}
        />
      )}
    </div>
  );
};

export default Arqueos;
