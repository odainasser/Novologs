'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Default location → Riyadh, Saudi Arabia

export default function ClientGoogleMap({
  position: initialPosition,
  onLocationSelect,
  latitude,
  longitude,
  defaultCenter,
}) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [markerPosition, setMarkerPosition] = useState(initialPosition || defaultCenter);

  useEffect(() => {
    setMarkerPosition(initialPosition || defaultCenter);
  }, [initialPosition]);

  const handleMapClick = useCallback(
    (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newPos = { lat, lng };
      setMarkerPosition(newPos);
      if (onLocationSelect) onLocationSelect(newPos);
    },
    [onLocationSelect]
  );

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={markerPosition}
      zoom={markerPosition ? 13 : 6}
      onClick={handleMapClick}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
      }}
    >
      {markerPosition && <Marker position={markerPosition} />}
    </GoogleMap>
  );
}
