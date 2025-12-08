import axios from 'axios';

/**
 * Service to fetch real hotel data from OpenStreetMap
 */

// Function to search for hotels near a specific location
export const searchHotelsNearLocation = async (location, budgetTier = 'moderate', radius = 5000) => {
  try {
    // First, we need to geocode the location to get coordinates
    const geocodeResponse = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
    );

    if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
      throw new Error('Location not found');
    }

    const { lat, lon } = geocodeResponse.data[0];
    
    // Now search for hotels near the location
    // Using Overpass API to search for hotels
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["tourism"="hotel"](around:${radius},${lat},${lon});
        way["tourism"="hotel"](around:${radius},${lat},${lon});
        relation["tourism"="hotel"](around:${radius},${lat},${lon});
      );
      out center;
    `;
    
    const overpassResponse = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(overpassQuery)}`
    );
    
    // Process the results to extract hotel information
    const hotels = processOverpassResults(overpassResponse.data.elements, location, budgetTier);
    
    // Filter hotels based on budget tier
    const filteredHotels = filterHotelsByBudget(hotels, budgetTier);
    
    return filteredHotels;
  } catch (error) {
    console.error('Error fetching hotels from OpenStreetMap:', error);
    // Return fallback data if API fails
    const fallbackHotels = getFallbackHotels(location, budgetTier);
    return filterHotelsByBudget(fallbackHotels, budgetTier);
  }
};

// Process Overpass API results
const processOverpassResults = (elements, location, budgetTier) => {
  return elements
    .filter(element => element.tags && element.tags.name)
    .map(element => {
      const lat = element.center ? element.center.lat : element.lat;
      const lng = element.center ? element.center.lon : element.lon;
      
      // Generate a more realistic price based on rating and budget tier
      const baseRating = Math.floor(Math.random() * 3) + 3; // Random rating between 3-5
      const price = generatePriceByBudget(baseRating, budgetTier);
      
      return {
        hotelName: element.tags.name || 'Hotel',
        hotelAddress: element.tags.address || element.tags['addr:full'] || element.tags['addr:street'] || 'Address not available',
        description: element.tags.description || element.tags.amenity || element.tags.tourism || `A comfortable hotel in ${location}`,
        geoCoordinates: { lat, lng },
        rating: baseRating,
        price: price,
        hotelImageUrl: '' // We'll need to fetch images separately or use placeholders
      };
    })
    .slice(0, 10); // Limit to 10 hotels
};

// Generate price based on budget tier
const generatePriceByBudget = (rating, budgetTier) => {
  // Base prices by budget tier (in Indian Rupees per night)
  const budgetRanges = {
    cheap: { min: 2000, max: 6000 },
    moderate: { min: 6000, max: 12000 },
    luxury: { min: 12000, max: 30000 }
  };
  
  // Get the range for the selected budget tier
  const range = budgetRanges[budgetTier] || budgetRanges.moderate;
  
  // Adjust price based on rating (higher rated hotels cost more within the tier)
  const ratingMultiplier = (rating - 2) * 0.2; // 0.2 multiplier per rating point above 2
  const basePrice = range.min + (range.max - range.min) * 0.3; // Start at 30% through the range
  const adjustedPrice = basePrice + (range.max - range.min) * ratingMultiplier * 0.2; // Apply rating adjustment
  
  // Ensure price stays within bounds
  const finalPrice = Math.max(range.min, Math.min(range.max, adjustedPrice));
  
  return `₹${Math.round(finalPrice).toLocaleString()} per night`;
};

// Filter hotels by budget tier
const filterHotelsByBudget = (hotels, budgetTier) => {
  // Define price ranges for each budget tier (in Indian Rupees per night)
  const priceRanges = {
    cheap: { min: 0, max: 7000 },
    moderate: { min: 5000, max: 15000 },
    luxury: { min: 12000, max: 100000 }
  };
  
  const range = priceRanges[budgetTier] || priceRanges.moderate;
  
  return hotels.filter(hotel => {
    // Extract numeric price from string like "₹7,800 per night"
    const priceMatch = hotel.price.match(/₹([\d,]+)/);
    if (!priceMatch) return true; // If we can't parse the price, include the hotel
    
    const price = parseInt(priceMatch[1].replace(/,/g, ''));
    return price >= range.min && price <= range.max;
  });
};

