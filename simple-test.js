// Simple test for JSON parsing
const fs = require('fs');

// Simulate a problematic AI response
const aiResponse = "```json\n{\n  \"hotels\": [\n    {\n      \"hotelName\": \"Test Hotel\",\n      \"hotelAddress\": \"123 Test St\",\n      \"price\": \"$100/night\",\n      \"hotelImageUrl\": \"https://example.com/hotel.jpg\",\n      \"geoCoordinates\": {\n        \"lat\": 40.7128,\n        \"lng\": -74.0060\n      },\n      \"rating\": 4.5,\n      \"description\": \"A wonderful test hotel\"\n    }\n  ],\n  \"itinerary\": []\n}\n```";

console.log("Original AI response:");
console.log(aiResponse);

// Apply our cleaning logic
let cleaned = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
console.log("\nAfter removing markdown:");
console.log(cleaned);

const jsonStart = cleaned.indexOf('{');
const jsonEnd = cleaned.lastIndexOf('}');
if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
}

console.log("\nAfter extracting JSON:");
console.log(cleaned);

// Remove newlines and extra spaces
cleaned = cleaned.replace(/[\r\n]/g, ' ').replace(/\s+/g, ' ');
console.log("\nAfter removing newlines:");
console.log(cleaned);

// Try to parse
try {
  const parsed = JSON.parse(cleaned);
  console.log("\n✅ Successfully parsed!");
  console.log(JSON.stringify(parsed, null, 2));
} catch (error) {
  console.log("\n❌ Parsing failed:", error.message);
}