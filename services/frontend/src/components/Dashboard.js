import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isLocal ? 'http://localhost:3001' : '';
        
        const url = user.role === 'driver'
          ? `${baseUrl}/api/vehicles/with-drivers/user/${user.id}`
          : `${baseUrl}/api/vehicles/with-drivers`;

        const response = await fetch(url);
        const data = await response.json();
        
        // Transformar los datos de la API al formato esperado
        const transformedVehicles = data
          .filter(v => v.userId != null) // Solo vehículos con conductor asignado
          .map(v => ({
            id: v.id,
            plate: v.plate,
            driver: v.driverFirstName && v.driverLastName 
              ? `${v.driverFirstName} ${v.driverLastName}` 
              : v.driverEmail || 'Sin conductor',
            driverId: v.userId,
            status: 'En movimiento', // TODO: obtener status real
            speed: 0, // TODO: obtener velocidad real
            location: 'Ubicación desconocida' // TODO: obtener ubicación real
          }));
        
        setVehicles(transformedVehicles);
      } catch (error) {
        console.error('Error al cargar vehículos:', error);
        setVehicles([]); // Establecer array vacío en caso de error
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [user.id, user.role]);

  // Alertas hardcodeadas (TODO: traer desde API)
  const allAlerts = [
    { id: 1, type: 'warning', message: 'Vehículo excedió velocidad (85 km/h)', time: 'Hace 5 min' },
    { id: 2, type: 'info', message: 'Vehículo detenido por más de 30 min', time: 'Hace 15 min' },
    { id: 3, type: 'danger', message: 'Vehículo desconexión del sistema', time: 'Hace 1 hora' }
  ];

  const alerts = user.role === 'driver' ? allAlerts.slice(0, 1) : allAlerts;

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <h2>Cargando...</h2>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <h2>{user.role === 'driver' ? 'Mi Panel de Control' : 'Panel de Control'}</h2>

      <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🚚</div>
              <div className="stat-info">
                <h3>{user.role === 'driver' ? 'Mi Vehículo' : 'Total Vehículos'}</h3>
                <p className="stat-number">
                  {user.role === 'driver' && vehicles.length > 0 
                    ? vehicles[0].plate 
                    : vehicles.length}
                </p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>En Tránsito</h3>
                <p className="stat-number">{vehicles.filter(v => v.status === 'En movimiento').length}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <h3>Alertas Activas</h3>
                <p className="stat-number">{alerts.length}</p>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>{user.role === 'driver' ? 'Mis Alertas Recientes' : 'Alertas Recientes'}</h3>
            <div className="alerts-list">
              {alerts.length === 0 ? (
                <p style={{ padding: '10px', color: '#888' }}>No hay alertas</p>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className={`alert alert-${alert.type}`}>
                    <div className="alert-content">
                      <strong>{alert.message}</strong>
                      <small>{alert.time}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="section">
            <h3>{user.role === 'driver' ? 'Estado de Mi Vehículo' : 'Estado de Vehículos'}</h3>
            <div className="table-responsive">
              {vehicles.length === 0 ? (
                <p style={{ padding: '10px', color: '#888' }}>
                  {user.role === 'driver' ? 'No tienes vehículo asignado' : 'No hay vehículos registrados'}
                </p>
              ) : (
                <table className="vehicles-table">
                  <thead>
                    <tr>
                      <th>Patente</th>
                      {user.role !== 'driver' && <th>Conductor</th>}
                      <th>Estado</th>
                      <th>Velocidad</th>
                      <th>Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map(vehicle => (
                      <tr key={vehicle.id}>
                        <td><strong>{vehicle.plate}</strong></td>
                        {user.role !== 'driver' && <td>{vehicle.driver}</td>}
                        <td>
                          <span className={`status-badge ${vehicle.status === 'En movimiento' ? 'status-active' : 'status-stopped'}`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td>{vehicle.speed} km/h</td>
                        <td>{vehicle.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
    </Layout>
  );
};

export default Dashboard;
