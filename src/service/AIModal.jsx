import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchHotelsNearLocation } from './OpenStreetMapService';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Model configuration - using gemini-2.5-flash for better stability and speed
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};
export const chatSession = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [{ text: "Generate a detailed Travel Plan for Location: Las Vegas, for 3 Days for Couple with a Cheap budget.\n\nProvide a JSON response with the following structure:\n\n1. HOTELS SECTION - Give me a list of hotel options with:\n   - HotelName: Hotel name\n   - HotelAddress: Full address\n   - Price: Price per night in ₹ (Indian Rupees)\n   - HotelImageUrl: URL to hotel image (or leave empty if not available)\n   - GeoCoordinates: { \"lat\": latitude, \"lng\": longitude }\n   - Rating: Rating out of 5\n   - Description\n\n2. ITINERARY SECTION - Provide a detailed day-by-day plan with:\n   - For each day (Day 1, Day 2, etc.), include:\n     - Date: Date for the day\n     - Plan: Array of activities with:\n       - PlaceName: Place name\n       - PlaceDetails: Description of the place\n       - PlaceImageUrl: URL to place image (or leave empty if not available)\n       - GeoCoordinates: { \"lat\": latitude, \"lng\": longitude }\n       - TicketPricing: Entry fee or pricing info in ₹ (Indian Rupees)\n       - Rating: Rating out of 5\n       - TimeToVisit: Best time to visit this place\n       - TimeTravel: Estimated time to get there from previous location\n\nIMPORTANT INSTRUCTIONS:\n1. Use REAL, VALID geographic coordinates that exist on OpenStreetMap\n2. All pricing MUST be in Indian Rupees (₹)\n3. Provide EXACTLY 3 days of itinerary - NO MORE, NO LESS\n4. Include AT LEAST 4 activities per day\n5. Make sure the itinerary is logical and flows well geographically\n6. Respond ONLY with valid JSON - no extra text, no markdown code blocks\n7. NEVER return partial itineraries or placeholder messages like \"Hotel Recommendations Ready!\"\n8. ALWAYS generate a complete day-by-day itinerary with all required fields filled\n9. Each activity must have ALL fields filled (no empty values)\n10. Return ONLY the JSON object with hotels and itinerary sections and time date and everything." }],
    },
    {
      role: "model",
      parts: [{ text: "{\n  \"hotels\": [\n    {\n      \"hotelName\": \"The D Las Vegas\",\n      \"hotelAddress\": \"Fremont Street, Las Vegas, NV\",\n      \"price\": \"₹3,700 per night\",\n      \"hotelImageUrl\": \"https://www.thed.com/images/hero/main-hero-02.jpg\",\n      \"geoCoordinates\": {\n        \"lat\": 36.1699,\n        \"lng\": -115.1438\n      },\n      \"rating\": 4,\n      \"description\": \"A budget-friendly hotel located in downtown Las Vegas with easy access to attractions.\"\n    },\n    {\n      \"hotelName\": \"Golden Nugget Hotel & Casino\",\n      \"hotelAddress\": \"129 E Fremont St, Las Vegas, NV 89101\",\n      \"price\": \"₹5,200 per night\",\n      \"hotelImageUrl\": \"https://media.architecturaldigest.com/photos/5f9a9a9b8c8c8c8c8c8c8c8c/16:9/w_2560%2Cc_limit/GettyImages-123456789.jpg\",\n      \"geoCoordinates\": {\n        \"lat\": 36.1707,\n        \"lng\": -115.1443\n      },\n      \"rating\": 4.2,\n      \"description\": \"Luxurious accommodations with a rooftop pool and vibrant casino floor.\"\n    }\n  ],\n  \"itinerary\": [\n    {\n      \"day\": \"Day 1\",\n      \"date\": \"Day 1\",\n      \"plan\": [\n        {\n          \"placeName\": \"Fremont Street Experience\",\n          \"placeDetails\": \"Historic downtown Las Vegas street with canopy of lights and entertainment\",\n          \"placeImageUrl\": \"https://example.com/fremont-street.jpg\",\n          \"geoCoordinates\": {\n            \"lat\": 36.1699,\n            \"lng\": -115.1438\n          },\n          \"ticketPricing\": \"Free\",\n          \"rating\": 4.5,\n          \"timeToVisit\": \"Evening for light show\",\n          \"timeTravel\": \"Walk from hotel (5 minutes)\"\n        },\n        {\n          \"placeName\": \"Mob Museum\",\n          \"placeDetails\": \"National Museum of Organized Crime and Law Enforcement\",\n          \"placeImageUrl\": \"https://example.com/mob-museum.jpg\",\n          \"geoCoordinates\": {\n            \"lat\": 36.1731,\n            \"lng\": -115.1492\n          },\n          \"ticketPricing\": \"₹1,200\",\n          \"rating\": 4.3,\n          \"timeToVisit\": \"Morning to afternoon\",\n          \"timeTravel\": \"15 minutes from Fremont Street\"\n        },\n        {\n          \"placeName\": \"Container Park\",\n          \"placeDetails\": \"Shopping and dining complex built from shipping containers with unique atmosphere\",\n          \"placeImageUrl\": \"https://example.com/container-park.jpg\",\n          \"geoCoordinates\": {\n            \"lat\": 36.1719,\n            \"lng\": -115.1467\n          },\n          \"ticketPricing\": \"Free to enter, individual shops vary\",\n          \"rating\": 4.1,\n          \"timeToVisit\": \"Lunch time\",\n          \"timeTravel\": \"10 minutes from Mob Museum\"\n        },\n        {\n          \"placeName\": \"High Roller Observation Wheel\",\n          \"placeDetails\": \"550-foot tall observation wheel offering panoramic views of the Las Vegas Strip\",\n          \"placeImageUrl\": \"https://example.com/high-roller.jpg\",\n          \"geoCoordinates\": {\n            \"lat\": 36.1669,\n            \"lng\": -115.1678\n          },\n          \"ticketPricing\": \"₹2,200\",\n          \"rating\": 4.6,\n          \"timeToVisit\": \"Sunset for best views\",\n          \"timeTravel\": \"20 minutes from Container Park\"\n        }\n      ]\n    },\n    {\n      \"day\": \"Day 2\",\n      \"date\": \"Day 2\",\n      \"plan\": [\n        {\n          \"placeName\": \"Bellagio Fountains\",\n          \"placeDetails\": \"Iconic water show with music and lights choreographed to famous songs\",\n          \"placeImageUrl\": \"https://example.com/bellagio-fountains.jpg\",\n          \"geoCoordinates\": {\n            \"lat\": 36.1121,\n            \"lng\": -115.1736\n          },\n          \"ticketPricing\": \"Free\",\n          \"rating\": 4.7,\n          \"timeToVisit\": \"Evening shows at 3pm, 6pm, 9pm, midnight\",\n          \"timeTravel\": \"15 minutes drive from hotel\"\n        },\n        {\n          \"placeName\": \"The Strip Walk\",\n          \"placeDetails\": \"Leisurely stroll along Las Vegas Boulevard to see iconic hotels and casinos\",\n          \"placeImageUrl\": \"https://example.com/las-vegas-strip.jpg\",\n          \"geoCoordinates\": {\n            \"lat\": 36.1021,\n            \"lng\": -115.1696\n          },\n          \"ticketPricing\": \"Free\",\n          \"rating\": 4.4,\n          \"timeToVisit\": \"Morning\",\n          \"timeTravel\": \"Walk from Bellagio (10 minutes)\"\n        },\n        {\n          \"placeName\": \"Caesars Palace Colosseum\",\n          \"placeDetails\": \"Historic venue hosting major concerts and entertainment shows\",\n          \"placeImageUrl\": \"https://example.com/caesars-colosseum.jpg\",\n          \"geoCoordinates\": {\n            \"lat\": 36.1164,\n            \"lng\": -115.1745\n          },\n          \"ticketPricing\": \"₹3,500-15,000 depending on event\",\n          \"rating\": 4.5,\n          \"timeToVisit\": \"Check schedule for performances\",\n          \"timeTravel\": \"5 minutes walk from Strip\"\n        },\n        {\n          \"placeName\": \"Red Rock Canyon National Conservation Area\",\n          \"placeDetails\": \"Spectacular desert landscape with towering sandstone formations and hiking trails\",\n          \"placeImageUrl\": \"https://example.com/red-rock-canyon.jpg\",\n          \"geoCoordinates\": {\n            \"lat\": 36.1372,\n            \"lng\": -115.4309\n          },\n          \"ticketPricing\": \"₹1,500 per vehicle\",\n          \"rating\": 4.8,\n          \"timeToVisit\": \"Morning for cooler temperatures\",\n          \"timeTravel\": \"30 minutes drive from Strip\"\n        }\n      ]\n    },\n    {\n      \"day\": \"Day 3\",\n      \"date\": \"Day 3\",\n      \"plan\": [\n        {\n          \"placeName\": \"Hoover Dam\",\n          \"placeDetails\": \"Engineering marvel spanning the Colorado River with museum and dam tours\",\n          \"placeImageUrl\": \"https://example.com/hoover-dam.jpg\",\n          \"geoCoordinates\": {\n            \"lat\": 36.0854,\n            \"lng\": -114.6892\n          },\n          \"ticketPricing\": \"₹1,800 for general admission\",\n          \"rating\": 4.6,\n          \"timeToVisit\": \"Morning departure to avoid heat\",\n          \"timeTravel\": \"1 hour drive from hotel\"\n        },\n        {\n          \"placeName\": \"Boulder City Downtown\",\n          \"placeDetails\": \"Charming historic town with unique shops and local dining options\",\n          \"placeImageUrl\": \"https://example.com/boulder-city.jpg\",\n          \"geoCoordinates\": {\n            \"lat\": 35.9786,\n            \"lng\": -114.8327\n          },\n          \"ticketPricing\": \"Free to explore\",\n          \"rating\": 4.2,\n          \"timeToVisit\": \"Lunch time\",\n          \"timeTravel\": \"15 minutes from Hoover Dam\"\n        },\n        {\n          \"placeName\": \"Springs Preserve\",\n          \"placeDetails\": \"180-acre cultural institution showcasing sustainable living and desert botany\",\n          \"placeImageUrl\": \"https://example.com/springs-preserve.jpg\",\n          \"geoCoordinates\": {\n            \"lat\": 36.1666,\n            \"lng\": -115.1575\n          },\n          \"ticketPricing\": \"₹1,200\",\n          \"rating\": 4.3,\n          \"timeToVisit\": \"Afternoon\",\n          \"timeTravel\": \"45 minutes from Boulder City\"\n        },\n        {\n          \"placeName\": \"Fremont East Entertainment District\",\n          \"placeDetails\": \"Vibrant nightlife district with bars, clubs, and late-night dining\",\n          \"placeImageUrl\": \"https://example.com/fremont-east.jpg\",\n          \"geoCoordinates\": {\n            \"lat\": 36.1722,\n            \"lng\": -115.1385\n          },\n          \"ticketPricing\": \"Free to explore, individual venues vary\",\n          \"rating\": 4.0,\n          \"timeToVisit\": \"Evening\",\n          \"timeTravel\": \"20 minutes from Springs Preserve\"\n        }\n      ]\n    }\n  ]\n}" }],
    },
  ],
});

