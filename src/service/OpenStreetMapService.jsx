import axios from 'axios';

/**
 * Service to fetch real hotel data from OpenStreetMap
 */

// Create axios instances with proper headers to reduce CORS issues
const nominatimApi = axios.create({
  baseURL: 'https://nominatim.openstreetmap.org',
  headers: {
    'User-Agent': 'TravelEase/1.0 (https://travelease.example.com)',
    'Accept': 'application/json'
  },
  timeout: 15000 // Increased timeout to 15 seconds
});

const overpassApi = axios.create({
  baseURL: 'https://overpass-api.de/api/interpreter', // Direct endpoint
  headers: {
    'User-Agent': 'TravelEase/1.0 (https://travelease.example.com)',
    'Accept': 'application/json'
  },
  timeout: 20000 // Increased timeout to 20 seconds
});

// Process Overpass API results
const processOverpassResults = (elements, location, budgetTier) => {
  if (!elements || !Array.isArray(elements)) {
    return [];
  }
  
  return elements
    .filter(element => element.tags && element.tags.name)
    .map(element => {
      const lat = element.center ? element.center.lat : (element.lat || 0);
      const lng = element.center ? element.center.lon : (element.lon || 0);
      
      // Generate a more realistic price based on rating and budget tier
      const baseRating = Math.min(5, Math.max(3, Math.floor(Math.random() * 3) + 3)); // Random rating between 3-5
      const price = generatePriceByBudget(baseRating, budgetTier);
      
      return {
        hotelName: element.tags.name || 'Hotel',
        hotelAddress: element.tags['addr:full'] || element.tags['addr:street'] || element.tags.address || 'Address not available',
        description: element.tags.description || `A comfortable hotel in ${location}`,
        geoCoordinates: { lat, lng },
        rating: baseRating,
        price: price,
        hotelImageUrl: '' // Will be populated with Unsplash image
      };
    })
    .slice(0, 15); // Increase limit before filtering
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
  }).slice(0, 10); // Limit to 10 hotels
};

// Function to enhance hotels with Unsplash images
const enhanceHotelsWithImages = async (hotels) => {
  const enhancedHotels = [];
  
  for (const hotel of hotels) {
    // If hotel doesn't have an image URL, try to get one from Unsplash
    if (!hotel.hotelImageUrl) {
      try {
        // Import the Unsplash image service dynamically to avoid circular dependencies
        const { getPlaceImage } = await import('./ImageGenerationService.jsx');
        const imageUrl = await getPlaceImage(hotel.hotelName);
        if (imageUrl) {
          hotel.hotelImageUrl = imageUrl;
        }
      } catch (error) {
        console.error('Error getting image for hotel:', hotel.hotelName, error);
        // If Unsplash fails, we'll leave the imageUrl empty and let the frontend handle it
      }
    }
    enhancedHotels.push(hotel);
  }
  
  return enhancedHotels;
};

