import { searchHotelsNearLocation } from './OpenStreetMapService';

// Function to validate and enhance trip data with comprehensive details
export function validateAndEnhanceTripData(tripData, formData) {
  // Check if this is a multi-destination trip
  const isMultiDestination = formData.destinations && Array.isArray(formData.destinations) && formData.destinations.length > 1;
  
  // Validate geographic coordinates
  if (Array.isArray(tripData.hotels)) {
    tripData.hotels.forEach(hotel => {
      if (hotel.geoCoordinates) {
        // Simple validation - in real implementation, you might want to check against a geocoding service
        if (typeof hotel.geoCoordinates.lat !== 'number' || typeof hotel.geoCoordinates.lng !== 'number') {
          hotel.geoCoordinates = { lat: 0, lng: 0 };
        }
      }
    });
  }
  
  // Validate and enhance local insights section
  if (tripData.localInsights && typeof tripData.localInsights === 'object') {
    const requiredInsightFields = [
      'weather', 'currency', 'language', 'tipping', 
      'safety', 'transport', 'cuisine', 'customs'
    ];
    
    requiredInsightFields.forEach(field => {
      if (!tripData.localInsights[field]) {
        tripData.localInsights[field] = `Information about ${field} is not available`;
      }
    });
  } else {
    // Create fallback local insights if not provided
    tripData.localInsights = {
      weather: "Seasonal weather information not available",
      currency: "Local currency information not available",
      language: "Language information not available",
      tipping: "Tipping customs information not available",
      safety: "Safety information not available",
      transport: "Transportation information not available",
      cuisine: "Local cuisine information not available",
      customs: "Local customs information not available"
    };
  }
  
  // Validate and enhance emergency contacts section
  if (tripData.emergencyContacts && typeof tripData.emergencyContacts === 'object') {
    const requiredContactFields = ['police', 'ambulance', 'touristHelpline'];
    
    requiredContactFields.forEach(field => {
      if (!tripData.emergencyContacts[field]) {
        tripData.emergencyContacts[field] = "Contact information not available";
      }
    });
  } else {
    // Create fallback emergency contacts if not provided
    tripData.emergencyContacts = {
      police: "Emergency contact information not available",
      ambulance: "Medical emergency contact information not available",
      touristHelpline: "Tourist helpline information not available"
    };
  }
  
  if (Array.isArray(tripData.itinerary)) {
    tripData.itinerary.forEach(day => {
      if (Array.isArray(day.plan)) {
        day.plan.forEach(activity => {
          if (activity.geoCoordinates) {
            // Simple validation
            if (typeof activity.geoCoordinates.lat !== 'number' || typeof activity.geoCoordinates.lng !== 'number') {
              activity.geoCoordinates = { lat: 0, lng: 0 };
            }
          }
          
          // Ensure all required fields are populated with sensible defaults
          activity.bestTime = activity.bestTime || activity.timeToVisit || "Any time";
          activity.duration = activity.duration || "1-2 hours";
          activity.category = activity.category || "Attraction";
          activity.accessibility = activity.accessibility || "Information not available";
          activity.tips = activity.tips || "No specific tips available";
          activity.nearestTransport = activity.nearestTransport || "Transport information not available";
          
          // Additional enhancements for richer data
          activity.seasonalConsiderations = activity.seasonalConsiderations || "Seasonal information not available";
          activity.bookingInfo = activity.bookingInfo || "Booking information not available";
          activity.whatToBring = activity.whatToBring || "Recommended items not specified";
        });
      }
      
      // For multi-destination trips, ensure location is specified for each day
      if (isMultiDestination && !day.location) {
        day.location = "Destination information not available";
      }
    });
  }
  
  return tripData;
}

// Function to generate comprehensive fallback itinerary
export function generateComprehensiveFallbackItinerary(days, isMultiDestination, destinations = []) {
  const itinerary = [];
  
  // Validate inputs
  const numDays = parseInt(days) || 3; // Default to 3 days if invalid
  
  // Create a comprehensive itinerary for each day
  for (let i = 1; i <= numDays; i++) {
    const dayPlan = {
      day: `Day ${i}`,
      date: `Day ${i}`,
      location: isMultiDestination ? 
        (destinations.length > 0 ? 
          destinations[Math.min(Math.floor((i-1) / Math.ceil(numDays / destinations.length)), destinations.length - 1)] : 
          `Destination ${((i-1) % (destinations.length || 3)) + 1}`) : 
        "", // For multi-destination
      plan: generateComprehensiveDayActivities(isMultiDestination ? 
        (destinations.length > 0 ? 
          destinations[Math.min(Math.floor((i-1) / Math.ceil(numDays / destinations.length)), destinations.length - 1)] : 
          `Destination ${((i-1) % (destinations.length || 3)) + 1}`) : 
        "your destination")
    };
    
    // For multi-destination trips, add transit days between destinations
    if (isMultiDestination && destinations.length > 0) {
      // Calculate which destination we should be at
      const daysPerDestination = Math.ceil(numDays / destinations.length);
      const currentDestinationIndex = Math.min(Math.floor((i-1) / daysPerDestination), destinations.length - 1);
      
      // If this is a transition day between destinations
      if (currentDestinationIndex < destinations.length - 1 && 
          (i % daysPerDestination === 0 || i === numDays)) {
        dayPlan.plan = [
          {
            placeName: "Inter-city Travel",
            placeDetails: `Journey from ${destinations[currentDestinationIndex]} to ${destinations[currentDestinationIndex + 1]} via the most convenient and scenic route. Experience the landscape transformation as you travel between culturally diverse regions.`,
            placeImageUrl: "",
            geoCoordinates: { lat: 0, lng: 0 },
            ticketPricing: "₹3,000-8,000 depending on distance and transport mode",
            rating: 4.0,
            timeToVisit: "Morning departure for afternoon arrival",
            timeTravel: "Varies by distance (2-8 hours typical)",
            bestTime: "Morning to avoid delays",
            duration: "Entire day",
            category: "Transport",
            accessibility: "Modern transport options offer good accessibility",
            tips: "Book seats with preferred views. Pack snacks and entertainment for longer journeys.",
            nearestTransport: "Major transport hubs with multiple connections",
            seasonalConsiderations: "Weather conditions may affect travel times and routes",
            bookingInfo: "Book transport in advance for better rates and availability",
            whatToBring: "Travel documents, snacks, entertainment, and comfortable clothing"
          }
        ];
      }
    }
    
    itinerary.push(dayPlan);
  }
  
  return itinerary;
}

