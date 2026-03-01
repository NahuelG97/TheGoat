import React, { useEffect, useState } from 'react';
import { getIngredients, createIngredient, updateIngredient, Ingredient } from '../services/api';

const IngredientsManager: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    Name: '',
    Unit: 'kg',
    CostPerUnit: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const response = await getIngredients();
      setIngredients(response.data);
    } catch (err) {
      setError('Error cargando ingredientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = {
        name: formData.Name,
        unit: formData.Unit,
        costPerUnit: parseFloat(formData.CostPerUnit),
      };
      
      if (editingId) {
        await updateIngredient(editingId, data as any);
      } else {
        await createIngredient(data as any);
      }
      setFormData({ Name: '', Unit: 'kg', CostPerUnit: '' });
      setEditingId(null);
      setShowForm(false);
      await loadIngredients();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || 'Error guardando ingrediente';
      setError(errorMsg);
      console.error('Error:', err);
    }
  };

  const handleEdit = (ingredient: Ingredient) => {
    setFormData({
      Name: ingredient.Name,
      Unit: ingredient.Unit,
      CostPerUnit: ingredient.CostPerUnit.toString(),
    });
    setEditingId(ingredient.Id);
    setShowForm(true);
  };

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Ingredientes</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) setEditingId(null);
            setFormData({ Name: '', Unit: 'kg', CostPerUnit: '' });
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Ingrediente'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                value={formData.Name}
                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unidad</label>
              <select
                value={formData.Unit}
                onChange={(e) => setFormData({ ...formData, Unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="unit">unit</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Costo Unitario</label>
              <input
                type="number"
                step="0.01"
                value={formData.CostPerUnit}
                onChange={(e) => setFormData({ ...formData, CostPerUnit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            {editingId ? 'Actualizar' : 'Crear'} Ingrediente
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Unidad</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Costo Unitario</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ingredients.map((ingredient) => (
              <tr key={ingredient.Id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-900">{ingredient.Name}</td>
                <td className="px-6 py-3 text-gray-900">{ingredient.Unit}</td>
                <td className="px-6 py-3 text-right text-gray-900">
                  ${ingredient.CostPerUnit.toFixed(2)}
                </td>
                <td className="px-6 py-3 text-center">
                  <button
                    onClick={() => handleEdit(ingredient)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IngredientsManager;
