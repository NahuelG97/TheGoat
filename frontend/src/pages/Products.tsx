import React, { useState } from 'react';
import IngredientsManager from '../components/IngredientsManager';
import ProductsManager from '../components/ProductsManager';
import RecipeEditor from '../components/RecipeEditor';
import ProductCostViewer from '../components/ProductCostViewer';
import Card from '../components/common/Card';

type Tab = 'ingredients' | 'products' | 'recipes' | 'costs';

interface TabConfig {
  id: Tab;
  label: string;
  icon: JSX.Element;
  description: string;
}

const Products: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('products');

  const tabConfig: TabConfig[] = [
    {
      id: 'ingredients',
      label: 'Ingredientes',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3zm5 16a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: 'Gestiona los ingredientes disponibles',
    },
    {
      id: 'products',
      label: 'Productos',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2a2 2 0 002 2h4a2 2 0 002-2v-2zM16 11a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      ),
      description: 'Crea y edita productos',
    },
    {
      id: 'recipes',
      label: 'Recetas',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a6 6 0 100 12H6a1 1 0 000 2 2 2 0 002-2v-1.268a6 6 0 00-1.022-3.263l-.022-.035a6 6 0 00-.316-.952A6 6 0 004 9V5zm6 5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
      description: 'Define ingredientes por producto',
    },
    {
      id: 'costs',
      label: 'Costos',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.16 5.314l4.897-1.596A1 1 0 0115 4.69v4.622a1 1 0 01-.97 1.022 24.05 24.05 0 01-1.597.1h-.045a24.051 24.051 0 01-1.599-.1.99.99 0 01-.968-1.022V5.69a1 1 0 01.728-.376z" />
          <path d="M13 16H7v-5.689A25.05 25.05 0 018.564 10.5a25.05 25.05 0 017.436.811v4.998z" />
        </svg>
      ),
      description: 'Visualiza costos de productos',
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>
          Gestión de Productos
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Administra ingredientes, productos, recetas y costos
        </p>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: 'var(--spacing-xl)',
          overflowX: 'auto',
        }}
      >
        {tabConfig.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid var(--brand-primary)' : '3px solid transparent',
              color: activeTab === tab.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 500,
              fontSize: '14px',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
              }
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <main>
        {activeTab === 'ingredients' && <IngredientsManager />}
        {activeTab === 'products' && <ProductsManager />}
        {activeTab === 'recipes' && <RecipeEditor />}
        {activeTab === 'costs' && <ProductCostViewer />}
      </main>
    </div>
  );
};

export default Products;
