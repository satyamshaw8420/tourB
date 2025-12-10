import { convertItineraryToUIBlueprint } from './itineraryToUIBlueprint.js';

// Test Case 1: Sample itinerary from the provided JSON
const sampleItinerary1 = {
  "hotels": [
    {
      "hotelName": "The Plaza Hotel",
      "hotelAddress": "768 5th Avenue, New York, NY 10019",
      "price": "₹15,000 per night",
      "hotelImageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "geoCoordinates": {
        "lat": 40.7641,
        "lng": -73.9735
      },
      "rating": 4.7,
      "description": "Iconic luxury hotel located in the heart of Manhattan, offering elegant rooms with Central Park views and exceptional service."
    }
  ],
  "itinerary": [
    {
      "day": "Day 1",
      "date": "June 15, 2023",
      "location": "New York City",
      "plan": [
        {
          "placeName": "Central Park",
          "placeDetails": "An expansive urban park in Manhattan that offers a respite from the city's hustle and bustle.",
          "placeImageUrl": "https://images.unsplash.com/photo-1579455384125-9f3bf56f403d?auto=format&fit=crop&w=800&q=80",
          "geoCoordinates": {
            "lat": 40.7812,
            "lng": -73.9665
          },
          "ticketPricing": "Free admission",
          "rating": 4.8,
          "timeToVisit": "Morning (9:00 AM - 12:00 PM)",
          "timeTravel": "10 minutes walk from The Plaza Hotel",
          "bestTime": "Morning",
          "duration": "3 hours",
          "category": "Park/Nature",
          "accessibility": "Most pathways are wheelchair accessible.",
          "tips": "Rent a bike or take a horse-drawn carriage ride.",
          "nearestTransport": "5th Avenue-Bryant Park Station",
          "seasonalConsiderations": "Peak bloom season for flowers is late April to early May.",
          "whatToBring": "Water bottle, sunscreen, comfortable walking shoes"
        }
      ]
    }
  ],
  "localInsights": {
    "weather": "Summer (June-August): Warm and humid with temperatures ranging from 21-29°C.",
    "transport": "Subway is the fastest way to get around.",
    "cuisine": "Diverse culinary scene featuring pizza and bagels.",
    "customs": "Stand on the right side of escalators.",
    "language": "English is the primary language."
  },
  "emergencyContacts": {
    "police": "911",
    "ambulance": "911",
    "touristHelpline": "1-800-NYC-HELP"
  }
};

// Test Case 2: Multi-destination trip
const sampleItinerary2 = {
  "hotels": [
    {
      "hotelName": "Paris Hotel",
      "hotelAddress": "123 Champs-Élysées, Paris, France",
      "price": "₹20,000 per night",
      "hotelImageUrl": "https://example.com/paris-hotel.jpg",
      "geoCoordinates": {
        "lat": 48.8738,
        "lng": 2.3065
      },
      "rating": 4.8,
      "description": "Luxury hotel near the Arc de Triomphe."
    }
  ],
  "itinerary": [
    {
      "day": "Day 1",
      "date": "July 10, 2023",
      "location": "Paris, France",
      "plan": [
        {
          "placeName": "Eiffel Tower",
          "placeDetails": "Iconic iron lattice tower on the Champ de Mars.",
          "placeImageUrl": "https://example.com/eiffel-tower.jpg",
          "geoCoordinates": {
            "lat": 48.8584,
            "lng": 2.2945
          },
          "ticketPricing": "₹1,200",
          "rating": 4.7,
          "timeToVisit": "Evening for light show",
          "timeTravel": "15 minutes walk from hotel",
          "bestTime": "Evening",
          "duration": "2 hours",
          "category": "Landmark",
          "accessibility": "Elevators available.",
          "tips": "Book tickets in advance to skip queues.",
          "nearestTransport": "Bir-Hakeim Station",
          "seasonalConsiderations": "Summer crowds are heavy.",
          "whatToBring": "Camera, light jacket for evening"
        }
      ]
    },
    {
      "day": "Day 2",
      "date": "July 11, 2023",
      "location": "Versailles, France",
      "plan": [
        {
          "placeName": "Palace of Versailles",
          "placeDetails": "Opulent former royal residence with ornate rooms and gardens.",
          "placeImageUrl": "https://example.com/versailles.jpg",
          "geoCoordinates": {
            "lat": 48.8049,
            "lng": 2.1205
          },
          "ticketPricing": "₹1,800",
          "rating": 4.9,
          "timeToVisit": "Morning to avoid crowds",
          "timeTravel": "45 minutes by train from Paris",
          "bestTime": "Morning",
          "duration": "5 hours",
          "category": "Historical Site",
          "accessibility": "Limited accessibility due to historic nature.",
          "tips": "Bring comfortable walking shoes and plenty of water.",
          "nearestTransport": "Versailles Château Rive Gauche Station",
          "seasonalConsiderations": "Gardens are magnificent in spring and summer.",
          "whatToBring": "Comfortable walking shoes, water, hat"
        }
      ]
    }
  ],
  "localInsights": {
    "weather": "Summer in Paris is warm with occasional rain showers.",
    "transport": "Metro and RER trains connect central Paris with suburbs.",
    "cuisine": "French cuisine with emphasis on cheese, wine, and pastries.",
    "customs": "Greetings with cheek kisses are common.",
    "language": "French is the official language, though English is widely understood."
  },
  "emergencyContacts": {
    "police": "17",
    "ambulance": "15",
    "touristHelpline": "0800 123 456"
  }
};

// Test Case 3: User selection data
const userSelection1 = {
  "location": {
    "label": "New York City"
  },
  "travelers": 2,
  "days": 5,
  "budget": 2
};

const userSelection2 = {
  "location": {
    "label": ["Paris, France", "Versailles, France"]
  },
  "travelers": 2,
  "days": 7,
  "budget": 3
};

// Run tests
console.log("=== Test Case 1: Single Destination Itinerary ===");
const result1 = convertItineraryToUIBlueprint(sampleItinerary1, userSelection1);
console.log(JSON.stringify(result1, null, 2));

console.log("\n=== Test Case 2: Multi-Destination Itinerary ===");
const result2 = convertItineraryToUIBlueprint(sampleItinerary2, userSelection2);
console.log(JSON.stringify(result2, null, 2));

console.log("\n=== Test Case 3: Itinerary with Missing Data ===");
const result3 = convertItineraryToUIBlueprint({}, {});
console.log(JSON.stringify(result3, null, 2));

console.log("\nAll tests completed successfully!");