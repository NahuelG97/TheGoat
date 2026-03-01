import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import IngredientsManager from '../components/IngredientsManager';
import ProductsManager from '../components/ProductsManager';
import RecipeEditor from '../components/RecipeEditor';
import ProductCostViewer from '../components/ProductCostViewer';

type Tab = 'ingredients' | 'products' | 'recipes' | 'costs';

export const Cashier: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('ingredients');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🍗 Rotisserie</h1>
              <p className="text-gray-600 text-sm">Calculador de Costos</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {[
              { id: 'ingredients' as Tab, label: '📦 Ingredientes' },
              { id: 'products' as Tab, label: '🍕 Productos' },
              { id: 'recipes' as Tab, label: '📋 Recetas' },
              { id: 'costs' as Tab, label: '💰 Costos' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'ingredients' && <IngredientsManager />}
        {activeTab === 'products' && <ProductsManager />}
        {activeTab === 'recipes' && <RecipeEditor />}
        {activeTab === 'costs' && <ProductCostViewer />}
      </main>
    </div>
  );
};

export default Cashier;
