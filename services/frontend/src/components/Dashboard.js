import React from 'react';
import Layout from './Layout';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const vehicles = [
    { id: 1, plate: 'ABC-123', driver: 'Juan Pérez', status: 'En movimiento', speed: 45, location: 'Ruta 5 Norte' },
    { id: 2, plate: 'DEF-456', driver: 'María García', status: 'Detenido', speed: 0, location: 'Mina El Teniente' },
    { id: 3, plate: 'GHI-789', driver: 'Pedro López', status: 'En movimiento', speed: 60, location: 'Carretera Antofagasta' },
    { id: 4, plate: 'JKL-012', driver: 'Ana Martínez', status: 'En movimiento', speed: 55, location: 'Ruta 68' },
    { id: 5, plate: 'MNO-345', driver: 'Carlos Rodríguez', status: 'Detenido', speed: 0, location: 'Base Central' }
  ];

  const alerts = [
    { id: 1, type: 'warning', message: 'Vehículo ABC-123 excedió velocidad (85 km/h)', time: 'Hace 5 min' },
    { id: 2, type: 'info', message: 'Vehículo DEF-456 detenido por más de 30 min', time: 'Hace 15 min' },
    { id: 3, type: 'danger', message: 'Vehículo GHI-789 desconexión del sistema', time: 'Hace 1 hora' }
  ];

  return (
    <Layout user={user} onLogout={onLogout}>
      <h2>Panel de Control</h2>

      <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🚚</div>
              <div className="stat-info">
                <h3>Total Vehículos</h3>
                <p className="stat-number">{vehicles.length}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>En Movimiento</h3>
                <p className="stat-number">{vehicles.filter(v => v.status === 'En movimiento').length}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏸️</div>
              <div className="stat-info">
                <h3>Detenidos</h3>
                <p className="stat-number">{vehicles.filter(v => v.status === 'Detenido').length}</p>
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
            <h3>Alertas Recientes</h3>
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className={`alert alert-${alert.type}`}>
                  <div className="alert-content">
                    <strong>{alert.message}</strong>
                    <small>{alert.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>Estado de Vehículos</h3>
            <div className="table-responsive">
              <table className="vehicles-table">
                <thead>
                  <tr>
                    <th>Patente</th>
                    <th>Conductor</th>
                    <th>Estado</th>
                    <th>Velocidad</th>
                    <th>Ubicación</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(vehicle => (
                    <tr key={vehicle.id}>
                      <td><strong>{vehicle.plate}</strong></td>
                      <td>{vehicle.driver}</td>
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
            </div>
          </div>
    </Layout>
  );
};

export default Dashboard;
