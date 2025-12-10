/**
 * Helper functions for organizing itinerary data
 */

/**
 * Categorize activities by time periods (morning, afternoon, evening)
 * @param {Array} activities - Array of activity objects
 * @returns {Object} Object with morning, afternoon, evening arrays
 */
export function categorizeActivitiesByTime(activities) {
  const timePeriods = {
    morning: [],
    afternoon: [],
    evening: []
  };

  if (!activities || !Array.isArray(activities)) {
    return timePeriods;
  }

  // If activities array is empty, return empty periods
  if (activities.length === 0) {
    return timePeriods;
  }

  activities.forEach(activity => {
    // Check if activity has time information
    const timeInfo = (activity.timeToVisit || activity.timeTravel || '').toLowerCase();
    
    // Handle case where timeInfo is empty - put in afternoon as default
    if (!timeInfo) {
      timePeriods.afternoon.push(activity);
      return;
    }
    
    // Categorize based on time keywords with improved logic
    if (timeInfo.includes('morning') || 
        timeInfo.includes('am') && !timeInfo.includes('pm') || 
        timeInfo.includes('9:') || 
        timeInfo.includes('10:') || 
        timeInfo.includes('11:') && !timeInfo.includes('11:00 pm') && !timeInfo.includes('11:30 pm')) {
      timePeriods.morning.push(activity);
    } else if (timeInfo.includes('afternoon') || 
               timeInfo.includes('12:') || 
               timeInfo.includes('1:') || 
               timeInfo.includes('2:') || 
               timeInfo.includes('3:') || 
               timeInfo.includes('4:') || 
               timeInfo.includes('5:') ||
               (timeInfo.includes('pm') && 
                !(timeInfo.includes('6 pm') || timeInfo.includes('7 pm') || timeInfo.includes('8 pm') || 
                  timeInfo.includes('9 pm') || timeInfo.includes('10 pm') || timeInfo.includes('11 pm') ||
                  timeInfo.includes('6:00 pm') || timeInfo.includes('7:00 pm') || timeInfo.includes('8:00 pm') || 
                  timeInfo.includes('9:00 pm') || timeInfo.includes('10:00 pm') || timeInfo.includes('11:00 pm') ||
                  timeInfo.includes('6:30 pm') || timeInfo.includes('7:30 pm') || timeInfo.includes('8:30 pm') || 
                  timeInfo.includes('9:30 pm') || timeInfo.includes('10:30 pm') || timeInfo.includes('11:30 pm')))) {
      timePeriods.afternoon.push(activity);
    } else if (timeInfo.includes('evening') || 
               timeInfo.includes('night') || 
               timeInfo.includes('6 pm') || timeInfo.includes('7 pm') || timeInfo.includes('8 pm') || 
               timeInfo.includes('9 pm') || timeInfo.includes('10 pm') || timeInfo.includes('11 pm') ||
               timeInfo.includes('6:00 pm') || timeInfo.includes('7:00 pm') || timeInfo.includes('8:00 pm') || 
               timeInfo.includes('9:00 pm') || timeInfo.includes('10:00 pm') || timeInfo.includes('11:00 pm') ||
               timeInfo.includes('6:30 pm') || timeInfo.includes('7:30 pm') || timeInfo.includes('8:30 pm') || 
               timeInfo.includes('9:30 pm') || timeInfo.includes('10:30 pm') || timeInfo.includes('11:30 pm')) {
      timePeriods.evening.push(activity);
    } else {
      // Default: put in afternoon if no clear time info
      timePeriods.afternoon.push(activity);
    }
  });

  // If all arrays are empty, put all activities in afternoon as fallback
  if (timePeriods.morning.length === 0 && timePeriods.afternoon.length === 0 && timePeriods.evening.length === 0) {
    timePeriods.afternoon = [...activities];
  }

  // Additional fallback: if no activities were categorized, put them all in afternoon
  const totalCategorized = timePeriods.morning.length + timePeriods.afternoon.length + timePeriods.evening.length;
  if (totalCategorized === 0 && activities.length > 0) {
    timePeriods.afternoon = [...activities];
  }

  return timePeriods;
}

/**
 * Get time period label with emoji
 * @param {string} period - Time period (morning, afternoon, evening)
 * @returns {string} Formatted label
 */
export function getTimePeriodLabel(period) {
  switch (period) {
    case 'morning':
      return '🌅 Morning';
    case 'afternoon':
      return '☀️ Afternoon';
    case 'evening':
      return '🌆 Evening';
    default:
      return '🕒 Anytime';
  }
}

/**
 * Get time period description
 * @param {string} period - Time period (morning, afternoon, evening)
 * @returns {string} Description
 */
export function getTimePeriodDescription(period) {
  switch (period) {
    case 'morning':
      return 'Start your day with these activities';
    case 'afternoon':
      return 'Continue exploring during the afternoon';
    case 'evening':
      return 'Wind down your day with these activities';
    default:
      return 'Activities for any time of day';
  }
}

export default {
  categorizeActivitiesByTime,
  getTimePeriodLabel,
  getTimePeriodDescription
};