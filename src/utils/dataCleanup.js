/**
 * Comprehensive data clearing utility for TravelEase application
 * This module provides functions to clear user data, authentication tokens,
 * and all site data for privacy and security purposes.
 */

/**
 * Clear all user-related data from localStorage, sessionStorage, and cookies
 * @param {Object} options - Configuration options
 * @param {boolean} options.preserveEssential - Whether to preserve essential non-user data
 * @returns {boolean} - Success status
 */
export const clearAllUserData = (options = {}) => {
  try {
    const { preserveEssential = false } = options;
    
    // Clear specific user items from localStorage
    const userKeys = ['user', 'authToken', 'refreshToken', 'userId'];
    userKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear any Google OAuth related data
    Object.keys(localStorage).forEach(key => {
      if (key.includes('google') || key.includes('oauth') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear cookies related to authentication
    document.cookie.split(";").forEach(function(c) { 
      const cookieName = c.split("=")[0].trim();
      if (cookieName.includes('google') || cookieName.includes('oauth') || cookieName.includes('auth')) {
        document.cookie = cookieName + "=;expires=" + new Date().toUTCString() + ";path=/";
      }
    });
    
    console.log("All user data cleared successfully");
    return true;
  } catch (error) {
    console.error("Error clearing user data:", error);
    return false;
  }
};

/**
 * Clear all site data including user data, cache, and cookies
 * @returns {boolean} - Success status
 */
export const clearAllSiteData = () => {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      const cookieName = c.split("=")[0].trim();
      document.cookie = cookieName + "=;expires=" + new Date().toUTCString() + ";path=/";
    });
    
    console.log("All site data cleared successfully");
    return true;
  } catch (error) {
    console.error("Error clearing site data:", error);
    return false;
  }
};

/**
 * Clear stale OAuth data that might interfere with authentication
 * @returns {boolean} - Success status
 */
export const clearStaleOAuthData = () => {
  try {
    // Clear sessionStorage entries that might interfere with OAuth
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('google') || key.includes('oauth')) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Check if user data exists but is malformed
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (!parsed.email || !parsed._id) {
          // Remove malformed user data
          localStorage.removeItem('user');
        }
      } catch (e) {
        // Remove corrupted user data
        localStorage.removeItem('user');
      }
    }
    
    console.log("Stale OAuth data cleared successfully");
    return true;
  } catch (error) {
    console.error("Error clearing stale OAuth data:", error);
    return false;
  }
};

export default {
  clearAllUserData,
  clearAllSiteData,
  clearStaleOAuthData
};