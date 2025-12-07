import axios from 'axios';

/**
 * Service to fetch real geolocation data from OpenStreetMap
 */

// Function to get real coordinates for a location using OpenStreetMap Nominatim
export const getLocationCoordinates = async (locationName) => {
  try {
    // Use OpenStreetMap Nominatim API to get real coordinates
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`
    );
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
    }
    
    // Return null if not found
    return null;
  } catch (error) {
    console.error('Error fetching coordinates from OpenStreetMap:', error);
    // Return null if API fails
    return null;
  }
};

// Function to generate a random color
export const getRandomColor = () => {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
    "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
    "#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};