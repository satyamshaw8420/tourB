import axios from 'axios';

// Unsplash API for image search
const UNSPLASH_ACCESS_KEY = '-SM0favOiLSKdFiD9cMc58LkLseqUZLcTeohV3qLW_w'; // Your provided access key
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

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
    
    const response = await axios.get(UNSPLASH_API_URL, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      },
      params: {
        query: destination,
        per_page: perPage,
        orientation: 'landscape',
        // Add cache-busting parameter to ensure real-time results
        cache_bust: Date.now()
      }
    });

    console.log('Unsplash API response:', response.data);

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
    console.error('Error searching for destination images from Unsplash API:', error);
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
    
    const images = await searchDestinationImages(placeName, 1);
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
    
    const images = await searchDestinationImages(destination, 1);
    if (images && images.length > 0) {
      return images[0].largeImageUrl || images[0].imageUrl;
    }
    return null;
  } catch (error) {
    console.error('Error getting destination image from Unsplash:', error);
    return null;
  }
}

/**
 * Generate a placeholder image with destination text overlay
 * Note: This is a fallback if no real images are found from Unsplash
 * @param {string} destination - The destination name
 * @returns {string} Placeholder image URL with text
 */
export function generatePlaceholderImage(destination) {
  // Using a service like placehold.co to generate images with text
  // Format: https://placehold.co/{width}x{height}/{bgColor}/{textColor}?text={text}
  const width = 800;
  const height = 600;
  const bgColor = '007bff'; // Blue background
  const textColor = 'ffffff'; // White text
  const encodedText = encodeURIComponent(destination);
  
  return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${encodedText}`;
}

export default {
  searchDestinationImages,
  getDestinationImage,
  getPlaceImage,
  generatePlaceholderImage
};