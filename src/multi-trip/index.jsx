import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input'
import { AI_PROMPT, SelectBudgetOptions, SelectTravelesList } from '@/constants/options'
import { Button } from '../components/ui/button'
import { toast } from 'sonner'
import { chatSession } from '@/service/AIModal'
import { FcGoogle } from 'react-icons/fc'
import axios from 'axios'
// Firebase imports
// Convex import
import { useSaveTrip } from '@/hooks/useConvexTrip';
// Image generation service
import { getDestinationImage } from '@/service/ImageGenerationService';
// Data cleanup utility
import { useAuth } from '@/hooks/useAuth'; // Import the new auth hook
// Import the enhanced AI service
import { generateTravelPlanWithRealHotels } from '../service/AIModal';
import { validateTripData } from '../service/EnhancedAIModal';
import MultiTripSkeleton from '@/components/custom/MultiTripSkeleton';

function MultiTrip() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Use the new auth hook
  const [formData, setFormData] = useState({
    destinations: [{ label: '' }], // Array of destinations instead of single location
    travelers: null,
    days: '',
    budget: null
  });
  
  // Convex mutation for saving trips
  const { saveTripToConvex: saveTrip } = useSaveTrip();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [destinationImages, setDestinationImages] = useState([]); // Array of images for destinations
  // Add missing state variables
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeDestinationIndex, setActiveDestinationIndex] = useState(-1); // Track which destination is being edited
  const [initialLoad, setInitialLoad] = useState(true); // Add initial load state

  // Listen for the custom event from Header to show Google Sign-In
  useEffect(() => {
    const handleOpenGoogleSignin = () => {
      // Check if user is already logged in
      const userData = localStorage.getItem('user');
      if (userData) {
        // User is already logged in, don't show login modal
        try {
          const parsedUser = JSON.parse(userData);
          // Update user state through the hook
        } catch (error) {
          console.error('Error parsing user data:', error);
          // If there's an error parsing user data, show login modal
          setShowLoginModal(true);
        }
      } else {
        // User is not logged in, redirect to sign-up page instead of showing modal
        navigate('/sign-up');
      }
    };

    window.addEventListener('open-google-signin', handleOpenGoogleSignin);

    // Also check if we came from homepage and should show login modal
    const authSource = localStorage.getItem('authSource');
    if (authSource === 'homepage') {
      const userData = localStorage.getItem('user');
      if (!userData) {
        // User is not logged in, redirect to sign-up page instead of showing modal
        navigate('/sign-up');
      }
    }

    return () => {
      window.removeEventListener('open-google-signin', handleOpenGoogleSignin);
    };
  }, [navigate]);

  // Function to get user profile after Google login
  const GetUserProfile = (tokenInfo) => {
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo?.access_token}`,
        Accept: 'Application/json'
      }
    })
      .then((resp) => {
        console.log("Full User Profile Response:", resp);
        console.log("User Data:", resp.data);
        
        // Format user data to match the expected structure
        const formattedUserData = {
          success: true,
          _id: resp.data.id || 'google-user',
          fullname: resp.data.name || 'Google User',
          username: resp.data.email?.split('@')[0] || 'google_user',
          email: resp.data.email || '',
          gender: 'not specified',
          profilepic: resp.data.picture || 'https://avatar.iran.liara.run/public/boy?username=google',
          message: "Successfully Logged In"
        };
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(formattedUserData));
        console.log("User data stored in localStorage:", formattedUserData);
        
        // Show success message
        toast.success("Welcome! You've been successfully signed in.");
        
        // Check if we should continue trip creation
        const continueCreation = localStorage.getItem('continueTripCreation');
        if (continueCreation === 'true') {
          // Continue with trip creation
          handleCreateTrip();
          // Clean up the flag
          localStorage.removeItem('continueTripCreation');
        } else {
          // Check where the user came from to determine redirect behavior
          const authSource = localStorage.getItem('authSource');
          if (authSource === 'homepage') {
            // If user came from homepage, redirect to homepage
            navigate('/');
          } else if (authSource === 'header') {
            // If user came from header, redirect to homepage
            navigate('/');
          } else {
            // If user came from trying to create a trip, stay on the create-trip page
            // Don't navigate anywhere, just close the modal and let them continue
            // The modal is already closed in the onSuccess handler
          }
          
          // Clean up the authSource
          localStorage.removeItem('authSource');
        }
      })
      .catch(error => {
        console.log("Error fetching user profile:", error);
        toast.error("Failed to fetch user profile. Please try again.");
      });
  };

  // Handle logout
  const handleLogout = () => {
    logout(); // Use the logout function from the hook
    toast.success("You have been logged out successfully. All user data cleared.");
    navigate('/');
  };

  // Debounce timer ref
  const debounceTimer = useRef(null)

  const fetchSuggestions = async (searchQuery, index) => {
    console.log('Fetching suggestions for:', searchQuery);
    if (!searchQuery.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    try {
      // Using Photon API (free and open-source, faster alternative to Nominatim)
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`,
        {
          headers: {
            'User-Agent': 'TravelEase/1.0 (educational project)',
            'Accept': 'application/json',
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        // Photon returns features array, we need to map it to our expected format
        const suggestions = data.features || []
        // Log the structure of the location data to console (similar to YouTube tutorial)
        console.log('Location suggestions:', {
          location: suggestions.map(item => ({
            label: item.properties.name,
            value: {
              description: item.properties.name,
              place_id: item.properties.osm_id,
              // ... other properties
            }
          }))
        })
        setSuggestions(suggestions)
        setShowSuggestions(true)
        setActiveDestinationIndex(index)
      } else {
        console.error('API request failed with status:', response.status);
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (name, value, index = null) => {
    // Add validation for days field - limit to 5 or less
    if (name === 'days') {
      const daysValue = parseInt(value);
      if (!isNaN(daysValue) && daysValue > 13) {
        console.log("Please enter Trip Days less than 13");
        // Prevent values greater than 5
        return;
      }
    }
    
    console.log('Updating form data:', name, value, index);
    if (name === 'destinations') {
      // For destinations, we update the specific destination in the array
      setFormData(prev => {
        const newDestinations = [...prev.destinations];
        newDestinations[index] = { label: value };
        return {
          ...prev,
          destinations: newDestinations
        };
      });
      
      // Clear destination image if input is empty
      if (!value.trim()) {
        setDestinationImages(prev => {
          const newImages = [...prev];
          newImages[index] = null;
          return newImages;
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleDestinationChange = (e, index) => {
    const value = e.target.value;
    handleInputChange('destinations', value, index);
      
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer
    debounceTimer.current = setTimeout(() => {
      if (value.trim()) {
        fetchSuggestions(value, index);
      } else {
        // Hide suggestions when input is empty
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce
  };

  const handleSuggestionClick = (suggestion, index) => {
    const locationLabel = suggestion.properties.name || '';
    handleInputChange('destinations', locationLabel, index);
    setShowSuggestions(false);
    setActiveDestinationIndex(-1);
    
    // Also update the location object with more details
    setFormData(prev => {
      const newDestinations = [...prev.destinations];
      newDestinations[index] = {
        label: locationLabel,
        value: {
          description: locationLabel,
          place_id: suggestion.properties.osm_id
        }
      };
      return {
        ...prev,
        destinations: newDestinations
      };
    });
    
    // Generate image for the selected destination
    generateDestinationImage(locationLabel, index);
  };

  // Function to generate image for a destination with content filtering
  const generateDestinationImage = async (destination, index) => {
    // Content filtering to prevent inappropriate content
    const inappropriateKeywords = [
      'adult', 'sex', 'porn', 'nude', 'xxx', 'explicit', 'nsfw', 
      'erotic', 'sexy', 'intimate', 'private', 'restricted', '18+',
      'mature', 'violence', 'weapon', 'drug', 'alcohol', 'gambling'
    ];
    
    const lowerDest = destination.toLowerCase();
    const isFiltered = inappropriateKeywords.some(keyword => lowerDest.includes(keyword));
    
    if (isFiltered) {
      console.log('Destination filtered due to inappropriate content');
      setDestinationImages(prev => {
        const newImages = [...prev];
        newImages[index] = null;
        return newImages;
      });
      return;
    }
    
    if (!destination) return;
    
    try {
      setLoading(true);
      console.log(`Generating image for destination: ${destination}`);
      
      // Try to get a real image from Unsplash API in real-time
      const imageUrl = await getDestinationImage(destination);
      
      if (imageUrl) {
        // Additional check for inappropriate content in URLs
        const lowerUrl = imageUrl.toLowerCase();
        const urlFiltered = inappropriateKeywords.some(keyword => lowerUrl.includes(keyword));
      
        if (urlFiltered) {
          console.log('Image URL filtered due to inappropriate content');
          setDestinationImages(prev => {
            const newImages = [...prev];
            newImages[index] = null;
            return newImages;
          });
        } else {
          setDestinationImages(prev => {
            const newImages = [...prev];
            newImages[index] = imageUrl;
            return newImages;
          });
          console.log(`Found image for ${destination}: ${imageUrl}`);
        }
      } else {
        // No image found from Unsplash, set to null instead of placeholder
        console.log(`No image found for ${destination}, setting to null`);
        setDestinationImages(prev => {
          const newImages = [...prev];
          newImages[index] = null;
          return newImages;
        });
      }
    } catch (error) {
      console.error('Error generating destination image from Unsplash:', error);
      // On error, set to null instead of placeholder
      setDestinationImages(prev => {
        const newImages = [...prev];
        newImages[index] = null;
        return newImages;
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new destination field
  const addDestination = () => {
    setFormData(prev => ({
      ...prev,
      destinations: [...prev.destinations, { label: '' }]
    }));
    setDestinationImages(prev => [...prev, null]);
  };

  // Function to remove a destination field
  const removeDestination = (index) => {
    if (formData.destinations.length <= 1) {
      toast.warning("You need at least one destination");
      return;
    }
    
    setFormData(prev => {
      const newDestinations = [...prev.destinations];
      newDestinations.splice(index, 1);
      return {
        ...prev,
        destinations: newDestinations
      };
    });
    
    setDestinationImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const onSubmit = async () => {
    console.log("Form submitted with data:", formData);
    
    // Validate form data with comprehensive error messages
    const hasValidDestination = formData.destinations.some(dest => dest.label.trim());
    if (!hasValidDestination) {
      toast.warning("📍 Please enter at least one destination to get started");
      return;
    }
    
    // Content filtering for inappropriate content
    const inappropriateKeywords = [
      'adult', 'sex', 'porn', 'nude', 'xxx', 'explicit', 'nsfw', 
      'erotic', 'sexy', 'intimate', 'private', 'restricted', '18+',
      'mature', 'violence', 'weapon', 'drug', 'alcohol', 'gambling'
    ];
    
    // Check each destination for inappropriate content
    for (const destination of formData.destinations) {
      const lowerDest = destination.label.toLowerCase();
      const isFiltered = inappropriateKeywords.some(keyword => lowerDest.includes(keyword));
      
      if (isFiltered) {
        toast.warning("📍 Please enter appropriate destinations");
        return;
      }
      
      // Additional validation for destination specificity
      if (destination.label.trim().length < 2) {
        toast.warning("📍 Please enter more specific destinations");
        return;
      }
    }
    
    if (!formData.travelers) {
      toast.warning("👥 Please select who's traveling with you");
      return;
    }
    
    if (!formData.days) {
      toast.warning("📅 Please enter number of days for your trip");
      return;
    }
    
    const daysNum = parseInt(formData.days);
    if (isNaN(daysNum) || daysNum <= 0) {
      toast.warning("📅 Please enter a valid number of days");
      return;
    }
    
    if (daysNum > 13) {
      toast.warning("📅 Please enter trip duration between 1-13 days");
      return;
    }
    
    if (!formData.budget) {
      toast.warning("💰 Please select your budget preference");
      return;
    }
    
    // Validate travelers selection
    const validTravelerOptions = [1, 2, 3, 4];
    if (!validTravelerOptions.includes(formData.travelers)) {
      toast.warning("👥 Please select a valid traveler option");
      return;
    }
    
    // Validate budget selection
    const validBudgetOptions = [1, 2, 3];
    if (!validBudgetOptions.includes(formData.budget)) {
      toast.warning("💰 Please select a valid budget option");
      return;
    }
    
    // Check if user is logged in
    if (!user) {
      // Set flag to continue trip creation after login
      localStorage.setItem('continueTripCreation', 'true');
      setShowLoginModal(true);
      return;
    }
    
    // Proceed with trip creation using the enhanced method
    OnCreateTrip();
  };

  const OnCreateTrip = async () => {
    console.log("Creating multi-destination trip with data:", formData);
    
    // Validate form data
    const hasValidDestination = formData.destinations.some(dest => dest.label.trim());
    if (!hasValidDestination) {
      toast.error("Please enter at least one destination");
      return;
    }
    
    // Additional validation for destination specificity
    for (const destination of formData.destinations) {
      if (destination.label.trim().length < 2) {
        toast.error("Please enter more specific destinations");
        return;
      }
    }
    
    if (!formData.days) {
      toast.error("Please enter the number of days");
      return;
    }
    
    if (!formData.travelers) {
      toast.error("Please select the number of travelers");
      return;
    }
    
    if (!formData.budget) {
      toast.error("Please select a budget option");
      return;
    }
    
    // Validate travelers selection
    const validTravelerOptions = [1, 2, 3, 4];
    if (!validTravelerOptions.includes(formData.travelers)) {
      toast.error("Please select a valid traveler option");
      return;
    }
    
    // Validate budget selection
    const validBudgetOptions = [1, 2, 3];
    if (!validBudgetOptions.includes(formData.budget)) {
      toast.error("Please select a valid budget option");
      return;
    }
    
    // Get user data from localStorage
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const userEmail = user?.email || 'unknown';
    const userId = user?._id || 'anonymous';
    
    try {
      setIsCreatingTrip(true);
      
      // Prepare form data for multi-destination support
      const multiDestFormData = {
        ...formData,
        location: { label: formData.destinations.map(d => d.label).join(' → ') } // Create a joined label for backward compatibility
      };
      
      // Generate trip plan with real hotels data
      const tripData = await generateTravelPlanWithRealHotels(multiDestFormData);
      console.log("AI generated trip data:", tripData);
      
      // Validate and enhance trip data before saving
      const enhancedTripData = validateTripData(tripData, multiDestFormData);
      
      // Save trip to database with proper parameters
      const tripId = await saveTrip(enhancedTripData, multiDestFormData, userEmail, userId);
      console.log("Trip saved with ID:", tripId);
      
      // Navigate to trip details page
      if (tripId) {
        navigate(`/view-trip/${tripId}`);
        toast.success("🎉 Multi-destination trip created successfully!");
      } else {
        throw new Error("Failed to save trip");
      }
    } catch (err) {
      console.error("Error in OnCreateTrip:", err);
      toast.error("❌ Failed to create trip. Please try again.");
    } finally {
      // Always stop the loading indicator
      setIsCreatingTrip(false);
    }
  };

  return (
    <>
      {initialLoad ? (
        <MultiTripSkeleton />
      ) : (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
          {/* Premium cinematic background with misty mountains */}
          <div className="absolute inset-0 z-0">
            {/* Blue-to-teal gradient base */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-700"></div>
            
            {/* Misty mountain silhouettes */}
            <div className="absolute bottom-0 left-0 right-0 h-2/3">
              {/* Mountain layers for depth */}
              <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black/30 to-transparent"></div>
              <div className="absolute bottom-10 left-10 w-64 h-40 bg-black/20 rounded-t-full transform rotate-12"></div>
              <div className="absolute bottom-5 right-20 w-80 h-52 bg-black/25 rounded-t-full transform -rotate-6"></div>
              <div className="absolute bottom-0 left-1/3 w-96 h-60 bg-black/20 rounded-t-full"></div>
              <div className="absolute bottom-16 left-2/3 w-72 h-44 bg-black/30 rounded-t-full transform rotate-3"></div>
            </div>
            
            {/* Soft blur overlay for dreamy effect */}
            <div className="absolute inset-0 backdrop-blur-sm"></div>
          </div>
          
          {/* Frosted glass panel */}
          <div className="relative z-10 w-full max-w-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-8">
            <div className="text-center mb-10">
              <h2 className="font-bold text-3xl text-white">🌍 Multi-Destination Trip Planner</h2>
              <p className="text-white/80 mt-2">
                ✨ Plan a journey across multiple cities with our AI-powered itinerary generator.
              </p>
            </div>

            {/* Destination Fields */}
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <span className="text-blue-300 text-xl mr-2">📍</span>
                <h2 className="text-lg font-medium text-white">Destinations (in order)</h2>
              </div>
              
              {formData.destinations.map((destination, index) => (
                <div key={index} className="mb-4 relative">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Input 
                        placeholder={`Destination ${index + 1} (e.g., Paris, France)`} 
                        value={destination.label}
                        onChange={(e) => handleDestinationChange(e, index)}
                        className="w-full py-4 px-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      {/* Clear button when there's text */}
                      {destination.label && (
                        <button 
                          onClick={() => {
                            handleInputChange('destinations', '', index);
                            setDestinationImages(prev => {
                              const newImages = [...prev];
                              newImages[index] = null;
                              return newImages;
                            });
                            setShowSuggestions(false);
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      {loading && activeDestinationIndex === index && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-300"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Remove button (except for the first destination) */}
                    {formData.destinations.length > 1 && (
                      <button
                        onClick={() => removeDestination(index)}
                        className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl border border-red-400/30 text-red-300 hover:text-red-200 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Destination Image Preview */}
                  {destinationImages[index] && (
                    <div className="mt-3 flex justify-center">
                      <div className="relative w-full max-w-md h-32 rounded-xl overflow-hidden shadow-lg border-2 border-white/30">
                        <img 
                          src={destinationImages[index]} 
                          alt={`Preview of ${destination.label}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Try to get a retry image before using placeholder
                            console.log('Image failed to load, attempting retry...');
                            getDestinationImage(`${destination.label} travel`)
                              .then(retryImageUrl => {
                                if (retryImageUrl) {
                                  e.target.src = retryImageUrl;
                                } else {
                                  // Only use placeholder as last resort
                                  e.target.src = `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(destination.label || 'Destination')}`;
                                }
                              })
                              .catch(() => {
                                // Only use placeholder as last resort
                                e.target.src = `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(destination.label || 'Destination')}`;
                              });
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <h3 className="text-white font-bold text-sm truncate">{destination.label}</h3>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Autocomplete dropdown */}
                  {showSuggestions && activeDestinationIndex === index && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto border border-gray-200">
                      {suggestions.map((suggestion, suggIndex) => (
                        <div
                          key={`${suggestion.properties.osm_id}-${suggIndex}`}
                          onClick={() => handleSuggestionClick(suggestion, index)}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-800">✈️ {suggestion.properties.name}</div>
                          <div className="text-sm text-gray-600">
                            📍 {suggestion.properties.country || suggestion.properties.state || ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showSuggestions && activeDestinationIndex === index && suggestions.length === 0 && destination.label?.length > 2 && !loading && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-xl shadow-lg z-50 p-2 border border-gray-200">
                      <div className="p-2 text-gray-600">❌ No locations found</div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Add Destination Button */}
              <button
                onClick={addDestination}
                className="w-full py-3 px-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white hover:bg-white/15 transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Another Destination
              </button>
            </div>

            {/* Traveler Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-white mb-3">👥 Number of Travelers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SelectTravelesList.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleInputChange('travelers', item.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      formData.travelers === item.id 
                        ? 'bg-white/20 border-2 border-blue-300 shadow-lg transform scale-105' 
                        : 'bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15'
                    }`}
                  >
                    <h2 className="text-lg font-semibold text-white">{item.icon} {item.title}</h2>
                    <h2 className="text-sm text-white/80">{item.desc}</h2>
                  </div>
                ))}
              </div>
            </div>

            {/* Days Input */}
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <span className="text-blue-300 text-xl mr-2">📅</span>
                <h2 className="text-lg font-medium text-white">Total Number of Days</h2>
              </div>
              <div className="flex items-center">
                <Input 
                  placeholder="e.g., 7" 
                  type="number"
                  min="1"
                  max="13"
                  value={formData.days}
                  onChange={(e) => handleInputChange('days', e.target.value)}
                  className="w-full py-4 px-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <p className="mt-2 text-sm text-white/70">
                ⏳ Maximum 13 days allowed for multi-destination trips
              </p>
            </div>

            {/* Budget Selection */}
            <div className="mb-10">
              <h2 className="text-lg font-medium text-white mb-3">💰 Budget</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SelectBudgetOptions.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleInputChange('budget', item.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      formData.budget === item.id 
                        ? 'bg-white/20 border-2 border-blue-300 shadow-lg transform scale-105' 
                        : 'bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15'
                    }`}
                  >
                    <h2 className="text-lg font-semibold text-white">{item.icon} {item.title}</h2>
                    <h2 className="text-sm text-white/80">{item.desc}</h2>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button 
                onClick={onSubmit}
                disabled={isCreatingTrip}
                className="py-4 px-8 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingTrip ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    🤖 Creating Multi-Destination Trip...
                  </div>
                ) : (
                  "Let's Build Your Multi-Destination Trip"
                )}
              </Button>
            </div>
          </div>

          {/* Login Modal */}
          {showLoginModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full mx-4 backdrop-blur-sm bg-white/90">
                <div className="text-center mb-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mt-4 text-gray-900">Sign in to Continue</h2>
                  <p className="text-gray-600 mt-2">
                    Sign in with Google to create and save your multi-destination trip plans
                  </p>
                </div>
                
                <button
                  onClick={() => navigate('/sign-up')}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <FcGoogle className="text-2xl" />
                  <span className="text-base">Continue with Google</span>
                </button>
                
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium py-2 flex items-center justify-center gap-1 mx-auto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default MultiTrip;