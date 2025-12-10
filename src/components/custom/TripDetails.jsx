import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import HotelMap from './HotelMap';
import HotelRecommendations from './HotelRecommendations';
import TripMap from './TripMap';
import POIMap from './POIMap';
import TripDetailsSkeleton from './TripDetailsSkeleton';
import { categorizeActivitiesByTime, getTimePeriodLabel, getTimePeriodDescription } from '@/utils/itineraryHelpers';
import { getPlaceImage } from '@/service/ImageGenerationService';
// Function to enhance places with real images from Unsplash API in real-time
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
      // If place doesn't have an image URL, try to get one from Unsplash API in real-time
      if (!place.placeImageUrl) {
        try {
          const imageUrl = await getPlaceImage(place.placeName);
          if (imageUrl) {
            place.placeImageUrl = imageUrl;
          } else {
            // Retry with a different query
            const retryImageUrl = await getPlaceImage(`${place.placeName} attraction`);
            if (retryImageUrl) {
              place.placeImageUrl = retryImageUrl;
            }
          }
        } catch (error) {
          console.error('Error getting image for place from Unsplash:', place.placeName, error);
          // Retry with a different query
          try {
            const retryImageUrl = await getPlaceImage(`${place.placeName} attraction`);
            if (retryImageUrl) {
              place.placeImageUrl = retryImageUrl;
            } else {
              // Set a default image if no image is found
              place.placeImageUrl = 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
            }
          } catch (retryError) {
            console.error('Retry failed for place image:', place.placeName, retryError);
            // Set a default image if all attempts fail
            place.placeImageUrl = 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
          }
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

// Function to enhance hotels with real images from Unsplash API in real-time
const enhanceHotelsWithImages = async (hotels) => {
  if (!hotels || !Array.isArray(hotels)) return hotels;
  
  const enhancedHotels = [];
  
  for (const hotel of hotels) {
    // If hotel doesn't have an image URL, try to get one from Unsplash API in real-time
    if (!hotel.hotelImageUrl) {
      try {
        const imageUrl = await getPlaceImage(hotel.hotelName);
        if (imageUrl) {
          hotel.hotelImageUrl = imageUrl;
        } else {
          // Retry with a different query
          const retryImageUrl = await getPlaceImage(`${hotel.hotelName} hotel`);
          if (retryImageUrl) {
            hotel.hotelImageUrl = retryImageUrl;
          }
        }
      } catch (error) {
        console.error('Error getting image for hotel from Unsplash:', hotel.hotelName, error);
        // Retry with a different query
        try {
          const retryImageUrl = await getPlaceImage(`${hotel.hotelName} hotel`);
          if (retryImageUrl) {
            hotel.hotelImageUrl = retryImageUrl;
          } else {
            // Set a default image if no image is found
            hotel.hotelImageUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
          }
        } catch (retryError) {
          console.error('Retry failed for hotel image:', hotel.hotelName, retryError);
          // Set a default image if all attempts fail
          hotel.hotelImageUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
        }
      }
    }
    enhancedHotels.push(hotel);
  }
  
  return enhancedHotels;
};// Function to get all Points of Interest from hotels and itinerary
const getAllPOIs = (hotels, itinerary) => {
  const pois = [];
  
  // Add hotels as POIs
  if (hotels && Array.isArray(hotels)) {
    hotels.forEach((hotel, index) => {
      if (hotel.geoCoordinates && hotel.geoCoordinates.lat && hotel.geoCoordinates.lng) {
        pois.push({
          name: hotel.hotelName || `Hotel ${index + 1}`,
          description: hotel.hotelAddress || 'Hotel accommodation',
          address: hotel.hotelAddress || '',
          lat: hotel.geoCoordinates.lat,
          lng: hotel.geoCoordinates.lng,
          type: 'hotel',
          rating: hotel.rating || null
        });
      }
    });
  }
  
  // Add itinerary places as POIs
  if (itinerary && Array.isArray(itinerary)) {
    itinerary.forEach((day, dayIndex) => {
      if (day.plan && Array.isArray(day.plan)) {
        day.plan.forEach((place, placeIndex) => {
          if (place.geoCoordinates && place.geoCoordinates.lat && place.geoCoordinates.lng) {
            pois.push({
              name: place.placeName || `Place ${placeIndex + 1}`,
              description: place.placeDetails || '',
              address: place.placeAddress || '',
              lat: place.geoCoordinates.lat,
              lng: place.geoCoordinates.lng,
              type: place.placeName && place.placeName.toLowerCase().includes('restaurant') ? 'restaurant' : 'attraction',
              rating: place.rating || null
            });
          }
        });
      }
    });
  }
  
  return pois;
};

// Function to filter hotels based on user's budget selection
const filterHotelsByUserBudget = (hotels, budget) => {  // Map budget IDs to price ranges (in Indian Rupees per night)
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
  const [message, setMessage] = useState({ type: '', text: '' }); // For showing success/error messages

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

      // Initialize edit form data with proper type handling
      if (trip.userSelection) {
        setEditFormData({
          location: trip.userSelection.location?.label || '',
          travelers: trip.userSelection.travelers !== null && trip.userSelection.travelers !== undefined ? 
            String(trip.userSelection.travelers) : '',
          days: trip.userSelection.days || '',
          budget: trip.userSelection.budget || '',
          numberOfMembers: trip.userSelection.numberOfMembers !== null && trip.userSelection.numberOfMembers !== undefined ? 
            String(trip.userSelection.numberOfMembers) : '',
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
      console.log('Itinerary data type:', typeof parsedData?.itinerary);
      console.log('Itinerary data isArray:', Array.isArray(parsedData?.itinerary));

      // Extract hotels data and filter based on user's budget
      if (parsedData && parsedData.hotels) {
        let hotels = Array.isArray(parsedData.hotels) ? parsedData.hotels : [];
        
        // Filter hotels based on user's budget selection if available
        if (trip.userSelection?.budget) {
          hotels = filterHotelsByUserBudget(hotels, trip.userSelection.budget);
        }
        
        // Enhance hotels with real images
        enhanceHotelsWithImages(hotels).then(enhancedHotels => {
          setHotelsData(enhancedHotels);
        });      }
      // Extract itinerary data with enhanced fallback logic
      if (parsedData) {
        let itinerary = [];

        // Handle different itinerary formats with priority order and enhanced logic
        if (parsedData.itinerary && Array.isArray(parsedData.itinerary)) {
          // Direct array format
          itinerary = parsedData.itinerary;
        } else if (parsedData.itinerary && typeof parsedData.itinerary === 'object') {
          // Object format with days array
          if (Array.isArray(parsedData.itinerary.days)) {
            itinerary = parsedData.itinerary.days;
          } else if (parsedData.itinerary.plan && Array.isArray(parsedData.itinerary.plan)) {
            // Handle case where the entire itinerary is stored as a single plan
            itinerary = [{
              day: "Day 1",
              date: "Day 1",
              plan: parsedData.itinerary.plan
            }];
          } else {
            // Convert object values to array
            const itineraryArray = Object.values(parsedData.itinerary);
            if (Array.isArray(itineraryArray) && itineraryArray.length > 0) {
              // Check if values are day objects or need to be wrapped
              if (itineraryArray.every(item => item && (item.plan || item.activities))) {
                itinerary = itineraryArray;
              } else {
                // Wrap in a single day if they appear to be activities
                itinerary = [{
                  day: "Day 1",
                  date: "Day 1",
                  plan: itineraryArray
                }];
              }
            }
          }
        } else if (parsedData.plan && Array.isArray(parsedData.plan)) {
          // Alternative format where itinerary is stored as 'plan'
          itinerary = [{
            day: "Day 1",
            date: "Day 1",
            plan: parsedData.plan
          }];
        }

        // If still no itinerary found, try more flexible extraction
        if (itinerary.length === 0) {
          // Recursive search for itinerary data in nested objects
          const findItineraryInObject = (obj) => {
            if (!obj || typeof obj !== 'object') return [];
            
            // Direct array check
            if (Array.isArray(obj)) {
              return obj;
            }
            
            // Check for common itinerary property names
            for (const key of ['itinerary', 'days', 'plan']) {
              if (obj[key] && Array.isArray(obj[key])) {
                return obj[key];
              }
              if (obj[key] && typeof obj[key] === 'object' && Array.isArray(obj[key].days)) {
                return obj[key].days;
              }
            }
            
            // Recursively search in nested objects
            for (const key in obj) {
              if (typeof obj[key] === 'object') {
                const result = findItineraryInObject(obj[key]);
                if (result.length > 0) return result;
              }
            }
            
            return [];
          };
          
          itinerary = findItineraryInObject(parsedData);
        }

        // Final fallback - try to extract from raw tripData string
        if (itinerary.length === 0 && typeof trip.tripData === 'string') {
          try {
            // Look for JSON patterns in the raw string
            const jsonPatterns = [
              /"itinerary"\s*:\s*(\[[^\]]*\])/,
              /"days"\s*:\s*(\[[^\]]*\])/,
              /"plan"\s*:\s*(\[[^\]]*\])/,
              /(\[[^\]]*\])\s*$/
            ];
            
            for (const pattern of jsonPatterns) {
              const match = trip.tripData.match(pattern);
              if (match && match[1]) {
                const parsedArray = JSON.parse(match[1]);
                if (Array.isArray(parsedArray)) {
                  itinerary = parsedArray;
                  break;
                }
              }
            }
          } catch (parseError) {
            console.warn('Could not extract itinerary from string:', parseError);
          }
        }

        // Ensure itinerary is always an array and has proper structure
        if (!Array.isArray(itinerary)) {
          itinerary = [];
        }
        
        // Validate and enhance each day in the itinerary
        itinerary = itinerary.map((day, index) => {
          // Ensure day has proper structure
          const validatedDay = {
            day: day.day || `Day ${index + 1}`,
            date: day.date || `Day ${index + 1}`,
            plan: Array.isArray(day.plan) ? day.plan : (Array.isArray(day.activities) ? day.activities : [])
          };
          
          // If plan is still empty, try other possible property names
          if (validatedDay.plan.length === 0) {
            // Check for other possible activity arrays
            Object.keys(day).forEach(key => {
              if (Array.isArray(day[key]) && key !== 'day' && key !== 'date') {
                validatedDay.plan = validatedDay.plan.concat(day[key]);
              }
            });
          }
          
          return validatedDay;
        });
        console.log('Final itinerary data:', itinerary);
        console.log('Final itinerary data type:', typeof itinerary);
        console.log('Final itinerary data isArray:', Array.isArray(itinerary));
        
        // Enhance itinerary with real images
        enhancePlacesWithImages(itinerary).then(enhancedItinerary => {
          console.log('Enhanced itinerary data:', enhancedItinerary);
          console.log('Enhanced itinerary data type:', typeof enhancedItinerary);
          console.log('Enhanced itinerary data isArray:', Array.isArray(enhancedItinerary));
          setItineraryData(enhancedItinerary);
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error processing trip data:', err);
      setError('Error loading trip data');
      setLoading(false);
      // Set a fallback plan even if processing fails
      if (trip.tripData) {
        setItineraryData([{
          day: "Day 1",
          date: "Day 1",
          plan: [{
            placeName: "Sample Activity",
            placeDetails: "This is a sample activity to demonstrate the itinerary structure.",
            placeImageUrl: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
            geoCoordinates: { lat: 0, lng: 0 },
            ticketPricing: "Free",
            rating: 4.5,
            timeToVisit: "Morning",
            timeTravel: "30 minutes"
          }]
        }]);
      }
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
    // Handle case where budget is null, undefined, or not the expected type
    if (budget === null || budget === undefined) return 'Not specified';
    
    // Handle numeric budget values (1, 2, 3)
    if (typeof budget === 'number') {
      const budgetLabels = {
        1: 'Cheap',
        2: 'Moderate',
        3: 'Luxury'
      };
      return budgetLabels[budget] || 'Not specified';
    }
    
    // Handle string budget values
    if (typeof budget === 'string') {
      const budgetLabels = {
        'low': 'Low Budget',
        'medium': 'Medium Budget',
        'high': 'High Budget',
        '1': 'Cheap',
        '2': 'Moderate',
        '3': 'Luxury'
      };
      
      return budgetLabels[budget.toLowerCase()] || budget;
    }
    
    return 'Not specified';
  };

  const formatDate = (dateValue) => {
    // Handle case where dateValue is null or undefined
    if (!dateValue) return 'Not specified';
    
    let date;
    
    // Handle different date formats
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (typeof dateValue === 'number') {
      // Handle timestamp values
      date = new Date(dateValue);
    } else {
      return 'Not specified';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
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
        travelers: tripData.userSelection.travelers !== null && tripData.userSelection.travelers !== undefined ? 
          String(tripData.userSelection.travelers) : '',
        days: tripData.userSelection.days || '',
        budget: tripData.userSelection.budget || '',
        numberOfMembers: tripData.userSelection.numberOfMembers !== null && tripData.userSelection.numberOfMembers !== undefined ? 
          String(tripData.userSelection.numberOfMembers) : '',
        startDate: tripData.userSelection.startDate || ''
      });
    }
  };

  // Save edited trip
  const saveEditedTrip = async () => {
    try {
      // Clear any existing messages
      setMessage({ type: '', text: '' });
      
      // Enhanced validation with better error messages
      if (!editFormData.location || !editFormData.location.trim()) {
        setMessage({ type: 'error', text: 'Please enter a valid destination' });
        return;
      }

      if (!editFormData.days || !editFormData.days.trim()) {
        setMessage({ type: 'error', text: 'Please enter a valid duration' });
        return;
      }

      // Validate numeric fields
      const travelers = parseInt(editFormData.travelers);
      if (editFormData.travelers && (isNaN(travelers) || travelers <= 0)) {
        setMessage({ type: 'error', text: 'Please enter a valid number of travelers (positive number)' });
        return;
      }

      const numberOfMembers = parseInt(editFormData.numberOfMembers);
      if (editFormData.numberOfMembers && (isNaN(numberOfMembers) || numberOfMembers <= 0)) {
        setMessage({ type: 'error', text: 'Please enter a valid number of members (positive number)' });
        return;
      }

      // Validate budget selection if provided
      const validBudgets = ['', 'low', 'medium', 'high'];
      if (editFormData.budget && !validBudgets.includes(editFormData.budget)) {
        setMessage({ type: 'error', text: 'Please select a valid budget option' });
        return;
      }

      // Validate date format if provided
      if (editFormData.startDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(editFormData.startDate)) {
          setMessage({ type: 'error', text: 'Please enter a valid start date in YYYY-MM-DD format' });
          return;
        }
        
        const date = new Date(editFormData.startDate);
        if (isNaN(date.getTime())) {
          setMessage({ type: 'error', text: 'Please enter a valid start date' });
          return;
        }
      }

      const updatedTripData = {
        ...tripData,
        userSelection: {
          ...tripData.userSelection,
          location: { label: editFormData.location.trim() },
          travelers: editFormData.travelers ? parseInt(editFormData.travelers) : null,
          days: editFormData.days.trim(),
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
      setMessage({ type: 'success', text: 'Trip updated successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error updating trip:', error);
      setMessage({ type: 'error', text: 'Failed to update trip. Please try again.' });
    }
  };

  // Loading state
  if (loading) {
    return <TripDetailsSkeleton />;
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
                className="border-b-2 border-blue-500 bg-transparent text-center w-full md:w-auto px-2 py-1"
                placeholder="Enter destination"
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
                  className="border-b border-gray-300 w-full px-2 py-1"
                  placeholder="Enter destination"
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
                  className="border-b border-gray-300 w-full px-2 py-1"
                  placeholder="e.g., 5 days"
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
                  className="border-b border-gray-300 w-full px-2 py-1"
                  placeholder="Number of travelers"
                  min="1"
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
                  className="border-b border-gray-300 w-full px-2 py-1"
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
                  className="border-b border-gray-300 w-full px-2 py-1"
                  placeholder="Enter number of members"
                  min="1"
                />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Start Date</p>
                <input
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) => handleEditChange('startDate', e.target.value)}
                  className="border-b border-gray-300 w-full px-2 py-1"
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
                      src={hotel.hotelImageUrl}
                      alt={hotel.hotelName || 'Hotel Image'}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
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
        {itineraryData && Array.isArray(itineraryData) && itineraryData.length > 0 ? (
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
                <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white">Day {index + 1}: {dayData.day || `Day ${index + 1}`}</h3>
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
                              src={hotelsData[0].hotelImageUrl}
                              alt={hotelsData[0].hotelName || 'Hotel'}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
                              }}
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
                            <div className="border-l-4 border-blue-500 pl-4">
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
                                        src={place.placeImageUrl}
                                        alt={place.placeName || 'Place Image'}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        onError={(e) => {
                                          e.target.src = 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
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
                            <div className="border-l-4 border-yellow-500 pl-4">
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
                                        src={place.placeImageUrl}
                                        alt={place.placeName || 'Place Image'}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        onError={(e) => {
                                          e.target.src = 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
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
                            <div className="border-l-4 border-purple-500 pl-4">
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
                                        src={place.placeImageUrl}
                                        alt={place.placeName || 'Place Image'}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        onError={(e) => {
                                          e.target.src = 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
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
        ) : (
          // Show message when we have no itinerary data
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
                {hotelsData && hotelsData.length > 0 && (
                  <div className="mt-6 text-left bg-blue-50 p-4 rounded-lg max-w-2xl mx-auto">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Hotels Found
                    </h4>
                    <p className="text-blue-700">We've found {hotelsData.length} hotel options for your stay in {safeLocation.label || 'your destination'}.</p>
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

        {/* Message display */}
        {message.text && (
          <div className={`mt-4 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {message.text}
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

          {/* Points of Interest Map */}
          {(hotelsData.length > 0 || (itineraryData && itineraryData.length > 0)) && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="mr-2">📍</span> Points of Interest
                </h2>
                <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                  {getAllPOIs(hotelsData, itineraryData).length} locations
                </span>
              </div>
              
              <POIMap 
                center={
                  hotelsData[0]?.geoCoordinates ? 
                  [hotelsData[0].geoCoordinates.lat, hotelsData[0].geoCoordinates.lng] : 
                  itineraryData[0]?.plan?.[0]?.geoCoordinates ?
                  [itineraryData[0].plan[0].geoCoordinates.lat, itineraryData[0].plan[0].geoCoordinates.lng] :
                  [36.1699, -115.1398]
                }
                pois={getAllPOIs(hotelsData, itineraryData)}
                onLocationClick={(poi) => {
                  // Handle POI click - could scroll to relevant section or show more details
                  console.log('POI clicked:', poi);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};export default TripDetails;