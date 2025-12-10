import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input'
import { AI_PROMPT, SelectBudgetOptions, SelectTravelesList } from '@/constants/options'
import { Button } from '../components/ui/button'
import { toast } from 'sonner'
import { chatSession } from '@/service/AIModal'
import { FcGoogle } from 'react-icons/fc'
import { FaUserTie, FaStar, FaMoneyBillWave, FaClock, FaGlobeAmericas } from 'react-icons/fa'; // Added more icons for guide benefits
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
import CreateTripSkeleton from '@/components/custom/CreateTripSkeleton';

function CreateTrip() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Use the new auth hook
  const [formData, setFormData] = useState({
    location: { label: '' },
    travelers: null,
    days: '',
    budget: null,
    customBudget: '', // Added for manual budget input
    needGuide: false // Added guide option
  });
  
  // Convex mutation for saving trips
  const { saveTripToConvex: saveTrip } = useSaveTrip();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [destinationImage, setDestinationImage] = useState(null); // New state for destination image
  // Add missing state variables
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // Add initial load state

  // Check if user is logged in and set initial load to false
  useEffect(() => {
    // Set initial load to false after component mounts
    setInitialLoad(false);
  }, []);

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

  const fetchSuggestions = async (searchQuery) => {
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

  const handleInputChange = (name, value) => {
    console.log('handleInputChange called with:', name, value);
    // Add validation for days field - limit to 5 or less
    if (name === 'days') {
      const daysValue = parseInt(value);
      if (!isNaN(daysValue) && daysValue > 13) {
        console.log("Please enter Trip Days less than 13");
        // Prevent values greater than 5
        return;
      }
    }
    
    console.log('Updating form data:', name, value);
    if (name === 'destination') {
      // For destination, we update the location.label property
      setFormData(prev => ({
        ...prev,
        location: { label: value }
      }));
      
      // Clear destination image if input is empty
      if (!value.trim()) {
        setDestinationImage(null);
      }
    } else if (name === 'customBudget') {
      // Handle custom budget input
      const numericValue = value.replace(/[^0-9]/g, ''); // Only allow numbers
      setFormData(prev => ({
        ...prev,
        customBudget: numericValue,
        // Automatically categorize the budget
        budget: categorizeBudget(numericValue)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleDestinationChange = (e) => {
    const value = e.target.value;
    handleInputChange('destination', value);
      
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer
    debounceTimer.current = setTimeout(() => {
      if (value.trim()) {
        fetchSuggestions(value);
      } else {
        // Hide suggestions when input is empty
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce
  };

  const handleSuggestionClick = (suggestion) => {
    const locationLabel = suggestion.properties.name || '';
    handleInputChange('destination', locationLabel);
    setShowSuggestions(false);
    
    // Also update the location object with more details
    setFormData(prev => ({
      ...prev,
      location: {
        label: locationLabel,
        value: {
          description: locationLabel,
          place_id: suggestion.properties.osm_id
        }
      }
    }));
    
    // Generate image for the selected destination
    generateDestinationImage(locationLabel);
  };

  // Function to generate image for a destination with content filtering
  const generateDestinationImage = async (destination) => {
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
      setDestinationImage(null);
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
          setDestinationImage(null);
        } else {
          setDestinationImage(imageUrl);
          console.log(`Found image for ${destination}: ${imageUrl}`);
        }
      } else {
        // No image found from Unsplash, set to null instead of placeholder
        console.log(`No image found for ${destination}, setting to null`);
        setDestinationImage(null);
      }
    } catch (error) {
      console.error('Error generating destination image from Unsplash:', error);
      // On error, set to null instead of placeholder
      setDestinationImage(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    console.log("Form submitted with data:", formData);
    
    // Enhanced validation with comprehensive error messages
    if (!formData.location?.label) {
      toast.warning("📍 Please enter a destination to get started");
      return;
    }
    
    // Content filtering for inappropriate content
    const inappropriateKeywords = [
      'adult', 'sex', 'porn', 'nude', 'xxx', 'explicit', 'nsfw', 
      'erotic', 'sexy', 'intimate', 'private', 'restricted', '18+',
      'mature', 'violence', 'weapon', 'drug', 'alcohol', 'gambling'
    ];
    
    const lowerDest = formData.location.label.toLowerCase();
    const isFiltered = inappropriateKeywords.some(keyword => lowerDest.includes(keyword));
    
    if (isFiltered) {
      toast.warning("📍 Please enter an appropriate destination");
      return;
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
    
    // Additional validation for comprehensive data integrity
    if (formData.location.label.length < 2) {
      toast.warning("📍 Please enter a more specific destination");
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

  const handleCreateTrip = async () => {
    console.log("Creating trip with data:", formData);
    setIsCreatingTrip(true);
    
    try {
      // Get user data from localStorage
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const userEmail = user?.email || 'unknown';
      const userId = user?._id || 'anonymous';
      
      // Prepare prompt for AI
      const FINAL_PROMPT = AI_PROMPT
        .replace('{location}', formData.location.label)
        .replace('{totalDays}', formData.days)
        .replace('{traveler}', SelectTravelesList.find(item => item.id == formData.travelers)?.people || '')
        .replace('{budget}', SelectBudgetOptions.find(item => item.id == formData.budget)?.title || '')
        .replace('{totalDays}', formData.days);

      console.log("Sending prompt to AI:", FINAL_PROMPT);
      
      // Send to Gemini AI
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      console.log("AI Response:", result?.response?.text());
      
      // Save trip to database with proper parameters
      const tripData = result?.response?.text();
      console.log("Saving trip data:", tripData);
      
      const tripId = await saveTrip(tripData, formData, userEmail, userId);
      console.log("Trip saved with ID:", tripId);
      
      // Navigate to trip details page
      if (tripId) {
        toast.success("🎉 Trip created successfully!");
        navigate(`/view-trip/${tripId}`);
      } else {
        throw new Error("Failed to save trip");
      }
    } catch (err) {
      console.error("Error creating trip:", err);
      toast.error("❌ Failed to create trip. Please try again.");
    } finally {
      setIsCreatingTrip(false);
    }
  };

  const OnCreateTrip = async () => {
    console.log("Creating trip with data:", formData);
    
    // Validate form data
    if (!formData.location?.label) {
      toast.error("Please select a destination");
      return;
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
    
    // Additional validation for comprehensive data integrity
    if (formData.location.label.length < 2) {
      toast.error("Please enter a more specific destination");
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
      
      // Generate trip plan with real hotels data
      const tripData = await generateTravelPlanWithRealHotels(formData);
      console.log("AI generated trip data:", tripData);
      
      // Validate and enhance trip data before saving
      const enhancedTripData = validateTripData(tripData, formData);
      
      // Save trip to database with proper parameters, including guide information
      const tripId = await saveTrip(enhancedTripData, {...formData, needGuide: formData.needGuide}, userEmail, userId);
      console.log("Trip saved with ID:", tripId);
      
      // Navigate to trip details page
      if (tripId) {
        navigate(`/view-trip/${tripId}`);
        toast.success("🎉 Trip created successfully!");
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

  // Function to categorize budget based on amount
  const categorizeBudget = (amount) => {
    const numAmount = parseInt(amount);
    if (isNaN(numAmount)) return null;
    
    if (numAmount <= 20000) {
      return 1; // Cheap tier
    } else if (numAmount <= 50000) {
      return 2; // Moderate tier
    } else {
      return 3; // Luxury tier
    }
  };

  // Function to get budget tier name
  const getBudgetTierName = (tierId) => {
    switch(tierId) {
      case 1: return 'Cheap';
      case 2: return 'Moderate';
      case 3: return 'Luxury';
      default: return 'Not Selected';
    }
  };

  // Function to get guide cost based on budget tier
  const getGuideCost = (budgetTier) => {
    switch(budgetTier) {
      case 1: return 3000; // Cheap tier
      case 2: return 5000; // Moderate tier
      case 3: return 8000; // Luxury tier
      default: return 0;
    }
  };

  // Guide benefits data
  const guideBenefits = [
    {
      icon: <FaStar className="text-yellow-500 text-2xl" />,
      title: "Local Expertise",
      description: "Access insider knowledge and hidden gems only locals know about."
    },
    {
      icon: <FaMoneyBillWave className="text-green-500 text-2xl" />,
      title: "Cost Savings",
      description: "Get discounts and special rates through local partnerships."
    },
    {
      icon: <FaClock className="text-blue-500 text-2xl" />,
      title: "Time Efficiency",
      description: "Skip the lines and avoid tourist traps with expert planning."
    },
    {
      icon: <FaGlobeAmericas className="text-purple-500 text-2xl" />,
      title: "Cultural Immersion",
      description: "Experience authentic local culture and traditions firsthand."
    }
  ];

  return (
    <>
      {initialLoad ? (
        <CreateTripSkeleton />
      ) : (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
          {/* Premium cinematic background with misty mountains */}
          <div className="absolute inset-0 z-0">
            {/* Blue-to-teal gradient base */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-teal-800 to-blue-700"></div>
            
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
          <div className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-8">
            <div className="text-center mb-10">
              <h2 className="font-bold text-3xl text-white">🗺️ Describe Your Trip</h2>
              <p className="text-white/80 mt-2">
                ✨ Just provide some basic information, and our AI will create a customized travel plan for you.
              </p>
            </div>

            {/* Destination Image Preview - Moved to top and properly positioned */}
            {destinationImage && (
              <div className="mb-8 flex justify-center">
                <div className="relative w-full max-w-md h-48 rounded-xl overflow-hidden shadow-lg border-2 border-white/30">
                  <img 
                    src={destinationImage} 
                    alt={`Preview of ${formData.location.label}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Try to get a retry image before using placeholder
                      console.log('Image failed to load, attempting retry...');
                      getDestinationImage(`${formData.location.label} travel`)
                        .then(retryImageUrl => {
                          if (retryImageUrl) {
                            e.target.src = retryImageUrl;
                          } else {
                            // Only use placeholder as last resort
                            e.target.src = `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(formData.location.label || 'Destination')}`;
                          }
                        })
                        .catch(() => {
                          // Only use placeholder as last resort
                          e.target.src = `https://placehold.co/800x600/007bff/ffffff?text=${encodeURIComponent(formData.location.label || 'Destination')}`;
                        });
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <h3 className="text-white font-bold text-md truncate">{formData.location.label}</h3>
                  </div>
                  {/* Close button for image */}
                  <button 
                    onClick={() => {
                      setDestinationImage(null);
                      handleInputChange('destination', '');
                    }}
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Destination Field */}
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <span className="text-blue-300 text-xl mr-2">📍</span>
                <h2 className="text-lg font-medium text-white">Destination</h2>
              </div>
              <div className="relative">
                <Input 
                  placeholder="e.g., Paris, France" 
                  value={formData.location.label}
                  onChange={handleDestinationChange}
                  className="w-full py-4 px-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                {/* Clear button when there's text */}
                {formData.location.label && (
                  <button 
                    onClick={() => {
                      handleInputChange('destination', '');
                      setDestinationImage(null);
                      setShowSuggestions(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {loading && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-300"></div>
                  </div>
                )}
                
                {/* Fixed autocomplete dropdown with solid background for better readability */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto border border-gray-200">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={`${suggestion.properties.osm_id}-${index}`}
                        onClick={() => handleSuggestionClick(suggestion)}
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
                
                {showSuggestions && suggestions.length === 0 && formData.location?.label?.length > 2 && !loading && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-xl shadow-lg z-50 p-2 border border-gray-200">
                    <div className="p-2 text-gray-600">❌ No locations found</div>
                  </div>
                )}
              </div>
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
                <h2 className="text-lg font-medium text-white">Number of Days</h2>
              </div>
              <div className="flex items-center">
                <Input 
                  placeholder="e.g., 3" 
                  type="number"
                  min="1"
                  max="13"
                  value={formData.days}
                  onChange={(e) => handleInputChange('days', e.target.value)}
                  className="w-full py-4 px-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <p className="mt-2 text-sm text-white/70">
                ⏳ Maximum 13 days allowed
              </p>
            </div>

            {/* Budget Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-white mb-3">💰 Budget</h2>
              
              {/* Manual Budget Input */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="text-blue-300 text-xl mr-2">₹</span>
                  <label htmlFor="customBudget" className="text-white">Enter Custom Budget Amount</label>
                </div>
                <div className="relative">
                  <Input 
                    id="customBudget"
                    placeholder="Enter your budget amount" 
                    type="text"
                    value={formData.customBudget}
                    onChange={(e) => handleInputChange('customBudget', e.target.value)}
                    className="w-full py-4 px-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  {formData.budget && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500/30 px-2 py-1 rounded text-white text-sm">
                      {getBudgetTierName(formData.budget)} Tier
                    </div>
                  )}
                </div>
                {formData.customBudget && (
                  <p className="mt-2 text-sm text-white/70">
                    Guide Service Cost: ₹{getGuideCost(formData.budget).toLocaleString()}
                  </p>
                )}
              </div>
              
              {/* Predefined Budget Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SelectBudgetOptions.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      // When selecting a predefined option, clear custom budget
                      setFormData(prev => ({
                        ...prev,
                        budget: item.id,
                        customBudget: ''
                      }));
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      formData.budget === item.id 
                        ? 'bg-white/20 border-2 border-blue-300 shadow-lg transform scale-105' 
                        : 'bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15'
                    }`}
                  >
                    <h2 className="text-lg font-semibold text-white">{item.icon} {item.title}</h2>
                    <h2 className="text-sm text-white/80">{item.desc}</h2>
                    <div className="mt-2 text-xs text-white/90">
                      {item.id === 1 && `Guide: ₹${getGuideCost(1).toLocaleString()}`}
                      {item.id === 2 && `Guide: ₹${getGuideCost(2).toLocaleString()}`}
                      {item.id === 3 && `Guide: ₹${getGuideCost(3).toLocaleString()}`}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Display selected budget tier and guide cost */}
              {formData.budget && (
                <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
                  <p className="text-white text-sm">
                    <span className="font-semibold">Selected Budget Tier:</span> {getBudgetTierName(formData.budget)} 
                    {formData.customBudget && ` (₹${parseInt(formData.customBudget).toLocaleString()})`}
                    <br />
                    <span className="font-semibold">Guide Service Cost:</span> ₹{getGuideCost(formData.budget).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Guide Option */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-white mb-3 flex items-center">
                <FaUserTie className="mr-2" /> Professional Guide Service
              </h2>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Would you like to hire a local guide?</h3>
                    <p className="text-white/80 text-sm mt-1">
                      Get a professional local guide to enhance your travel experience
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.needGuide}
                      onChange={(e) => {
                        console.log('Guide toggle changed to:', e.target.checked);
                        handleInputChange('needGuide', e.target.checked);
                      }}
                    />
                    <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
                {formData.needGuide && (
                  <div className="mt-3 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
                    <p className="text-white text-sm">
                      <span className="font-semibold">Guide Service Included:</span> A professional local guide will be assigned to your trip. 
                      The cost will be added to your total trip expenses and shown in the financial breakdown.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Guide Benefits Section - Only show when guide option is selected */}
              {formData.needGuide && (
                <div className="mt-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-3 flex items-center">
                    <FaStar className="text-yellow-400 mr-2" /> Benefits of Hiring a Local Guide
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {guideBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-start p-3 bg-white/5 rounded-lg">
                        <div className="mr-3 mt-1">
                          {benefit.icon}
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm">{benefit.title}</h4>
                          <p className="text-white/80 text-xs mt-1">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-white/70">
                    <p>Professional guide service costs ₹{getGuideCost(formData.budget).toLocaleString()} and will be added to your total trip cost.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Multi-Destination Trip Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => navigate('/multi-trip')}
                className="py-3 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <span className="text-xl">🌍</span>
                Plan Multi-Destination Trip
              </button>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-center">
              <Button 
                onClick={onSubmit}
                disabled={isCreatingTrip}
                className="py-4 px-8 bg-gradient-to-r from-blue-400 to-blue-200 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingTrip ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    🤖 Creating Trip...
                  </div>
                ) : (
                  "Let's Build Your Trip"
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
                    Sign in with Google to create and save your trip plans
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

export default CreateTrip;