// Function to send a message and get a response
export async function sendMessage(userMessage) {
  try {
    console.log('Sending message to AI:', userMessage);
    console.log('Using chatSession:', chatSession);
    const result = await chatSession.sendMessage(userMessage);
    console.log('Raw AI result:', result);
    const response = await result.response;
    console.log('AI response:', response);
    return response;
  } catch (error) {
    console.error("Error sending message to AI:", error);
    
    // Log detailed error information
    if (error.response) {
      console.error('Error response details:', error.response);
    }
    
    if (error.message) {
      console.error('Error message:', error.message);
    }
    
    // Provide more specific error messages
    if (error.message && error.message.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Google Generative AI API key. Please check your API key configuration.');
    } else if (error.message && error.message.includes('400')) {
      throw new Error('Bad request to Google Generative AI API. Please check your request format.');
    } else if (error.message && error.message.includes('403')) {
      throw new Error('Access forbidden to Google Generative AI API. Please check your API key permissions.');
    } else if (error.message && error.message.includes('429')) {
      throw new Error('Rate limit exceeded for Google Generative AI API. Please try again later.');
    } else if (error.message && error.message.includes('500')) {
      throw new Error('Google Generative AI API server error. Please try again later.');
    }
    
    // Return a basic response structure if AI fails
    return {
      text: () => "{\n  \"hotels\": [],\n  \"itinerary\": []\n}"
    };
  }
}

