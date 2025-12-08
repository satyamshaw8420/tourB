import React from 'react';
import HotelMap from './HotelMap';

const HotelRecommendations = ({ hotels, destination }) => {
  if (!hotels || hotels.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Hotel Recommendations</h3>
        <p className="text-gray-600">No hotel recommendations available for {destination}.</p>
      </div>
    );
  }

  // Get the center coordinates for the map
  const mapCenter = hotels[0]?.geoCoordinates 
    ? [hotels[0].geoCoordinates.lat, hotels[0].geoCoordinates.lng] 
    : [0, 0];

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">🏨</span> Recommended Hotels in {destination}
        </h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          {hotels.length} hotels found
        </span>
      </div>
      
      {/* Hotel Map */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Hotel Locations</h3>
        <HotelMap 
          hotels={hotels} 
          center={mapCenter}
        />
      </div>
      
      {/* Hotel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="h-48 overflow-hidden">
              <img 
                src={hotel.hotelImageUrl || `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(hotel.hotelName || 'Hotel')}`} 
                alt={hotel.hotelName || 'Hotel Image'}
                className="w-full h-full object-cover"
                onError={(e) => { 
                  e.target.src = `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(hotel.hotelName || 'Hotel')}`;
                }}
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800">{hotel.hotelName || 'Hotel Name'}</h3>
                <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{hotel.rating || 'N/A'}</span>
                </div>
              </div>
              <p className="text-gray-600 mb-3">{hotel.hotelAddress || 'Address not available'}</p>
              <p className="text-gray-700 mb-4">{hotel.description || 'Description not available'}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-600">{hotel.price || 'Price not available'}</span>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  onClick={() => {
                    // Open hotel booking in new tab (would integrate with real booking system in production)
                    window.open(`https://www.booking.com/search.html?ss=${encodeURIComponent(hotel.hotelName)}`, '_blank');
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Additional Info */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">💡 Booking Tips</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Prices shown are approximate and may vary based on dates and availability</li>
          <li>Check reviews and amenities before booking</li>
          <li>Consider booking through trusted platforms for secure transactions</li>
        </ul>
      </div>
    </div>
  );
};

export default HotelRecommendations;