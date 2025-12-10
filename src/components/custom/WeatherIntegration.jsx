import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchTrips } from '@/hooks/useFetchTrips';
import { getLocationCoordinates } from '@/utils/geocodeHelper';

// Helper functions for travel tips
const getPackingSuggestions = (condition, temperature) => {
  let suggestions = [];
  
  if (temperature < 0) {
    suggestions.push("Pack warm winter clothing, thermal layers, and insulated boots");
  } else if (temperature < 10) {
    suggestions.push("Bring warm clothes, a jacket, and layers for comfort");
  } else if (temperature < 20) {
    suggestions.push("Pack light layers that can be added or removed as needed");
  } else if (temperature < 30) {
    suggestions.push("Bring light, breathable clothing and sun protection");
  } else {
    suggestions.push("Pack lightweight clothing, sun protection, and stay hydrated");
  }
  
  const normalizedCondition = condition.toLowerCase();
  if (normalizedCondition.includes('rain') || normalizedCondition.includes('shower')) {
    suggestions.push("Bring a waterproof jacket and umbrella");
  }
  
  if (normalizedCondition.includes('snow')) {
    suggestions.push("Pack waterproof boots and gloves");
  }
  
  return suggestions.join('. ') + '.';
};

const getActivityRecommendations = (condition) => {
  const normalizedCondition = condition.toLowerCase();
  
  if (normalizedCondition.includes('clear')) {
    return "Perfect weather for outdoor activities, sightseeing, and photography. Ideal for beach visits or hiking.";
  } else if (normalizedCondition.includes('cloud')) {
    return "Good for both indoor and outdoor activities. Consider museums, parks, or shopping centers.";
  } else if (normalizedCondition.includes('rain') || normalizedCondition.includes('shower')) {
    return "Focus on indoor activities like museums, galleries, or cafes. Indoor pools or spas are great options.";
  } else if (normalizedCondition.includes('snow')) {
    return "Enjoy winter sports like skiing or snowboarding. Hot springs and cozy indoor activities are also great.";
  } else {
    return "Plan flexible activities that can be moved indoors if needed. Check local attractions for options.";
  }
};

const getHealthAdvisory = (temperature, humidity) => {
  let advisory = [];
  
  if (temperature > 30) {
    advisory.push("Stay hydrated and seek shade during peak sun hours");
  } else if (temperature < 0) {
    advisory.push("Protect against frostbite and hypothermia with proper clothing");
  }
  
  // Only check humidity if it's available (not 'N/A')
  if (humidity !== 'N/A') {
    if (humidity > 80) {
      advisory.push("High humidity can cause dehydration faster - drink more water");
    } else if (humidity < 30) {
      advisory.push("Low humidity can dry out skin and throat - moisturize regularly");
    }
  }
  
  if (advisory.length === 0) {
    advisory.push("General good health - enjoy your trip!");
  }
  
  return advisory.join('. ') + '.';
};

// Process forecast data to get daily forecasts (legacy function for OpenWeatherMap - no longer used)
// const processForecastData = (forecastList) => {
//   const dailyForecasts = [];
//   const today = new Date();
//   
//   // Group forecasts by day
//   const forecastsByDay = {};
//   forecastList.forEach(item => {
//     const date = new Date(item.dt * 1000);
//     const dateStr = date.toISOString().split('T')[0];
//     
//     // Skip today's forecast
//     if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth()) {
//       return;
//     }
//     
//     if (!forecastsByDay[dateStr]) {
//       forecastsByDay[dateStr] = [];
//     }
//     forecastsByDay[dateStr].push(item);
//   });
//   
//   // Get one forecast per day (prefer midday)
//   Object.keys(forecastsByDay).forEach(date => {
//     if (dailyForecasts.length >= 5) return; // Limit to 5 days
//     
//     const forecasts = forecastsByDay[date];
//     let bestForecast = forecasts[0];
//     
//     // Find forecast closest to midday
//     const midday = 12;
//     let minDiff = Math.abs(new Date(bestForecast.dt * 1000).getHours() - midday);
//     
//     forecasts.forEach(forecast => {
//       const hour = new Date(forecast.dt * 1000).getHours();
//       const diff = Math.abs(hour - midday);
//       if (diff < minDiff) {
//         minDiff = diff;
//         bestForecast = forecast;
//       }
//     });
//     
//     const dateObj = new Date(bestForecast.dt * 1000);
//     dailyForecasts.push({
//       date: dateObj.toDateString(),
//       high: Math.round(bestForecast.main.temp_max),
//       low: Math.round(bestForecast.main.temp_min),
//       condition: bestForecast.weather[0].main,
//       description: bestForecast.weather[0].description,
//       humidity: bestForecast.main.humidity,
//       wind: Math.round(bestForecast.wind.speed * 3.6) // Convert m/s to km/h
//     });
//   });
//   
//   return dailyForecasts;
// };

