import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import './UserManagement.css';

const UserManagement = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableVehicles, setAvailableVehicles] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    rut: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'driver',
    vehicleId: ''
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isLocal ? 'http://localhost:3001' : '';
        
        const response = await fetch(`${baseUrl}/api/users/with-vehicles`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transformar datos de la API
        const transformedUsers = data.map(u => ({
          id: u.id,
          name: u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email,
          email: u.email,
          role: mapRoleFromBackend(u.role),
          rut: u.rut,
          vehicle: u.vehiclePlate,
          status: 'active'
        }));
        
        setUsers(transformedUsers);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Cargar vehículos sin usuario asignado cuando se abre el modal
  useEffect(() => {
    if (showModal) {
      fetchAvailableVehicles();
    }
  }, [showModal]);

  const fetchAvailableVehicles = async () => {
    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const baseUrl = isLocal ? 'http://localhost:3001' : '';
      
      const response = await fetch(`${baseUrl}/api/vehicles`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filtrar solo vehículos sin usuario asignado
      const unassignedVehicles = data.filter(v => !v.userId);
      setAvailableVehicles(unassignedVehicles);
    } catch (error) {
      console.error('Error al cargar vehículos disponibles:', error);
      setAvailableVehicles([]);
    }
  };

  const mapRoleFromBackend = (backendRole) => {
    const roleMap = {
      'ADMIN': 'admin',
      'DAF': 'daf',
      'CHOFER': 'driver'
    };
    return roleMap[backendRole] || 'driver';
  };

  const mapRoleToBackend = (frontendRole) => {
    const roleMap = {
      'admin': 'ADMIN',
      'daf': 'DAF',
      'driver': 'CHOFER'
    };
    return roleMap[frontendRole] || 'CHOFER';
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const baseUrl = isLocal ? 'http://localhost:3001' : '';
      
      // 1. Registrar el usuario
      const registerData = {
        rut: newUser.rut,
        email: newUser.email,
        password: newUser.password,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: mapRoleToBackend(newUser.role)
      };
      
      const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData)
      });
      
      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.message || 'Error al registrar usuario');
      }
      
      const userData = await registerResponse.json();
      const newUserId = userData.userId;
      
      // 2. Si seleccionó un vehículo, asignarlo al usuario
      if (newUser.vehicleId && newUser.role === 'driver') {
        const updateVehicleResponse = await fetch(`${baseUrl}/api/vehicles/${newUser.vehicleId}/assign/${newUserId}`, {
          method: 'PUT'
        });
        
        if (!updateVehicleResponse.ok) {
          console.error('Error al asignar vehículo, pero el usuario fue creado');
        }
      }
      
      // 3. Recargar la lista de usuarios
      const usersResponse = await fetch(`${baseUrl}/api/users/with-vehicles`);
      const usersData = await usersResponse.json();
      const transformedUsers = usersData.map(u => ({
        id: u.id,
        name: u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email,
        email: u.email,
        role: mapRoleFromBackend(u.role),
        rut: u.rut,
        vehicle: u.vehiclePlate,
        status: 'active'
      }));
      setUsers(transformedUsers);
      
      // Limpiar formulario y cerrar modal
      setShowModal(false);
      setNewUser({ rut: '', email: '', password: '', firstName: '', lastName: '', role: 'driver', vehicleId: '' });
      alert('Usuario agregado exitosamente!');
      
    } catch (error) {
      console.error('Error al agregar usuario:', error);
      alert('Error al agregar usuario: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario? El vehículo asignado quedará disponible.')) {
      return;
    }
    
    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const baseUrl = isLocal ? 'http://localhost:3001' : '';
      
      const response = await fetch(`${baseUrl}/api/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }
      
      // Recargar la lista de usuarios
      const usersResponse = await fetch(`${baseUrl}/api/users/with-vehicles`);
      const usersData = await usersResponse.json();
      const transformedUsers = usersData.map(u => ({
        id: u.id,
        name: u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email,
        email: u.email,
        role: mapRoleFromBackend(u.role),
        rut: u.rut,
        vehicle: u.vehiclePlate,
        status: 'active'
      }));
      setUsers(transformedUsers);
      
      // Recargar vehículos disponibles
      await fetchAvailableVehicles();
      
      alert('Usuario eliminado exitosamente. El vehículo asociado ha quedado disponible.');
      
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar usuario: ' + error.message);
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

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <h2>Cargando usuarios...</h2>
      </Layout>
    );
  }

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
              {users.length === 0 ? (
                <p style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                  No hay usuarios registrados
                </p>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>RUT</th>
                      <th>Rol</th>
                      <th>Vehículo Asignado</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.rut || '-'}</td>
                        <td>
                          <span className={`role-badge role-${u.role}`}>
                            {getRoleName(u.role)}
                          </span>
                        </td>
                        <td>{u.vehicle || '-'}</td>
                        <td>
                          <span className="status-badge status-active">
                            Activo
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-action btn-delete" 
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>


      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Agregar Nuevo Usuario</h3>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>RUT *</label>
                <input
                  type="text"
                  value={newUser.rut}
                  onChange={(e) => setNewUser({...newUser, rut: e.target.value})}
                  placeholder="Ej: 12345678-9"
                  required
                />
              </div>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                  placeholder="Nombre"
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellido *</label>
                <input
                  type="text"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                  placeholder="Apellido"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Contraseña *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Contraseña"
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label>Rol *</label>
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
                  <select
                    value={newUser.vehicleId}
                    onChange={(e) => setNewUser({...newUser, vehicleId: e.target.value})}
                  >
                    <option value="">Sin vehículo asignado</option>
                    {availableVehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} - {vehicle.brand}
                      </option>
                    ))}
                  </select>
                  {availableVehicles.length === 0 && (
                    <small style={{ color: '#888', marginTop: '5px', display: 'block' }}>
                      No hay vehículos disponibles sin asignar
                    </small>
                  )}
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
