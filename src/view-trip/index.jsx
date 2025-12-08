import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '../components/ui/button';
import TripFinancingPanel from '../components/custom/TripFinancingPanel';
import HotelMap from '../components/custom/HotelMap';
import TripMap from '../components/custom/TripMap';
import { categorizeActivitiesByTime, getTimePeriodLabel, getTimePeriodDescription } from '@/utils/itineraryHelpers';
import { getPlaceImage } from '@/service/ImageGenerationService';

// Function to enhance places with real images
const enhancePlacesWithImages = async (itinerary) => {
  if (!itinerary || !Array.isArray(itinerary)) return itinerary;
  
  const enhancedItinerary = [];
  
  for (const day of itinerary) {
    if (!day.plan || !Array.isArray(day.plan)) {
      enhancedItinerary.push(day);
      continue;
    }
    
    const enhancedPlan = [];
    for (const place of day.plan) {
      // If place doesn't have an image URL, try to get one from Unsplash
      if (!place.placeImageUrl) {
        try {
          const imageUrl = await getPlaceImage(place.placeName);
          if (imageUrl) {
            place.placeImageUrl = imageUrl;
          }
        } catch (error) {
          console.error('Error getting image for place:', place.placeName, error);
        }
      }
      enhancedPlan.push(place);
    }
    
    enhancedItinerary.push({
      ...day,
      plan: enhancedPlan
    });
  }
  
  return enhancedItinerary;
};

