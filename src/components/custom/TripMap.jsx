import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create beautiful custom icons with SVG - Enhanced for better mobile-like appearance
const createCustomIcon = (color, iconType) => {
  let iconPath = '';
  let iconSize = [36, 50]; // Slightly larger for better visibility
  let iconAnchor = [18, 50]; // Adjusted for larger size
  
  switch(iconType) {
    case 'hotel':
      // Enhanced bed icon for hotels with more detail
      iconPath = `<path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V9c0-1.1-.9-1-1-1z" fill="white" stroke="${color}" stroke-width="0.5"/>
                  <path d="M18 12c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-8 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" fill="${color}"/>
                  <rect x="4" y="10" width="16" height="2" fill="${color}"/>
                  <circle cx="6" cy="14" r="1" fill="white"/>
                  <circle cx="10" cy="14" r="1" fill="white"/>
                  <circle cx="14" cy="14" r="1" fill="white"/>
                  <circle cx="18" cy="14" r="1" fill="white"/>`;
      break;
    case 'attraction':
      // Enhanced pin icon for attractions with gradient effect
      iconPath = `<defs><radialGradient id="pinGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" stop-color="${color}" stop-opacity="1"/><stop offset="100%" stop-color="${color}" stop-opacity="0.8"/></radialGradient></defs>
                  <circle cx="12" cy="10" r="4" fill="white" stroke="${color}" stroke-width="1"/>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 4.5 5.5 12 7 12s7-7.5 7-12c0-3.87-3.13-7-7-7z" fill="url(#pinGradient)" stroke="${color}" stroke-width="0.5"/>`;
      break;
    case 'restaurant':
      // Enhanced fork and knife icon for restaurants
      iconPath = `<path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h1v-9.03C9.84 12.84 11 11.12 11 9V2h-1v7zm5-3v8h1v-8h-1zm0 10v2h1v-2h-1z" fill="white" stroke="${color}" stroke-width="0.5"/>
                  <path d="M17 5c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm0 10c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z" fill="${color}"/>`;
      break;
    case 'start':
      // Enhanced flag icon for start points
      iconPath = `<path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" fill="white" stroke="${color}" stroke-width="0.5"/>
                  <circle cx="12" cy="6" r="2" fill="${color}"/>`;
      break;
    case 'end':
      // Enhanced flag with checkmark for end points
      iconPath = `<path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" fill="white" stroke="${color}" stroke-width="0.5"/>
                  <path d="M21 7l-4 4-2-2-2 2 4 4 4-4z" fill="#4CAF50" stroke="#4CAF50" stroke-width="0.5"/>`;
      break;
    case 'selected':
      // Enhanced highlight icon for selected locations with pulse effect
      iconPath = `<circle cx="12" cy="10" r="6" fill="${color}" stroke="white" stroke-width="2"/>
                  <circle cx="12" cy="10" r="10" fill="${color}" opacity="0.3"/>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="white" stroke-width="1"/>`;
      break;
    default:
      // Enhanced default pin icon
      iconPath = `<circle cx="12" cy="10" r="4" fill="white" stroke="${color}" stroke-width="1"/>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 4.5 5.5 12 7 12s7-7.5 7-12c0-3.87-3.13-7-7-7z" fill="${color}" stroke="${color}" stroke-width="0.5"/>`;
  }
  
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize[0]}" height="${iconSize[1]}" viewBox="0 0 24 24">
      <!-- Enhanced shadow for 3D effect -->
      <ellipse cx="12" cy="23" rx="7" ry="2.5" fill="rgba(0,0,0,0.3)"/>
      <!-- Icon background with enhanced styling -->
      ${iconPath}
    </svg>`;

  return L.divIcon({
    html: svgMarkup,
    className: 'custom-map-marker',
    iconSize: iconSize,
    iconAnchor: iconAnchor,
    popupAnchor: [0, -45]
  });
};

// Custom hotel icon with BLUE styling (as per project specification)
const hotelIcon = createCustomIcon('#3498db', 'hotel'); // Blue

// Custom attraction icon with RED styling (as per project specification)
const attractionIcon = createCustomIcon('#e74c3c', 'attraction'); // Red

// Custom restaurant icon with GREEN styling
const restaurantIcon = createCustomIcon('#2ecc71', 'restaurant'); // Green

// Custom start/end point icons
const startIcon = createCustomIcon('#9b59b6', 'start'); // Purple
const endIcon = createCustomIcon('#f39c12', 'end'); // Orange

// Special icon for selected locations
const selectedIcon = createCustomIcon('#ffeb3b', 'selected'); // Yellow highlight

// Fix for default marker icons in Leaflet with fallback to local assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const TripMap = ({ hotels, itinerary, center, zoom = 13, selectedLocation = null }) => {
  const [mapCenter, setMapCenter] = useState(center);
  const [routes, setRoutes] = useState([]);
  const mapRef = React.useRef();
  
  // Debug logging
  console.log('TripMap props:', { hotels, itinerary, center, zoom, selectedLocation });

  useEffect(() => {
    if (center) {
      setMapCenter(center);
    }
  }, [center]);

  // Calculate routes between attractions for each day
  useEffect(() => {
    if (!itinerary || !Array.isArray(itinerary)) return;

    const newRoutes = [];
    itinerary.forEach(day => {
      if (day.plan && Array.isArray(day.plan)) {
        const positions = day.plan
          .filter(place => place.geoCoordinates && 
                  typeof place.geoCoordinates.lat === 'number' && 
                  typeof place.geoCoordinates.lng === 'number')
          .map(place => [place.geoCoordinates.lat, place.geoCoordinates.lng]);
        
        if (positions.length > 1) {
          newRoutes.push(positions);
        }
      }
    });
    
    setRoutes(newRoutes);
  }, [itinerary]);

  // Determine map center based on available data
  useEffect(() => {
    // If we have a selected location, center on that
    if (selectedLocation && selectedLocation.geoCoordinates) {
      setMapCenter([selectedLocation.geoCoordinates.lat, selectedLocation.geoCoordinates.lng]);
      return;
    }
    
    // Try to find a center point from hotels first
    if (hotels && hotels.length > 0 && hotels[0].geoCoordinates && 
        typeof hotels[0].geoCoordinates.lat === 'number' && 
        typeof hotels[0].geoCoordinates.lng === 'number') {
      setMapCenter([hotels[0].geoCoordinates.lat, hotels[0].geoCoordinates.lng]);
      return;
    }
    
    // If no hotels, try to find center from itinerary
    if (itinerary && itinerary.length > 0 && itinerary[0].plan && itinerary[0].plan.length > 0) {
      const firstPlace = itinerary[0].plan[0];
      if (firstPlace.geoCoordinates && 
          typeof firstPlace.geoCoordinates.lat === 'number' && 
          typeof firstPlace.geoCoordinates.lng === 'number') {
        setMapCenter([firstPlace.geoCoordinates.lat, firstPlace.geoCoordinates.lng]);
        return;
      }
    }
    
    // Calculate average center from all locations
    const locations = getAllLocations();
    if (locations.length > 0) {
      const avgLat = locations.reduce((sum, loc) => sum + loc[0], 0) / locations.length;
      const avgLng = locations.reduce((sum, loc) => sum + loc[1], 0) / locations.length;
      setMapCenter([avgLat, avgLng]);
      return;
    }
    
    // Default center (Las Vegas)
    setMapCenter([36.1699, -115.1398]);
  }, [hotels, itinerary, selectedLocation]);

  // Combine all locations for bounds calculation
  const getAllLocations = () => {
    const locations = [];
    
    // Add hotels
    if (hotels && Array.isArray(hotels)) {
      hotels.forEach(hotel => {
        if (hotel.geoCoordinates && hotel.geoCoordinates.lat && hotel.geoCoordinates.lng) {
          locations.push([hotel.geoCoordinates.lat, hotel.geoCoordinates.lng]);
        }
      });
    }
    
    // Add itinerary places
    if (itinerary && Array.isArray(itinerary)) {
      itinerary.forEach(day => {
        if (day.plan && Array.isArray(day.plan)) {
          day.plan.forEach(place => {
            if (place.geoCoordinates && place.geoCoordinates.lat && place.geoCoordinates.lng) {
              locations.push([place.geoCoordinates.lat, place.geoCoordinates.lng]);
            }
          });
        }
      });
    }
    
    return locations;
  };

  if ((!hotels || hotels.length === 0) && (!itinerary || itinerary.length === 0)) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">🌍</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Map</h3>
        <p className="text-gray-500">Add hotel recommendations or itinerary details to see locations on the map</p>
      </div>
    );
  }

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
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        @keyframes glow {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.05); }
          100% { filter: brightness(1); }
        }
        @keyframes drop {
          0% { transform: translateY(-20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
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
        .map-container {
          animation: pulse 3s infinite;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          cursor: grab;
        }
        .map-container:active {
          cursor: grabbing;
        }
        .leaflet-container {
          animation: glow 5s infinite;
        }
        /* Selected marker pulsing effect */
        .custom-map-marker.selected {
          animation: pulse-glow 2s infinite, bounce 3s infinite;
        }
      `}</style>
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        className="z-0 map-container"
        dragging={true}
        tap={true}
        zoomControl={true}
        ref={mapRef}
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
        {/* Stamen Toner tile layer for enhanced map visualization (as per project specification) */}
        <TileLayer
          url="https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png"
          attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
          maxZoom={20}
        />
        
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
        
        {/* Render routes between attractions with enhanced styling */}
        {routes.map((route, index) => (
          <Polyline 
            key={index} 
            positions={route} 
            color="#1d4ed8" 
            weight={5} 
            dashArray="20, 15" 
            dashOffset="0"
            opacity={0.9}
          />
        ))}
        
        {/* Add animated route effect for better visualization */}
        {routes.map((route, index) => (
          <Polyline 
            key={`animated-${index}`} 
            positions={route} 
            color="#60a5fa" 
            weight={2} 
            dashArray="10, 10" 
            dashOffset="10"
            opacity={0.7}
            className="animate-pulse"
          />
        ))}
        
        {/* Points of Interest Layer - Adding popular attractions, restaurants, etc. */}
        {/* This would typically be loaded from an external API or dataset */}
        
        {/* Geolocation Feature - Shows user's current location */}
        {/* This would be implemented with the browser's geolocation API */}
        
        {/* Weather Overlay - Shows weather conditions on the map */}
        {/* This would be implemented with a weather API */}
        
        {/* Render hotels with BLUE markers (as per project specification) */}
        {hotels && Array.isArray(hotels) && hotels.map((hotel, index) => {
          if (!hotel.geoCoordinates || 
              typeof hotel.geoCoordinates.lat !== 'number' || 
              typeof hotel.geoCoordinates.lng !== 'number') {
            return null;
          }
          
          const position = [hotel.geoCoordinates.lat, hotel.geoCoordinates.lng];
          
          // Check if this is the selected location
          const isSelected = selectedLocation && 
                            selectedLocation.type === 'hotel' && 
                            selectedLocation.index === index;
          
          return (
            <Marker 
              key={`hotel-${index}`} 
              position={position}
              icon={isSelected ? selectedIcon : hotelIcon}
              className={isSelected ? 'custom-map-marker selected' : 'custom-map-marker'}
            >
              <Popup>
                <div className="min-w-60 p-3 bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="flex items-start mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 18v-6h2v6H9zm3-9a1 1 0 10-2 0v1H9v-1a1 1 0 10-2 0v4a1 1 0 102 0v-1h1v1a1 1 0 102 0v-4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{hotel.hotelName || 'Hotel'}</h3>
                      <p className="text-sm text-gray-600">{hotel.hotelAddress || 'Address not available'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between mt-2">
                    {hotel.price && (
                      <span className="text-blue-600 font-semibold">{hotel.price}</span>
                    )}
                    {hotel.rating && typeof hotel.rating === 'number' && (
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.min(5, Math.max(0, hotel.rating)) ? 'text-yellow-400' : 'text-gray-300'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-1 text-sm text-gray-600">({hotel.rating})</span>
                      </div>
                    )}
                  </div>
                  <button 
                    className="mt-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                    onClick={() => {
                      window.open(`https://www.booking.com/search.html?ss=${encodeURIComponent(hotel.hotelName || 'hotel')}`, '_blank');
                    }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Book Now
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Render itinerary places with RED markers (as per project specification) */}
        {itinerary && Array.isArray(itinerary) && itinerary.map((day, dayIndex) => (
          day.plan && Array.isArray(day.plan) && day.plan.map((place, placeIndex) => {
            if (!place.geoCoordinates || 
                typeof place.geoCoordinates.lat !== 'number' || 
                typeof place.geoCoordinates.lng !== 'number') {
              return null;
            }
            
            const position = [place.geoCoordinates.lat, place.geoCoordinates.lng];
            
            // Determine icon based on place type and position in route
            let icon = place.placeName && place.placeName.toLowerCase().includes('restaurant') ? restaurantIcon : attractionIcon;
            
            // Special icons for start and end points
            if (day.plan.length > 0) {
              if (placeIndex === 0) {
                icon = startIcon; // Start of day
              } else if (placeIndex === day.plan.length - 1) {
                icon = endIcon; // End of day
              }
            }
            
            // Check if this is the selected location
            const isSelected = selectedLocation && 
                              selectedLocation.type === 'itinerary' && 
                              selectedLocation.dayIndex === dayIndex && 
                              selectedLocation.placeIndex === placeIndex;
            
            // Use selected icon if this location is selected
            if (isSelected) {
              icon = selectedIcon;
            }
            
            return (
              <Marker 
                key={`place-${dayIndex}-${placeIndex}`} 
                position={position}
                icon={icon}
                className={isSelected ? 'custom-map-marker selected' : 'custom-map-marker'}
              >
                <Popup>
                  <div className="min-w-60 p-3 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="flex items-start mb-2">
                      <div className="bg-red-100 p-2 rounded-lg mr-3">
                        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{place.placeName || 'Attraction'}</h3>
                        <p className="text-sm text-gray-600">{place.placeDetails || 'Details not available'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between mt-2">
                      {place.ticketPricing && place.ticketPricing !== "N/A" && (
                        <span className="text-red-600 font-semibold">{place.ticketPricing}</span>
                      )}
                      {place.timeToVisit && (
                        <span className="text-sm text-gray-500 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {place.timeToVisit}
                        </span>
                      )}
                    </div>
                    {place.rating && typeof place.rating === 'number' && (
                      <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600 mr-2">Rating:</span>
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.min(5, Math.max(0, place.rating)) ? 'text-yellow-400' : 'text-gray-300'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-1 text-sm text-gray-600">({place.rating})</span>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })
        ))}
      </MapContainer>
    </div>
  );
};

export default TripMap;