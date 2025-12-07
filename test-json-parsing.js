// Test script to validate JSON parsing logic
const testResponses = [
  // Test case 1: Valid JSON
  `{
  "hotels": [
    {
      "hotelName": "Test Hotel",
      "hotelAddress": "123 Test St",
      "price": "$100/night",
      "hotelImageUrl": "https://example.com/hotel.jpg",
      "geoCoordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      },
      "rating": 4.5,
      "description": "A wonderful test hotel"
    }
  ],
  "itinerary": [
    {
      "day": "Day 1",
      "date": "2023-06-01",
      "plan": [
        {
          "placeName": "Test Attraction",
          "placeDetails": "A beautiful test attraction",
          "placeImageUrl": "https://example.com/place.jpg",
          "geoCoordinates": {
            "lat": 40.7589,
            "lng": -73.9851
          },
          "ticketPricing": "$25",
          "rating": 4.2,
          "timeToVisit": "2 hours",
          "timeTravel": "30 mins"
        }
      ]
    }
  ]
}`,
  
  // Test case 2: JSON with markdown code blocks
  "```json\n{\n  \"hotels\": [\n    {\n      \"hotelName\": \"Markdown Hotel\",\n      \"hotelAddress\": \"456 Markdown Ave\",\n      \"price\": \"$150/night\",\n      \"hotelImageUrl\": \"https://example.com/markdown-hotel.jpg\",\n      \"geoCoordinates\": {\n        \"lat\": 34.0522,\n        \"lng\": -118.2437\n      },\n      \"rating\": 4.0,\n      \"description\": \"A hotel wrapped in markdown\"\n    }\n  ],\n  \"itinerary\": []\n}\n```",
  
  // Test case 3: Malformed JSON with missing quotes
  `{ hotels: [ { hotelName: "Malformed Hotel" } ], itinerary: [] }`,
  
  // Test case 4: JSON with trailing commas
  `{
  "hotels": [
    {
      "hotelName": "Trailing Comma Hotel",
      "hotelAddress": "789 Trailing St",
    }
  ],
  "itinerary": [],
}`,

  // Test case 5: Empty response
  "",

  // Test case 6: Plain text response
  "I can't generate a proper JSON response right now."
];

function testJsonParsing(responseText) {
  console.log("Testing response:", responseText.substring(0, 50) + "...");

  try {
    // Clean up the response text to make it valid JSON
    let cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Try to find JSON content between curly braces
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
    }
    
    // More robust JSON cleaning
    // Remove any text before the first brace and after the last brace
    cleanedText = cleanedText.replace(/^[^{]*{/, '{').replace(/}[^}]*$/, '}');
    
    // Fix common JSON issues
    // Replace single quotes with double quotes for property names
    cleanedText = cleanedText.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
    
    // Fix unquoted string values
    cleanedText = cleanedText.replace(/:\s*([^"'\{\}\[\]\d][^,\}\]]*?)(?=\s*[},]|$)/g, ': "$1"');
    
    // Remove trailing commas
    cleanedText = cleanedText.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    
    // Handle escaped quotes
    cleanedText = cleanedText.replace(/\\'/g, "'").replace(/\\"/g, '"');
    
    const parsed = JSON.parse(cleanedText);
    console.log("✅ Successfully parsed:", JSON.stringify(parsed, null, 2));
    return parsed;
  } catch (parseError) {
    console.log("❌ Parsing failed:", parseError.message);
    
    // Try fallback parsing
    try {
      let fallbackText = responseText;
      const firstBrace = fallbackText.indexOf('{');
      const lastBrace = fallbackText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        fallbackText = fallbackText.substring(firstBrace, lastBrace + 1);
        fallbackText = fallbackText.replace(/[\r\n]/g, ' ');
        fallbackText = fallbackText.replace(/\s+/g, ' ');
        fallbackText = fallbackText.replace(/([^\s"':,{}\[\]])\s*(?=:)/g, '"$1"');
        fallbackText = fallbackText.replace(/:\s*([^"'][^,}\]]*?)(?=\s*[},]|$)/g, ': "$1"');
        fallbackText = fallbackText.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        const parsed = JSON.parse(fallbackText);
        console.log("✅ Fallback parsing succeeded:", JSON.stringify(parsed, null, 2));
        return parsed;
      }
    } catch (fallbackError) {
      console.log("❌ Fallback parsing also failed:", fallbackError.message);
    }
    
    // Return basic structure if all parsing fails
    const basicStructure = {
      hotels: [],
      itinerary: []
    };
    console.log("🔄 Returning basic structure:", JSON.stringify(basicStructure, null, 2));
    return basicStructure;
  }
}

// Run tests
testResponses.forEach((response, index) => {
  console.log(`\n--- Test Case ${index + 1} ---`);
  testJsonParsing(response);
});