// Function to search for hotels near a specific location
export const searchHotelsNearLocation = async (location, budgetTier = 'moderate', radius = 3000) => {
  try {
    console.log(`Searching for hotels near: ${location}`);
    
    // First, we need to geocode the location to get coordinates
    const geocodeResponse = await nominatimApi.get('', {
      params: {
        q: location,
        format: 'json',
        limit: 1
      }
    });

    if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
      console.warn('Location not found, using fallback');
      let fallbackHotels = getFallbackHotels(location, budgetTier);
      // Enhance fallback hotels with Unsplash images
      fallbackHotels = await enhanceHotelsWithImages(fallbackHotels);
      return filterHotelsByBudget(fallbackHotels, budgetTier);
    }

    const { lat, lon } = geocodeResponse.data[0];
    console.log(`Found coordinates: ${lat}, ${lon}`);
    
    // Simplified Overpass query with reduced timeout and smaller radius
    const overpassQuery = `
      [out:json][timeout:15];
      (
        node["tourism"="hotel"](around:${radius},${lat},${lon});
        way["tourism"="hotel"](around:${radius},${lat},${lon});
      );
      out center limit 15;
    `;
    
    console.log('Sending Overpass query...');
    
    // Using direct POST with form data
    const overpassResponse = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(overpassQuery)}`,
      {
        headers: {
          'User-Agent': 'TravelEase/1.0 (https://travelease.example.com)',
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 20000
      }
    );
    
    console.log(`Received ${overpassResponse.data.elements.length} hotels from Overpass`);
    
    // Process the results to extract hotel information
    let hotels = processOverpassResults(overpassResponse.data.elements, location, budgetTier);
    
    // Enhance hotels with Unsplash images
    hotels = await enhanceHotelsWithImages(hotels);
    
    // Filter hotels based on budget tier
    const filteredHotels = filterHotelsByBudget(hotels, budgetTier);
    
    // If we didn't get enough hotels, add some fallbacks
    if (filteredHotels.length < 3) {
      let fallbackHotels = getFallbackHotels(location, budgetTier);
      // Enhance fallback hotels with Unsplash images
      fallbackHotels = await enhanceHotelsWithImages(fallbackHotels);
      const combinedHotels = [...filteredHotels, ...fallbackHotels];
      // Remove duplicates and limit to 10
      const uniqueHotels = combinedHotels.filter((hotel, index, self) => 
        index === self.findIndex(h => h.hotelName === hotel.hotelName)
      ).slice(0, 10);
      return uniqueHotels;
    }
    
    return filteredHotels.slice(0, 10); // Limit to 10 hotels
  } catch (error) {
    console.error('Error fetching hotels from OpenStreetMap:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    // Return fallback data if API fails
    let fallbackHotels = getFallbackHotels(location, budgetTier);
    // Enhance fallback hotels with Unsplash images
    fallbackHotels = await enhanceHotelsWithImages(fallbackHotels);
    return filterHotelsByBudget(fallbackHotels, budgetTier);
  }
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

// Fallback hotel data in case API fails
const getFallbackHotels = (location, budgetTier) => {
  // Import the Unsplash image service
  // Note: We can't import it directly here due to circular dependencies, so we'll define a simplified version
  
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
        hotelImageUrl: '' // Will be populated with Unsplash image
      },
      {
        hotelName: `Hostel Central ${location}`,
        hotelAddress: `100 Backpacker St, ${location}`,
        description: `Social hostel with dormitory and private rooms, ideal for solo travelers exploring ${location}`,
        geoCoordinates: { lat: 40.7505, lng: -73.9934 },
        rating: 3,
        price: '₹2,800 per night',
        hotelImageUrl: '' // Will be populated with Unsplash image
      },
      {
        hotelName: `Economy Inn ${location}`,
        hotelAddress: `777 Value Blvd, ${location}`,
        description: `Basic but comfortable rooms at wallet-friendly prices in ${location}`,
        geoCoordinates: { lat: 40.7549, lng: -73.9840 },
        rating: 2,
        price: '₹3,200 per night',
        hotelImageUrl: '' // Will be populated with Unsplash image
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
        hotelImageUrl: '' // Will be populated with Unsplash image
      },
      {
        hotelName: `Business Suites ${location}`,
        hotelAddress: `555 Corporate Plaza, ${location}`,
        description: `Modern business hotel with conference facilities and high-speed internet in ${location}`,
        geoCoordinates: { lat: 40.7549, lng: -73.9840 },
        rating: 4,
        price: '₹9,200 per night',
        hotelImageUrl: '' // Will be populated with Unsplash image
      },
      {
        hotelName: `Heritage Hotel ${location}`,
        hotelAddress: `222 Culture St, ${location}`,
        description: `Charming hotel in a historic building with modern amenities in ${location}`,
        geoCoordinates: { lat: 40.7282, lng: -74.0776 },
        rating: 4,
        price: '₹8,500 per night',
        hotelImageUrl: '' // Will be populated with Unsplash image
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
        hotelImageUrl: '' // Will be populated with Unsplash image
      },
      {
        hotelName: `Seaside Resort ${location}`,
        hotelAddress: `789 Beach Blvd, ${location}`,
        description: `Beautiful beachfront resort with stunning ocean views and water sports facilities in ${location}`,
        geoCoordinates: { lat: 40.7505, lng: -73.9934 },
        rating: 5,
        price: '₹16,200 per night',
        hotelImageUrl: '' // Will be populated with Unsplash image
      },
      {
        hotelName: `Palace Hotel ${location}`,
        hotelAddress: `999 Royal Way, ${location}`,
        description: `Opulent accommodation with world-class spa, fine dining, and personalized butler service in ${location}`,
        geoCoordinates: { lat: 40.7589, lng: -73.9851 },
        rating: 5,
        price: '₹22,500 per night',
        hotelImageUrl: '' // Will be populated with Unsplash image
      }
    ]
  };
  
  return fallbackHotelsByBudget[budgetTier] || fallbackHotelsByBudget.moderate;
};

// Function to get a single hotel by ID (if needed)
export const getHotelById = async (osmId) => {
  try {
    const response = await nominatimApi.get('/lookup', {
      params: {
        osm_ids: `N${osmId}`,
        format: 'json'
      }
    });
    
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