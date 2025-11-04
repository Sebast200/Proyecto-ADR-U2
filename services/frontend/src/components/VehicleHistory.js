import React, { useState } from 'react';
import Layout from './Layout';
import './VehicleHistory.css';

const VehicleHistory = ({ user, onLogout }) => {
  const [selectedVehicle, setSelectedVehicle] = useState('ABC-123');

  const vehicles = [
    { id: 1, plate: 'ABC-123', driver: 'Juan Pérez' },
    { id: 2, plate: 'DEF-456', driver: 'María García' },
    { id: 3, plate: 'GHI-789', driver: 'Pedro López' },
    { id: 4, plate: 'JKL-012', driver: 'Ana Martínez' },
    { id: 5, plate: 'MNO-345', driver: 'Carlos Rodríguez' }
  ];

  const historyData = {
    'ABC-123': [
      { date: '2025-10-31', time: '14:30', route: 'Base Central → Mina Norte', km: 45, duration: '1h 20min', avgSpeed: 52, maxSpeed: 75 },
      { date: '2025-10-31', time: '09:15', route: 'Mina Norte → Estación de Servicio', km: 28, duration: '45min', avgSpeed: 48, maxSpeed: 68 },
      { date: '2025-10-30', time: '16:45', route: 'Base Central → Ruta 5', km: 85, duration: '2h 10min', avgSpeed: 55, maxSpeed: 90 },
      { date: '2025-10-30', time: '11:00', route: 'Ruta 5 → Base Central', km: 85, duration: '2h 5min', avgSpeed: 58, maxSpeed: 95 }
    ],
    'DEF-456': [
      { date: '2025-10-31', time: '13:20', route: 'Mina El Teniente → Base', km: 32, duration: '55min', avgSpeed: 45, maxSpeed: 65 },
      { date: '2025-10-31', time: '08:00', route: 'Base → Mina El Teniente', km: 32, duration: '58min', avgSpeed: 42, maxSpeed: 62 }
    ],
    'GHI-789': [
      { date: '2025-10-31', time: '15:40', route: 'Antofagasta → Calama', km: 215, duration: '3h 45min', avgSpeed: 65, maxSpeed: 102 },
      { date: '2025-10-30', time: '10:30', route: 'Calama → Antofagasta', km: 215, duration: '3h 30min', avgSpeed: 68, maxSpeed: 105 }
    ]
  };

  const drivingPatterns = {
    'ABC-123': {
      score: 78,
      style: 'Moderado',
      issues: ['Aceleraciones bruscas ocasionales', 'Exceso de velocidad 8 veces/mes'],
      strengths: ['Buen uso de frenos', 'Respeta tiempos de descanso']
    },
    'DEF-456': {
      score: 92,
      style: 'Conservador',
      issues: [],
      strengths: ['Excelente conducción', 'Sin infracciones', 'Bajo consumo']
    },
    'GHI-789': {
      score: 65,
      style: 'Agresivo',
      issues: ['Exceso de velocidad frecuente', 'Aceleraciones bruscas', 'Frenadas bruscas'],
      strengths: ['Cumple horarios']
    }
  };

  const currentHistory = historyData[selectedVehicle] || [];
  const currentPattern = drivingPatterns[selectedVehicle] || {};

  return (
    <Layout user={user} onLogout={onLogout}>
      <h2>Historial de Recorridos</h2>

      <div className="vehicle-selector">
            <label>Seleccionar Vehículo:</label>
            <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.plate}>
                  {vehicle.plate} - {vehicle.driver}
                </option>
              ))}
            </select>
          </div>

          <div className="pattern-section">
            <h3>Patrón de Conducción</h3>
            <div className="pattern-card">
              <div className="pattern-score">
                <div className="score-circle" style={{ 
                  background: currentPattern.score >= 80 ? '#28a745' : 
                              currentPattern.score >= 60 ? '#ffc107' : '#dc3545'
                }}>
                  <span>{currentPattern.score}</span>
                  <small>Puntuación</small>
                </div>
                <div className="pattern-info">
                  <h4>Estilo: {currentPattern.style}</h4>
                  
                  {currentPattern.strengths?.length > 0 && (
                    <div className="pattern-strengths">
                      <strong>Fortalezas:</strong>
                      <ul>
                        {currentPattern.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {currentPattern.issues?.length > 0 && (
                    <div className="pattern-issues">
                      <strong>Áreas de mejora:</strong>
                      <ul>
                        {currentPattern.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="history-section">
            <h3>Historial de Viajes</h3>
            <div className="table-responsive">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Ruta</th>
                    <th>KM</th>
                    <th>Duración</th>
                    <th>Vel. Promedio</th>
                    <th>Vel. Máxima</th>
                  </tr>
                </thead>
                <tbody>
                  {currentHistory.map((trip, index) => (
                    <tr key={index}>
                      <td>{trip.date}</td>
                      <td>{trip.time}</td>
                      <td><strong>{trip.route}</strong></td>
                      <td>{trip.km} km</td>
                      <td>{trip.duration}</td>
                      <td>{trip.avgSpeed} km/h</td>
                      <td>
                        <span className={trip.maxSpeed > 80 ? 'speed-warning' : ''}>
                          {trip.maxSpeed} km/h
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-box">
              <h4>Total KM (30 días)</h4>
              <p className="big-number">1,250</p>
            </div>
            <div className="stat-box">
              <h4>Viajes Realizados</h4>
              <p className="big-number">{currentHistory.length}</p>
            </div>
            <div className="stat-box">
              <h4>Tiempo Total</h4>
              <p className="big-number">45h</p>
            </div>
            <div className="stat-box">
              <h4>Consumo Promedio</h4>
              <p className="big-number">14.8 L</p>
            </div>
          </div>
    </Layout>
  );
};

export default VehicleHistory;
