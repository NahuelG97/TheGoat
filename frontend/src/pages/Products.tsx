import React, { useState } from 'react';
import IngredientsManager from '../components/IngredientsManager';
import ProductsManager from '../components/ProductsManager';
import RecipeEditor from '../components/RecipeEditor';
import ProductCostViewer from '../components/ProductCostViewer';

type Tab = 'ingredients' | 'products' | 'recipes' | 'costs';

export const Products: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('products');

  return (
    <div className="w-full">
      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 sm:px-8 py-0">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: 'ingredients' as Tab, label: '📦 Ingredientes' },
              { id: 'products' as Tab, label: '🍕 Productos' },
              { id: 'recipes' as Tab, label: '📋 Recetas' },
              { id: 'costs' as Tab, label: '💰 Costos' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
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
      <main className="px-4 sm:px-8 py-8">
        {activeTab === 'ingredients' && <IngredientsManager />}
        {activeTab === 'products' && <ProductsManager />}
        {activeTab === 'recipes' && <RecipeEditor />}
        {activeTab === 'costs' && <ProductCostViewer />}
      </main>
    </div>
  );
};

export default Products;
