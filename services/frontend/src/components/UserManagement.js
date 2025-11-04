import React, { useState } from 'react';
import Layout from './Layout';
import './UserManagement.css';

const UserManagement = ({ user, onLogout }) => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Juan Pérez', email: 'juan@fleet.com', role: 'driver', status: 'active', vehicle: 'ABC-123' },
    { id: 2, name: 'María García', email: 'maria@fleet.com', role: 'driver', status: 'active', vehicle: 'DEF-456' },
    { id: 3, name: 'Pedro López', email: 'pedro@fleet.com', role: 'driver', status: 'active', vehicle: 'GHI-789' },
    { id: 4, name: 'Ana Martínez', email: 'ana@fleet.com', role: 'daf', status: 'active', vehicle: null },
    { id: 5, name: 'Carlos Rodríguez', email: 'carlos@fleet.com', role: 'admin', status: 'active', vehicle: null }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'driver',
    vehicle: ''
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    const user = {
      id: users.length + 1,
      ...newUser,
      status: 'active'
    };
    setUsers([...users, user]);
    setShowModal(false);
    setNewUser({ name: '', email: '', role: 'driver', vehicle: '' });
    alert('Usuario agregado exitosamente!');
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      setUsers(users.filter(u => u.id !== id));
      alert('Usuario eliminado');
    }
  };

  const getRoleName = (role) => {
    const roles = {
      admin: 'Administrador',
      daf: 'Encargado DAF',
      driver: 'Conductor'
    };
    return roles[role];
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="header-section">
            <h2>Gestión de Usuarios y Roles</h2>
            <button className="btn-add" onClick={() => setShowModal(true)}>
              Agregar Usuario
            </button>
          </div>

          <div className="users-section">
            <div className="table-responsive">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Vehículo Asignado</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {getRoleName(user.role)}
                        </span>
                      </td>
                      <td>{user.vehicle || '-'}</td>
                      <td>
                        <span className="status-badge status-active">
                          Activo
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-action btn-delete" 
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Agregar Nuevo Usuario</h3>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="driver">Conductor</option>
                  <option value="daf">Encargado DAF</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {newUser.role === 'driver' && (
                <div className="form-group">
                  <label>Vehículo Asignado</label>
                  <input
                    type="text"
                    value={newUser.vehicle}
                    onChange={(e) => setNewUser({...newUser, vehicle: e.target.value})}
                    placeholder="Ej: ABC-123"
                  />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserManagement;