// Function to generate comprehensive activities for a day
function generateComprehensiveDayActivities(location = "your destination") {
  return [
    {
      placeName: "Cultural Landmark",
      placeDetails: `Explore significant historical sites and monuments that shaped the region's culture and heritage in ${location}. Learn about local history through guided tours or audio guides available on-site.`,
      placeImageUrl: "",
      geoCoordinates: { lat: 0, lng: 0 },
      ticketPricing: "₹500-1,500",
      rating: 4.2,
      timeToVisit: "Morning (9:00 AM - 12:00 PM)",
      timeTravel: "Walking distance or public transport",
      bestTime: "Morning for fewer crowds",
      duration: "2-3 hours",
      category: "Landmark",
      accessibility: "Most landmarks have basic accessibility, contact ahead for specific needs",
      tips: "Book tickets online in advance to skip queues. Bring comfortable walking shoes and a camera.",
      nearestTransport: "Multiple public transport options typically available"
    },
    {
      placeName: "Local Market Experience",
      placeDetails: `Immerse yourself in local commerce and culture at bustling markets in ${location}. Sample regional delicacies, shop for authentic souvenirs, and interact with friendly vendors.`,
      placeImageUrl: "",
      geoCoordinates: { lat: 0.001, lng: 0.001 },
      ticketPricing: "Free entry, purchases as desired",
      rating: 4.0,
      timeToVisit: "Late morning or afternoon (10:00 AM - 6:00 PM)",
      timeTravel: "30 minutes by public transport",
      bestTime: "Mid-week mornings for freshest produce",
      duration: "1-2 hours",
      category: "Market",
      accessibility: "Varies by market, most have ground level access",
      tips: "Carry small bills for easier transactions. Visit during harvest season for best selections.",
      nearestTransport: "Accessible by multiple bus/tram lines"
    },
    {
      placeName: "Scenic Viewpoint",
      placeDetails: `Enjoy panoramic views of the cityscape or natural landscapes from elevated positions in ${location}. Perfect for photography and appreciating geographical beauty of the region.`,
      placeImageUrl: "",
      geoCoordinates: { lat: -0.001, lng: -0.001 },
      ticketPricing: "Free-₹300",
      rating: 4.3,
      timeToVisit: "Sunrise, sunset, or late afternoon (6:00 PM - 8:00 PM)",
      timeTravel: "45 minutes by taxi or public transport",
      bestTime: "Golden hour for photography",
      duration: "1-2 hours",
      category: "Scenic Spot",
      accessibility: "Outdoor locations, terrain varies, inquire ahead",
      tips: "Bring a tripod for photography. Check weather forecast for clear visibility days.",
      nearestTransport: "Usually accessible by bus with short walk"
    }
  ];
}

// Function to generate additional activities
function generateAdditionalActivity(index, location) {
  const activities = [
    {
      placeName: "Local Museum",
      placeDetails: `Discover the rich history and culture of ${location} through fascinating exhibits and artifacts at a local museum.`,
      placeImageUrl: "",
      geoCoordinates: { lat: 0.002, lng: -0.002 },
      ticketPricing: "₹400-1,200",
      rating: 4.1,
      timeToVisit: "Afternoon (1:00 PM - 4:00 PM)",
      timeTravel: "20 minutes by public transport",
      bestTime: "Weekdays for fewer crowds",
      duration: "2-3 hours",
      category: "Museum",
      accessibility: "Most museums are wheelchair accessible",
      tips: "Check for free admission days. Audio guides often available in multiple languages.",
      nearestTransport: "Accessible by bus or metro"
    },
    {
      placeName: "Nature Park",
      placeDetails: `Escape the urban hustle and enjoy serene natural surroundings at a nearby park or nature reserve in ${location}.`,
      placeImageUrl: "",
      geoCoordinates: { lat: -0.002, lng: 0.002 },
      ticketPricing: "Free-₹200",
      rating: 4.4,
      timeToVisit: "Early morning or late afternoon (6:00 AM - 9:00 AM or 4:00 PM - 7:00 PM)",
      timeTravel: "30 minutes by taxi",
      bestTime: "Spring and autumn for pleasant weather",
      duration: "1-3 hours",
      category: "Nature",
      accessibility: "Paths vary, contact ahead for accessible routes",
      tips: "Bring water and wear comfortable shoes. Early morning visits offer peaceful atmosphere and bird watching opportunities.",
      nearestTransport: "Bus service available with short walk"
    }
  ];
  
  return activities[index % activities.length];
}

// Helper functions for prompt generation
export function getTravelerDescription(travelers) {
  switch (travelers) {
    case 1: return "Solo traveler";
    case 2: return "Couple";
    case 3: return "Family";
    default: return "Group of friends";
  }
}

export function getBudgetDescription(budget) {
  switch (budget) {
    case 1: return "Cheap";
    case 2: return "Moderate";
    case 3: return "Luxury";
    default: return "Moderate";
  }
}