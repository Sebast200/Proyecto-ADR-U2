import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const users = {
      'admin@fleet.com': { name: 'Admin', role: 'admin', email: 'admin@fleet.com' },
      'daf@fleet.com': { name: 'Encargado DAF', role: 'daf', email: 'daf@fleet.com' },
      'driver@fleet.com': { name: 'Conductor', role: 'driver', email: 'driver@fleet.com' }
    };

    const userData = users[email];
    if (userData && password === '123456') {
      // attach an id field so other components can identify the logged user
      onLogin({ ...userData, id: email });
    } else {
      alert('Credenciales incorrectas. Intente con:\n- admin@fleet.com / 123456\n- daf@fleet.com / 123456\n- driver@fleet.com / 123456');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Sistema de Monitoreo de Flota</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingrese su email"
              required
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
            />
          </div>
          <button type="submit" className="btn-primary">Iniciar Sesión</button>
        </form>
        <div className="demo-info">
          <p><strong>Credenciales de prueba:</strong></p>
          <p>Admin: admin@fleet.com / 123456</p>
          <p>DAF: daf@fleet.com / 123456</p>
          <p>Conductor: driver@fleet.com / 123456</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
