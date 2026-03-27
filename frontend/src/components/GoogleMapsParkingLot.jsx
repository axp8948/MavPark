import React, { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Circle, GroundOverlay } from '@react-google-maps/api';

// Map container style
const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '12px',
};

const DEFAULT_CENTER = {
  lat: 32.733149,
  lng: -97.111563,
};

// Color mapping for spot statuses
const getSpotColor = (status) => {
  switch (status) {
    case 'available':
    case 'free':
      return '#22c55e'; // Green
    case 'occupied':
      return '#ef4444'; // Red
    case 'reserved':
      return '#a855f7'; // Purple
    default:
      return '#f97316'; // Orange (unknown/no data)
  }
};

const GoogleMapsParkingLot = ({
  spots,
  spotCoordinates,
  lotName,
  onSpotClick,
  center = DEFAULT_CENTER,
  overlayBounds,
  overlayImage,
  zoom = 19,
}) => {
  const [map, setMap] = useState(null);

  // Debug: Log spots and coordinates on mount/update
  useEffect(() => {
    console.log('GoogleMapsParkingLot - Total spots:', spots?.length);
    console.log('GoogleMapsParkingLot - Coordinate keys:', Object.keys(spotCoordinates || {}).slice(0, 5), '...');
    console.log('GoogleMapsParkingLot - Sample spot:', spots?.[0]);
    console.log('GoogleMapsParkingLot - Sample coordinate:', spotCoordinates?.['401']);
  }, [spots, spotCoordinates]);

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Calculate availability stats
  const stats = spots.reduce(
    (acc, spot) => {
      if (spot.status === 'available' || spot.status === 'free') acc.available++;
      else if (spot.status === 'occupied') acc.occupied++;
      else if (spot.status === 'reserved') acc.reserved++;
      else acc.noData++;
      return acc;
    },
    { available: 0, occupied: 0, reserved: 0, noData: 0 }
  );

  if (loadError) {
    return <div className="text-red-500">Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-800 rounded-xl">
        <div className="text-white">Loading Map...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Legend Panel - Top Right */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
        <h3 className="font-bold text-gray-800 mb-2">{lotName || 'Parking Lot'}</h3>
        <p className="text-sm text-blue-600 italic mb-3">This lot requires a permit</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
            <span>Available: {stats.available}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
            <span>Occupied: {stats.occupied}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#a855f7' }} />
            <span>Reserved: {stats.reserved}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }} />
            <span>No Data: {stats.noData}</span>
          </div>
        </div>
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        mapTypeId="hybrid"
        options={{
          mapTypeControl: true,
          mapTypeControlOptions: {
            mapTypeIds: ['roadmap', 'satellite', 'hybrid'],
          },
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          tilt: 0, // Look straight down, no 3D tilt
        }}
      >
        {overlayImage && overlayBounds && (
          <GroundOverlay
            url={overlayImage}
            bounds={overlayBounds}
            opacity={0.85}
          />
        )}

        {/* Render parking spots as circles/dots on top of the overlay */}
        {spots.map((spot) => {
          const coords = spotCoordinates[spot.id] || spotCoordinates[spot.number];
          
          if (!coords) return null;

          // Get center point from the polygon coordinates (average of corners)
          // Or if it's already a center point object, use it directly
          let center;
          if (Array.isArray(coords)) {
            // Polygon format: average the corners
            const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
            const avgLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;
            center = { lat: avgLat, lng: avgLng };
          } else if (coords.lat !== undefined && coords.lng !== undefined) {
            // Simple center-point format (from calibration tool)
            center = { lat: coords.lat, lng: coords.lng };
          } else {
            return null;
          }

          return (
            <Circle
              key={spot.id || spot.number}
              center={center}
              radius={1.5} // Radius in meters - small dots
              options={{
                fillColor: getSpotColor(spot.status),
                fillOpacity: 0.9,
                strokeColor: '#ffffff',
                strokeOpacity: 1,
                strokeWeight: 1,
                clickable: true,
              }}
              onClick={() => onSpotClick && onSpotClick(spot)}
            />
          );
        })}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapsParkingLot;