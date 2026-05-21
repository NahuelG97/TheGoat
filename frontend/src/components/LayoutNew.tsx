import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  path: string;
  label: string;
  icon: JSX.Element;
  roles: string[];
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define your menu items here
  const menuItems: MenuItem[] = [
    {
      path: '/products',
      label: 'Productos',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3z" />
          <path d="M16 16a2 2 0 11-4 0 2 2 0 014 0zM4 12a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      roles: ['ADMINISTRADOR', 'ENCARGADO'],
    },
    {
      path: '/stock',
      label: 'Stock',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
        </svg>
      ),
      roles: ['ADMINISTRADOR', 'ENCARGADO'],
    },
    {
      path: '/sales',
      label: 'Ventas',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.186 6.387a1.5 1.5 0 011.628 0l.01.007.147.095a1.5 1.5 0 001.628 0l1.972-1.274A1.5 1.5 0 0015 5.5v1a.5.5 0 01-1 0v-.5l-1.972 1.274a2.5 2.5 0 01-2.714 0L8.5 5.63l-1.814 1.173a2.5 2.5 0 01-2.714 0L2 6v.5a.5.5 0 01-1 0v-1a1.5 1.5 0 011.409-.93l1.972 1.274z" />
          <path d="M16 8a1 1 0 01-1 1H5a1 1 0 01-1-1V5.286l1.814-1.173a2.5 2.5 0 012.714 0L10 4.887l1.472-.774a2.5 2.5 0 012.714 0L16 5.286V8z" />
          <path fillRule="evenodd" d="M4 9a1 1 0 011-1h10a1 1 0 011 1v6a2 2 0 01-2 2H6a2 2 0 01-2-2V9zm2 2a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      roles: ['ADMINISTRADOR', 'ENCARGADO'],
    },
    {
      path: '/arqueos',
      label: 'Arqueos',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      ),
      roles: ['ADMINISTRADOR'],
    },
    {
      path: '/users',
      label: 'Usuarios',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 12a6 6 0 01-6 6H3a1 1 0 11-2 0h3a6 6 0 016-6h3a1 1 0 110 2h-3zM15 9h-2a1 1 0 110-2h2a1 1 0 110 2zM15 13h-2a1 1 0 110-2h2a1 1 0 110 2z" />
        </svg>
      ),
      roles: ['ADMINISTRADOR'],
    },
  ];

  const isActive = (path: string) => location.pathname === path;
  const getPageTitle = () => {
    const current = menuItems.find((item) => isActive(item.path));
    return current ? current.label : '';
  };
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar - Desktop */}
      <aside
        style={{
          width: sidebarExpanded ? '260px' : '0',
          backgroundColor: 'var(--dark-sidebar-bg)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 40,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'block',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="hidden lg:block"
      >
        <div style={{ padding: '24px 16px', position: 'relative', height: '100%' }}>
          {/* Botón para cerrar sidebar */}
          {sidebarExpanded && (
            <button
              onClick={() => setSidebarExpanded(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                borderRadius: '4px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
              title="Cerrar sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '32px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--brand-primary)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '20px',
                flexShrink: 0,
              }}
            >
              🍗
            </div>
            {sidebarExpanded && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  TheGoat
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Rotisserie
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                  gap: sidebarExpanded ? '12px' : '0',
                  width: '100%',
                  padding: sidebarExpanded ? '14px 12px' : '14px 8px',
                  backgroundColor: isActive(item.path) ? 'rgba(13, 110, 253, 0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: isActive(item.path) ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderLeft: isActive(item.path) ? '3px solid var(--brand-primary)' : '3px solid transparent',
                  fontSize: sidebarExpanded ? '15px' : '12px',
                  fontWeight: 500,
                  overflow: 'hidden',
                  minHeight: '44px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', color: 'inherit', fontSize: sidebarExpanded ? '20px' : '20px', flexShrink: 0 }}>
                  {item.icon}
                </div>
                {sidebarExpanded && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Sidebar - Mobile Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 30,
            }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            style={{
              width: '260px',
              backgroundColor: 'var(--dark-sidebar-bg)',
              position: 'fixed',
              left: 0,
              top: 0,
              height: '100vh',
              zIndex: 40,
              overflowY: 'auto',
            }}
            className="lg:hidden"
          >
            <div style={{ padding: '24px 16px' }}>
              {/* Close Button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '28px',
                  cursor: 'pointer',
                  zIndex: 100,
                }}
              >
                ×
              </button>

              {/* Logo */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '32px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'var(--brand-primary)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '20px',
                    flexShrink: 0,
                  }}
                >
                  🍗
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    TheGoat
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Rotisserie
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '14px 12px',
                      backgroundColor: isActive(item.path) ? 'rgba(13, 110, 253, 0.1)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: isActive(item.path) ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderLeft: isActive(item.path) ? '3px solid var(--brand-primary)' : '3px solid transparent',
                      fontSize: '15px',
                      fontWeight: 500,
                      overflow: 'hidden',
                      minHeight: '44px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(item.path)) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.path)) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', color: 'inherit', fontSize: '20px', flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </>
      )}

      {/* Botón flotante para abrir sidebar cuando está cerrado (en desktop) */}
      {!sidebarExpanded && (
        <button
          onClick={() => setSidebarExpanded(true)}
          style={{
            position: 'fixed',
            left: '16px',
            top: '16px',
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            transition: 'all 0.2s',
          }}
          className="hidden lg:flex"
          title="Abrir sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Main Content - Desktop */}
      <div
        style={{
          marginLeft: sidebarExpanded ? '260px' : '0',
          width: sidebarExpanded ? 'calc(100% - 260px)' : '100%',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="hidden lg:flex lg:flex-1 lg:flex-col lg:flex-col"
      >
        {/* Topbar */}
        <header
          style={{
            height: 'var(--topbar-height)',
            backgroundColor: 'var(--card-bg)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--spacing-xl)',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            marginLeft: 0,
          }}
        >
          {/* Left Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
              }}
              className="lg:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title */}
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
              }}
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a4 4 0 00-5.656 0l2.12 2.12a2 2 0 003.536 0zm2.121-7.071l2.12-2.121a1 1 0 00-1.414-1.414l-2.12 2.12a1 1 0 001.414 1.414zM17 11a1 1 0 100 2h1a1 1 0 100-2h-1zm-6 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM3 10a1 1 0 100-2H2a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* User Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                paddingRight: '12px',
                borderRight: '1px solid var(--border-color)',
              }}
            >
              <div style={{ textAlign: 'right', minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {user?.username || 'Usuario'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {user?.role || 'Sin rol'}
                </div>
              </div>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                {(user?.username ?? '?').charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--brand-danger)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--brand-danger)';
                (e.currentTarget as HTMLButtonElement).style.color = 'white';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand-danger)';
              }}
              title="Salir"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--spacing-xl)',
          }}
        >
          {children}
        </main>
      </div>

      {/* Main Content - Mobile */}
      <div
        style={{
          width: '100%',
        }}
        className="lg:hidden flex flex-col min-h-screen"
      >
        {/* Topbar for Mobile */}
        <header
          style={{
            height: 'var(--topbar-height)',
            backgroundColor: 'var(--card-bg)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--spacing-lg)',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          {/* Left Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title */}
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
              }}
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a4 4 0 00-5.656 0l2.12 2.12a2 2 0 003.536 0zm2.121-7.071l2.12-2.121a1 1 0 00-1.414-1.414l-2.12 2.12a1 1 0 001.414 1.414zM17 11a1 1 0 100 2h1a1 1 0 100-2h-1zm-6 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM3 10a1 1 0 100-2H2a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--brand-danger)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--brand-danger)';
                (e.currentTarget as HTMLButtonElement).style.color = 'white';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand-danger)';
              }}
              title="Salir"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--spacing-lg)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