// Enhanced function to generate travel plan with real hotel data and comprehensive details
export async function generateTravelPlanWithRealHotels(formData) {
  try {
    // Check if this is a multi-destination trip
    const isMultiDestination = formData.destinations && Array.isArray(formData.destinations) && formData.destinations.length > 1;
    
    // Map budget IDs to tier names
    const budgetTiers = {
      1: 'cheap',
      2: 'moderate',
      3: 'luxury'
    };
    
    const budgetTier = budgetTiers[formData.budget] || 'moderate';
    
    // Get real hotel data from OpenStreetMap with budget filtering
    // For multi-destination trips, we'll get hotels for the first destination as examples
    const locationLabel = isMultiDestination 
      ? formData.destinations.map(d => d.label).join(', ')
      : formData.location.label;
      
    const realHotels = await searchHotelsNearLocation(
      isMultiDestination ? formData.destinations[0].label : formData.location.label, 
      budgetTier
    );
    
    // Create a comprehensive prompt that encourages the AI to provide detailed information
    const prompt = isMultiDestination
      ? `Generate a comprehensive, detailed Multi-Destination Travel Plan for the following locations in sequence: ${locationLabel}, for ${formData.days} Days for ${getTravelerDescription(formData.travelers)} with a ${getBudgetDescription(formData.budget)} budget.
      
      Provide a detailed JSON response with the following structure:
      
      1. HOTELS SECTION - Give me a list of hotel options with:
         - HotelName: Hotel name
         - HotelAddress: Full address
         - Price: Price per night in ₹ (Indian Rupees)
         - HotelImageUrl: URL to hotel image (or leave empty if not available)
         - GeoCoordinates: { "lat": latitude, "lng": longitude }
         - Rating: Rating out of 5
         - Description: Brief description including amenities and location benefits
      
      2. ITINERARY SECTION - Provide a comprehensive day-by-day plan with:
         - For each day (Day 1, Day 2, etc.), include:
           - Date: Specific date for the day
           - Location: Current destination/city
           - Plan: Array of activities with extensive details:
             - PlaceName: Place name
             - PlaceDetails: Comprehensive description including history, significance, and visitor experience
             - PlaceImageUrl: URL to place image (or leave empty if not available)
             - GeoCoordinates: { "lat": latitude, "lng": longitude }
             - TicketPricing: Entry fee or pricing info in ₹ (Indian Rupees)
             - Rating: Rating out of 5
             - TimeToVisit: Best time to visit this place with seasonal considerations
             - TimeTravel: Estimated time to get there from previous location with transport options
             - BestTime: Optimal visiting hours (e.g., morning, afternoon, evening)
             - Duration: Recommended time to spend (e.g., 2-3 hours)
             - Category: Type of attraction (e.g., Museum, Landmark, Neighborhood)
             - Accessibility: Accessibility information for visitors with disabilities
             - Tips: Practical advice for visiting (booking, timing, what to bring)
             - NearestTransport: Closest public transport options
             - SeasonalConsiderations: Weather or seasonal factors affecting the visit
             - BookingInfo: Information about reservations or tickets
             - WhatToBring: Recommended items for the visit
      
      3. LOCAL INSIGHTS SECTION - Provide practical information for travelers:
         - Weather: Seasonal weather patterns and packing suggestions
         - Currency: Local currency and payment methods
         - Language: Languages spoken and useful phrases
         - Tipping: Tipping customs and expectations
         - Safety: Safety concerns and precautions
         - Transport: Public transport options and tips
         - Cuisine: Local specialties and dining customs
         - Customs: Cultural norms and etiquette
      
      4. EMERGENCY CONTACTS SECTION - Essential contact information:
         - Police: Emergency number
         - Ambulance: Medical emergency number
         - TouristHelpline: Tourist information hotline
      
      IMPORTANT INSTRUCTIONS:
      1. Use REAL, VALID geographic coordinates that exist on OpenStreetMap
      2. All pricing MUST be in Indian Rupees (₹)
      3. Provide EXACTLY ${formData.days} days of itinerary - NO MORE, NO LESS
      4. Include AT LEAST 2-3 UNIQUE, detailed activities per day with comprehensive information
      5. Make sure the itinerary flows logically geographically and temporally
      6. Ensure each activity has ALL fields filled with specific, actionable information
      7. Include practical tips and insider knowledge for each location
      8. Provide realistic timing and travel durations between activities
      9. Include accessibility information for inclusive travel planning
      10. Add seasonal considerations for optimal timing of activities
      11. For multi-destination trips:
          - Include transit days with detailed travel information between cities
          - Specify transportation modes, costs, and journey times
          - Include check-in and orientation activities for new destinations
          - Clearly indicate which destination is being visited on each day
          - Provide destination-specific local insights
          - Include practical information for each destination (weather, currency, etc.)
      12. Respond ONLY with valid JSON - no extra text, no markdown code blocks
      13. NEVER return partial itineraries or placeholder messages
      14. ALWAYS generate a complete day-by-day itinerary with all required fields filled
      15. Each activity must have ALL fields filled with specific, non-generic information
      16. Avoid generic activities like 'City Center Exploration' - provide specific, meaningful experiences
      17. Ensure activities are diverse and cover different aspects of each destination
      18. Include seasonal and weather considerations for optimal timing
      19. Add practical tips for each location (booking, timing, what to bring)
      20. Include accessibility information for inclusive travel planning
      
      Here are some real hotels in the first destination that you MUST incorporate into your recommendations:
      ${realHotels.map(hotel => 
        `- ${hotel.hotelName}: ${hotel.description} (Rating: ${hotel.rating}/5, Price: ${hotel.price})`
      ).join('\n')}
      
      Return ONLY the JSON object with hotels, itinerary, local insights, and emergency contacts sections.`
      : `Generate a comprehensive, detailed Travel Plan for Location: ${formData.location.label}, for ${formData.days} Days for ${getTravelerDescription(formData.travelers)} with a ${getBudgetDescription(formData.budget)} budget.

Provide a detailed JSON response with the following structure:

1. HOTELS SECTION - Give me a list of hotel options with:
   - HotelName: Hotel name
   - HotelAddress: Full address
   - Price: Price per night in ₹ (Indian Rupees)
   - HotelImageUrl: URL to hotel image (or leave empty if not available)
   - GeoCoordinates: { "lat": latitude, "lng": longitude }
   - Rating: Rating out of 5
   - Description: Brief description including amenities and location benefits

2. ITINERARY SECTION - Provide a comprehensive day-by-day plan with:
   - For each day (Day 1, Day 2, etc.), include:
     - Date: Specific date for the day
     - Plan: Array of activities with extensive details:
       - PlaceName: Place name
       - PlaceDetails: Comprehensive description including history, significance, and visitor experience
       - PlaceImageUrl: URL to place image (or leave empty if not available)
       - GeoCoordinates: { "lat": latitude, "lng": longitude }
       - TicketPricing: Entry fee or pricing info in ₹ (Indian Rupees)
       - Rating: Rating out of 5
       - TimeToVisit: Best time to visit this place with seasonal considerations
       - TimeTravel: Estimated time to get there from previous location with transport options
       - BestTime: Optimal visiting hours (e.g., morning, afternoon, evening)
       - Duration: Recommended time to spend (e.g., 2-3 hours)
       - Category: Type of attraction (e.g., Museum, Landmark, Neighborhood)
       - Accessibility: Accessibility information for visitors with disabilities
       - Tips: Practical advice for visiting (booking, timing, what to bring)
       - NearestTransport: Closest public transport options
       - SeasonalConsiderations: Weather or seasonal factors affecting the visit
       - BookingInfo: Information about reservations or tickets
       - WhatToBring: Recommended items for the visit

3. LOCAL INSIGHTS SECTION - Provide practical information for travelers:
   - Weather: Seasonal weather patterns and packing suggestions
   - Currency: Local currency and payment methods
   - Language: Languages spoken and useful phrases
   - Tipping: Tipping customs and expectations
   - Safety: Safety concerns and precautions
   - Transport: Public transport options and tips
   - Cuisine: Local specialties and dining customs
   - Customs: Cultural norms and etiquette

4. EMERGENCY CONTACTS SECTION - Essential contact information:
   - Police: Emergency number
   - Ambulance: Medical emergency number
   - TouristHelpline: Tourist information hotline

IMPORTANT INSTRUCTIONS:
1. Use REAL, VALID geographic coordinates that exist on OpenStreetMap
2. All pricing MUST be in Indian Rupees (₹)
3. Provide EXACTLY ${formData.days} days of itinerary - NO MORE, NO LESS
4. Include AT LEAST 3-4 UNIQUE, detailed activities per day with comprehensive information
5. Make sure the itinerary flows logically geographically and temporally
6. Ensure each activity has ALL fields filled with specific, actionable information
7. Include practical tips and insider knowledge for each location
8. Provide realistic timing and travel durations between activities
9. Include accessibility information for inclusive travel planning
10. Add seasonal considerations for optimal timing of activities
11. Respond ONLY with valid JSON - no extra text, no markdown code blocks
12. NEVER return partial itineraries or placeholder messages
13. ALWAYS generate a complete day-by-day itinerary with all required fields filled
14. Each activity must have ALL fields filled with specific, non-generic information
15. Avoid generic activities like 'City Center Exploration' - provide specific, meaningful experiences
16. Ensure activities are diverse and cover different aspects of the destination
17. Include seasonal and weather considerations for optimal timing
18. Add practical tips for each location (booking, timing, what to bring)
19. Include accessibility information for inclusive travel planning
20. Include emergency contact information
21. Provide local insights
22. Ensure all activities have image URLs where possible
23. Include detailed descriptions for all hotels and activities

Here are some real hotels in this location that you MUST incorporate into your recommendations:
${realHotels.map(hotel => 
  `- ${hotel.hotelName}: ${hotel.description} (Rating: ${hotel.rating}/5, Price: ${hotel.price})`
).join('\n')}

Return ONLY the JSON object with hotels, itinerary, local insights, and emergency contacts sections.`;    
    let response;
    try {
      const result = await chatSession.sendMessage(prompt);
      response = await result.response;
    } catch (sendError) {
      console.error("Error sending message to AI:", sendError);
      // If sending fails, create a basic structure
      const tripData = {
        hotels: realHotels,
        itinerary: []
      };
      return tripData;
    }
    
    // Try to parse the AI response
    let tripData;
    try {
      // Clean up the response text to make it valid JSON
      let responseText = response.text();
      console.log("Raw AI response:", responseText);
      
      // Handle completely empty responses
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Empty AI response');
      }
      
      // Remove any markdown code block indicators
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Try to find JSON content between curly braces
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        responseText = responseText.substring(jsonStart, jsonEnd + 1);
      } else {
        // No JSON object found in response
        throw new Error('No valid JSON object found in response');
      }
      
      // More robust JSON cleaning
      // Remove newlines and extra spaces
      responseText = responseText.replace(/[\r\n]/g, ' ').replace(/\s+/g, ' ');
      
      // Fix common JSON issues
      // Replace single quotes with double quotes for property names
      responseText = responseText.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
      
      // Fix unquoted string values (more conservative approach)
      responseText = responseText.replace(/:\s*([^"'\{\}\[\]\d][^,\}\]]*?)(?=\s*[},]|$)/g, function(match, p1) {
        // Only quote values that aren't already quoted and look like strings
        if (p1 && !/^\s*$/.test(p1)) {
          return ': "' + p1.trim() + '"';
        }
        return match;
      });
      
      // Remove trailing commas
      responseText = responseText.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
      
      // Handle escaped quotes
      responseText = responseText.replace(/\\'/g, "'").replace(/\\"/g, '"');
      
      // Final cleanup - remove any remaining control characters
      responseText = responseText.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      
      // Additional validation to ensure we have valid JSON structure
      if (responseText.length < 10) {
        throw new Error('Response too short to be valid JSON');
      }
      
      tripData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing AI response as JSON:", parseError);
      console.error("Response text that failed to parse:", response.text());
      
      // Try a more aggressive fallback parsing
      try {
        let fallbackText = response.text();
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
          tripData = JSON.parse(fallbackText);
        } else {
          throw new Error('No valid JSON object found in fallback parsing');
        }
      } catch (fallbackError) {
        console.error("Fallback parsing also failed:", fallbackError);
        
        // If all parsing fails, create a basic structure with real hotels data
        tripData = {
          hotels: realHotels && Array.isArray(realHotels) ? realHotels : [],
          itinerary: []
        };
      }
    }
    
    // Validate and merge real hotel data with AI-generated data
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
    
    // Ensure we have the correct number of days
    if (validatedItinerary.length === 0 || validatedItinerary.length !== parseInt(formData.days)) {
      // If we don't have a complete itinerary, use our fallback
      console.log(`Incomplete itinerary: expected ${formData.days} days, got ${validatedItinerary.length} days. Using fallback.`);
      validatedItinerary = createBasicItinerary(formData.days, realHotels);
    } else {
      // Even if we have the right number of days, check if any day is missing activities
      let hasCompleteItinerary = true;
      for (let i = 0; i < validatedItinerary.length; i++) {
        if (!validatedItinerary[i].plan || validatedItinerary[i].plan.length < 3) {
          console.log(`Day ${i + 1} has insufficient activities (${validatedItinerary[i].plan?.length || 0}), using fallback.`);
          hasCompleteItinerary = false;
          break;
        }
      }
      
      if (!hasCompleteItinerary) {
        console.log("Itinerary has insufficient activities, using fallback.");
        validatedItinerary = createBasicItinerary(formData.days, realHotels);
      }
    }
    
    // Additional validation to ensure each day has activities
    validatedItinerary = validatedItinerary.map((day, index) => {
      // Ensure each day has a proper structure
      const validatedDay = {
        day: day.day || `Day ${index + 1}`,
        date: day.date || `Day ${index + 1}`,
        plan: Array.isArray(day.plan) ? day.plan : []
      };
      
      // If a day has no activities, add some basic ones
      if (validatedDay.plan.length === 0) {
        console.log(`Day ${index + 1} has no activities, adding basic ones`);
        validatedDay.plan = [
          {
            placeName: "City Center Exploration",
            placeDetails: "Explore the heart of the city and get familiar with local surroundings and culture",
            placeImageUrl: "",
            geoCoordinates: {
              lat: realHotels[0]?.geoCoordinates?.lat || 0,
              lng: realHotels[0]?.geoCoordinates?.lng || 0
            },
            ticketPricing: "Free",
            rating: 4,
            timeToVisit: "Morning",
            timeTravel: "30 minutes"
          },
          {
            placeName: "Local Attraction",
            placeDetails: "Visit a popular local attraction and immerse yourself in its culture and history",
            placeImageUrl: "",
            geoCoordinates: {
              lat: (realHotels[0]?.geoCoordinates?.lat || 0) + 0.001,
              lng: (realHotels[0]?.geoCoordinates?.lng || 0) + 0.001
            },
            ticketPricing: "₹200",
            rating: 4.2,
            timeToVisit: "Afternoon",
            timeTravel: "45 minutes"
          },
          {
            placeName: "Scenic Viewpoint",
            placeDetails: "Enjoy panoramic views of the city and surrounding areas and learn about its rich history and culture",
            placeImageUrl: "",
            geoCoordinates: {
              lat: (realHotels[0]?.geoCoordinates?.lat || 0) - 0.002,
              lng: (realHotels[0]?.geoCoordinates?.lng || 0) - 0.002
            },
            ticketPricing: "Free",
            rating: 4.5,
            timeToVisit: "Evening",
            timeTravel: "60 minutes"
          }
        ];
      }
      
      // Ensure each activity has all required fields
      validatedDay.plan = validatedDay.plan.map(activity => ({
        placeName: activity.placeName || "Unknown Place",
        placeDetails: activity.placeDetails || "No details available",
        placeImageUrl: activity.placeImageUrl || "",
        geoCoordinates: {
          lat: activity.geoCoordinates?.lat || 0,
          lng: activity.geoCoordinates?.lng || 0
        },
        ticketPricing: activity.ticketPricing || "Price not available",
        rating: activity.rating || 0,
        timeToVisit: activity.timeToVisit || "Any time",
        timeTravel: activity.timeTravel || "Travel time not specified"
      }));
      
      // Ensure we have at least 3 activities per day
      while (validatedDay.plan.length < 3) {
        validatedDay.plan.push({
          placeName: "Additional Local Attraction",
          placeDetails: "Discover and tell in detailed about more of what the city has to offer with this hidden gem recommended by locals. This place is perfect for those looking to experience the true essence of the city's culture and heritage. It offers a unique perspective and authentic experience that you won't find in other popular attractions. Whether it's a scenic walk, a cultural experience, or a local delicacy, this place is sure to leave a lasting impression.",
          placeImageUrl: "",
          geoCoordinates: {
            lat: (realHotels[0]?.geoCoordinates?.lat || 0) + (validatedDay.plan.length * 0.001),
            lng: (realHotels[0]?.geoCoordinates?.lng || 0) + (validatedDay.plan.length * 0.001)
          },
          ticketPricing: "₹100",
          rating: 4,
          timeToVisit: "Any time",
          timeTravel: "30 minutes"
        });
      }
      
      return validatedDay;
    });
    
    tripData.itinerary = validatedItinerary;
    
    if (tripData.hotels.length > 0) {
      // Combine AI hotels with real hotels, removing duplicates
      const allHotels = [...realHotels, ...tripData.hotels];
      const uniqueHotels = allHotels.filter((hotel, index, self) => 
        index === self.findIndex(h => h.hotelName === hotel.hotelName)
      );
      tripData.hotels = uniqueHotels.slice(0, 10); // Limit to 10 hotels
    } else {
      // If no hotels from AI, use real hotels
      tripData.hotels = realHotels;
    }
    
    // Ensure we have an itinerary - if empty, create a basic one
    if (!tripData.itinerary || tripData.itinerary.length === 0) {
      console.log("AI failed to generate itinerary, creating basic one");
      tripData.itinerary = createBasicItinerary(formData.days, realHotels);
    }
    
    console.log("Final validated trip data:", tripData);
    return tripData;
  } catch (error) {
    console.error("Error generating travel plan with real hotels:", error);
    throw error;
  }
}

