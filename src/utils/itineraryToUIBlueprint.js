// Function to convert AI-generated JSON itinerary into a structured UI blueprint
export function convertItineraryToUIBlueprint(itineraryJson, userSelection = {}) {
  try {
    // Validate input
    if (!itineraryJson || typeof itineraryJson !== 'object') {
      throw new Error('Invalid itinerary JSON provided');
    }

    // Extract required data sections
    const hotels = itineraryJson.hotels || [];
    const itinerary = itineraryJson.itinerary || [];
    const localInsights = itineraryJson.localInsights || {};
    const emergencyContacts = itineraryJson.emergencyContacts || {};

    // Create UI blueprint structure
    const uiBlueprint = {
      sidebar: {
        appLogo: "travel-icon",
        title: "Trip Overview",
        destinations: [],
        tripDuration: "",
        travelers: "",
        budget: "",
        dayStepper: []
      },
      hotelStrip: [],
      dailyItinerary: {
        header: {
          title: "Daily Itinerary",
          subtitle: "",
          date: "",
          weatherChip: ""
        },
        activities: []
      },
      rightPanel: {
        localInsights: {},
        emergencyContacts: {}
      },
      styling: {
        background: "vertical gradient (#001E3C → #008A8A → #A8F3DA)",
        glassmorphism: {
          backdropBlur: "40px",
          overlay: "rgba(255,255,255,0.15)",
          shadows: "soft deep shadows"
        },
        borderRadius: "24px",
        accentColor: "#00F0FF",
        layout: "CSS-grid style with three zones"
      }
    };

    // Populate sidebar
    if (itinerary.length > 0) {
      // Handle multi-destination trips
      const destinations = new Set();
      
      // Collect unique destinations from itinerary
      itinerary.forEach(day => {
        if (day.location) {
          destinations.add(day.location);
        }
      });
      
      // If no locations found in itinerary, use user selection or hotel data
      if (destinations.size === 0) {
        if (userSelection.location && userSelection.location.label) {
          // Handle both single and multi-destination formats
          if (typeof userSelection.location.label === 'string') {
            destinations.add(userSelection.location.label);
          } else if (Array.isArray(userSelection.location.label)) {
            userSelection.location.label.forEach(loc => destinations.add(loc));
          }
        } else if (hotels.length > 0 && hotels[0].hotelAddress) {
          // Extract city from first hotel address
          const addressParts = hotels[0].hotelAddress.split(',');
          if (addressParts.length >= 2) {
            const city = addressParts[addressParts.length - 2].trim();
            destinations.add(city);
          }
        }
      }
      
      // Convert destinations to array with numbering
      uiBlueprint.sidebar.destinations = Array.from(destinations).map((dest, index) => 
        `Destination ${index + 1}: ${dest}`
      );
      
      // If still no destinations, use a fallback
      if (uiBlueprint.sidebar.destinations.length === 0) {
        uiBlueprint.sidebar.destinations = ["Destination 1: Not specified"];
      }
      
      uiBlueprint.sidebar.tripDuration = `${itinerary.length} days`;
      
      // Extract travelers and budget from user selection
      uiBlueprint.sidebar.travelers = userSelection.travelers ? 
        `Travelers: ${userSelection.travelers}` : "Travelers: Not specified";
        
      uiBlueprint.sidebar.budget = userSelection.budget ? 
        `Budget: ${getBudgetLabel(userSelection.budget)}` : "Budget: Not specified";
      
      // Day stepper
      uiBlueprint.sidebar.dayStepper = itinerary.map(day => {
        // Get a short title from the first activity of the day
        let shortTitle = "Activities";
        if (day.plan && day.plan.length > 0 && day.plan[0].placeName) {
          shortTitle = day.plan[0].placeName;
          // Truncate if too long
          if (shortTitle.length > 20) {
            shortTitle = shortTitle.substring(0, 17) + "...";
          }
        }
        return `${day.day} · ${shortTitle}`;
      });
    }

    // Populate hotel strip
    uiBlueprint.hotelStrip = hotels.map(hotel => ({
      hotelName: hotel.hotelName || "",
      pricePerNight: hotel.price || "",
      rating: hotel.rating || 0,
      hotelAddress: hotel.hotelAddress || "",
      keyAmenities: hotel.description || "",
      hotelImageUrl: hotel.hotelImageUrl || "",
      viewOnMapIndicator: "View on map"
    }));

    // For daily itinerary, we'll use the first day as default
    // In a real implementation, this would be dynamic based on selected day
    if (itinerary.length > 0) {
      const firstDay = itinerary[0];
      
      // Populate daily itinerary header
      const location = firstDay.location || 
        (uiBlueprint.sidebar.destinations.length > 0 ? 
          uiBlueprint.sidebar.destinations[0].replace("Destination 1: ", "") : 
          "Location not specified");
          
      uiBlueprint.dailyItinerary.header.subtitle = `${firstDay.day} · ${location}`;
      uiBlueprint.dailyItinerary.header.date = firstDay.date || "";
      uiBlueprint.dailyItinerary.header.weatherChip = localInsights.weather ? 
        localInsights.weather.split('.')[0] : ""; // First sentence of weather info

      // Populate activities
      if (Array.isArray(firstDay.plan)) {
        uiBlueprint.dailyItinerary.activities = firstDay.plan.map(activity => ({
          topRow: {
            placeName: activity.placeName || "",
            category: activity.category || "Attraction",
            placeDetails: activity.placeDetails || "",
            placeImageUrl: activity.placeImageUrl || ""
          },
          middleGrid: {
            bestTime: activity.bestTime || activity.timeToVisit || "",
            duration: activity.duration || "",
            ticketPricing: activity.ticketPricing || "",
            rating: activity.rating || 0,
            accessibility: activity.accessibility || "",
            nearestTransport: activity.nearestTransport || ""
          },
          bottomRow: {
            travelFromPrevious: `Travel from previous location: ${activity.timeTravel || ""}`,
            tips: activity.tips ? `Tips: ${activity.tips}` : "Tips: Not available"
          },
          bottomTags: {
            seasonalConsiderations: activity.seasonalConsiderations || "",
            whatToBring: activity.whatToBring || ""
          }
        }));
      }
    }

    // Populate right panel - local insights
    uiBlueprint.rightPanel.localInsights = {
      weather: {
        title: "Weather",
        content: localInsights.weather || ""
      },
      transport: {
        title: "Transport",
        content: localInsights.transport || ""
      },
      cuisine: {
        title: "Cuisine",
        content: localInsights.cuisine || ""
      },
      customs: {
        title: "Customs",
        content: localInsights.customs || ""
      },
      language: {
        title: "Language",
        content: localInsights.language || ""
      }
    };

    // Populate right panel - emergency contacts
    uiBlueprint.rightPanel.emergencyContacts = {
      police: emergencyContacts.police || "",
      ambulance: emergencyContacts.ambulance || "",
      touristHelpline: emergencyContacts.touristHelpline || ""
    };

    return uiBlueprint;
  } catch (error) {
    console.error("Error converting itinerary to UI blueprint:", error);
    // Return a minimal valid structure on error
    return {
      sidebar: {
        appLogo: "travel-icon",
        title: "Trip Overview",
        destinations: ["Destination 1: Not available"],
        tripDuration: "0 days",
        travelers: "Not specified",
        budget: "Not specified",
        dayStepper: []
      },
      hotelStrip: [],
      dailyItinerary: {
        header: {
          title: "Daily Itinerary",
          subtitle: "Day 1 · Location not available",
          date: "",
          weatherChip: ""
        },
        activities: []
      },
      rightPanel: {
        localInsights: {},
        emergencyContacts: {}
      },
      styling: {
        background: "vertical gradient (#001E3C → #008A8A → #A8F3DA)",
        glassmorphism: {
          backdropBlur: "40px",
          overlay: "rgba(255,255,255,0.15)",
          shadows: "soft deep shadows"
        },
        borderRadius: "24px",
        accentColor: "#00F0FF",
        layout: "CSS-grid style with three zones"
      }
    };
  }
}

// Helper function to convert budget ID to label
function getBudgetLabel(budget) {
  switch(budget) {
    case 1: return "Cheap";
    case 2: return "Moderate";
    case 3: return "Luxury";
    default: return "Not specified";
  }
}