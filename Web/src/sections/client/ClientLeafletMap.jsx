
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { useState, useEffect } from 'react';
import L from 'leaflet'; // Import L
import 'leaflet/dist/leaflet.css';

// This is crucial for Next.js/Webpack to correctly display markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


// Helper to invalidate map size when container might resize
const MapResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100); // Small delay ensures container dimensions are stable

    // Optional: Add resize listener if needed for dynamic resizing
    // const handleResize = () => map.invalidateSize();
    // window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      // window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  return null;
};

function LocationMarker({ initialPosition, onLocationSelect }) {
  const [position, setPosition] = useState(initialPosition || null);
  const map = useMap();

  // Update marker position if initialPosition prop changes
  useEffect(() => {
    setPosition(initialPosition || null);
    // Optionally fly to the new initial position if it's set
    if (initialPosition) {
      map.flyTo(initialPosition, map.getZoom());
    }
  }, [initialPosition, map]);

  useMapEvents({
    click(e) {
      const newPos = e.latlng;
      setPosition(newPos);
      map.flyTo(newPos, map.getZoom());
      if (onLocationSelect) {
        onLocationSelect(newPos);
      }
    },
    // locationfound(e) { // Only needed if using map.locate()
    //   setPosition(e.latlng);
    //   map.flyTo(e.latlng, map.getZoom());
    //   if (onLocationSelect) {
    //     onLocationSelect(e.latlng);
    //   }
    // },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        Selected Location: <br /> Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}
      </Popup>
    </Marker>
  );
}

// Main Map Component
export default function ClientLeafletMap({
  position: initialPosition = null, 
  onLocationSelect,
}) {
  const defaultCenter = [36.0339, 1.6596];

  return (
    <MapContainer
      style={{ height: '100%', width: '100%' }}
      center={initialPosition || defaultCenter}
      zoom={initialPosition ? 13 : 8}
      scrollWheelZoom={true}
      minZoom={3}
    >
      <MapResizeHandler />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker initialPosition={initialPosition} onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
}