// Helper functions for prompt generation
function getTravelerDescription(travelers) {
  switch (travelers) {
    case 1: return "Solo traveler";
    case 2: return "Couple";
    case 3: return "Family";
    default: return "Group of friends";
  }
}

function getBudgetDescription(budget) {
  switch (budget) {
    case 1: return "Cheap";
    case 2: return "Moderate";
    case 3: return "Luxury";
    default: return "Moderate";
  }
}

// Function to create a basic itinerary when AI fails
function createBasicItinerary(days, hotels) {
  const itinerary = [];
  
  // Validate inputs
  const numDays = parseInt(days) || 3; // Default to 3 days if invalid
  const validHotels = Array.isArray(hotels) && hotels.length > 0 ? hotels : [{
    hotelName: "Default Hotel",
    geoCoordinates: { lat: 0, lng: 0 },
    price: "₹5,000 per night",
    rating: 4,
    description: "A comfortable place to stay"
  }];
  
  // Generic categories of attractions and activities
  const attractionCategories = [
    {
      name: "Historical Landmarks",
      details: "Explore significant historical sites and monuments that shaped the region's culture and heritage.",
      pricing: "₹100-500",
      timeToVisit: "Morning (9:00 AM - 12:00 PM)",
      rating: 4.5
    },
    {
      name: "Museums & Galleries",
      details: "Discover art, history, and cultural artifacts through curated exhibitions and interactive displays.",
      pricing: "₹150-400",
      timeToVisit: "Late Morning (10:00 AM - 2:00 PM)",
      rating: 4.3
    },
    {
      name: "Religious Sites",
      details: "Visit places of worship and spiritual significance to experience local religious traditions.",
      pricing: "Free donation suggested",
      timeToVisit: "Early Morning (6:00 AM - 10:00 AM)",
      rating: 4.6
    },
    {
      name: "Parks & Gardens",
      details: "Enjoy nature and green spaces with scenic walks, picnics, and outdoor recreational activities.",
      pricing: "Free-₹200",
      timeToVisit: "Early Morning or Late Afternoon (6:00 AM - 9:00 AM or 4:00 PM - 7:00 PM)",
      rating: 4.2
    },
    {
      name: "Markets & Shopping",
      details: "Experience local commerce, crafts, and cuisine at bustling markets and shopping districts.",
      pricing: "Varies by purchase",
      timeToVisit: "Late Morning or Afternoon (10:00 AM - 8:00 PM)",
      rating: 4.1
    },
    {
      name: "Architecture & Monuments",
      details: "Admire notable buildings, bridges, and architectural marvels representing various eras and styles.",
      pricing: "Free-₹300",
      timeToVisit: "Morning or Early Afternoon (9:00 AM - 3:00 PM)",
      rating: 4.4
    },
    {
      name: "Cultural Centers",
      details: "Engage with local arts, performances, and cultural events that showcase regional traditions.",
      pricing: "₹200-600",
      timeToVisit: "Afternoon or Evening (2:00 PM - 9:00 PM)",
      rating: 4.3
    },
    {
      name: "Scenic Viewpoints",
      details: "Capture breathtaking panoramic views of the cityscape, coastline, or natural landscapes.",
      pricing: "Free-₹150",
      timeToVisit: "Sunrise, Sunset, or Late Afternoon (6:00 AM, 5:00 PM, or 4:00 PM)",
      rating: 4.5
    },
    {
      name: "Entertainment & Recreation",
      details: "Enjoy amusement parks, theaters, and recreational facilities for family fun and relaxation.",
      pricing: "₹300-1000",
      timeToVisit: "Afternoon or Evening (1:00 PM - 10:00 PM)",
      rating: 4.0
    },
    {
      name: "Educational Institutions",
      details: "Tour prestigious universities, research centers, and educational landmarks of historical importance.",
      pricing: "Free-₹200",
      timeToVisit: "Morning or Afternoon (9:00 AM - 4:00 PM)",
      rating: 4.1
    }
  ];
  
  // Dining experiences
  const diningExperiences = [
    {
      name: "Local Cuisine Restaurant",
      details: "Savor authentic regional dishes and traditional flavors at a well-regarded local establishment.",
      pricing: "₹800-2000 per person",
      timeToVisit: "Lunch or Dinner (12:30 PM - 2:30 PM or 7:00 PM - 10:00 PM)",
      rating: 4.4
    },
    {
      name: "Street Food Tour",
      details: "Experience the vibrant street food culture with popular local snacks and delicacies.",
      pricing: "₹300-600 per person",
      timeToVisit: "Evening (5:00 PM - 9:00 PM)",
      rating: 4.2
    },
    {
      name: "Fine Dining Experience",
      details: "Indulge in upscale culinary offerings with exceptional service and ambiance.",
      pricing: "₹2500-5000 per person",
      timeToVisit: "Dinner (7:30 PM - 11:00 PM)",
      rating: 4.6
    },
    {
      name: "Heritage Restaurant",
      details: "Dine in a historically significant setting with traditional decor and classic recipes.",
      pricing: "₹1500-3000 per person",
      timeToVisit: "Lunch or Dinner (1:00 PM - 3:00 PM or 7:00 PM - 10:00 PM)",
      rating: 4.3
    }
  ];
  
  // Unique local experiences
  const localExperiences = [
    {
      name: "Local Market Exploration",
      details: "Explore a bustling local market to experience the city's vibrant street life and shop for souvenirs.",
      pricing: "Varies by purchase",
      timeToVisit: "Morning (10:00 AM - 12:00 PM)",
      rating: 4.0
    },
    {
      name: "Park Visit and Relaxation",
      details: "Spend time in one of the city's beautiful parks to relax and observe local life.",
      pricing: "Free",
      timeToVisit: "Early Morning (6:00 AM - 8:00 AM)",
      rating: 4.1
    },
    {
      name: "Art Gallery Visit",
      details: "Visit a local art gallery to appreciate contemporary and traditional art.",
      pricing: "₹150",
      timeToVisit: "Afternoon (2:00 PM - 4:00 PM)",
      rating: 4.2
    },
    {
      name: "Guided Walking Tour",
      details: "Explore neighborhoods with a knowledgeable local guide sharing insights and stories.",
      pricing: "₹500-1500 per person",
      timeToVisit: "Morning (9:00 AM - 12:00 PM)",
      rating: 4.5
    },
    {
      name: "Cooking Class",
      details: "Learn to prepare traditional dishes with hands-on instruction from local chefs.",
      pricing: "₹1000-2500 per person",
      timeToVisit: "Late Morning or Afternoon (10:00 AM - 12:00 PM or 2:00 PM - 5:00 PM)",
      rating: 4.6
    },
    {
      name: "Local Workshop",
      details: "Participate in craft-making, art, or skill-building sessions with artisans.",
      pricing: "₹800-2000 per person",
      timeToVisit: "Afternoon (2:00 PM - 5:00 PM)",
      rating: 4.3
    },
    {
      name: "Photography Session",
      details: "Capture memorable moments at scenic spots with professional photography guidance.",
      pricing: "₹1500-3000 per person",
      timeToVisit: "Golden Hour (1 hour before sunset)",
      rating: 4.4
    }
  ];
  
  // Create a basic itinerary for each day
  for (let i = 1; i <= numDays; i++) {
    const dayPlan = {
      day: `Day ${i}`,
      date: `Day ${i}`,
      plan: []
    };
    
    // Shuffle categories to ensure variety
    const shuffledCategories = [...attractionCategories].sort(() => 0.5 - Math.random());
    const selectedCategories = shuffledCategories.slice(0, 3);
    
    // Add attractions to the day plan
    selectedCategories.forEach((category, index) => {
      const timeSlots = [
        "Morning (9:00 AM - 12:00 PM)",
        "Afternoon (1:00 PM - 4:00 PM)",
        "Evening (5:00 PM - 8:00 PM)"
      ];
      
      dayPlan.plan.push({
        placeName: category.name,
        placeDetails: category.details,
        placeImageUrl: "",
        geoCoordinates: {
          lat: validHotels[0].geoCoordinates.lat + (i * 0.001) + (index * 0.0005),
          lng: validHotels[0].geoCoordinates.lng + (i * 0.001) - (index * 0.0005)
        },
        ticketPricing: category.pricing,
        rating: category.rating,
        timeToVisit: timeSlots[index % 3],
        timeTravel: `${10 + (i + index) * 5} minutes by ${['walking', 'public transport', 'taxi'][index % 3]}`
      });
    });
    
    // Add a dining experience
    const dining = diningExperiences[(i - 1) % diningExperiences.length];
    dayPlan.plan.push({
      placeName: dining.name,
      placeDetails: dining.details,
      placeImageUrl: "",
      geoCoordinates: {
        lat: validHotels[0].geoCoordinates.lat - (i * 0.001),
        lng: validHotels[0].geoCoordinates.lng + (i * 0.001)
      },
      ticketPricing: dining.pricing,
      rating: dining.rating,
      timeToVisit: dining.timeToVisit,
      timeTravel: `${15 + i * 5} minutes by ${['taxi', 'public transport', 'walking'][i % 3]}`
    });
    
    // Add a unique local experience
    const experience = localExperiences[(i - 1) % localExperiences.length];
    dayPlan.plan.push({
      placeName: experience.name,
      placeDetails: experience.details,
      placeImageUrl: "",
      geoCoordinates: {
        lat: validHotels[0].geoCoordinates.lat + (i * 0.002),
        lng: validHotels[0].geoCoordinates.lng - (i * 0.002)
      },
      ticketPricing: experience.pricing,
      rating: experience.rating,
      timeToVisit: experience.timeToVisit,
      timeTravel: `${20 + i * 3} minutes by ${['taxi', 'walking', 'public transport'][i % 3]}`
    });
    
    itinerary.push(dayPlan);
  }
  
  return itinerary;
}

// Streaming function similar to the pattern you showed
export async function sendMessageStream(userMessage) {
  try {
    console.log('Sending message to AI (streaming):', userMessage);
    
    // Get the model directly for streaming
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      }
    });
    
    const result = await model.generateContentStream(userMessage);
    return result.stream;
  } catch (error) {
    console.error("Error sending message to AI (streaming):", error);
    
    // Log detailed error information
    if (error.response) {
      console.error('Error response details:', error.response);
    }
    
    if (error.message) {
      console.error('Error message:', error.message);
    }
    
    // Provide more specific error messages
    if (error.message && error.message.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Google Generative AI API key. Please check your API key configuration.');
    } else if (error.message && error.message.includes('400')) {
      throw new Error('Bad request to Google Generative AI API. Please check your request format.');
    } else if (error.message && error.message.includes('403')) {
      throw new Error('Access forbidden to Google Generative AI API. Please check your API key permissions.');
    } else if (error.message && error.message.includes('429')) {
      throw new Error('Rate limit exceeded for Google Generative AI API. Please try again later.');
    } else if (error.message && error.message.includes('500')) {
      throw new Error('Google Generative AI API server error. Please try again later.');
    }
    
    throw error;
  }
}
