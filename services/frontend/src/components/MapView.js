import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapView.css';
import client, { getLastPosition, getAllUsers } from '../api/axiosClient';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


function MapController({ targetPosition, mapRef }) {
  const map = useMap();
  
  useEffect(() => {
    if (mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);

  useEffect(() => {
    if (targetPosition && map) {
      map.flyTo(targetPosition, 15, { duration: 0.8 });
    }
  }, [targetPosition, map]);

  return null;
}

const MapView = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [targetPosition, setTargetPosition] = useState(null);
  const mapRef = useRef(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    };
    fetchUsers();
  }, []);

  const fetchVehiclePosition = async (vehicleId) => {
    const data = await getLastPosition(vehicleId);
    if (data && data.last_location) {
      const { latitude, longitude } = data.last_location;
      setSelectedVehicle(prev =>
        prev ? { ...prev, position: [latitude, longitude] } : prev
      );
    }
  };

  useEffect(() => {
      if (!selectedVehicle) return;

      const interval = setInterval(() => {
        fetchVehiclePosition(selectedVehicle.id);
      }, 5000); // cada 5 segundos

      return () => clearInterval(interval);
    }, [selectedVehicle]);

  const vehicles = [
    { 
      id: 'daf@fleet.com', 
      plate: 'ABC-123', 
      driver: 'Juan Pérez', 
      position: [-33.4489, -70.6693],
      speed: 45,
      status: 'En movimiento',
      route: [[-33.4489, -70.6693], [-33.4500, -70.6700], [-33.4520, -70.6710]]
    },
    { 
      id: 2, 
      plate: 'DEF-456', 
      driver: 'María García', 
      position: [-33.4372, -70.6506],
      speed: 0,
      status: 'Detenido',
      route: [[-33.4372, -70.6506]]
    },
    { 
      id: 3, 
      plate: 'GHI-789', 
      driver: 'Pedro López', 
      position: [-33.4569, -70.6483],
      speed: 60,
      status: 'En movimiento',
      route: [[-33.4569, -70.6483], [-33.4580, -70.6490], [-33.4600, -70.6500]]
    }
  ];

  const pointsOfInterest = [
    { id: 1, name: 'Base Central', position: [-33.4372, -70.6506], type: 'base' },
    { id: 2, name: 'Mina Norte', position: [-33.4200, -70.6000], type: 'mine' },
    { id: 3, name: 'Estación de Servicio', position: [-33.4600, -70.6700], type: 'fuel' }
  ];

  return (
    <div className="map-view">
      <nav className="navbar">
        <div className="nav-brand">Fleet Monitor</div>
        <div className="nav-user">
          <span>{user.name}</span>
          <button onClick={onLogout} className="btn-logout">Salir</button>
        </div>
      </nav>

      <div className="map-container">
        <aside className="map-sidebar">
          <h3>Usuarios en la base de datos</h3>
            <ul>
              {users.map(u => (
                <li key={u.id}>
                  {u.firstName} {u.lastName} - {u.email} ({u.role})
                </li>
              ))}
            </ul>
          <button className="menu-item" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button className="menu-item active">
            Mapa en Tiempo Real
          </button>
          <button className="menu-item" onClick={() => navigate('/history')}>
            Historial
          </button>
          <button className="menu-item" onClick={() => navigate('/reports')}>
            Reportes
          </button>
          {user.role === 'admin' && (
            <button className="menu-item" onClick={() => navigate('/users')}>
              Gestión de Usuarios
            </button>
          )}

          <div className="vehicle-list">
            <h3>Vehículos Activos</h3>
            {vehicles.map(vehicle => (
              <div 
                key={vehicle.id} 
                className={`vehicle-item ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                onClick={async () => {
                  setSelectedVehicle(vehicle);
                  await fetchVehiclePosition(vehicle.id); 
                  setTargetPosition(vehicle.position);
                }}
              >
                <div className="vehicle-info">
                  <strong>{vehicle.plate}</strong>
                  <small>{vehicle.driver}</small>
                </div>
                <div className={`vehicle-status ${vehicle.status === 'En movimiento' ? 'active' : 'stopped'}`}>
                  {vehicle.speed} km/h
                </div>
              </div>
            ))}
          </div>

          <div className="poi-list">
            <h3>Puntos de Interés</h3>
            {pointsOfInterest.map(poi => (
              <button 
                key={poi.id} 
                className="poi-item"
                onClick={() => {
                  setTargetPosition(poi.position);
                }}
              >
                <span>{poi.type === 'base' ? '🏢' : poi.type === 'mine' ? '⛏️' : '⛽'}</span>
                <span>{poi.name}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="map-content">
          <MapContainer 
            center={[-33.4489, -70.6693]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <MapController targetPosition={targetPosition} mapRef={mapRef} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {vehicles.map(vehicle => (
              <React.Fragment key={vehicle.id}>
                <Marker 
                  position={vehicle.position}
                  eventHandlers={{
                      click: () => {
                        setSelectedVehicle(vehicle);
                        setTargetPosition(vehicle.position);
                      }
                    }}
                >
                  <Popup>
                    <div className="popup-content">
                      <h4>{vehicle.plate}</h4>
                      <p><strong>Conductor:</strong> {vehicle.driver}</p>
                      <p><strong>Velocidad:</strong> {vehicle.speed} km/h</p>
                      <p><strong>Estado:</strong> {vehicle.status}</p>
                    </div>
                  </Popup>
                </Marker>
                {vehicle.route.length > 1 && (
                  <Polyline 
                    positions={vehicle.route} 
                    color="blue" 
                    weight={3}
                    opacity={0.6}
                  />
                )}
              </React.Fragment>
            ))}

            {pointsOfInterest.map(poi => (
              <Marker 
                key={poi.id} 
                position={poi.position}
                icon={L.divIcon({
                  html: `<div style="background: red; width: 20px; height: 20px; border-radius: 50%;"></div>`,
                  className: 'custom-marker'
                })}
                eventHandlers={{
                  click: () => {
                    setTargetPosition(poi.position);
                  }
                }}
              >
                <Popup>
                  <h4>{poi.name}</h4>
                  <p>Tipo: {poi.type}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

// NOTE: centering is handled inline in click handlers and marker eventHandlers above.

export default MapView;
