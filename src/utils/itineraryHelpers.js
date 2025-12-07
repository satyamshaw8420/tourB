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

  activities.forEach(activity => {
    // Check if activity has time information
    const timeInfo = (activity.timeToVisit || activity.timeTravel || '').toLowerCase();
    
    // Categorize based on time keywords
    if (timeInfo.includes('morning') || timeInfo.includes('am') || timeInfo.includes('9:') || timeInfo.includes('10:') || timeInfo.includes('11:')) {
      timePeriods.morning.push(activity);
    } else if (timeInfo.includes('afternoon') || timeInfo.includes('pm') && !timeInfo.includes('12:') && !timeInfo.includes('1:') && !timeInfo.includes('2:') && !timeInfo.includes('3:') && !timeInfo.includes('4:') && !timeInfo.includes('5:')) {
      timePeriods.afternoon.push(activity);
    } else if (timeInfo.includes('evening') || timeInfo.includes('night') || timeInfo.includes('6:') || timeInfo.includes('7:') || timeInfo.includes('8:') || timeInfo.includes('9:') || timeInfo.includes('10:') || timeInfo.includes('11:')) {
      timePeriods.evening.push(activity);
    } else {
      // Default: put in afternoon if no time info
      timePeriods.afternoon.push(activity);
    }
  });

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