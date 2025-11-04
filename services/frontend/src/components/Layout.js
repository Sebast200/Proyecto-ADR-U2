import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ user, onLogout, children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">Fleet Monitor</div>
        <div className="nav-user">
          <span>{user.name}</span>
          <button onClick={onLogout} className="btn-logout">Salir</button>
        </div>
      </nav>

      <div className="layout-container">
        <aside className="sidebar">
          <button 
            className={`menu-item ${isActive('/dashboard') ? 'active' : ''}`} 
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`menu-item ${isActive('/map') ? 'active' : ''}`} 
            onClick={() => navigate('/map')}
          >
            Mapa en Tiempo Real
          </button>
          <button 
            className={`menu-item ${isActive('/history') ? 'active' : ''}`} 
            onClick={() => navigate('/history')}
          >
            Historial
          </button>
          <button 
            className={`menu-item ${isActive('/reports') ? 'active' : ''}`} 
            onClick={() => navigate('/reports')}
          >
            Reportes
          </button>
          {user.role === 'admin' && (
            <button 
              className={`menu-item ${isActive('/users') ? 'active' : ''}`} 
              onClick={() => navigate('/users')}
            >
              Gestión de Usuarios
            </button>
          )}
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
