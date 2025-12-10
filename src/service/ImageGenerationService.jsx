import axios from 'axios';

// Unsplash API for image search
const UNSPLASH_ACCESS_KEY = '-SM0favOiLSKdFiD9cMc58LkLseqUZLcTeohV3qLW_w'; // Updated access key
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

// Application ID: 839519
// Secret key: 3TbkBvg9QlONTA-ugghU2Cz7JhQLow9hOOtIU2qsYhM

// Simple rate limiting mechanism
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

/**
 * Search for images related to a destination using Unsplash API in real-time
 * @param {string} destination - The destination name (e.g., "Paris, France")
 * @param {number} perPage - Number of images to return (default: 5)
 * @returns {Promise<Array>} Array of image objects with URLs and metadata
 */
export async function searchDestinationImages(destination, perPage = 5) {
  try {
    console.log(`Searching for images for destination: ${destination}`);
    
    // Ensure we have a valid destination
    if (!destination || destination.trim().length === 0) {
      console.warn('Empty or invalid destination provided');
      return [];
    }
    
    // Rate limiting - wait if needed
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${delay}ms before making request`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Update last request time
    lastRequestTime = Date.now();
    
    // Encode the destination query properly
    const encodedDestination = encodeURIComponent(destination);
    
    const response = await axios.get(UNSPLASH_API_URL, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1',
        'User-Agent': 'TravelEase/1.0 (https://travelease.example.com)'
      },
      params: {
        query: encodedDestination,
        per_page: perPage,
        orientation: 'landscape'
      }
    });

    console.log('Unsplash API response status:', response.status);
    console.log('Unsplash API response headers:', response.headers);

    if (response.data && response.data.results) {
      // Map the response to our expected format
      const images = response.data.results.map(result => ({
        id: result.id,
        imageUrl: result.urls.small,
        largeImageUrl: result.urls.regular,
        fullImageUrl: result.urls.full,
        thumbUrl: result.urls.thumb,
        tags: result.alt_description || destination,
        likes: result.likes,
        downloads: result.downloads || 0,
        user: result.user.name,
        userImageURL: result.user.profile_image?.medium || ''
      }));

      console.log('Processed images:', images);
      return images;
    }

    return [];
  } catch (error) {
    console.error('Error searching for destination images from Unsplash API:', error.response?.status, error.response?.data || error.message);
    // Return empty array as fallback
    return [];
  }
}

/**
 * Get a single representative image for a place/activity from Unsplash in real-time
 * @param {string} placeName - The name of the place/activity
 * @returns {Promise<string|null>} Image URL or null if not found
 */
export async function getPlaceImage(placeName) {
  try {
    // Validate input
    if (!placeName || placeName.trim().length === 0) {
      console.warn('Empty or invalid place name provided');
      return null;
    }
    
    // Try with the original place name first
    let images = await searchDestinationImages(placeName, 1);
    
    // If no images found, try with a modified query
    if (!images || images.length === 0) {
      console.log(`No images found for "${placeName}", trying with modified query...`);
      images = await searchDestinationImages(`${placeName} attraction`, 1);
    }
    
    if (images && images.length > 0) {
      return images[0].largeImageUrl || images[0].imageUrl;
    }
    return null;
  } catch (error) {
    console.error('Error getting place image from Unsplash:', error);
    return null;
  }
}

/**
 * Get a single representative image for a destination from Unsplash in real-time
 * @param {string} destination - The destination name
 * @returns {Promise<string|null>} Image URL or null if not found
 */
export async function getDestinationImage(destination) {
  try {
    // Validate input
    if (!destination || destination.trim().length === 0) {
      console.warn('Empty or invalid destination provided');
      return null;
    }
    
    // Try with the original destination first
    let images = await searchDestinationImages(destination, 1);
    
    // If no images found, try with a modified query
    if (!images || images.length === 0) {
      console.log(`No images found for "${destination}", trying with modified query...`);
      images = await searchDestinationImages(`${destination} travel`, 1);
    }
    
    if (images && images.length > 0) {
      return images[0].largeImageUrl || images[0].imageUrl;
    }
    return null;
  } catch (error) {
    console.error('Error getting destination image from Unsplash:', error);
    return null;
  }
}

export default {
  searchDestinationImages,
  getDestinationImage,
  getPlaceImage
};