// Process Open-Meteo forecast data
const processOpenMeteoForecastData = (dailyData) => {
  const forecasts = [];
  
  // Get the current date to skip today's forecast
  const today = new Date();
  
  // Process daily forecast data (skip today, get next 5 days)
  for (let i = 1; i < Math.min(dailyData.time.length, 6); i++) {
    const date = new Date(dailyData.time[i]);
    
    forecasts.push({
      date: date.toDateString(),
      high: Math.round(dailyData.temperature_2m_max[i]),
      low: Math.round(dailyData.temperature_2m_min[i]),
      condition: getWeatherConditionFromCode(dailyData.weather_code[i]),
      description: getWeatherDescriptionFromCode(dailyData.weather_code[i]),
      humidity: 'N/A', // Open-Meteo doesn't provide daily humidity in this API call
      wind: 'N/A' // Open-Meteo doesn't provide daily wind in this API call
    });
  }
  
  return forecasts;
};

const WeatherIntegration = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setIsLoading(false);
  }, []);
  
  // Fetch trips only for the current user
  const { allTrips } = useFetchTrips(user?._id || null);
  
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch weather data for a trip
  const fetchWeatherData = async (trip) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get coordinates for the location
      const locationName = trip.userSelection.location.label;
      let coordinates = null;
      
      try {
        coordinates = await getLocationCoordinates(locationName);
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
      
      if (!coordinates) {
        throw new Error(`Could not find coordinates for ${locationName}`);
      }
      
      // Call Open-Meteo API with coordinates (no API key required)
      // Fetch current weather and forecast data in one request
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,windspeed_10m&hourly=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch weather data from Open-Meteo: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process and format the data
      const processedWeatherData = {
        location: locationName,
        current: {
          temperature: Math.round(data.current.temperature_2m),
          condition: getWeatherConditionFromCode(data.current.weather_code),
          description: getWeatherDescriptionFromCode(data.current.weather_code),
          humidity: data.current.relative_humidity_2m,
          wind: Math.round(data.current.windspeed_10m),
          feelsLike: Math.round(data.current.apparent_temperature),
          pressure: Math.round(data.current.pressure_msl)
        },
        forecast: processOpenMeteoForecastData(data.daily)
      };
      
      setWeatherData(processedWeatherData);
      setSelectedTrip(trip);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data. Please try again.');
      console.error('Weather API error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to convert Open-Meteo weather codes to condition names
  const getWeatherConditionFromCode = (code) => {
    const weatherCodes = {
      0: 'Clear',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing Rime Fog',
      51: 'Light Drizzle',
      53: 'Moderate Drizzle',
      55: 'Dense Drizzle',
      56: 'Light Freezing Drizzle',
      57: 'Dense Freezing Drizzle',
      61: 'Slight Rain',
      63: 'Moderate Rain',
      65: 'Heavy Rain',
      66: 'Light Freezing Rain',
      67: 'Heavy Freezing Rain',
      71: 'Slight Snow Fall',
      73: 'Moderate Snow Fall',
      75: 'Heavy Snow Fall',
      77: 'Snow Grains',
      80: 'Slight Rain Showers',
      81: 'Moderate Rain Showers',
      82: 'Violent Rain Showers',
      85: 'Slight Snow Showers',
      86: 'Heavy Snow Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Slight Hail',
      99: 'Thunderstorm with Heavy Hail'
    };
    
    return weatherCodes[code] || 'Unknown';
  };
  
  // Helper function to convert Open-Meteo weather codes to descriptions
  const getWeatherDescriptionFromCode = (code) => {
    const weatherDescriptions = {
      0: 'Clear sky',
      1: 'Mainly clear sky',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy conditions',
      48: 'Fog with ice crystals',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Heavy drizzle',
      56: 'Light freezing drizzle',
      57: 'Heavy freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Light snowfall',
      73: 'Moderate snowfall',
      75: 'Heavy snowfall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    
    return weatherDescriptions[code] || 'Unknown weather conditions';
  };
  
  // Process Open-Meteo forecast data
  const processOpenMeteoForecastData = (dailyData) => {
    const forecasts = [];
    
    // Get the current date to skip today's forecast
    const today = new Date();
    
    // Process daily forecast data (skip today, get next 5 days)
    for (let i = 1; i < Math.min(dailyData.time.length, 6); i++) {
      const date = new Date(dailyData.time[i]);
      
      forecasts.push({
        date: date.toDateString(),
        high: Math.round(dailyData.temperature_2m_max[i]),
        low: Math.round(dailyData.temperature_2m_min[i]),
        condition: getWeatherConditionFromCode(dailyData.weather_code[i]),
        description: getWeatherDescriptionFromCode(dailyData.weather_code[i]),
        humidity: 'N/A', // Open-Meteo doesn't provide daily humidity in this API call
        wind: 'N/A' // Open-Meteo doesn't provide daily wind in this API call
      });
    }
    
    return forecasts;
  };

  // Get weather icon based on condition
  const getWeatherIcon = (condition) => {
    // Normalize condition for icon mapping
    const normalizedCondition = condition.toLowerCase();
    
    if (normalizedCondition.includes('clear')) {
      return '☀️';
    } else if (normalizedCondition.includes('cloud')) {
      return '☁️';
    } else if (normalizedCondition.includes('rain') || normalizedCondition.includes('shower')) {
      return '🌧️';
    } else if (normalizedCondition.includes('drizzle')) {
      return '🌦️';
    } else if (normalizedCondition.includes('thunder')) {
      return '⛈️';
    } else if (normalizedCondition.includes('snow') || normalizedCondition.includes('sleet')) {
      return '❄️';
    } else if (normalizedCondition.includes('fog') || normalizedCondition.includes('mist')) {
      return '🌫️';
    } else {
      return '🌤️';
    }
  };

  // Get background color based on temperature
  const getTempBackground = (temp) => {
    if (temp < 0) return 'from-blue-600 to-blue-800';
    if (temp < 10) return 'from-blue-400 to-blue-600';
    if (temp < 20) return 'from-green-400 to-green-600';
    if (temp < 30) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Trip Weather Forecast</h1>
          <p className="text-gray-600">Check weather conditions for your travel destinations</p>
        </div>

        {/* Trip Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Select a Trip</h2>
          
          {allTrips && allTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTrips.map((trip) => (
                <div 
                  key={trip._id}
                  onClick={() => fetchWeatherData(trip)}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-xl ${
                    selectedTrip?._id === trip._id 
                      ? 'ring-4 ring-blue-500 border-blue-500' 
                      : 'hover:-translate-y-1'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        {trip.userSelection.location.label}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {trip.userSelection.days} days
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Travel Dates:</span>
                        <span className="font-medium">Coming soon</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Travelers:</span>
                        <span className="font-medium">
                          {trip.userSelection.travelers === 1 ? 'Just Me' : 
                           trip.userSelection.travelers === 2 ? 'A Couple' : 
                           trip.userSelection.travelers <= 6 ? 'Family' : 'Friends'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trip-details/${trip._id}`);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                      >
                        View Trip Details
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-5xl mb-4">🌤️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No trips found</h3>
              <p className="text-gray-600 mb-6">Create some trips to check weather forecasts!</p>
              <button
                onClick={() => navigate('/create-trip')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Create New Trip
              </button>
            </div>
          )}
        </div>

        {/* Weather Display */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center mb-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Fetching weather data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg p-6 mb-12">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {weatherData && !loading && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
            {/* Current Weather */}
            <div className={`bg-gradient-to-r ${getTempBackground(weatherData.current.temperature)} p-8 text-black`}>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{weatherData.location}</h2>
                  <p className="text-xl opacity-90">Current Weather</p>
                </div>
                <div className="mt-6 md:mt-0 text-center">
                  <div className="text-6xl mb-2">{getWeatherIcon(weatherData.current.condition)}</div>
                  <div className="text-5xl font-bold">{weatherData.current.temperature}°C</div>
                  <div className="text-xl capitalize">{weatherData.current.description}</div>
                </div>
                <div className="mt-6 md:mt-0 grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                    <div className="text-sm opacity-80">Feels Like</div>
                    <div className="text-xl font-semibold">{weatherData.current.feelsLike}°C</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                    <div className="text-sm opacity-80">Humidity</div>
                    <div className="text-xl font-semibold">{weatherData.current.humidity}%</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                    <div className="text-sm opacity-80">Wind</div>
                    <div className="text-xl font-semibold">{weatherData.current.wind} km/h</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                    <div className="text-sm opacity-80">Pressure</div>
                    <div className="text-xl font-semibold">{weatherData.current.pressure} hPa</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">5-Day Forecast</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="font-semibold text-gray-800 mb-2">{day.date.split(' ')[0]}</div>
                    <div className="text-3xl my-2">{getWeatherIcon(day.condition)}</div>
                    <div className="text-gray-600 mb-1 capitalize">{day.description}</div>
                    <div className="flex justify-between mt-3">
                      <span className="text-red-500 font-semibold">{day.high}°</span>
                      <span className="text-blue-500 font-semibold">{day.low}°</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <div>Humidity: {day.humidity}%</div>
                      <div>Wind: {day.wind} km/h</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Tips */}
            <div className="bg-blue-50 p-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Travel Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="text-blue-600 font-semibold mb-2">Packing Suggestions</div>
                  <p className="text-gray-600 text-sm">
                    {getPackingSuggestions(weatherData.current.condition, weatherData.current.temperature)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="text-blue-600 font-semibold mb-2">Activity Recommendations</div>
                  <p className="text-gray-600 text-sm">
                    {getActivityRecommendations(weatherData.current.condition)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="text-blue-600 font-semibold mb-2">Health Advisory</div>
                  <p className="text-gray-600 text-sm">
                    {getHealthAdvisory(weatherData.current.temperature, weatherData.current.humidity)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        {!selectedTrip && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">🌦️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Select a Trip to View Weather</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Choose a trip from your history to see detailed weather forecasts for your destination. 
              Plan your activities and packing based on weather conditions.
            </p>
            <button
              onClick={() => navigate('/trip-history')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              View All Trips
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherIntegration;