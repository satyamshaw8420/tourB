// Enhanced JSON parsing utilities for AI responses
export function robustJSONParse(responseText) {
  try {
    // Handle completely empty responses
    if (!responseText || responseText.trim().length === 0) {
      throw new Error('Empty AI response');
    }
    
    console.log("Raw AI response:", responseText);
    
    // Remove any markdown code block indicators
    let cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Try to find JSON content between curly braces
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
    } else {
      // No JSON object found in response
      throw new Error('No valid JSON object found in response');
    }
    
    // More robust JSON cleaning
    // Remove newlines and extra spaces
    cleanedText = cleanedText.replace(/[\r\n]/g, ' ').replace(/\s+/g, ' ');
    
    // Fix common JSON issues
    // Replace single quotes with double quotes for property names
    cleanedText = cleanedText.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
    
    // Fix unquoted string values (more conservative approach)
    cleanedText = cleanedText.replace(/:\s*([^"'\{\}\[\]\d][^,\}\]]*?)(?=\s*[},]|$)/g, function(match, p1) {
      // Only quote values that aren't already quoted and look like strings
      if (p1 && !/^\s*$/.test(p1)) {
        return ': "' + p1.trim() + '"';
      }
      return match;
    });
    
    // Remove trailing commas
    cleanedText = cleanedText.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    
    // Handle escaped quotes
    cleanedText = cleanedText.replace(/\\'/g, "'").replace(/\\"/g, '"');
    
    // Final cleanup - remove any remaining control characters
    cleanedText = cleanedText.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    // Additional validation to ensure we have valid JSON structure
    if (cleanedText.length < 10) {
      throw new Error('Response too short to be valid JSON');
    }
    
    // Try to parse the cleaned JSON
    const parsed = JSON.parse(cleanedText);
    console.log("Successfully parsed JSON:", parsed);
    return parsed;
  } catch (parseError) {
    console.error("Primary JSON parsing failed:", parseError);
    console.error("Response text that failed to parse:", responseText);
    
    // Try a more aggressive fallback parsing
    try {
      let fallbackText = responseText;
      console.log("Attempting fallback parsing with text:", fallbackText);
      
      // Handle completely empty responses
      if (!fallbackText || fallbackText.trim().length === 0) {
        throw new Error('Empty AI response in fallback');
      }
      
      // Extract everything between the first { and last }
      const firstBrace = fallbackText.indexOf('{');
      const lastBrace = fallbackText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        fallbackText = fallbackText.substring(firstBrace, lastBrace + 1);
        console.log("Extracted JSON portion:", fallbackText);
        
        // Aggressive cleaning
        fallbackText = fallbackText.replace(/[\r\n]/g, ' ');
        fallbackText = fallbackText.replace(/\s+/g, ' ');
        
        // Remove control characters
        fallbackText = fallbackText.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        
        // Extract JSON-like structure (more conservative)
        fallbackText = fallbackText.replace(/([^\s"':,{}\[\]])\s*(?=:)/g, function(match, p1) {
          // Only quote property names that look valid
          if (/^[a-zA-Z0-9_]+$/.test(p1)) {
            return '"' + p1 + '"';
          }
          return match;
        });
        
        fallbackText = fallbackText.replace(/:\s*([^"'][^,}\]]*?)(?=\s*[},]|$)/g, function(match, p1) {
          // Only quote values that aren't already quoted and look like strings
          if (p1 && !/^\s*$/.test(p1) && !/^\d+(\.\d+)?$/.test(p1) && p1 !== 'true' && p1 !== 'false' && p1 !== 'null') {
            return ': "' + p1.trim() + '"';
          }
          return match;
        });
        
        fallbackText = fallbackText.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        
        // Additional validation
        if (fallbackText.length < 10) {
          throw new Error('Fallback text too short to be valid JSON');
        }
        
        console.log("Cleaned JSON text:", fallbackText);
        const parsed = JSON.parse(fallbackText);
        console.log("Successfully parsed with fallback:", parsed);
        return parsed;
      } else {
        throw new Error('No valid JSON object found in fallback parsing');
      }
    } catch (fallbackError) {
      console.error("Fallback parsing also failed:", fallbackError);
      // Return a basic structure if all parsing fails
      return {
        hotels: [],
        itinerary: []
      };
    }
  }
}

// Function to validate and normalize trip data structure
export function validateTripData(tripData, realHotels = []) {
  // Ensure tripData has the expected structure
  if (!tripData || typeof tripData !== 'object') {
    tripData = {
      hotels: [],
      itinerary: []
    };
  }
  
  // Ensure hotels array exists
  if (!Array.isArray(tripData.hotels)) {
    tripData.hotels = [];
  }
  
  // Ensure itinerary array exists
  if (!Array.isArray(tripData.itinerary)) {
    tripData.itinerary = [];
  }
  
  // Validate hotel structure
  tripData.hotels = tripData.hotels.map(hotel => ({
    hotelName: hotel.hotelName || '',
    hotelAddress: hotel.hotelAddress || '',
    price: hotel.price || '',
    hotelImageUrl: hotel.hotelImageUrl || '',
    geoCoordinates: {
      lat: hotel.geoCoordinates?.lat || 0,
      lng: hotel.geoCoordinates?.lng || 0
    },
    rating: hotel.rating || 0,
    description: hotel.description || ''
  }));
  
  // Validate itinerary structure - handle multiple formats and ensure completeness
  let validatedItinerary = [];
  
  if (Array.isArray(tripData.itinerary)) {
    // Standard array format - array of days
    validatedItinerary = tripData.itinerary.map((day, index) => ({
      day: day.day || `Day ${index + 1}`,
      date: day.date || `Day ${index + 1}`,
      plan: Array.isArray(day.plan) ? day.plan.map(activity => ({
        placeName: activity.placeName || '',
        placeDetails: activity.placeDetails || '',
        placeImageUrl: activity.placeImageUrl || '',
        geoCoordinates: {
          lat: activity.geoCoordinates?.lat || 0,
          lng: activity.geoCoordinates?.lng || 0
        },
        ticketPricing: activity.ticketPricing || '',
        rating: activity.rating || 0,
        timeToVisit: activity.timeToVisit || activity.bestTimeToVisit || '',
        timeTravel: activity.timeTravel || ''
      })) : []
    }));
  } else if (typeof tripData.itinerary === 'object' && tripData.itinerary !== null) {
    // Object format with day keys
    const dayKeys = Object.keys(tripData.itinerary);
    validatedItinerary = dayKeys.map((dayKey, index) => {
      const dayData = tripData.itinerary[dayKey];
      const dayObj = {
        day: dayData.day || dayKey || `Day ${index + 1}`,
        date: dayData.date || dayKey || `Day ${index + 1}`,
        plan: []
      };
      
      // Handle different plan structures
      if (Array.isArray(dayData.plan)) {
        dayObj.plan = dayData.plan.map(activity => {
          // If it's a time slot with activities array
          if (activity.activities && Array.isArray(activity.activities)) {
            return activity.activities.map(subActivity => ({
              placeName: subActivity.placeName || subActivity.name || '',
              placeDetails: subActivity.placeDetails || subActivity.details || '',
              placeImageUrl: subActivity.placeImageUrl || subActivity.image || '',
              geoCoordinates: {
                lat: subActivity.geoCoordinates?.lat || subActivity.lat || 0,
                lng: subActivity.geoCoordinates?.lng || subActivity.lng || 0
              },
              ticketPricing: subActivity.ticketPricing || subActivity.pricing || subActivity.price || '',
              rating: subActivity.rating || 0,
              timeToVisit: subActivity.timeToVisit || subActivity.bestTimeToVisit || subActivity.time || '',
              timeTravel: subActivity.timeTravel || subActivity.travelTime || ''
            }));
          }
          // Regular activity format
          return {
            placeName: activity.placeName || activity.name || '',
            placeDetails: activity.placeDetails || activity.details || '',
            placeImageUrl: activity.placeImageUrl || activity.image || '',
            geoCoordinates: {
              lat: activity.geoCoordinates?.lat || activity.lat || 0,
              lng: activity.geoCoordinates?.lng || activity.lng || 0
            },
            ticketPricing: activity.ticketPricing || activity.pricing || activity.price || '',
            rating: activity.rating || 0,
            timeToVisit: activity.timeToVisit || activity.bestTimeToVisit || activity.time || '',
            timeTravel: activity.timeTravel || activity.travelTime || ''
          };
        }).flat();
      }
      
      return dayObj;
    });
  }
  
  tripData.itinerary = validatedItinerary;
  
  // Combine AI hotels with real hotels, removing duplicates
  if (tripData.hotels.length > 0 && realHotels.length > 0) {
    const allHotels = [...realHotels, ...tripData.hotels];
    const uniqueHotels = allHotels.filter((hotel, index, self) => 
      index === self.findIndex(h => h.hotelName === hotel.hotelName)
    );
    tripData.hotels = uniqueHotels.slice(0, 10); // Limit to 10 hotels
  } else if (realHotels.length > 0) {
    // If no hotels from AI, use real hotels
    tripData.hotels = realHotels;
  }
  
  return tripData;
}