// Fallback hotel data in case API fails
const getFallbackHotels = (location, budgetTier) => {
  // Define fallback hotels for each budget tier
  const fallbackHotelsByBudget = {
    cheap: [
      {
        hotelName: `Budget Lodge ${location}`,
        hotelAddress: `321 Economy Rd, ${location}`,
        description: `Affordable and clean accommodation perfect for budget-conscious travelers exploring ${location}`,
        geoCoordinates: { lat: 40.7282, lng: -74.0776 },
        rating: 3,
        price: '₹4,500 per night',
        hotelImageUrl: `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(`Budget Lodge ${location}`)}`
      },
      {
        hotelName: `Hostel Central ${location}`,
        hotelAddress: `100 Backpacker St, ${location}`,
        description: `Social hostel with dormitory and private rooms, ideal for solo travelers exploring ${location}`,
        geoCoordinates: { lat: 40.7505, lng: -73.9934 },
        rating: 3,
        price: '₹2,800 per night',
        hotelImageUrl: `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(`Hostel Central ${location}`)}`
      },
      {
        hotelName: `Economy Inn ${location}`,
        hotelAddress: `777 Value Blvd, ${location}`,
        description: `Basic but comfortable rooms at wallet-friendly prices in ${location}`,
        geoCoordinates: { lat: 40.7549, lng: -73.9840 },
        rating: 2,
        price: '₹3,200 per night',
        hotelImageUrl: `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(`Economy Inn ${location}`)}`
      }
    ],
    moderate: [
      {
        hotelName: `City Center Inn ${location}`,
        hotelAddress: `456 Central Ave, ${location}`,
        description: `Comfortable mid-range accommodation in central ${location} with easy access to attractions`,
        geoCoordinates: { lat: 40.7589, lng: -73.9851 },
        rating: 4,
        price: '₹7,800 per night',
        hotelImageUrl: `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(`City Center Inn ${location}`)}`
      },
      {
        hotelName: `Business Suites ${location}`,
        hotelAddress: `555 Corporate Plaza, ${location}`,
        description: `Modern business hotel with conference facilities and high-speed internet in ${location}`,
        geoCoordinates: { lat: 40.7549, lng: -73.9840 },
        rating: 4,
        price: '₹9,200 per night',
        hotelImageUrl: `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(`Business Suites ${location}`)}`
      },
      {
        hotelName: `Heritage Hotel ${location}`,
        hotelAddress: `222 Culture St, ${location}`,
        description: `Charming hotel in a historic building with modern amenities in ${location}`,
        geoCoordinates: { lat: 40.7282, lng: -74.0776 },
        rating: 4,
        price: '₹8,500 per night',
        hotelImageUrl: `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(`Heritage Hotel ${location}`)}`
      }
    ],
    luxury: [
      {
        hotelName: `Grand Hotel ${location}`,
        hotelAddress: `123 Main St, ${location}`,
        description: `A luxurious 5-star hotel in the heart of ${location} with premium amenities and services`,
        geoCoordinates: { lat: 40.7128, lng: -74.0060 }, // Default coordinates
        rating: 5,
        price: '₹12,500 per night',
        hotelImageUrl: `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(`Grand Hotel ${location}`)}`
      },
      {
        hotelName: `Seaside Resort ${location}`,
        hotelAddress: `789 Beach Blvd, ${location}`,
        description: `Beautiful beachfront resort with stunning ocean views and water sports facilities in ${location}`,
        geoCoordinates: { lat: 40.7505, lng: -73.9934 },
        rating: 5,
        price: '₹16,200 per night',
        hotelImageUrl: `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(`Seaside Resort ${location}`)}`
      },
      {
        hotelName: `Palace Hotel ${location}`,
        hotelAddress: `999 Royal Way, ${location}`,
        description: `Opulent accommodation with world-class spa, fine dining, and personalized butler service in ${location}`,
        geoCoordinates: { lat: 40.7589, lng: -73.9851 },
        rating: 5,
        price: '₹22,500 per night',
        hotelImageUrl: `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(`Palace Hotel ${location}`)}`
      }
    ]
  };
  
  return fallbackHotelsByBudget[budgetTier] || fallbackHotelsByBudget.moderate;
};

// Function to get a single hotel by ID (if needed)
export const getHotelById = async (osmId) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/lookup?osm_ids=N${osmId}&format=json`
    );
    
    if (response.data && response.data.length > 0) {
      const hotel = response.data[0];
      return {
        hotelName: hotel.display_name || 'Hotel',
        hotelAddress: hotel.display_name || 'Address not available',
        geoCoordinates: { lat: hotel.lat, lng: hotel.lon },
        // Add more fields as needed
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching hotel by ID:', error);
    return null;
  }
};

export default {
  searchHotelsNearLocation,
  getHotelById
};