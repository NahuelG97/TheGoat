import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Login: React.FC = () => {
  const [username, setUsername] = useState('cajero');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Apply theme on mount
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
  }, [isDark]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginAPI({ username, password });
      login(response.data.token, response.data.user);
      navigate('/products');
    } catch (err) {
      setError('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-lg)',
        position: 'relative',
        background: isDark
          ? 'linear-gradient(135deg, #1A1D29 0%, #2A2F3F 100%)'
          : 'linear-gradient(135deg, #F5F7FB 0%, #E7F1FF 100%)',
      }}
    >
      {/* Theme Toggle (Top Right) */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: 'var(--spacing-xl)',
          right: 'var(--spacing-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
        }}
        title={isDark ? 'Modo claro' : 'Modo oscuro'}
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a4 4 0 00-5.656 0l2.12 2.12a2 2 0 003.536 0zm2.121-7.071l2.12-2.121a1 1 0 00-1.414-1.414l-2.12 2.12a1 1 0 001.414 1.414zM17 11a1 1 0 100 2h1a1 1 0 100-2h-1zm-6 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM3 10a1 1 0 100-2H2a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      {/* Login Card */}
      <Card
        className=""
        header={
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: 'var(--brand-primary)',
                color: 'white',
                fontSize: '28px',
                marginBottom: 'var(--spacing-md)',
                animation: 'bounce 2s infinite',
              }}
            >
              🍗
            </div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-sm)',
              }}
            >
              TheGoat
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Sistema de Gestión Rotisserie
            </p>
          </div>
        }
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-lg)',
            minWidth: '320px',
          }}
        >
          <Input
            label="Usuario"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ingresa tu usuario"
            required
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="ingresa tu contraseña"
            required
          />

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--brand-danger-light)',
                borderRadius: '6px',
                border: '1px solid var(--brand-danger)',
                color: 'var(--brand-danger)',
                fontSize: '14px',
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div
          style={{
            marginTop: 'var(--spacing-xl)',
            paddingTop: 'var(--spacing-lg)',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--spacing-sm)',
              fontWeight: 500,
            }}
          >
            📋 Credenciales de prueba:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Usuario:</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 500 }}>
                cajero
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Contraseña:</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 500 }}>
                admin123
              </span>
            </div>
          </div>
        </div>
      </Card>

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
