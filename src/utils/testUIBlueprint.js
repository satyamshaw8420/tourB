import { convertItineraryToUIBlueprint } from './itineraryToUIBlueprint';

// Sample itinerary JSON (same as in sample-detailed-itinerary.json)
const sampleItinerary = {
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
    },
    {
      "hotelName": "The Bryant Park Hotel",
      "hotelAddress": "11 W 40th St, New York, NY 10018",
      "price": "₹12,000 per night",
      "hotelImageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "geoCoordinates": {
        "lat": 40.7541,
        "lng": -73.9829
      },
      "rating": 4.5,
      "description": "Upscale hotel featuring contemporary rooms, a rooftop bar with city views, and a prime location near Bryant Park."
    }
  ],
  "itinerary": [
    {
      "day": "Day 1",
      "date": "June 15, 2023",
      "plan": [
        {
          "placeName": "Central Park",
          "placeDetails": "An expansive urban park in Manhattan that offers a respite from the city's hustle and bustle. Highlights include Bethesda Fountain, Bow Bridge, and the Central Park Zoo. The park spans 843 acres and features walking paths, lakes, and numerous recreational facilities.",
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
          "accessibility": "Most pathways are wheelchair accessible, with accessible restrooms available throughout the park.",
          "tips": "Rent a bike or take a horse-drawn carriage ride for a unique experience. Bring comfortable walking shoes.",
          "nearestTransport": "5th Avenue-Bryant Park Station (B,D,F,M,R,W,S trains)",
          "seasonalConsiderations": "Peak bloom season for flowers is late April to early May. Fall foliage is spectacular from October to November.",
          "bookingInfo": "No booking required for general admission",
          "whatToBring": "Water bottle, sunscreen, comfortable walking shoes, camera"
        },
        {
          "placeName": "The Metropolitan Museum of Art",
          "placeDetails": "One of the world's largest and finest art museums, housing over 2 million works of art spanning 5,000 years. Notable collections include Egyptian temples, European paintings, and ancient musical instruments. The museum's rooftop garden offers stunning views of Central Park.",
          "placeImageUrl": "https://images.unsplash.com/photo-1579455384125-9f3bf56f403d?auto=format&fit=crop&w=800&q=80",
          "geoCoordinates": {
            "lat": 40.7794,
            "lng": -73.9632
          },
          "ticketPricing": "₹500 for adults",
          "rating": 4.7,
          "timeToVisit": "Afternoon (1:00 PM - 5:00 PM)",
          "timeTravel": "15 minutes walk from Central Park",
          "bestTime": "Afternoon",
          "duration": "4 hours",
          "category": "Museum",
          "accessibility": "Fully wheelchair accessible with elevators, ramps, and accessible restrooms. Wheelchairs available for loan.",
          "tips": "Purchase tickets online to skip the queue. The museum is vast, so plan your visit to focus on specific wings.",
          "nearestTransport": "86th Street Station (4,5,6 trains)",
          "seasonalConsiderations": "Special exhibitions change seasonally. Summer months are busier, while winter months offer a more relaxed experience.",
          "bookingInfo": "Advance booking recommended, especially for special exhibitions",
          "whatToBring": "Comfortable walking shoes, notebook for jotting down favorites, portable charger"
        },
        {
          "placeName": "Times Square",
          "placeDetails": "The bustling commercial intersection known as 'The Crossroads of the World.' Famous for its bright billboards, Broadway theaters, and energetic atmosphere. The area comes alive at night with neon lights and street performers.",
          "placeImageUrl": "https://images.unsplash.com/photo-1579455384125-9f3bf56f403d?auto=format&fit=crop&w=800&q=80",
          "geoCoordinates": {
            "lat": 40.7580,
            "lng": -73.9855
          },
          "ticketPricing": "Free to explore",
          "rating": 4.3,
          "timeToVisit": "Evening (6:00 PM - 9:00 PM)",
          "timeTravel": "20 minutes subway ride from The Met",
          "bestTime": "Evening",
          "duration": "2 hours",
          "category": "Entertainment District",
          "accessibility": "Well-paved sidewalks and crosswalks. Most Broadway theaters are wheelchair accessible.",
          "tips": "Visit early evening to see the area transition from day to night. Avoid peak lunch hours when it's most crowded.",
          "nearestTransport": "Times Square-42nd Street Station (1,2,3,7,N,Q,R,W,S trains)",
          "seasonalConsiderations": "New Year's Eve ball drop is a major attraction but requires tickets. Summer months can be extremely hot and crowded.",
          "bookingInfo": "No booking required for general exploration",
          "whatToBring": "Camera, comfortable walking shoes, cash for street vendors"
        }
      ]
    },
    {
      "day": "Day 2",
      "date": "June 16, 2023",
      "plan": [
        {
          "placeName": "Statue of Liberty & Ellis Island",
          "placeDetails": "Symbol of freedom and democracy, this iconic statue was a gift from France in 1886. Visitors can climb to the crown for panoramic views or explore the museum. Ellis Island features the Immigration Museum chronicling America's immigration history.",
          "placeImageUrl": "https://images.unsplash.com/photo-1579455384125-9f3bf56f403d?auto=format&fit=crop&w=800&q=80",
          "geoCoordinates": {
            "lat": 40.6892,
            "lng": -74.0445
          },
          "ticketPricing": "₹1,200 for ferry + pedestal access, ₹2,000 for crown access",
          "rating": 4.8,
          "timeToVisit": "Morning (8:30 AM - 12:00 PM)",
          "timeTravel": "30 minutes subway ride from Times Square",
          "bestTime": "Morning",
          "duration": "4 hours",
          "category": "Landmark/Historical Site",
          "accessibility": "Ferry is wheelchair accessible. Pedestal access is available, but crown access involves climbing 162 steps with narrow staircases.",
          "tips": "Book tickets in advance, especially for crown access. Security screening is thorough and can take 30-45 minutes.",
          "nearestTransport": "South Ferry/Whitehall Terminal (1 train) or Liberty State Park (via NJ Transit)",
          "seasonalConsiderations": "Summer months are busiest with longest lines. Spring and fall offer pleasant weather with shorter waits.",
          "bookingInfo": "Advance booking mandatory through Statue Cruises website",
          "whatToBring": "ID for security screening, water bottle, hat for sun protection"
        },
        {
          "placeName": "9/11 Memorial & Museum",
          "placeDetails": "A moving tribute to the victims of the September 11, 2001 attacks. The memorial features two reflecting pools in the footprints of the Twin Towers, surrounded by bronze panels inscribed with victims' names. The museum houses artifacts, exhibits, and personal stories.",
          "placeImageUrl": "https://images.unsplash.com/photo-1579455384125-9f3bf56f403d?auto=format&fit=crop&w=800&q=80",
          "geoCoordinates": {
            "lat": 40.7115,
            "lng": -74.0134
          },
          "ticketPricing": "₹1,500 for museum entry",
          "rating": 4.9,
          "timeToVisit": "Afternoon (1:00 PM - 4:00 PM)",
          "timeTravel": "25 minutes subway ride from Battery Park",
          "bestTime": "Afternoon",
          "duration": "3 hours",
          "category": "Memorial/Museum",
          "accessibility": "Fully accessible with elevators, ramps, and accessible restrooms. Wheelchairs available for loan.",
          "tips": "Allow time for reflection. The museum is emotionally impactful and may require breaks.",
          "nearestTransport": "World Trade Center Station (E train) or Cortlandt Street Station (R,W trains)",
          "seasonalConsiderations": "Indoor museum provides relief from summer heat and winter cold. Peak visitation during summer months.",
          "bookingInfo": "Advance booking recommended, especially during peak season",
          "whatToBring": "Tissues, comfortable walking shoes, respectful attire"
        },
        {
          "placeName": "Brooklyn Bridge",
          "placeDetails": "An architectural marvel connecting Manhattan and Brooklyn, completed in 1883. The pedestrian walkway offers stunning views of the Manhattan skyline and East River. The bridge is illuminated at night, creating a spectacular sight.",
          "placeImageUrl": "https://images.unsplash.com/photo-1579455384125-9f3bf56f403d?auto=format&fit=crop&w=800&q=80",
          "geoCoordinates": {
            "lat": 40.7061,
            "lng": -73.9969
          },
          "ticketPricing": "Free to walk across",
          "rating": 4.6,
          "timeToVisit": "Evening (5:00 PM - 7:00 PM)",
          "timeTravel": "15 minutes walk from 9/11 Memorial",
          "bestTime": "Evening",
          "duration": "2 hours",
          "category": "Landmark",
          "accessibility": "Pedestrian walkway is wheelchair accessible with gentle inclines. Elevator access available at both ends.",
          "tips": "Walk toward Brooklyn for the best views of Manhattan. The bridge is especially beautiful at sunset.",
          "nearestTransport": "Brooklyn Bridge-City Hall Station (4,5,6 trains) or High Street-Brooklyn Bridge Station (A,C,F,R trains)",
          "seasonalConsiderations": "Winter winds can be strong on the bridge. Summer evenings offer the best combination of pleasant weather and beautiful lighting.",
          "bookingInfo": "No booking required for general access",
          "whatToBring": "Camera, light jacket for evening breeze, comfortable walking shoes"
        }
      ]
    }
  ],
  "localInsights": {
    "weather": "Summer (June-August): Warm and humid with temperatures ranging from 21-29°C (70-85°F). Pack lightweight clothing, rain jacket for occasional thunderstorms. Winter (December-February): Cold with temperatures ranging from -1-4°C (30-40°F). Pack warm layers, waterproof boots. Spring/Fall: Mild and pleasant with temperatures ranging from 10-21°C (50-70°F). Ideal for sightseeing.",
    "currency": "US Dollar (USD). Credit cards widely accepted but carry some cash for small purchases, taxis, and tips. ATMs readily available throughout the city.",
    "language": "English is the primary language. Useful phrases: 'How much does this cost?' 'Where is the nearest subway station?' 'Can you recommend a good restaurant?' Spanish is commonly heard in many neighborhoods.",
    "tipping": "Standard practice: 18-20% at restaurants, $1-2 per bag for bellhops, $1-2 per drink at bars, 10-15% for taxi drivers. Tipping is expected and appreciated.",
    "safety": "Generally safe but be aware of pickpockets in tourist areas. Keep valuables secure and be cautious in poorly lit areas at night. Emergency number: 911.",
    "transport": "Subway is the fastest way to get around. Purchase a MetroCard for multiple rides. Taxis and rideshares readily available. Walking is excellent for short distances in Manhattan.",
    "cuisine": "Diverse culinary scene featuring pizza, bagels, pastrami sandwiches, and international cuisines. Must-try local foods: New York-style pizza, pastrami on rye, cronuts, egg creams. Food trucks offer affordable options.",
    "customs": "Stand on the right side of escalators. Queue orderly for everything. Tipping is mandatory. Greet with handshake or nod. Loud conversations on public transport are frowned upon."
  },
  "emergencyContacts": {
    "police": "911",
    "ambulance": "911",
    "touristHelpline": "1-800-NYC-HELP (1-800-692-4357)"
  }
};

// Test the conversion
console.log("Testing itinerary to UI blueprint conversion...");
const blueprint = convertItineraryToUIBlueprint(sampleItinerary);
console.log(JSON.stringify(blueprint, null, 2));