import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import HotelMap from './HotelMap';
import HotelRecommendations from './HotelRecommendations';
import TripMap from './TripMap';
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
const TripDetails = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [isSharing, setIsSharing] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [hotelsData, setHotelsData] = useState([]);
  const [itineraryData, setItineraryData] = useState([]);
  const [parsedTripData, setParsedTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null); // For highlighting specific locations on map

  // Add state for edit mode and form data
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    location: '',
    travelers: '',
    days: '',
    budget: '',
    numberOfMembers: '',
    startDate: ''
  });

  // Fetch trip data using Convex - only if we have a valid ID
  const trip = tripId ? useQuery(api.tripsQueries.getTripById, { id: tripId }) : null;

  // Add mutation for updating trip
  const updateTrip = useMutation(api.trips.updateTrip);

  // Function to handle "View on Map" clicks
  const handleViewOnMap = (location) => {
    setSelectedLocation(location);
    
    // Scroll to the map section
    setTimeout(() => {
      const mapSection = document.getElementById('trip-map-section');
      if (mapSection) {
        mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  useEffect(() => {
    // If there's no ID in the URL, show an error
    if (!tripId) {
      setError('No trip ID provided');
      setLoading(false);
      return;
    }

    if (trip === undefined) {
      // Still loading
      return;
    }

    if (trip === null) {
      // Trip not found
      setError('Trip not found');
      setLoading(false);
      return;
    }

    try {
      // Set the main trip data
      setTripData(trip);

      // Initialize edit form data
      if (trip.userSelection) {
        setEditFormData({
          location: trip.userSelection.location?.label || '',
          travelers: trip.userSelection.travelers || '',
          days: trip.userSelection.days || '',
          budget: trip.userSelection.budget || '',
          numberOfMembers: trip.userSelection.numberOfMembers || '',
          startDate: trip.userSelection.startDate || ''
        });
      }

      // Parse trip data if it's a string
      let parsedData = null;
      if (typeof trip.tripData === 'string') {
        try {
          // Try to find JSON content in the string
          let jsonString = trip.tripData.trim();
          const jsonStart = jsonString.indexOf('{');
          const jsonEnd = jsonString.lastIndexOf('}');

          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
            parsedData = JSON.parse(jsonString);
          } else {
            // If no JSON found, try to parse the whole string
            parsedData = JSON.parse(trip.tripData);
          }
          setParsedTripData(parsedData);
        } catch (parseError) {
          console.error('Error parsing trip data:', parseError);
          // Try to extract JSON-like content
          try {
            const jsonString = trip.tripData.match(/\{[^]*\}/);
            if (jsonString && jsonString[0]) {
              parsedData = JSON.parse(jsonString[0]);
              setParsedTripData(parsedData);
            } else {
              setParsedTripData(trip.tripData);
            }
          } catch (extractError) {
            console.error('Error extracting JSON from trip data:', extractError);
            setParsedTripData(trip.tripData);
          }
        }
      } else {
        parsedData = trip.tripData;
        setParsedTripData(parsedData);
      }

      // Debug logging
      console.log('Trip data received:', trip);
      console.log('Parsed trip data:', parsedData);
      console.log('Hotels data:', parsedData?.hotels);
      console.log('Itinerary data:', parsedData?.itinerary);

      // Extract hotels data and filter based on user's budget
      if (parsedData && parsedData.hotels) {
        let hotels = Array.isArray(parsedData.hotels) ? parsedData.hotels : [];
        
        // Filter hotels based on user's budget selection if available
        if (trip.userSelection?.budget) {
          hotels = filterHotelsByUserBudget(hotels, trip.userSelection.budget);
        }
        
        setHotelsData(hotels);
      }
      // Extract itinerary data - improved logic to handle different data structures
      if (parsedData) {
        let itinerary = [];

        // Check multiple possible locations for itinerary data
        if (parsedData.itinerary && Array.isArray(parsedData.itinerary)) {
          // Direct array format
          // Filter out empty itinerary arrays
          if (parsedData.itinerary.length > 0) {
            itinerary = parsedData.itinerary;
          }
        } else if (parsedData.itinerary && typeof parsedData.itinerary === 'object') {
          // Object format - convert to array
          if (Array.isArray(parsedData.itinerary.days)) {
            // If it's structured as { days: [...] }
            if (parsedData.itinerary.days.length > 0) {
              itinerary = parsedData.itinerary.days;
            }
          } else {
            // Convert object values to array
            const itineraryArray = Object.values(parsedData.itinerary);
            if (Array.isArray(itineraryArray) && itineraryArray.length > 0) {
              itinerary = itineraryArray;
            }
          }
        } else if (parsedData.plan && Array.isArray(parsedData.plan)) {
          // Alternative format where itinerary is stored as 'plan'
          if (parsedData.plan.length > 0) {
            itinerary = parsedData.plan;
          }
        } else {
          // Try to find itinerary in nested objects
          const findItinerary = (obj) => {
            if (!obj || typeof obj !== 'object') return null;
            
            // Directly check if this object is an itinerary
            if (obj.itinerary && Array.isArray(obj.itinerary)) {
              return obj.itinerary;
            }
            
            // Check if this is a days array format
            if (obj.days && Array.isArray(obj.days)) {
              return obj.days;
            }
            
            // Recursively search in nested objects
            for (const key in obj) {
              if (typeof obj[key] === 'object') {
                const result = findItinerary(obj[key]);
                if (result) return result;
              }
            }
            
            return null;
          };
          
          const foundItinerary = findItinerary(parsedData);
          if (foundItinerary) {
            itinerary = foundItinerary;
          }
        }

        // Enhance itinerary with real images
        enhancePlacesWithImages(itinerary).then(enhancedItinerary => {
          setItineraryData(enhancedItinerary);
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error processing trip data:', err);
      setError('Error loading trip data');
      setLoading(false);
    }
  }, [trip, tripId]);

  // Helper functions
  const getTravelersLabel = (travelers) => {
    // Handle case where travelers is null, undefined, or not the expected type
    if (!travelers) return 'Not specified';
    if (typeof travelers === 'object') {
      if (travelers.adults || travelers.children) {
        const adults = travelers.adults || 0;
        const children = travelers.children || 0;
        return `${adults} Adult${adults !== 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}`;
      }
      // Handle case where travelers is an object but doesn't have expected properties
      try {
        return JSON.stringify(travelers);
      } catch (e) {
        return 'Not specified';
      }
    }
    // Handle case where travelers is not an object
    try {
      return travelers.toString();
    } catch (e) {
      return 'Not specified';
    }
  };

  const getBudgetLabel = (budget) => {
    // Handle case where budget is null, undefined, or not a string
    if (!budget || typeof budget !== 'string') return 'Not specified';

    const budgetLabels = {
      'low': 'Low Budget',
      'medium': 'Medium Budget',
      'high': 'High Budget'
    };

    // Convert to lowercase safely after confirming it's a string
    return budgetLabels[budget.toLowerCase()] || budget;
  };

  const formatDate = (dateString) => {
    // Handle case where dateString is null, undefined, or not a string
    if (!dateString || typeof dateString !== 'string') return 'Not specified';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    // Handle case where dateString is not a valid date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString(undefined, options);
  };

  const handleShareTrip = async () => {
    setIsSharing(true);
    try {
      // Implementation for sharing trip
      console.log('Sharing trip...');
    } catch (error) {
      console.error('Error sharing trip:', error);
    } finally {
      setIsSharing(false);
    }
  };

  // Handle edit form changes
  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    // Reset form data when exiting edit mode
    if (isEditing && tripData?.userSelection) {
      setEditFormData({
        location: tripData.userSelection.location?.label || '',
        travelers: tripData.userSelection.travelers || '',
        days: tripData.userSelection.days || '',
        budget: tripData.userSelection.budget || '',
        numberOfMembers: tripData.userSelection.numberOfMembers || '',
        startDate: tripData.userSelection.startDate || ''
      });
    }
  };

  // Save edited trip
  const saveEditedTrip = async () => {
    try {
      // Validate form data
      if (!editFormData.location.trim()) {
        alert('Please enter a destination');
        return;
      }

      if (!editFormData.days.trim()) {
        alert('Please enter the duration');
        return;
      }

      const updatedTripData = {
        ...tripData,
        userSelection: {
          ...tripData.userSelection,
          location: { label: editFormData.location },
          travelers: editFormData.travelers ? parseInt(editFormData.travelers) : null,
          days: editFormData.days,
          budget: editFormData.budget || null,
          numberOfMembers: editFormData.numberOfMembers ? parseInt(editFormData.numberOfMembers) : null,
          startDate: editFormData.startDate || null
        }
      };

      await updateTrip({
        tripId: tripId,
        userSelection: updatedTripData.userSelection,
        tripData: updatedTripData.tripData
      });

      // Update local state
      setTripData(updatedTripData);
      setIsEditing(false);

      // Show success message
      alert('Trip updated successfully!');
    } catch (error) {
      console.error('Error updating trip:', error);
      alert('Failed to update trip. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Trip Details</h2>
          <p className="text-gray-600">Please wait while we fetch your trip information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Trip</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/trip-history')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Back to Trip History
          </button>
        </div>
      </div>
    );
  }

  // Check if we have the required data to render the component
  if (!tripData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Data Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't load the trip details. Please try again or go back to your trips.</p>
          <button
            onClick={() => navigate('/trip-history')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Back to Trip History
          </button>
        </div>
      </div>
    );
  }

  // Safe data access
  const safeUserSelection = tripData.userSelection || {};
  const safeLocation = safeUserSelection.location || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {isEditing ? (
              <input
                type="text"
                value={editFormData.location}
                onChange={(e) => handleEditChange('location', e.target.value)}
                className="border-b-2 border-blue-500 bg-transparent text-center w-full md:w-auto"
              />
            ) : (
              safeLocation.label || 'Trip'
            )} Details
          </h1>
          <p className="text-gray-600">Detailed itinerary and travel plan</p>
        </div>

        {/* Trip Summary Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border-r border-gray-100 pr-4">
              <p className="text-gray-600 text-sm">Destination</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => handleEditChange('location', e.target.value)}
                  className="border-b border-gray-300 w-full"
                />
              ) : (
                <p className="font-semibold text-lg">{safeLocation.label || 'Not specified'}</p>
              )}
            </div>
            <div className="border-r border-gray-100 pr-4">
              <p className="text-gray-600 text-sm">Duration</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editFormData.days}
                  onChange={(e) => handleEditChange('days', e.target.value)}
                  className="border-b border-gray-300 w-full"
                />
              ) : (
                <p className="font-semibold text-lg">{safeUserSelection.days || 'N/A'} Days</p>
              )}
            </div>
            <div className="border-r border-gray-100 pr-4">
              <p className="text-gray-600 text-sm">Travelers</p>
              {isEditing ? (
                <input
                  type="number"
                  value={editFormData.travelers}
                  onChange={(e) => handleEditChange('travelers', e.target.value)}
                  className="border-b border-gray-300 w-full"
                />
              ) : (
                <p className="font-semibold text-lg">{getTravelersLabel(safeUserSelection.travelers)}</p>
              )}
            </div>
            <div>
              <p className="text-gray-600 text-sm">Budget</p>
              {isEditing ? (
                <select
                  value={editFormData.budget}
                  onChange={(e) => handleEditChange('budget', e.target.value)}
                  className="border-b border-gray-300 w-full"
                >
                  <option value="">Select Budget</option>
                  <option value="low">Low Budget</option>
                  <option value="medium">Medium Budget</option>
                  <option value="high">High Budget</option>
                </select>
              ) : (
                <p className="font-semibold text-lg">{getBudgetLabel(safeUserSelection.budget)}</p>
              )}
            </div>
          </div>

          {/* Additional editable fields when in edit mode */}
          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-gray-600 text-sm">Number of Members</p>
                <input
                  type="number"
                  value={editFormData.numberOfMembers}
                  onChange={(e) => handleEditChange('numberOfMembers', e.target.value)}
                  className="border-b border-gray-300 w-full"
                  placeholder="Enter number of members"
                />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Start Date</p>
                <input
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) => handleEditChange('startDate', e.target.value)}
                  className="border-b border-gray-300 w-full"
                />
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-600 text-sm">Created on</p>
            <p className="font-semibold">{formatDate(tripData.createdAt)}</p>
            {tripData.updatedAt && (
              <p className="text-gray-600 text-sm">Last updated: {formatDate(tripData.updatedAt)}</p>
            )}
          </div>
        </div>

        {/* Comprehensive Map Visualization */}
        {(hotelsData.length > 0 || (itineraryData && itineraryData.length > 0)) && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">🗺️</span> Interactive Trip Map
              </h2>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {hotelsData.length + (itineraryData.reduce((acc, day) => acc + (day.plan ? day.plan.length : 0), 0))} locations
              </span>
            </div>

            {/* Enhanced Combined Trip Map showing both hotels and itinerary */}
            <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Trip Route & Accommodations
                </h3>
              </div>
              <TripMap
                hotels={hotelsData}
                itinerary={itineraryData}
                center={
                  hotelsData[0]?.geoCoordinates
                    ? [hotelsData[0].geoCoordinates.lat, hotelsData[0].geoCoordinates.lng]
                    : itineraryData && itineraryData[0]?.plan && itineraryData[0].plan[0]?.geoCoordinates
                      ? [itineraryData[0].plan[0].geoCoordinates.lat, itineraryData[0].plan[0].geoCoordinates.lng]
                      : [0, 0]
                }
                zoom={13}
              />
            </div>
          </div>
        )}

        {/* Hotels Section with Integrated Recommendations */}
        {hotelsData && hotelsData.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">🏨</span> Recommended Hotels
              </h2>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {Math.min(hotelsData.length, 10)} hotels found
              </span>
            </div>

            {/* Hotel Cards in a Beautiful Grid - Limited to 10 hotels */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {hotelsData.slice(0, 10).map((hotel, index) => (
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
                      <div className="flex space-x-2">
                        <button
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                          onClick={() => {
                            window.open(`https://www.booking.com/search.html?ss=${encodeURIComponent(hotel.hotelName)}`, '_blank');
                          }}
                        >
                          Book Now
                        </button>
                        <button
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-all duration-300 flex items-center"
                          onClick={() => handleViewOnMap({
                            ...hotel,
                            type: 'hotel',
                            index: index
                          })}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Map
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Itinerary Section with Daily Breakdown */}
        {itineraryData && itineraryData.length > 0 ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">📅</span> Daily Itinerary
              </h2>
              <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                {itineraryData.length} Days
              </span>
            </div>

            <div className="space-y-8">
              {itineraryData.map((dayData, index) => (
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
                    {/* Integrated Hotel Recommendation for the Day */}
                    {hotelsData && hotelsData.length > 0 && index === 0 && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Recommended Accommodation
                        </h4>
                        <div className="flex items-center">
                          <div className="bg-white p-2 rounded-lg mr-3">
                            <img
                              src={hotelsData[0].hotelImageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'}
                              alt={hotelsData[0].hotelName || 'Hotel'}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'; }}
                            />
                          </div>
                          <div>
                            <p className="font-semibold">{hotelsData[0].hotelName || 'Hotel Name'}</p>
                            <p className="text-sm text-gray-600">{hotelsData[0].price || 'Price not available'}</p>
                          </div>
                        </div>
                      </div>
                    )}

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
                                        src={place.placeImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'}
                                        alt={place.placeName || 'Place Image'}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'; }}
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
                                            onClick={() => handleViewOnMap({
                                              ...place,
                                              type: 'itinerary',
                                              dayIndex: index,
                                              placeIndex: placeIndex
                                            })}
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
                                        src={place.placeImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'}
                                        alt={place.placeName || 'Place Image'}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'; }}
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
                                            onClick={() => handleViewOnMap({
                                              ...place,
                                              type: 'itinerary',
                                              dayIndex: index,
                                              placeIndex: placeIndex
                                            })}
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
                                        src={place.placeImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'}
                                        alt={place.placeName || 'Place Image'}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'; }}
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
                                            onClick={() => handleViewOnMap({
                                              ...place,
                                              type: 'itinerary',
                                              dayIndex: index,
                                              placeIndex: placeIndex
                                            })}
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
        ) : hotelsData && hotelsData.length > 0 ? (
          // Show message when we have hotels but no itinerary
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
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
                <div className="mt-6 text-left bg-blue-50 p-4 rounded-lg max-w-2xl mx-auto">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Hotels Found
                  </h4>
                  <p className="text-blue-700">We've found {hotelsData.length} hotel options for your stay in {safeLocation.label || 'your destination'}.</p>
                </div>
                
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
        ) : (
          // Fallback for when neither hotels nor itinerary data is available
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">📅</span> Trip Itinerary
            </h2>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Preparing Your Travel Plan</h3>
                <p className="text-gray-600 mb-4">We're generating your personalized travel itinerary with hotels and activities.</p>
                <p className="text-gray-500 text-sm mb-6">This usually takes just a few seconds. Please wait while we prepare your complete travel itinerary.</p>
                
                {/* Loading indicator */}
                <div className="flex justify-center mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
                
                <button 
                  className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </button>
                
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
          <button
            onClick={handleShareTrip}
            disabled={isSharing}
            className={`font-medium py-3 px-8 rounded-lg transition-all duration-300 flex items-center shadow-lg ${isSharing ? 'bg-green-400 cursor-not-allowed text-white' : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white transform hover:scale-105'}`}
          >
            {isSharing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Link...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Trip
              </>
            )}
          </button>
          <button
            onClick={isEditing ? saveEditedTrip : toggleEditMode}
            className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {isEditing ? 'Save Changes' : 'Edit Trip'}
          </button>
          {isEditing && (
            <button
              onClick={toggleEditMode}
              className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetails;