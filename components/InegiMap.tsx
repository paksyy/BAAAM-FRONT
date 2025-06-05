'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configuración de iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

// Componente para añadir marcadores INEGI
interface INEGI_Coords { latitud: string; longitud: string; }
const InegiMarkers: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    fetch('/INEGI_COORDS.json')
      .then(res => res.json())
      .then((rows: INEGI_Coords[]) => {
        rows.forEach(({ latitud, longitud }) => {
          const lat = +latitud, lng = +longitud;
          if (!isNaN(lat) && !isNaN(lng)) L.marker([lat, lng]).addTo(map);
        });
        map.invalidateSize();
      })
      .catch(console.error);
  }, [map]);
  return null;
};

const InegiMap: React.FC = () => (
  <MapContainer
    center={[23.6345, -102.5528]}
    zoom={5}
    scrollWheelZoom
    style={{ height: '100%', width: '100%' }}
    className="rounded-lg shadow-lg"
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <InegiMarkers />
  </MapContainer>
);

export default InegiMap;
