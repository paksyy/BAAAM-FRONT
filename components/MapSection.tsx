// components/MapSection.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';

// Apunta a tus copias en /public/images
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl:       '/images/marker-icon.png',
  shadowUrl:     '/images/marker-shadow.png',
});

interface INEGI_Coords { latitud: string; longitud: string; }

const MapSection: React.FC = () => {
  const [coords, setCoords] = useState<[number,number][]>([]);

  useEffect(() => {
    fetch('/INEGI_COORDS.json')
      .then(r => r.json())
      .then((rows: INEGI_Coords[]) => {
        setCoords(
          rows
            .map(r => [parseFloat(r.latitud), parseFloat(r.longitud)] as [number,number])
            .filter(([lat,lng]) => !isNaN(lat) && !isNaN(lng))
        );
      })
      .catch(console.error);
  }, []);

  return (
    <MapContainer
      center={[23.6345, -102.5528]}
      zoom={5}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg shadow-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup
        chunkedLoading
        chunkProgressive
        showCoverageOnHover={false}
        spiderfyOnMaxZoom={false}
      >
        {coords.map((pos, i) => (
          <Marker key={i} position={pos} />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default MapSection;
