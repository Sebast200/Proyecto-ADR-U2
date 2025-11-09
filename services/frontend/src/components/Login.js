import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Detectar si estamos en desarrollo local o producción
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocal 
        ? 'http://localhost:3001/api/auth/login'
        : '/api/auth/login'; // En producción, usar ruta relativa (requiere proxy)

      // Llamada al backend para autenticación
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rutOrEmail: email,
          password: password
        })
      });

      // Verificar si la respuesta es JSON antes de parsear
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('El servidor no está respondiendo correctamente.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el login');
      }

      // Mapear el rol de la respuesta al formato esperado
      const roleMap = {
        'ADMIN': 'admin',
        'DAF': 'daf',
        'CHOFER': 'driver'
      };

      const userData = {
        id: data.userId,
        email: data.email,
        name: data.firstName && data.lastName 
          ? `${data.firstName} ${data.lastName}` 
          : data.firstName || data.email.split('@')[0],
        role: roleMap[data.role] || 'driver'
      };

      onLogin(userData);
    } catch (error) {
      console.error('Error en login:', error);
      setError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Sistema de Monitoreo de Flota</h1>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ 
              padding: '10px', 
              marginBottom: '15px', 
              backgroundColor: '#fee', 
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c00'
            }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label>Email o RUT</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingrese su email o RUT"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
