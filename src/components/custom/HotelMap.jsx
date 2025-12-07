import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create beautiful custom icons with SVG
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

// Custom hotel icon with BLUE styling (as per project specification)
const hotelIcon = createCustomIcon('#3498db', 'hotel'); // Blue

// Custom attraction icon with RED styling (as per project specification)
const attractionIcon = createCustomIcon('#e74c3c', 'attraction'); // Red

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const HotelMap = ({ hotels, center, zoom = 13 }) => {
  const [mapCenter, setMapCenter] = useState(center);
  
  useEffect(() => {
    if (center) {
      setMapCenter(center);
    }
  }, [center]);

  if (!hotels || hotels.length === 0) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 text-center">
        <p className="text-gray-500">No hotel locations available to display on map</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-lg h-96 w-full">
      <style>{`
        .custom-map-marker {
          transition: transform 0.2s ease;
        }
        .custom-map-marker:hover {
          transform: scale(1.2) translateY(-5px);
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
      >
        {/* Enhanced Google Maps-like tile layer with maximum detail */}
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          attribution='&copy; Google Maps'
          maxZoom={20}
          subdomains={['mt0','mt1','mt2','mt3']}
        />
        
        {/* Fallback OpenStreetMap tile layer with high detail */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        
        {/* Satellite hybrid view for maximum detail */}
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
          attribution='&copy; Google Maps Satellite'
          maxZoom={20}
          subdomains={['mt0','mt1','mt2','mt3']}
          opacity={0.85}
        />
        
        {hotels.map((hotel, index) => {
          // Check if hotel has valid coordinates
          if (!hotel.geoCoordinates || !hotel.geoCoordinates.lat || !hotel.geoCoordinates.lng) {
            return null;
          }
          
          const position = [hotel.geoCoordinates.lat, hotel.geoCoordinates.lng];
          
          return (
            <Marker 
              key={index} 
              position={position}
              icon={hotelIcon}
            >
              <Popup>
                <div className="min-w-48">
                  <h3 className="font-bold text-gray-800 text-lg">{hotel.hotelName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{hotel.hotelAddress}</p>
                  {hotel.price && (
                    <p className="text-blue-600 font-semibold mt-1">{hotel.price}</p>
                  )}
                  {hotel.rating && (
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < hotel.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-sm text-gray-600">({hotel.rating})</span>
                    </div>
                  )}
                  <button 
                    className="mt-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs px-3 py-1 rounded transition-all duration-300"
                    onClick={() => {
                      window.open(`https://www.booking.com/search.html?ss=${encodeURIComponent(hotel.hotelName)}`, '_blank');
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default HotelMap;