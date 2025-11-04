import React, { useState } from 'react';
import Layout from './Layout';
import './Reports.css';

const Reports = ({ user, onLogout }) => {
  const [selectedReport, setSelectedReport] = useState('motor');
  const [dateFrom, setDateFrom] = useState('2025-10-01');
  const [dateTo, setDateTo] = useState('2025-11-01');

  const reportData = {
    motor: [
      { vehicle: 'ABC-123', driver: 'Juan Pérez', ignitions: 45, totalHours: 120, date: '2025-10-30' },
      { vehicle: 'DEF-456', driver: 'María García', ignitions: 38, totalHours: 95, date: '2025-10-30' },
      { vehicle: 'GHI-789', driver: 'Pedro López', ignitions: 52, totalHours: 140, date: '2025-10-30' }
    ],
    speed: [
      { vehicle: 'ABC-123', driver: 'Juan Pérez', violations: 8, maxSpeed: 95, date: '2025-10-30' },
      { vehicle: 'GHI-789', driver: 'Pedro López', violations: 12, maxSpeed: 102, date: '2025-10-30' }
    ],
    kilometers: [
      { vehicle: 'ABC-123', driver: 'Juan Pérez', km: 1250, avgKmDay: 42, date: '2025-10-30' },
      { vehicle: 'DEF-456', driver: 'María García', km: 890, avgKmDay: 30, date: '2025-10-30' },
      { vehicle: 'GHI-789', driver: 'Pedro López', km: 1580, avgKmDay: 53, date: '2025-10-30' }
    ],
    fuel: [
      { vehicle: 'ABC-123', driver: 'Juan Pérez', consumption: 185, avgPer100km: 14.8, date: '2025-10-30' },
      { vehicle: 'DEF-456', driver: 'María García', consumption: 135, avgPer100km: 15.2, date: '2025-10-30' },
      { vehicle: 'GHI-789', driver: 'Pedro López', consumption: 240, avgPer100km: 15.2, date: '2025-10-30' }
    ]
  };

  const exportToExcel = () => {
    const data = reportData[selectedReport];
    let csv = '';
    
    // Headers
    const headers = Object.keys(data[0]);
    csv += headers.join(',') + '\n';
    
    // Data
    data.forEach(row => {
      csv += Object.values(row).join(',') + '\n';
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    alert('Reporte exportado exitosamente!');
  };

  const getReportTitle = () => {
    const titles = {
      motor: 'Motor Encendido/Apagado',
      speed: 'Excesos de Velocidad',
      kilometers: 'Kilómetros Recorridos',
      fuel: 'Consumo de Combustible'
    };
    return titles[selectedReport];
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <h2>Generación de Reportes</h2>

      <div className="report-controls">
            <div className="control-group">
              <label>Tipo de Reporte</label>
              <select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}>
                <option value="motor">Motor Encendido/Apagado</option>
                <option value="speed">Excesos de Velocidad</option>
                <option value="kilometers">Kilómetros Recorridos</option>
                <option value="fuel">Consumo de Combustible</option>
              </select>
            </div>

            <div className="control-group">
              <label>Fecha Desde</label>
              <input 
                type="date" 
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="control-group">
              <label>Fecha Hasta</label>
              <input 
                type="date" 
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <button className="btn-export" onClick={exportToExcel}>
              Exportar a Excel
            </button>
          </div>

          <div className="report-section">
            <h3>{getReportTitle()}</h3>
            <div className="table-responsive">
              <table className="report-table">
                <thead>
                  <tr>
                    {selectedReport === 'motor' && (
                      <>
                        <th>Vehículo</th>
                        <th>Conductor</th>
                        <th>Encendidos</th>
                        <th>Horas Totales</th>
                        <th>Fecha</th>
                      </>
                    )}
                    {selectedReport === 'speed' && (
                      <>
                        <th>Vehículo</th>
                        <th>Conductor</th>
                        <th>Infracciones</th>
                        <th>Velocidad Máxima</th>
                        <th>Fecha</th>
                      </>
                    )}
                    {selectedReport === 'kilometers' && (
                      <>
                        <th>Vehículo</th>
                        <th>Conductor</th>
                        <th>KM Totales</th>
                        <th>Promedio KM/Día</th>
                        <th>Fecha</th>
                      </>
                    )}
                    {selectedReport === 'fuel' && (
                      <>
                        <th>Vehículo</th>
                        <th>Conductor</th>
                        <th>Consumo (L)</th>
                        <th>Promedio L/100km</th>
                        <th>Fecha</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportData[selectedReport].map((row, index) => (
                    <tr key={index}>
                      <td><strong>{row.vehicle}</strong></td>
                      <td>{row.driver}</td>
                      {selectedReport === 'motor' && (
                        <>
                          <td>{row.ignitions}</td>
                          <td>{row.totalHours}h</td>
                        </>
                      )}
                      {selectedReport === 'speed' && (
                        <>
                          <td><span className="badge-danger">{row.violations}</span></td>
                          <td>{row.maxSpeed} km/h</td>
                        </>
                      )}
                      {selectedReport === 'kilometers' && (
                        <>
                          <td>{row.km} km</td>
                          <td>{row.avgKmDay} km</td>
                        </>
                      )}
                      {selectedReport === 'fuel' && (
                        <>
                          <td>{row.consumption} L</td>
                          <td>{row.avgPer100km} L</td>
                        </>
                      )}
                      <td>{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
    </Layout>
  );
};

export default Reports;
