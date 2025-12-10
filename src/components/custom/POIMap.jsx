import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create beautiful custom icons with SVG for different POI types
const createCustomIcon = (color, iconType) => {
  let iconPath = '';
  let iconSize = [32, 48];
  let iconAnchor = [16, 48];
  
  switch(iconType) {
    case 'hotel':
      // Bed icon for hotels
      iconPath = `<path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V9c0-1.1-.9-1-1-1z" fill="white"/>
                  <path d="M18 12c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-8 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" fill="${color}"/>
                  <rect x="4" y="10" width="16" height="2" fill="${color}"/>`;
      break;
    case 'attraction':
      // Pin icon for attractions
      iconPath = `<circle cx="12" cy="10" r="3" fill="white"/>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}"/>`;
      break;
    case 'restaurant':
      // Fork and knife icon for restaurants
      iconPath = `<path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" fill="white"/>`;
      break;
    case 'poi':
      // Star icon for general points of interest
      iconPath = `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="${color}"/>`;
      break;
    default:
      // Default pin icon
      iconPath = `<circle cx="12" cy="10" r="3" fill="white"/>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}"/>`;
  }
  
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize[0]}" height="${iconSize[1]}" viewBox="0 0 24 24">
      <!-- Soft shadow -->
      <ellipse cx="12" cy="22" rx="6" ry="2" fill="rgba(0,0,0,0.2)"/>
      <!-- Icon background -->
      ${iconPath}
    </svg>`;

  return L.divIcon({
    html: svgMarkup,
    className: 'custom-map-marker',
    iconSize: iconSize,
    iconAnchor: iconAnchor,
    popupAnchor: [0, -40]
  });
};

// Custom icons for different POI types
const hotelIcon = createCustomIcon('#3498db', 'hotel'); // Blue
const attractionIcon = createCustomIcon('#e74c3c', 'attraction'); // Red
const restaurantIcon = createCustomIcon('#2ecc71', 'restaurant'); // Green
const poiIcon = createCustomIcon('#9b59b6', 'poi'); // Purple

// Fix for default marker icons in Leaflet with fallback to local assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to handle map events and geolocation
const MapEvents = ({ onLocationFound }) => {
  const map = useMap();

  useEffect(() => {
    // Function to handle location found event
    const handleLocationFound = (e) => {
      onLocationFound(e.latlng);
    };

    // Add event listener for location found
    map.on('locationfound', handleLocationFound);

    // Clean up event listener
    return () => {
      map.off('locationfound', handleLocationFound);
    };
  }, [map, onLocationFound]);

  return null;
};

const POIMap = ({ center, zoom = 13, pois = [], onLocationClick }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);

  useEffect(() => {
    if (center) {
      setMapCenter(center);
    }
  }, [center]);

  // Function to get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latlng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(latlng);
          setMapCenter(latlng);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services and try again.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Handle location found from MapEvents
  const handleLocationFound = (latlng) => {
    setUserLocation(latlng);
    setMapCenter(latlng);
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-lg h-96 w-full relative">
      {/* Touch interaction hint for mobile users */}
      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white text-xs z-10 hidden md:block">
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
          <span>Drag • Zoom • Explore</span>
        </div>
      </div>
      {/* Mobile touch hint */}
      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white text-xs z-10 md:hidden">
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
          <span>Touch to explore</span>
        </div>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-10px);}
          60% {transform: translateY(-5px);}
        }
        @keyframes drop {
          0% { transform: translateY(-20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .custom-map-marker {
          animation: drop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, bounce 3s infinite 0.5s;
          transform-origin: bottom center;
          transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
          filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));
        }
        .custom-map-marker:hover {
          animation: none;
          transform: scale(1.3) translateY(-8px);
          z-index: 1000 !important;
          filter: drop-shadow(0 6px 12px rgba(0,0,0,0.4));
        }
        .user-location-marker {
          background-color: #4CAF50;
          border: 2px solid white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          animation: bounce 2s infinite;
        }
        .leaflet-container {
          cursor: grab;
        }
        .leaflet-container.leaflet-dragging {
          cursor: grabbing;
        }
      `}</style>
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        dragging={true}
        tap={true}
        zoomControl={true}
        touchZoom={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        boxZoom={true}
        keyboard={true}
        inertia={true}
        inertiaDeceleration={3000}
        inertiaMaxSpeed={1500}
        zoomAnimation={true}
        markerZoomAnimation={true}
        fadeAnimation={true}
      >
        {/* Stamen Toner tile layer for enhanced map visualization */}
        <TileLayer
          url="https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
          attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
          maxZoom={20}
        />
        
        {/* Map events handler */}
        <MapEvents onLocationFound={handleLocationFound} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'user-location-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-green-600">Your Location</h3>
                <p className="text-sm">Lat: {userLocation.lat.toFixed(4)}</p>
                <p className="text-sm">Lng: {userLocation.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Render POIs */}
        {pois.map((poi, index) => {
          // Check if POI has valid coordinates
          if (!poi.lat || !poi.lng) {
            return null;
          }
          
          const position = [poi.lat, poi.lng];
          
          // Determine icon based on POI type
          let icon = attractionIcon;
          if (poi.type === 'hotel') {
            icon = hotelIcon;
          } else if (poi.type === 'restaurant') {
            icon = restaurantIcon;
          } else if (poi.type === 'poi') {
            icon = poiIcon;
          }
          
          return (
            <Marker 
              key={index} 
              position={position}
              icon={icon}
              className='custom-map-marker'
            >
              <Popup>
                <div className="min-w-48 p-2">
                  <h3 className="font-bold text-gray-800 text-lg">{poi.name}</h3>
                  {poi.description && (
                    <p className="text-sm text-gray-600 mt-1">{poi.description}</p>
                  )}
                  {poi.address && (
                    <p className="text-xs text-gray-500 mt-1">{poi.address}</p>
                  )}
                  {poi.rating && (
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < poi.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-sm text-gray-600">({poi.rating})</span>
                    </div>
                  )}
                  <button 
                    className="mt-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs px-3 py-1 rounded transition-all duration-300"
                    onClick={() => onLocationClick && onLocationClick(poi)}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Geolocation button */}
      <button
        onClick={getUserLocation}
        className="absolute top-4 right-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-all duration-300 z-10"
        title="Find my location"
      >
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
};

export default POIMap;