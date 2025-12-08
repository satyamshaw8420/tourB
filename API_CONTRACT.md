# TravelEase API Contract

This document defines the API contract for the enhanced trip data structure used in the TravelEase application.

## Trip Data Structure

```json
{
  "hotels": [
    {
      "hotelName": "string",
      "hotelAddress": "string",
      "price": "string (e.g., '₹7,800 per night')",
      "hotelImageUrl": "string (URL or empty)",
      "geoCoordinates": {
        "lat": "number",
        "lng": "number"
      },
      "rating": "number (0-5)",
      "description": "string"
    }
  ],
  "itinerary": [
    {
      "day": "string (e.g., 'Day 1')",
      "date": "string (e.g., 'Day 1' or specific date)",
      "location": "string (for multi-destination trips)",
      "plan": [
        {
          "placeName": "string",
          "placeDetails": "string (comprehensive description)",
          "placeImageUrl": "string (URL or empty)",
          "geoCoordinates": {
            "lat": "number",
            "lng": "number"
          },
          "ticketPricing": "string (in ₹)",
          "rating": "number (0-5)",
          "timeToVisit": "string (best time to visit)",
          "timeTravel": "string (estimated travel time)",
          "bestTime": "string (optimal visiting hours)",
          "duration": "string (recommended time to spend)",
          "category": "string (type of attraction)",
          "accessibility": "string (accessibility information)",
          "tips": "string (practical advice)",
          "nearestTransport": "string (closest public transport)",
          "seasonalConsiderations": "string (weather/seasonal factors)",
          "bookingInfo": "string (reservation information)",
          "whatToBring": "string (recommended items)"
        }
      ]
    }
  ],
  "localInsights": {
    "weather": "string (seasonal weather patterns)",
    "currency": "string (local currency and payment methods)",
    "language": "string (languages and useful phrases)",
    "tipping": "string (tipping customs)",
    "safety": "string (safety concerns and precautions)",
    "transport": "string (public transport options)",
    "cuisine": "string (local specialties)",
    "customs": "string (cultural norms)"
  },
  "emergencyContacts": {
    "police": "string (emergency number)",
    "ambulance": "string (medical emergency number)",
    "touristHelpline": "string (tourist information hotline)"
  }
}
```

## Form Data Structure

### Single Destination Trip
```json
{
  "location": {
    "label": "string (destination name)"
  },
  "travelers": "number (1-4)",
  "days": "string (number of days)",
  "budget": "number (1-3 for cheap, moderate, luxury)"
}
```

### Multi-Destination Trip
```json
{
  "destinations": [
    {
      "label": "string (destination name)"
    }
  ],
  "travelers": "number (1-4)",
  "days": "string (number of days)",
  "budget": "number (1-3 for cheap, moderate, luxury)"
}
```

## Service Functions

### validateAndEnhanceTripData(tripData, formData)
- **Purpose**: Validates and enhances trip data with comprehensive details
- **Parameters**:
  - `tripData`: Raw trip data from AI
  - `formData`: Original form data from user input
- **Returns**: Enhanced trip data with all required fields populated

### generateComprehensiveFallbackItinerary(days, isMultiDestination, destinations)
- **Purpose**: Generates a comprehensive fallback itinerary when AI fails
- **Parameters**:
  - `days`: Number of days for the trip
  - `isMultiDestination`: Boolean indicating if it's a multi-destination trip
  - `destinations`: Array of destination names (for multi-destination trips)
- **Returns**: Structured itinerary with detailed activities

### generateTravelPlanWithRealHotels(formData)
- **Purpose**: Generates a complete travel plan using AI with real hotel data
- **Parameters**:
  - `formData`: User input form data
- **Returns**: Complete trip data structure with hotels, itinerary, local insights, and emergency contacts

## Error Handling

The system implements comprehensive error handling with the following fallback mechanisms:

1. **AI Response Parsing Failures**:
   - Multiple parsing attempts with different strategies
   - Fallback to basic itinerary generation
   - Use of real hotel data when AI fails

2. **External Service Failures**:
   - Fallback hotel data when OpenStreetMap is unavailable
   - Placeholder images when Unsplash is unavailable
   - Graceful degradation of features

3. **Data Validation Failures**:
   - Default value assignment for missing fields
   - Coordinate validation and correction
   - Price range validation based on budget tiers

## Validation Rules

### Hotels
- All fields must be present
- Coordinates must be valid numbers
- Price must be in Indian Rupees format
- Rating must be between 0 and 5

### Itinerary
- Exactly the number of days specified by user
- At least 3-4 activities per day
- All activity fields must be populated
- Coordinates must be valid numbers
- All times and prices must be in appropriate formats

### Local Insights
- All insight categories must be present
- Information should be destination-specific when possible

### Emergency Contacts
- All contact types must be present
- Contact information should be destination-specific when possible