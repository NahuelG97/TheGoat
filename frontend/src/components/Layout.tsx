import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/products', label: '🍕 Productos', icon: '🍕' },
    { path: '/stock', label: '📦 Control de Stock', icon: '📦' },
    { path: '/sales', label: '💰 Ventas', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {sidebarOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>

              {/* Logo/Title */}
              <div
                onClick={() => navigate('/products')}
                className="cursor-pointer flex items-center gap-2"
              >
                <h1 className="text-2xl font-bold text-gray-900">🍗</h1>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Rotisseria System</h1>
                  <p className="text-xs text-gray-500">Gestión de Costos</p>
                </div>
              </div>
            </div>

            {/* Right side: User info + Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-full">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white shadow">
          <nav className="mt-8 px-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                  isActive(item.path)
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition mt-8"
            >
              🚪 Cerrar Sesión
            </button>
          </nav>
        </aside>

        {/* Sidebar - Mobile (Overlay) */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Mobile Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow z-30 mt-16">
              <nav className="mt-8 px-4 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                      isActive(item.path)
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition mt-8"
                >
                  🚪 Cerrar Sesión
                </button>
              </nav>
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
