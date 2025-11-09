import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapView.css';

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
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

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
        
        // Transformar datos de la API al formato esperado para el mapa
        const transformedVehicles = data
          .filter(v => v.userId != null) // Solo vehículos con conductor asignado
          .map(v => ({
            id: v.id,
            plate: v.plate,
            driver: v.driverFirstName && v.driverLastName 
              ? `${v.driverFirstName} ${v.driverLastName}` 
              : v.driverEmail || 'Sin conductor',
            driverId: v.userId,
            position: [-33.4489, -70.6693], // Posición por defecto (Santiago, Chile)
            speed: 0, // TODO: obtener velocidad real
            status: 'Sin ubicación', // TODO: obtener status real
            route: [[-33.4489, -70.6693]] // TODO: obtener ruta real
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

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 60px)' }}>
          <h2>Cargando mapa...</h2>
        </div>
      ) : (
        <div className="map-container">
        <aside className="map-sidebar">
          <button className="menu-item" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button className="menu-item active">
            Mapa en Tiempo Real
          </button>
          {user.role !== 'driver' && (
            <>
              <button className="menu-item" onClick={() => navigate('/history')}>
                Historial
              </button>
              <button className="menu-item" onClick={() => navigate('/reports')}>
                Reportes
              </button>
            </>
          )}
          {user.role === 'admin' && (
            <button className="menu-item" onClick={() => navigate('/users')}>
              Gestión de Usuarios
            </button>
          )}

          <div className="vehicle-list">
            <h3>{user.role === 'driver' ? 'Mi Vehículo' : 'Vehículos Activos'}</h3>
            {vehicles.length === 0 ? (
              <p style={{ padding: '10px', color: '#888' }}>
                {user.role === 'driver' ? 'No tienes vehículo asignado' : 'No hay vehículos activos'}
              </p>
            ) : (
              vehicles.map(vehicle => (
                <div 
                  key={vehicle.id} 
                  className={`vehicle-item ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setTargetPosition(vehicle.position);
                  }}
                >
                  <div className="vehicle-info">
                    <strong>{vehicle.plate}</strong>
                    <small>{user.role === 'driver' ? 'Tu vehículo' : vehicle.driver}</small>
                  </div>
                  <div className={`vehicle-status ${vehicle.status === 'En movimiento' ? 'active' : 'stopped'}`}>
                    {vehicle.speed} km/h
                  </div>
                </div>
              ))
            )}
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
      )}
    </div>
  );
};

// NOTE: centering is handled inline in click handlers and marker eventHandlers above.

export default MapView;