const ViewTrip = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [showFinancing, setShowFinancing] = useState(false);
  const [enhancedTravelPlan, setEnhancedTravelPlan] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null); // Add this state for map highlighting

  // Fetch trip data using Convex - only if we have a valid tripId
  const trip = tripId ? useQuery(api.tripsQueries.getTripById, { id: tripId }) : null;

  // Function to handle "View on Map" clicks for itinerary locations
  const handleViewOnMap = (location, type, dayIndex, placeIndex) => {
    setSelectedLocation({
      ...location,
      type: type,
      dayIndex: dayIndex,
      placeIndex: placeIndex
    });
    
    // Scroll to the map section
    setTimeout(() => {
      const mapSection = document.getElementById('trip-itinerary-map');
      if (mapSection) {
        mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Effect to enhance the travel plan with real images once trip data is available
  useEffect(() => {
    if (!trip) return;
    
    const enhancePlan = async () => {
      try {
        // Extract user selection and trip data
        const userSelection = trip.userSelection;
        const tripData = trip.tripData;
        
        // Parse trip data if it's a string
        let parsedData = null;
        if (typeof tripData === 'string') {
          try {
            // Try to find JSON content in the string
            let jsonString = tripData.trim();
            const jsonStart = jsonString.indexOf('{');
            const jsonEnd = jsonString.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
              jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
              parsedData = JSON.parse(jsonString);
            } else {
              // If no JSON found, try to parse the whole string
              parsedData = JSON.parse(tripData);
            }
          } catch (parseError) {
            console.error('Error parsing trip data:', parseError);
            // Try to extract JSON-like content
            try {
              const jsonString = tripData.match(/\{[^]*\}/);
              if (jsonString && jsonString[0]) {
                parsedData = JSON.parse(jsonString[0]);
              } else {
                parsedData = tripData;
              }
            } catch (extractError) {
              console.error('Error extracting JSON from trip data:', extractError);
              parsedData = tripData;
            }
          }
        } else {
          parsedData = tripData;
        }
        
        // Debug logging
        console.log('Trip data received:', trip);
        console.log('Parsed trip data:', parsedData);
        console.log('Hotels data:', parsedData?.hotels);
        console.log('Itinerary data:', parsedData?.itinerary);
        
        // Extract hotels and itinerary data
        let hotels = parsedData?.hotels || [];
        let itinerary = parsedData?.itinerary || [];
        
        // Handle different itinerary formats
        if (itinerary && !Array.isArray(itinerary) && typeof itinerary === 'object') {
          if (Array.isArray(itinerary.days)) {
            itinerary = itinerary.days;
          } else {
            // Convert object values to array
            const itineraryArray = Object.values(itinerary);
            if (Array.isArray(itineraryArray) && itineraryArray.length > 0) {
              itinerary = itineraryArray;
            }
          }
        }
        
        // Filter hotels based on user's budget selection if available
        if (userSelection?.budget) {
          hotels = filterHotelsByUserBudget(hotels, userSelection.budget);
        }
        
        // Enhance hotels with real images
        const enhancedHotels = [];
        for (const hotel of hotels) {
          // If hotel doesn't have an image URL, try to get one from Unsplash
          if (!hotel.hotelImageUrl) {
            try {
              const imageUrl = await getPlaceImage(hotel.hotelName);
              if (imageUrl) {
                hotel.hotelImageUrl = imageUrl;
              }
            } catch (error) {
              console.error('Error getting image for hotel:', hotel.hotelName, error);
            }
          }
          enhancedHotels.push(hotel);
        }
        
        // Enhance itinerary with real images
        const enhancedItinerary = await enhancePlacesWithImages(itinerary);
        
        // Create the enhanced travel plan
        setEnhancedTravelPlan({
          hotels: enhancedHotels,
          itinerary: enhancedItinerary
        });
      } catch (err) {
        console.error('Error enhancing travel plan:', err);
      }
    };
    
    enhancePlan();
  }, [trip]);

  // Function to filter hotels based on user's budget selection
  const filterHotelsByUserBudget = (hotels, budget) => {
    // Map budget IDs to price ranges (in Indian Rupees per night)
    const budgetRanges = {
      '1': { min: 0, max: 7000, label: 'Cheap' },      // Cheap budget
      '2': { min: 5000, max: 15000, label: 'Moderate' }, // Moderate budget
      '3': { min: 12000, max: 100000, label: 'Luxury' }  // Luxury budget
    };
    
    const range = budgetRanges[budget];
    if (!range) return hotels; // If budget not recognized, return all hotels
    
    return hotels.filter(hotel => {
      // Extract numeric price from string like "₹7,800 per night"
      const priceMatch = hotel.price?.match(/₹([\d,]+)/);
      if (!priceMatch) return true; // If we can't parse the price, include the hotel
      
      const price = parseInt(priceMatch[1].replace(/,/g, ''));
      return price >= range.min && price <= range.max;
    });
  };

  // Loading state
  if (!tripId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Not Found</h2>
          <p className="text-gray-600 mb-6">No trip ID was provided. Please go back and select a valid trip.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (trip === undefined) {
    // Still loading
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Trip</h2>
          <p className="text-gray-600">Please wait while we fetch your trip details...</p>
        </div>
      </div>
    );
  }

  if (trip === null) {
    // Trip not found
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the trip you're looking for. Please check the trip ID and try again.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!enhancedTravelPlan) {
    // Still processing
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Processing Trip Data</h2>
          <p className="text-gray-600">We're preparing your personalized travel plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {trip.userSelection?.location?.label || 'Trip'} Itinerary
          </h1>
          <p className="text-gray-600">Your personalized travel plan</p>
        </div>

        {/* Trip Summary Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-r border-gray-100 pr-4">
              <p className="text-gray-600 text-sm">Destination</p>
              <p className="font-semibold text-lg">{trip.userSelection?.location?.label || 'Not specified'}</p>
            </div>
            <div className="border-r border-gray-100 pr-4">
              <p className="text-gray-600 text-sm">Duration</p>
              <p className="font-semibold text-lg">{trip.userSelection?.days || 'N/A'} Days</p>
            </div>
            <div className="border-r border-gray-100 pr-4">
              <p className="text-gray-600 text-sm">Travelers</p>
              <p className="font-semibold text-lg">{trip.userSelection?.travelers || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Budget</p>
              <p className="font-semibold text-lg">{trip.userSelection?.budget || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Hotels Section with Integrated Map */}
        {enhancedTravelPlan?.hotels && enhancedTravelPlan.hotels.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-2">🏨</span> Recommended Hotels in {trip.userSelection?.location?.label || 'Your Destination'}
              </h2>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {enhancedTravelPlan.hotels.length} hotels found
              </span>
            </div>
            
            {/* Combined Trip Map showing hotels */}
            <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Hotel Locations Map
                </h3>
              </div>
              <HotelMap 
                hotels={enhancedTravelPlan.hotels}
                center={enhancedTravelPlan.hotels[0]?.geoCoordinates ? [enhancedTravelPlan.hotels[0].geoCoordinates.lat, enhancedTravelPlan.hotels[0].geoCoordinates.lng] : [0, 0]}
                zoom={13}
              />
            </div>
            
            {/* Hotel Cards in a Beautiful Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {enhancedTravelPlan.hotels.map((hotel, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={hotel.hotelImageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'} 
                      alt={hotel.hotelName || 'Hotel Image'}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'; }}
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
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                        onClick={() => {
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
          </div>
        )}

        {/* Enhanced Itinerary Section with Map Integration */}
        {enhancedTravelPlan?.itinerary && enhancedTravelPlan.itinerary.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-2">📅</span> Daily Itinerary
              </h2>
              <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                {enhancedTravelPlan.itinerary.length} Days
              </span>
            </div>
            
            {/* Enhanced Combined Trip Map showing itinerary */}
            <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border border-gray-200" id="trip-itinerary-map">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Trip Itinerary Map
                </h3>
              </div>
              <TripMap 
                itinerary={enhancedTravelPlan.itinerary}
                center={enhancedTravelPlan.itinerary && enhancedTravelPlan.itinerary[0]?.plan && enhancedTravelPlan.itinerary[0].plan[0]?.geoCoordinates ? [enhancedTravelPlan.itinerary[0].plan[0].geoCoordinates.lat, enhancedTravelPlan.itinerary[0].plan[0].geoCoordinates.lng] : [0, 0]}
                zoom={13}
                selectedLocation={selectedLocation} // Pass the selected location to the map
              />
            </div>
            
            <div className="space-y-8">
              {enhancedTravelPlan.itinerary.map((dayData, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white">{dayData.day || `Day ${index + 1}`}</h3>
                      <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                        {dayData.date || `Day ${index + 1}`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Organize activities by time periods */}
                    {dayData.plan && (() => {
                      const timePeriods = categorizeActivitiesByTime(dayData.plan);
                      const hasMorning = timePeriods.morning.length > 0;
                      const hasAfternoon = timePeriods.afternoon.length > 0;
                      const hasEvening = timePeriods.evening.length > 0;

                      return (
                        <div className="space-y-8">
                          {/* Morning Activities */}
                          {hasMorning && (
                            <div>
                              <div className="flex items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                  <span className="mr-2">🌅</span> Morning Activities
                                </h3>
                                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                  {timePeriods.morning.length} activities
                                </span>
                              </div>
                              <div className="space-y-6">
                                {timePeriods.morning.map((place, placeIndex) => (
                                  <div key={`morning-${placeIndex}`} className="flex flex-col md:flex-row gap-6 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                                    <div className="md:w-1/3 h-48 rounded-xl overflow-hidden shadow-md">
                                      <img 
                                        src={place.placeImageUrl || `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(place.placeName || 'Place')}`} 
                                        alt={place.placeName || 'Place Image'}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        onError={(e) => { 
                                          e.target.src = `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(place.placeName || 'Place')}`;
                                        }}
                                      />
                                    </div>
                                    
                                    <div className="md:w-2/3">
                                      <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-xl font-bold text-gray-800">{place.placeName || 'Place Name'}</h4>
                                        <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                          <span>{place.rating || 'N/A'}</span>
                                        </div>
                                      </div>
                                      
                                      <p className="text-gray-600 mb-4">{place.placeDetails || 'Details not available'}</p>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <span className="text-gray-700">{place.timeToVisit || place.timeTravel || 'Time not specified'}</span>
                                        </div>
                                        
                                        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <span className="text-gray-700 font-semibold">{place.ticketPricing || 'Price not available'}</span>
                                        </div>
                                        
                                        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                          </svg>
                                          <button 
                                            onClick={() => handleViewOnMap(place, 'itinerary', index, placeIndex)}
                                            className="text-gray-700 underline hover:text-blue-600"
                                          >
                                            View on Map
                                          </button>
                                        </div>
                                      </div>
                                      
                                      {/* Additional place details if available */}
                                      {place.bestTimeToVisit && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                          <p className="text-sm text-blue-800">
                                            <span className="font-semibold">Best Time to Visit:</span> {place.bestTimeToVisit}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Afternoon Activities */}
                          {hasAfternoon && (
                            <div>
                              <div className="flex items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                  <span className="mr-2">☀️</span> Afternoon Activities
                                </h3>
                                <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                  {timePeriods.afternoon.length} activities
                                </span>
                              </div>
                              <div className="space-y-6">
                                {timePeriods.afternoon.map((place, placeIndex) => (
                                  <div key={`afternoon-${placeIndex}`} className="flex flex-col md:flex-row gap-6 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                                    <div className="md:w-1/3 h-48 rounded-xl overflow-hidden shadow-md">
                                      <img 
                                        src={place.placeImageUrl || `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(place.placeName || 'Place')}`} 
                                        alt={place.placeName || 'Place Image'}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        onError={(e) => { 
                                          e.target.src = `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(place.placeName || 'Place')}`;
                                        }}
                                      />
                                    </div>
                                    
                                    <div className="md:w-2/3">
                                      <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-xl font-bold text-gray-800">{place.placeName || 'Place Name'}</h4>
                                        <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                          <span>{place.rating || 'N/A'}</span>
                                        </div>
                                      </div>
                                      
                                      <p className="text-gray-600 mb-4">{place.placeDetails || 'Details not available'}</p>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <span className="text-gray-700">{place.timeToVisit || place.timeTravel || 'Time not specified'}</span>
                                        </div>
                                        
                                        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <span className="text-gray-700 font-semibold">{place.ticketPricing || 'Price not available'}</span>
                                        </div>
                                        
                                        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                          </svg>
                                          <button 
                                            onClick={() => handleViewOnMap(place, 'itinerary', index, placeIndex)}
                                            className="text-gray-700 underline hover:text-blue-600"
                                          >
                                            View on Map
                                          </button>
                                        </div>
                                      </div>
                                      
                                      {/* Additional place details if available */}
                                      {place.bestTimeToVisit && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                          <p className="text-sm text-blue-800">
                                            <span className="font-semibold">Best Time to Visit:</span> {place.bestTimeToVisit}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Evening Activities */}
                          {hasEvening && (
                            <div>
                              <div className="flex items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                  <span className="mr-2">🌆</span> Evening Activities
                                </h3>
                                <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                  {timePeriods.evening.length} activities
                                </span>
                              </div>
                              <div className="space-y-6">
                                {timePeriods.evening.map((place, placeIndex) => (
                                  <div key={`evening-${placeIndex}`} className="flex flex-col md:flex-row gap-6 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                                    <div className="md:w-1/3 h-48 rounded-xl overflow-hidden shadow-md">
                                      <img 
                                        src={place.placeImageUrl || `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(place.placeName || 'Place')}`} 
                                        alt={place.placeName || 'Place Image'}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        onError={(e) => { 
                                          e.target.src = `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(place.placeName || 'Place')}`;
                                        }}
                                      />
                                    </div>
                                    
                                    <div className="md:w-2/3">
                                      <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-xl font-bold text-gray-800">{place.placeName || 'Place Name'}</h4>
                                        <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                          <span>{place.rating || 'N/A'}</span>
                                        </div>
                                      </div>
                                      
                                      <p className="text-gray-600 mb-4">{place.placeDetails || 'Details not available'}</p>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <span className="text-gray-700">{place.timeToVisit || place.timeTravel || 'Time not specified'}</span>
                                        </div>
                                        
                                        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <span className="text-gray-700 font-semibold">{place.ticketPricing || 'Price not available'}</span>
                                        </div>
                                        
                                        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                          </svg>
                                          <button 
                                            onClick={() => handleViewOnMap(place, 'itinerary', index, placeIndex)}
                                            className="text-gray-700 underline hover:text-blue-600"
                                          >
                                            View on Map
                                          </button>
                                        </div>
                                      </div>
                                      
                                      {/* Additional place details if available */}
                                      {place.bestTimeToVisit && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                          <p className="text-sm text-blue-800">
                                            <span className="font-semibold">Best Time to Visit:</span> {place.bestTimeToVisit}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    
                    {/* Additional day information if available */}
                    {dayData.notes && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Day Notes
                        </h4>
                        <p className="text-gray-700">{dayData.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced message when itinerary is being processed */}
        {(!enhancedTravelPlan?.itinerary || enhancedTravelPlan.itinerary.length === 0) && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">📅</span> Trip Itinerary
            </h2>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🏨</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Preparing Your Detailed Itinerary</h3>
                <p className="text-gray-600 mb-4">We're generating your personalized day-by-day travel plan with activities, timings, and more.</p>
                <p className="text-gray-500 text-sm mb-6">This usually takes just a few seconds. Please wait while we prepare your complete travel itinerary.</p>
                
                {/* Loading indicator */}
                <div className="flex justify-center mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
                
                {/* Hotel information while waiting */}
                {enhancedTravelPlan?.hotels && enhancedTravelPlan.hotels.length > 0 && (
                  <div className="mt-6 text-left bg-blue-50 p-4 rounded-lg max-w-2xl mx-auto">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Hotels Found
                    </h4>
                    <p className="text-blue-700">We've found {enhancedTravelPlan.hotels.length} hotel options for your stay in {trip.userSelection?.location?.label || 'your destination'}.</p>
                  </div>
                )}
                
                {/* Progress indicator */}
                <div className="mt-6 max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Step 1: Finding hotels</span>
                    <span>Step 2: Creating itinerary</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">Creating your personalized day-by-day travel plan...</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Download PDF
          </button>
          <button className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Trip
          </button>
          <button className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTrip;