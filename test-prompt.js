// Test the enhanced prompt for generating a travel plan
const testPrompt = `Generate Travel Plan for:

Location: Las Vegas

Trip Duration: 3 Days

Travelers: Couple

Budget: Cheap

Return the response STRICTLY in CLEAN JSON FORMAT ONLY.  

No text outside JSON. No explanations.

Your response must follow EXACTLY this schema (DO NOT change any field names):

{
  "hotels": [
    {
      "hotelName": "",
      "hotelAddress": "",
      "price": "",
      "hotelImageUrl": "",
      "geoCoordinates": {
        "lat": 0,
        "lng": 0
      },
      "rating": 0,
      "description": ""
    }
  ],
  "itinerary": [
    {
      "day": "Day 1",
      "date": "",
      "plan": [
        {
          "placeName": "",
          "placeDetails": "",
          "placeImageUrl": "",
          "geoCoordinates": {
            "lat": 0,
            "lng": 0
          },
          "ticketPricing": "",
          "rating": 0,
          "timeToVisit": "",
          "timeTravel": ""
        }
      ]
    }
  ]
}

REQUIREMENTS (Enhancements without changing schema):

1. **Hotels Section**
   - Provide multiple hotel options.
   - Include cheap-budget friendly hotels first.
   - Use real hotel details if available.
   - Fill every field properly.

2. **Itinerary Section**
   - Provide a detailed 3-day plan.
   - Each day must include:
     • 4–6 attractions  
     • realistic travel timing  
     • best-time-to-visit  
     • real ticket pricing  
   - Use correct lat/lng values for real places.
   - Describe every place in a short, clear, accurate way.

3. **No missing fields**
   Every key in the schema must be filled.

4. **No external text**
   Output must be ONLY the JSON object.`;

console.log(testPrompt);