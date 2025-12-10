import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HotelMap from './HotelMap';
import HotelRecommendations from './HotelRecommendations';

const SharedTripView = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // In a real implementation, you would fetch the shared trip data from your backend
  // For now, we'll simulate fetching data
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      // This is a placeholder - in a real app, you would fetch the shared trip data
      // based on the shareId parameter
      console.log('Fetching shared trip with ID:', shareId);
      
      // For demonstration purposes, we'll show an error since we don't have
      // a real implementation of shared trip fetching
      setError('Shared trip functionality not implemented yet');
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [shareId]);

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Shared Trip</h2>
          <p className="text-gray-600">Please wait while we fetch the shared trip information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Shared Trip Not Available</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Back to Home
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Shared Trip Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't load the shared trip details. The link may be invalid or expired.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Safe data access
  const safeTripData = tripData || {};
  const safeUserSelection = safeTripData.userSelection || {};
  const safeLocation = safeUserSelection.location || {};
  const safeTripDetails = safeTripData.tripData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {safeLocation.label || 'Shared Trip'} Details
          </h1>
          <p className="text-gray-600">Shared travel plan</p>
        </div>

        {/* Trip Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border-r border-gray-100 pr-4">
              <p className="text-gray-600 text-sm">Destination</p>
              <p className="font-semibold text-lg">{safeLocation.label || 'Not specified'}</p>
            </div>
            <div className="border-r border-gray-100 pr-4">
              <p className="text-gray-600 text-sm">Duration</p>
              <p className="font-semibold text-lg">{safeUserSelection.days || 'N/A'} Days</p>
            </div>
            <div className="border-r border-gray-100 pr-4">
              <p className="text-gray-600 text-sm">Travelers</p>
              <p className="font-semibold text-lg">{getTravelersLabel(safeUserSelection.travelers)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Budget</p>
              <p className="font-semibold text-lg">{getBudgetLabel(safeUserSelection.budget)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-600 text-sm">Created on</p>
            <p className="font-semibold">{formatDate(safeTripData.createdAt)}</p>
          </div>
        </div>

        {/* Hotels Section */}
        {safeTripDetails.hotels && safeTripDetails.hotels.length > 0 && (
          <HotelRecommendations 
            hotels={safeTripDetails.hotels} 
            destination={safeLocation.label || 'Shared Trip Destination'} 
          />
        )}
        
        {/* Itinerary Section */}
        {safeTripDetails.itinerary && Object.keys(safeTripDetails.itinerary).length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Daily Itinerary</h2>
            <div className="space-y-8">
              {Object.entries(safeTripDetails.itinerary).map(([dayKey, dayData], index) => (
                <div key={dayKey} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                    <h3 className="text-xl font-bold text-white">Day {index + 1}: {dayData.date || `Day ${index + 1}`}</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {dayData.places && dayData.places.map((place, placeIndex) => (
                        <div key={placeIndex} className="flex flex-col md:flex-row gap-6 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                          <div className="md:w-1/3 h-48 rounded-xl overflow-hidden">
                            <img 
                              src={place.placeImageUrl} 
                              alt={place.placeName || 'Place Image'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="md:w-2/3">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-xl font-bold text-gray-800">{place.placeName || 'Place Name'}</h4>
                              <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>{place.rating || 'N/A'}</span>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-3">{place.placeDetails || 'Details not available'}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-700">{place.timeToVisit || 'Time not specified'}</span>
                              </div>
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-700 font-semibold">{place.ticketPricing || 'Price not available'}</span>
                              </div>
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-gray-700">View on Map</span>
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
                    
                    {/* Additional day information if available */}
                    {dayData.notes && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-2">Day Notes:</h4>
                        <p className="text-gray-700">{dayData.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Your Own Trip</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Inspired by this trip? Create your own personalized travel plan with TravelEase AI-powered trip planner.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Plan Your Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharedTripView;